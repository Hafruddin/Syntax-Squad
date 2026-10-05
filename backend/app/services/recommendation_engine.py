from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import Location, InventoryItem, AIRecommendation, Shipment, Route

class RecommendationEngine:
    """
    Generates explainable, actionable recommendations for Forward Military Logistics.
    Architecture follows: Problem -> Cause -> Prediction -> Impact -> Recommendation -> Action.
    """

    def generate_recommendations(self, db: Session) -> List[Dict[str, Any]]:
        recs = []

        # 1. Scan Inventory Items for Critical/High Risk Stockout
        items = db.query(InventoryItem).all()
        for item in items:
            loc = db.query(Location).filter(Location.id == item.location_id).first()
            if not loc:
                continue

            daily = item.daily_consumption_base
            # Adjust daily for weather/terrain
            if "Rain" in loc.weather_condition or "Snow" in loc.weather_condition:
                daily *= 1.25
            days_of_supply = round(item.current_quantity / daily, 1) if daily > 0 else 999.0

            if days_of_supply <= 4.0:
                priority = "CRITICAL" if days_of_supply <= 2.5 else "HIGH"
                title = f"Proactive Replenishment Alert: {item.item_name} at {loc.name}"
                reasoning = (
                    f"Problem: Critical stock depletion detected for {item.item_name}. "
                    f"Cause: High consumption tempo ({round(daily, 1)} {item.unit}/day) combined with {loc.weather_condition.lower()} weather. "
                    f"Prediction: Complete stockout within {days_of_supply} days. "
                    f"Impact: Sector operational readiness degraded below required safety margin."
                )
                action = (
                    f"Action: Dispatch emergency replenishment convoy of at least {int(item.safety_stock * 2.5)} {item.unit} "
                    f"from Central Base Logistics Hub immediately before weather window closes."
                )

                recs.append({
                    "title": title,
                    "category": "INVENTORY_REPLENISHMENT",
                    "target_location_id": loc.id,
                    "target_location_name": loc.name,
                    "target_item_id": item.id,
                    "target_item_name": item.item_name,
                    "priority": priority,
                    "reasoning": reasoning,
                    "action_suggested": action,
                    "confidence_pct": 91.5 if days_of_supply <= 2.5 else 86.0,
                    "status": "ACTIVE"
                })

        # 2. Scan Routes for Adverse Weather rerouting
        routes = db.query(Route).filter(Route.weather_risk >= 60.0).all()
        for r in routes:
            origin = db.query(Location).filter(Location.id == r.origin_id).first()
            dest = db.query(Location).filter(Location.id == r.destination_id).first()
            recs.append({
                "title": f"Route Advisory: Severe Weather Exposure on {r.route_name}",
                "category": "ROUTE_SAFETY",
                "target_location_id": dest.id if dest else None,
                "target_location_name": dest.name if dest else "Forward Grid",
                "target_item_id": None,
                "target_item_name": None,
                "priority": "HIGH",
                "reasoning": (
                    f"Problem: High weather vulnerability ({r.weather_risk}% risk) along {r.route_name}. "
                    f"Cause: Heavy precipitation and potential mountain pass slush. "
                    f"Prediction: Transit ETA will surge by +2.5 hours with high stoppage likelihood. "
                    f"Impact: Potential convoy stranding in high-gradient corridor."
                ),
                "action_suggested": (
                    "Action: Reroute all active and planned dispatches to Route B (Valley Bypass Axis). "
                    "Maintain speed restriction and deploy satellite telemetry check-ins."
                ),
                "confidence_pct": 89.0,
                "status": "ACTIVE"
            })

        return recs

recommendation_engine = RecommendationEngine()
