import datetime
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import OfflineSyncEvent, Shipment, Vehicle, AuditLog, SystemNotification

class OfflineSyncManager:
    """
    Manages store-and-forward telemetry synchronization from offline driver PWA clients.
    Features idempotency (event_id deduplication), timestamp ordering, and conflict detection.
    """

    def process_batch(
        self,
        db: Session,
        device_id: str,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        processed = 0
        conflicts = 0
        synced_results = []

        # Sort events by client event_timestamp to guarantee chronological event replay
        sorted_events = sorted(events, key=lambda x: x.get("event_timestamp", ""))

        for ev in sorted_events:
            ev_id = ev.get("event_id")
            ev_type = ev.get("event_type")
            shipment_id = ev.get("shipment_id")
            driver_id = ev.get("driver_id")
            payload = ev.get("payload_json", "{}")
            if isinstance(payload, dict):
                payload_data = payload
                payload_str = json.dumps(payload)
            else:
                try:
                    payload_data = json.loads(payload)
                    payload_str = payload
                except Exception:
                    payload_data = {}
                    payload_str = str(payload)

            # Idempotency check: Ignore duplicate retransmissions
            existing = db.query(OfflineSyncEvent).filter(OfflineSyncEvent.event_id == ev_id).first()
            if existing:
                synced_results.append({
                    "event_id": ev_id,
                    "status": "DUPLICATE_IGNORED",
                    "note": "Event already committed"
                })
                continue

            # Record event in offline sync log
            sync_record = OfflineSyncEvent(
                event_id=ev_id,
                device_id=device_id,
                shipment_id=shipment_id,
                driver_id=driver_id,
                event_type=ev_type,
                payload_json=payload_str,
                event_timestamp=ev.get("event_timestamp", datetime.datetime.utcnow().isoformat()),
                sync_status="SYNCED"
            )
            db.add(sync_record)

            # Apply state mutation to target Shipment and Vehicle
            conflict_detected = False
            shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first() if shipment_id else None
            vehicle = None
            if shipment and shipment.vehicle_id:
                vehicle = db.query(Vehicle).filter(Vehicle.id == shipment.vehicle_id).first()

            if ev_type == "DELAY":
                delay_hrs = float(payload_data.get("delay_hours", 2.0))
                reason = payload_data.get("reason", "Weather / Road Obstruction")
                if shipment:
                    shipment.status = "DELAYED"
                    shipment.eta_hours = round(shipment.eta_hours + delay_hrs, 1)
                    shipment.notes = f"Convoy reported delay: {reason} (+{delay_hrs}h)"
                if vehicle:
                    vehicle.status = "DELAYED"

                # Create urgent notification for Command Center
                db.add(SystemNotification(
                    title=f"Convoy Delay Synced: {shipment.tracking_number if shipment else 'Vehicle'}",
                    message=f"Driver reported {reason} (+{delay_hrs}h). Recovered from offline queue.",
                    alert_type="DELAY",
                    priority="HIGH",
                    target_role="COMMANDER"
                ))

            elif ev_type == "ROUTE_OBSTRUCTION":
                desc = payload_data.get("description", "Road blocked by heavy snowfall/landslide")
                if shipment:
                    shipment.status = "DELAYED"
                    shipment.notes = f"Route obstruction recorded: {desc}"
                if vehicle:
                    vehicle.status = "DELAYED"
                db.add(SystemNotification(
                    title="Route Obstruction Synced",
                    message=f"Obstruction logged at checkpoint. Rerouting alert posted to Command Grid.",
                    alert_type="HIGH_RISK",
                    priority="HIGH",
                    target_role="LOGISTICS_OFFICER"
                ))

            elif ev_type == "ARRIVAL" or ev_type == "DELIVERY_COMPLETE":
                if shipment:
                    if shipment.status == "CANCELLED":
                        conflict_detected = True
                        conflicts += 1
                        sync_record.sync_status = "CONFLICT"
                        sync_record.error_message = "Shipment was marked CANCELLED on Command server."
                    else:
                        shipment.status = "DELIVERED"
                        shipment.delivered_at = datetime.datetime.utcnow()
                        shipment.remaining_km = 0.0
                        if vehicle:
                            vehicle.status = "ARRIVED"
                        db.add(SystemNotification(
                            title=f"Delivery Completed: {shipment.tracking_number}",
                            message="Convoy successfully delivered payload to destination base.",
                            alert_type="SUCCESS",
                            priority="MEDIUM",
                            target_role="COMMANDER"
                        ))

            elif ev_type == "GPS_BREADCRUMB":
                lat = payload_data.get("lat")
                lng = payload_data.get("lng")
                if vehicle and lat and lng:
                    vehicle.current_lat = float(lat)
                    vehicle.current_lng = float(lng)

            # Update vehicle sync heartbeat
            if vehicle:
                vehicle.last_sync_at = datetime.datetime.utcnow()
                vehicle.connectivity_status = "ONLINE"

            # Audit trail
            db.add(AuditLog(
                user_role="TRUCK_DRIVER",
                user_name=f"Device-{device_id[-4:]}",
                action=f"OFFLINE_SYNC_{ev_type}",
                entity_type="SHIPMENT",
                entity_id=str(shipment_id) if shipment_id else "N/A",
                details=f"Processed event {ev_id} ({ev_type}). Conflicts: {conflict_detected}"
            ))

            processed += 1
            synced_results.append({
                "event_id": ev_id,
                "status": "CONFLICT" if conflict_detected else "COMMITTED",
                "event_type": ev_type
            })

        db.commit()

        return {
            "status": "SUCCESS",
            "processed_count": processed,
            "conflicts_detected": conflicts,
            "sync_timestamp": datetime.datetime.utcnow().isoformat(),
            "synced_events": synced_results
        }

offline_sync_manager = OfflineSyncManager()
