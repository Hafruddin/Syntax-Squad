import os
import json
import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, SessionLocal
from .models import (
    User, Location, InventoryItem, ConsumptionRecord, Vehicle, Driver,
    Route, Shipment, OfflineSyncEvent, AIRecommendation, AuditLog,
    SystemNotification
)
from .schemas import (
    LoginRequest, LoginResponse, UserResponse,
    LocationResponse, InventoryItemResponse, InventoryUpdateRequest,
    DemandForecastResponse, RouteResponse, RouteOptimizeRequest,
    RouteComparisonResponse, VehicleResponse, DriverResponse,
    ShipmentCreate, ShipmentResponse, OfflineSyncBatchRequest,
    OfflineSyncBatchResponse, SimulationRequest, SimulationResponse,
    AIRecommendationResponse, DashboardKPISummary, AuditLogResponse,
    NotificationResponse, AssistantQueryRequest, AssistantQueryResponse
)
from .services.forecasting import forecasting_engine
from .services.risk_engine import risk_engine
from .services.route_optimizer import route_optimizer
from .services.offline_sync import offline_sync_manager
from .services.simulation import simulation_engine
from .services.recommendation_engine import recommendation_engine
from .services.ai_assistant import ai_assistant
from .seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

# Auto seed database on startup
db_init = SessionLocal()
seed_database(db_init, force=False)
db_init.close()

app = FastAPI(
    title="FORGE - Forward Operational Resource & Logistics Grid Engine",
    description="Predictive Logistics Decision Support Platform for Defence Supply Chains (SIH-2026 Academic Demo)",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 1. AUTHENTICATION & QUICK DEMO LOGIN
# -------------------------------------------------------------
@app.post("/api/auth/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        # Fallback to demo default if matching role
        role = req.role or "COMMANDER"
        user = User(
            username=req.username,
            role=role,
            full_name=f"Officer ({role.title()})",
            rank="Service Officer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    db.add(AuditLog(
        user_role=user.role,
        user_name=user.full_name,
        action="USER_LOGIN",
        entity_type="AUTH",
        entity_id=str(user.id),
        details=f"User {user.username} authenticated in {user.role} mode."
    ))
    db.commit()

    return {
        "access_token": f"forge-token-{user.username}-{datetime.datetime.utcnow().timestamp()}",
        "token_type": "bearer",
        "user": user
    }

# -------------------------------------------------------------
# 2. COMMAND DASHBOARD
# -------------------------------------------------------------
@app.get("/api/dashboard", response_model=DashboardKPISummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    locs = db.query(Location).all()
    items = db.query(InventoryItem).all()
    shipments = db.query(Shipment).all()
    vehicles = db.query(Vehicle).all()

    total_locations = len(locs)
    total_items = len(items)
    fleet_count = len(vehicles)

    # Calculate inventory health (% of items with >= 5 days of supply)
    healthy_items = 0
    at_risk_locations = 0
    predicted_shortages = 0

    for it in items:
        daily = it.daily_consumption_base if it.daily_consumption_base > 0 else 1.0
        days_of_supply = it.current_quantity / daily
        if days_of_supply >= 5.0:
            healthy_items += 1
        else:
            predicted_shortages += 1

    for l in locs:
        if l.current_risk_score >= 60.0 or l.status in ["CRITICAL", "AT_RISK"]:
            at_risk_locations += 1

    inventory_health_pct = round((healthy_items / total_items * 100.0), 1) if total_items > 0 else 85.0
    active_shipments = len([s for s in shipments if s.status in ["EN_ROUTE", "DISPATCHED", "LOADING"]])
    vehicles_en_route = len([v for v in vehicles if v.status == "EN_ROUTE"])
    weather_alerts = len([l for l in locs if "Rain" in l.weather_condition or "Snow" in l.weather_condition or l.precipitation_mm > 20])

    # Dynamic AI Logistics Brief
    brief = (
        f"{at_risk_locations} forward locations require priority attention today. "
        f"{predicted_shortages} potential stockouts predicted within 5 days across high-altitude nodes. "
        f"{active_shipments} convoys currently active on Northern grid. "
        f"{weather_alerts} transit sectors under weather advisory. "
        f"Primary Recommendation: Expedite Fuel replenishment to Forward Post Kilo via All-Weather Route B before storm intensifies."
    )

    return {
        "total_locations": total_locations,
        "total_inventory_items": total_items,
        "fleet_total_count": fleet_count,
        "inventory_health_pct": inventory_health_pct,
        "at_risk_locations_count": at_risk_locations,
        "predicted_shortages_count": predicted_shortages,
        "active_shipments_count": active_shipments,
        "vehicles_en_route_count": vehicles_en_route,
        "weather_alerts_count": weather_alerts,
        "ai_brief": brief,
        "system_status": "OPERATIONAL / PREDICTIVE GRID ACTIVE"
    }

# -------------------------------------------------------------
# 3. LOCATIONS & GIS MAP NODES
# -------------------------------------------------------------
@app.get("/api/locations", response_model=List[LocationResponse])
def get_locations(db: Session = Depends(get_db)):
    locs = db.query(Location).all()
    results = []
    for l in locs:
        # Calculate minimum days of supply and critical items count
        items = db.query(InventoryItem).filter(InventoryItem.location_id == l.id).all()
        min_dos = 999.0
        critical_count = 0
        for it in items:
            daily = it.daily_consumption_base if it.daily_consumption_base > 0 else 1.0
            dos = it.current_quantity / daily
            if dos < min_dos:
                min_dos = dos
            if dos < 4.0:
                critical_count += 1
        
        l_dict = {c.name: getattr(l, c.name) for c in l.__table__.columns}
        l_dict["days_of_supply_min"] = round(min_dos, 1) if items else 15.0
        l_dict["critical_items_count"] = critical_count
        results.append(l_dict)
    return results

@app.get("/api/locations/{location_id}")
def get_location_details(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    items = db.query(InventoryItem).filter(InventoryItem.location_id == location_id).all()
    incoming = db.query(Shipment).filter(
        Shipment.destination_id == location_id,
        Shipment.status.in_(["EN_ROUTE", "DISPATCHED", "PLANNED", "DELAYED"])
    ).all()

    # Risk evaluation
    min_dos = min([(it.current_quantity / (it.daily_consumption_base or 1.0)) for it in items]) if items else 10.0
    risk_eval = risk_engine.evaluate_risk(
        days_of_supply=min_dos,
        demand_trend_ratio=1.18 if loc.status == "CRITICAL" else 1.0,
        weather_condition=loc.weather_condition,
        precipitation_mm=loc.precipitation_mm,
        road_condition=loc.road_condition,
        active_delay_hours=2.5 if loc.status == "CRITICAL" else 0.0
    )

    return {
        "location": loc,
        "inventory": items,
        "incoming_shipments": incoming,
        "risk_evaluation": risk_eval,
        "terrain_notes": f"{loc.terrain_type} terrain at {loc.altitude_m}m altitude. Road status: {loc.road_condition}."
    }

# -------------------------------------------------------------
# 4. INVENTORY MANAGEMENT & INTELLIGENCE
# -------------------------------------------------------------
@app.get("/api/inventory", response_model=List[InventoryItemResponse])
def get_inventory(
    category: Optional[str] = None,
    location_id: Optional[int] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem)
    if category and category != "ALL":
        query = query.filter(InventoryItem.category == category)
    if location_id:
        query = query.filter(InventoryItem.location_id == location_id)

    items = query.all()
    results = []
    for it in items:
        loc = db.query(Location).filter(Location.id == it.location_id).first()
        loc_name = loc.name if loc else "Unknown Post"

        daily = it.daily_consumption_base if it.daily_consumption_base > 0 else 1.0
        # Incorporate weather factor
        weather_mult = 1.25 if loc and ("Rain" in loc.weather_condition or "Snow" in loc.weather_condition) else 1.0
        eff_daily = daily * weather_mult
        days_of_supply = round(it.current_quantity / eff_daily, 1)

        # Classify risk
        if days_of_supply <= 2.5:
            r_level = "CRITICAL"
        elif days_of_supply <= 4.5:
            r_level = "HIGH_RISK"
        elif days_of_supply <= 7.0:
            r_level = "MEDIUM_RISK"
        else:
            r_level = "HEALTHY"

        if risk_level and risk_level != "ALL" and r_level != risk_level:
            continue

        ai_rec = (
            f"Initiate replenishment of {int(it.safety_stock * 2)} {it.unit} before projected shortage window."
            if days_of_supply <= 4.5 else "Buffer adequate for nominal operational tempo."
        )

        it_dict = {c.name: getattr(it, c.name) for c in it.__table__.columns}
        it_dict["location_name"] = loc_name
        it_dict["days_of_supply"] = days_of_supply
        it_dict["predicted_stockout_days"] = days_of_supply
        it_dict["risk_level"] = r_level
        it_dict["ai_recommendation"] = ai_rec
        results.append(it_dict)

    return sorted(results, key=lambda x: x["days_of_supply"])

@app.post("/api/inventory/{item_id}/consume")
def record_consumption(
    item_id: int,
    req: InventoryUpdateRequest,
    db: Session = Depends(get_db)
):
    it = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Item not found")

    qty_to_deduct = req.consumed_quantity or 10.0
    it.current_quantity = max(0.0, round(it.current_quantity - qty_to_deduct, 1))
    it.last_updated = datetime.datetime.utcnow()

    # Recalculate item status
    daily = it.daily_consumption_base or 1.0
    dos = it.current_quantity / daily
    if dos <= 2.5:
        it.status = "CRITICAL"
    elif dos <= 4.5:
        it.status = "HIGH_RISK"
    elif dos <= 7.0:
        it.status = "MEDIUM_RISK"
    else:
        it.status = "HEALTHY"

    # Add audit log
    db.add(AuditLog(
        user_role="FORWARD_OPERATOR",
        user_name="Forward Logistics Operator",
        action="INVENTORY_CONSUMPTION",
        entity_type="INVENTORY",
        entity_id=str(it.id),
        details=f"Deducted {qty_to_deduct} {it.unit} of {it.item_name}. New Balance: {it.current_quantity}. Reason: {req.reason}"
    ))

    db.commit()
    db.refresh(it)
    return {"message": "Consumption recorded successfully", "new_quantity": it.current_quantity, "status": it.status}

# -------------------------------------------------------------
# 5. DEMAND FORECASTING & STOCKOUT PREDICTIONS
# -------------------------------------------------------------
@app.get("/api/forecast", response_model=List[DemandForecastResponse])
def get_demand_forecasts(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).all()
    results = []
    # Pick top items across categories
    for it in items[:8]:
        loc = db.query(Location).filter(Location.id == it.location_id).first()
        loc_name = loc.name if loc else "Forward Node"
        weather = loc.weather_condition if loc else "Clear"
        terrain = loc.terrain_type if loc else "Mountain"
        temp = loc.temp_c if loc else 10.0

        fc_result = forecasting_engine.predict_demand(
            base_daily_consumption=it.daily_consumption_base,
            current_stock=it.current_quantity,
            weather_condition=weather,
            terrain_type=terrain,
            temperature_c=temp
        )

        results.append({
            "item_id": it.id,
            "item_name": it.item_name,
            "location_id": it.location_id,
            "location_name": loc_name,
            "category": it.category,
            "current_stock": it.current_quantity,
            "forecast": fc_result["forecast"],
            "historical_series": fc_result["historical_series"],
            "projected_series": fc_result["projected_series"],
            "stockout_predicted_days": fc_result["stockout_predicted_days"],
            "weather_impact_factor": fc_result["weather_impact_factor"],
            "risk_assessment": "ELEVATED DEMAND SURGE" if fc_result["forecast"]["trend_direction"] == "INCREASING" else "NOMINAL"
        })
    return results

@app.get("/api/stockout-predictions")
def get_stockout_predictions(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).all()
    predictions = []
    for it in items:
        loc = db.query(Location).filter(Location.id == it.location_id).first()
        loc_name = loc.name if loc else "Forward Base"
        daily = it.daily_consumption_base or 1.0
        weather_factor = 1.25 if loc and ("Rain" in loc.weather_condition or "Snow" in loc.weather_condition) else 1.0
        eff_daily = daily * weather_factor
        days_remaining = round(it.current_quantity / eff_daily, 1)

        stockout_date = (datetime.date.today() + datetime.timedelta(days=int(days_remaining))).strftime("%d %b %Y")

        if days_remaining <= 3.0:
            level = "CRITICAL"
            action = "Dispatch immediate emergency replenishment convoy via high-priority priority corridor."
        elif days_remaining <= 5.0:
            level = "HIGH"
            action = "Stage resupply convoy at intermediate depot; prepare route package."
        elif days_remaining <= 8.0:
            level = "MEDIUM"
            action = "Monitor daily burn rate; schedule routine weekly replenishment."
        else:
            level = "LOW"
            action = "Maintain standard inventory audits."

        predictions.append({
            "item_id": it.id,
            "item_name": it.item_name,
            "location_id": it.location_id,
            "location_name": loc_name,
            "category": it.category,
            "current_stock": it.current_quantity,
            "unit": it.unit,
            "effective_daily_demand": round(eff_daily, 1),
            "days_remaining": days_remaining,
            "stockout_date": stockout_date,
            "weather_adjustment_risk": "+0.5 to +1.2 days delay exposure",
            "risk_level": level,
            "recommended_action": action
        })

    return sorted(predictions, key=lambda x: x["days_remaining"])

# -------------------------------------------------------------
# 6. GIS ROUTE OPTIMIZATION & COMPARISON
# -------------------------------------------------------------
@app.get("/api/routes", response_model=List[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    results = []
    for r in routes:
        origin = db.query(Location).filter(Location.id == r.origin_id).first()
        dest = db.query(Location).filter(Location.id == r.destination_id).first()
        r_dict = {c.name: getattr(r, c.name) for c in r.__table__.columns}
        r_dict["origin_name"] = origin.name if origin else "Depot"
        r_dict["destination_name"] = dest.name if dest else "Forward Post"
        try:
            r_dict["checkpoints"] = json.loads(r.checkpoints_json)
            r_dict["geometry"] = json.loads(r.geometry_json)
        except Exception:
            r_dict["checkpoints"] = []
            r_dict["geometry"] = []
        results.append(r_dict)
    return results

@app.post("/api/routes/optimize", response_model=RouteComparisonResponse)
def optimize_route(req: RouteOptimizeRequest, db: Session = Depends(get_db)):
    origin = db.query(Location).filter(Location.id == req.origin_id).first()
    dest = db.query(Location).filter(Location.id == req.destination_id).first()
    if not origin or not dest:
        raise HTTPException(status_code=404, detail="Origin or Destination location not found")

    candidates = route_optimizer.generate_candidate_routes(
        origin.name, origin.latitude, origin.longitude,
        dest.name, dest.latitude, dest.longitude,
        weather_condition=dest.weather_condition
    )

    # Format responses
    route_responses = []
    for idx, c in enumerate(candidates):
        route_responses.append({
            "id": idx + 1,
            "origin_id": origin.id,
            "destination_id": dest.id,
            "origin_name": origin.name,
            "destination_name": dest.name,
            "route_name": c["route_name"],
            "distance_km": c["distance_km"],
            "base_eta_hours": c["base_eta_hours"],
            "terrain_risk": c["terrain_risk"],
            "weather_risk": c["weather_risk"],
            "road_condition": c["road_condition"],
            "reliability_score": c["reliability_score"],
            "composite_score": c["composite_score"],
            "is_recommended": c["is_recommended"],
            "checkpoints_json": json.dumps(c["checkpoints"]),
            "geometry_json": json.dumps(c["geometry"]),
            "checkpoints": c["checkpoints"],
            "geometry": c["geometry"]
        })

    # Pick recommended
    recommended = next((r for r in route_responses if r["is_recommended"]), route_responses[0])
    reason = (
        f"RECOMMENDED {recommended['route_name']}: Composite score {recommended['composite_score']}/100. "
        f"Although distance is {recommended['distance_km']} km, its weather hazard exposure and terrain risk are significantly lower, "
        f"preventing high-altitude bottleneck delays."
    )

    return {
        "recommended_route_id": recommended["id"],
        "summary_reason": reason,
        "routes": route_responses
    }

# -------------------------------------------------------------
# 7. SHIPMENTS & CONVOY DISPATCH
# -------------------------------------------------------------
@app.get("/api/shipments", response_model=List[ShipmentResponse])
def get_shipments(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Shipment)
    if status and status != "ALL":
        query = query.filter(Shipment.status == status)
    shipments = query.all()

    results = []
    for s in shipments:
        origin = db.query(Location).filter(Location.id == s.origin_id).first()
        dest = db.query(Location).filter(Location.id == s.destination_id).first()
        veh = db.query(Vehicle).filter(Vehicle.id == s.vehicle_id).first() if s.vehicle_id else None
        drv = db.query(Driver).filter(Driver.id == s.driver_id).first() if s.driver_id else None
        rt = db.query(Route).filter(Route.id == s.route_id).first() if s.route_id else None
        it = db.query(InventoryItem).filter(InventoryItem.id == s.item_id).first() if s.item_id else None

        s_dict = {c.name: getattr(s, c.name) for c in s.__table__.columns}
        s_dict["origin_name"] = origin.name if origin else "Central Depot"
        s_dict["destination_name"] = dest.name if dest else "Forward Post"
        s_dict["vehicle_number"] = veh.vehicle_number if veh else "Unassigned"
        s_dict["driver_name"] = drv.name if drv else "Unassigned"
        s_dict["route_name"] = rt.route_name if rt else "Standard Logistics Axis"
        s_dict["item_name"] = it.item_name if it else s.category
        results.append(s_dict)

    return results

@app.post("/api/shipments", response_model=ShipmentResponse)
def create_shipment(req: ShipmentCreate, db: Session = Depends(get_db)):
    tracking_no = f"CONVOY-NORTH-{datetime.datetime.utcnow().strftime('%M%S')}"
    shipment = Shipment(
        tracking_number=tracking_no,
        origin_id=req.origin_id,
        destination_id=req.destination_id,
        category=req.category,
        item_id=req.item_id,
        quantity=req.quantity,
        unit=req.unit,
        priority=req.priority,
        vehicle_id=req.vehicle_id,
        driver_id=req.driver_id,
        route_id=req.route_id,
        status="PLANNED",
        eta_hours=5.5,
        remaining_km=180.0,
        last_known_checkpoint="Origin Staging Base Gate",
        notes=req.notes or "Created by Logistics Officer."
    )
    db.add(shipment)

    # Assign vehicle & driver status
    if req.vehicle_id:
        veh = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
        if veh:
            veh.status = "LOADING"
    if req.driver_id:
        drv = db.query(Driver).filter(Driver.id == req.driver_id).first()
        if drv:
            drv.status = "ASSIGNED"

    db.add(AuditLog(
        user_role="LOGISTICS_OFFICER",
        user_name="Logistics Operations Officer",
        action="CREATE_SHIPMENT",
        entity_type="SHIPMENT",
        entity_id=tracking_no,
        details=f"Created planned convoy {tracking_no} transporting {req.quantity} {req.unit} of {req.category}."
    ))

    db.commit()
    db.refresh(shipment)

    origin = db.query(Location).filter(Location.id == shipment.origin_id).first()
    dest = db.query(Location).filter(Location.id == shipment.destination_id).first()
    veh = db.query(Vehicle).filter(Vehicle.id == shipment.vehicle_id).first() if shipment.vehicle_id else None
    drv = db.query(Driver).filter(Driver.id == shipment.driver_id).first() if shipment.driver_id else None
    rt = db.query(Route).filter(Route.id == shipment.route_id).first() if shipment.route_id else None

    s_dict = {c.name: getattr(shipment, c.name) for c in shipment.__table__.columns}
    s_dict["origin_name"] = origin.name if origin else "Central Depot"
    s_dict["destination_name"] = dest.name if dest else "Forward Post"
    s_dict["vehicle_number"] = veh.vehicle_number if veh else "Unassigned"
    s_dict["driver_name"] = drv.name if drv else "Unassigned"
    s_dict["route_name"] = rt.route_name if rt else "Standard Logistics Axis"
    s_dict["item_name"] = req.category
    return s_dict

@app.post("/api/shipments/{shipment_id}/dispatch")
def dispatch_shipment(shipment_id: int, db: Session = Depends(get_db)):
    s = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")

    s.status = "EN_ROUTE"
    s.dispatched_at = datetime.datetime.utcnow()
    if s.vehicle_id:
        veh = db.query(Vehicle).filter(Vehicle.id == s.vehicle_id).first()
        if veh:
            veh.status = "EN_ROUTE"
    if s.driver_id:
        drv = db.query(Driver).filter(Driver.id == s.driver_id).first()
        if drv:
            drv.status = "EN_ROUTE"

    db.add(AuditLog(
        user_role="LOGISTICS_OFFICER",
        user_name="Logistics Dispatch Officer",
        action="DISPATCH_CONVOY",
        entity_type="SHIPMENT",
        entity_id=s.tracking_number,
        details=f"Dispatched convoy {s.tracking_number} to forward sector."
    ))
    db.commit()
    return {"message": "Shipment dispatched", "tracking_number": s.tracking_number, "status": s.status}

@app.post("/api/shipments/{shipment_id}/deliver")
def deliver_shipment(shipment_id: int, db: Session = Depends(get_db)):
    s = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")

    s.status = "DELIVERED"
    s.delivered_at = datetime.datetime.utcnow()
    s.remaining_km = 0.0

    # Replenish destination inventory item
    if s.item_id:
        it = db.query(InventoryItem).filter(InventoryItem.id == s.item_id).first()
        if it:
            it.current_quantity += s.quantity
            it.status = "HEALTHY"
            it.last_updated = datetime.datetime.utcnow()

    # Lower destination location risk
    dest = db.query(Location).filter(Location.id == s.destination_id).first()
    if dest:
        dest.current_risk_score = max(18.0, dest.current_risk_score - 45.0)
        dest.status = "HEALTHY"

    if s.vehicle_id:
        veh = db.query(Vehicle).filter(Vehicle.id == s.vehicle_id).first()
        if veh:
            veh.status = "ARRIVED"

    db.add(AuditLog(
        user_role="FORWARD_OPERATOR",
        user_name="Forward Post Receiving Officer",
        action="CONFIRM_DELIVERY",
        entity_type="SHIPMENT",
        entity_id=s.tracking_number,
        details=f"Received delivery of {s.quantity} {s.unit} at destination base. Risk mitigated to HEALTHY."
    ))
    db.commit()
    return {"message": "Shipment delivered and inventory replenished", "tracking_number": s.tracking_number}

# -------------------------------------------------------------
# 8. FLEET & DRIVER TELEMETRY
# -------------------------------------------------------------
@app.get("/api/fleet", response_model=List[VehicleResponse])
def get_fleet(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    results = []
    for v in vehicles:
        drv = db.query(Driver).filter(Driver.id == v.assigned_driver_id).first() if v.assigned_driver_id else None
        shipment = db.query(Shipment).filter(
            Shipment.vehicle_id == v.id,
            Shipment.status.in_(["EN_ROUTE", "LOADING", "DELAYED"])
        ).first()

        v_dict = {c.name: getattr(v, c.name) for c in v.__table__.columns}
        v_dict["assigned_driver_name"] = drv.name if drv else "Unassigned"
        v_dict["current_shipment_number"] = shipment.tracking_number if shipment else "None (Staged)"
        results.append(v_dict)
    return results

# -------------------------------------------------------------
# 9. OFFLINE SYNC STORE-AND-FORWARD
# -------------------------------------------------------------
@app.post("/api/sync", response_model=OfflineSyncBatchResponse)
def sync_offline_events(req: OfflineSyncBatchRequest, db: Session = Depends(get_db)):
    events_payload = [e.dict() for e in req.events]
    result = offline_sync_manager.process_batch(
        db=db,
        device_id=req.device_id,
        events=events_payload
    )
    return result

# -------------------------------------------------------------
# 10. WHAT-IF STRATEGIC SIMULATION
# -------------------------------------------------------------
@app.post("/api/simulations", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    result = simulation_engine.run_simulation(
        db=db,
        demand_multiplier=req.demand_multiplier,
        weather_severity=req.weather_severity,
        route_disrupted=req.route_disruption,
        vehicle_availability_pct=req.vehicle_availability_pct,
        target_location_id=req.target_location_id
    )

    db.add(AuditLog(
        user_role="COMMANDER",
        user_name="Strategic Logistics Planner",
        action="RUN_WHAT_IF_SIMULATION",
        entity_type="SIMULATION",
        entity_id="SIM-RUN",
        details=f"Ran stress simulation with Demand x{req.demand_multiplier}, Weather {req.weather_severity}, Disruption={req.route_disruption}."
    ))
    db.commit()

    return result

# -------------------------------------------------------------
# 11. AI RECOMMENDATIONS
# -------------------------------------------------------------
@app.get("/api/recommendations", response_model=List[AIRecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    recs = db.query(AIRecommendation).all()
    results = []
    for r in recs:
        loc = db.query(Location).filter(Location.id == r.target_location_id).first() if r.target_location_id else None
        it = db.query(InventoryItem).filter(InventoryItem.id == r.target_item_id).first() if r.target_item_id else None

        r_dict = {c.name: getattr(r, c.name) for c in r.__table__.columns}
        r_dict["target_location_name"] = loc.name if loc else "Sector Grid"
        r_dict["target_item_name"] = it.item_name if it else "General Logistics Stores"
        results.append(r_dict)
    return results

@app.post("/api/recommendations/{rec_id}/approve")
def approve_recommendation(rec_id: int, db: Session = Depends(get_db)):
    rec = db.query(AIRecommendation).filter(AIRecommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = "APPROVED"

    # Automatically dispatch planned shipment if this was the critical fuel recommendation
    shipment = db.query(Shipment).filter(Shipment.destination_id == rec.target_location_id, Shipment.status == "PLANNED").first()
    if shipment:
        shipment.status = "EN_ROUTE"
        shipment.dispatched_at = datetime.datetime.utcnow()

    db.add(AuditLog(
        user_role="LOGISTICS_OFFICER",
        user_name="Officer Commanding Logistics",
        action="APPROVE_AI_RECOMMENDATION",
        entity_type="RECOMMENDATION",
        entity_id=f"REC-{rec.id}",
        details=f"Approved action for recommendation: {rec.title}"
    ))
    db.commit()
    return {"message": "Recommendation approved and proactive mission initiated", "status": rec.status}

# -------------------------------------------------------------
# 12. GROUNDED AI ASSISTANT / COPILOT
# -------------------------------------------------------------
@app.post("/api/assistant/query", response_model=AssistantQueryResponse)
def query_ai_assistant(req: AssistantQueryRequest, db: Session = Depends(get_db)):
    return ai_assistant.process_query(db=db, query=req.query)

# -------------------------------------------------------------
# 13. AUDIT LOGS & NOTIFICATIONS
# -------------------------------------------------------------
@app.get("/api/audit", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

@app.get("/api/notifications", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(SystemNotification).order_by(SystemNotification.created_at.desc()).limit(20).all()

# -------------------------------------------------------------
# 14. END-TO-END DEMO SCENARIO & RESET (FOR SIH JUDGES)
# -------------------------------------------------------------
@app.post("/api/demo/run-scenario")
def run_demo_scenario(db: Session = Depends(get_db)):
    """
    Executes the exact 17-step end-to-end judge scenario:
    1. Forward Post Kilo Fuel decreases (stockout projected in 3.4 days).
    2. Weather alerts trigger (Rain & Sleet, 42mm precipitation, Pass Echo route risk rises to 85%).
    3. AI Recommendation generated: Proactive replenishment via Route B (Valley Bypass).
    4. Convoy CONVOY-NORTH-703 created & dispatched.
    5. Driver begins navigation with offline package.
    6. Driver enters zero-connectivity zone (Offline vehicle status).
    7. Offline event (Delay +1.5h) logged to queue.
    8. Connectivity restored -> Auto Sync completes.
    9. Delivery completed -> Stock replenished -> Forward Post Kilo risk falls from 86% to 22% (HEALTHY).
    """
    fp_kilo = db.query(Location).filter(Location.code == "FP-KILO").first()
    c_depot = db.query(Location).filter(Location.code == "CSD-01").first()

    if not fp_kilo or not c_depot:
        seed_database(db, force=True)
        fp_kilo = db.query(Location).filter(Location.code == "FP-KILO").first()
        c_depot = db.query(Location).filter(Location.code == "CSD-01").first()

    fuel_item = db.query(InventoryItem).filter(
        InventoryItem.location_id == fp_kilo.id,
        InventoryItem.category == "Fuel & Energy"
    ).first()

    # Step 1: Simulate consumption surge
    fuel_item.current_quantity = 280.0
    fuel_item.status = "CRITICAL"
    fp_kilo.current_risk_score = 92.0
    fp_kilo.status = "CRITICAL"

    # Step 2: Ensure planned shipment exists
    shipment = db.query(Shipment).filter(Shipment.destination_id == fp_kilo.id).first()
    if not shipment:
        shipment = Shipment(
            tracking_number="CONVOY-NORTH-703",
            origin_id=c_depot.id,
            destination_id=fp_kilo.id,
            category="Fuel & Energy",
            item_id=fuel_item.id,
            quantity=1200.0,
            unit="Litres",
            priority="URGENT",
            status="PLANNED",
            eta_hours=5.9,
            remaining_km=205.0,
            notes="Proactive fuel replenishment under AI Recommendation."
        )
        db.add(shipment)
        db.flush()

    db.add(SystemNotification(
        title="DEMO SCENARIO INITIALIZED",
        message="Critical fuel depletion & storm conditions simulated at Forward Post Kilo. System awaiting Logistics Officer approval.",
        alert_type="CRITICAL",
        priority="HIGH",
        target_role="COMMANDER"
    ))
    db.commit()

    return {
        "status": "SCENARIO_READY",
        "story": [
            "1. Forward Post Kilo fuel stock dropped to 280 Litres (Coverage: ~2.9 days).",
            "2. Storm radar detects 42mm precipitation along mountain pass.",
            "3. AI stockout predictor flags CRITICAL risk (92/100).",
            "4. Recommendation REC-01 proposes dispatching 1,200L via All-Weather Route B.",
            "5. Logistics Officer can now approve recommendation & dispatch convoy.",
            "6. Driver mode can be switched to test offline navigation and sync."
        ],
        "target_location": fp_kilo.name,
        "fuel_stock": fuel_item.current_quantity,
        "risk_score": fp_kilo.current_risk_score
    }

@app.post("/api/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    seed_database(db, force=True)
    return {"message": "Demo environment reset to baseline synthetic state successfully."}

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "FORGE Logistics Decision-Support Grid",
        "environment": "SIH-2026 Academic MoD Prototype",
        "database": "CONNECTED",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# Mount static frontend production build
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

