from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import datetime

class UserBase(BaseModel):
    username: str
    role: str
    full_name: str
    rank: str = "Officer"
    assigned_location_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "demo"
    role: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LocationBase(BaseModel):
    name: str
    code: str
    sector: str = "Northern Synthetic Sector"
    location_type: str
    latitude: float
    longitude: float
    altitude_m: int
    terrain_type: str
    road_condition: str
    current_risk_score: float
    weather_condition: str
    temp_c: float
    precipitation_mm: float
    wind_speed_kmh: float
    visibility_km: float
    status: str
    incoming_shipments_count: int = 0

class LocationResponse(LocationBase):
    id: int
    days_of_supply_min: Optional[float] = None
    critical_items_count: Optional[int] = 0
    class Config:
        from_attributes = True

class InventoryItemBase(BaseModel):
    location_id: int
    item_name: str
    category: str
    unit: str
    current_quantity: float
    daily_consumption_base: float
    safety_stock: float
    reorder_threshold: float
    status: str

class InventoryItemResponse(InventoryItemBase):
    id: int
    location_name: Optional[str] = None
    days_of_supply: float
    predicted_stockout_days: float
    risk_level: str
    ai_recommendation: Optional[str] = None
    last_updated: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class InventoryUpdateRequest(BaseModel):
    current_quantity: Optional[float] = None
    consumed_quantity: Optional[float] = None
    reason: Optional[str] = "Routine Operational Consumption"

class ConsumptionRecordCreate(BaseModel):
    item_id: int
    location_id: int
    consumed_qty: float
    date: str
    notes: Optional[str] = "Daily Consumption Log"

class ForecastHorizon(BaseModel):
    day_1: float
    day_3: float
    day_7: float
    day_14: float
    confidence_pct: float
    trend_direction: str # INCREASING, STABLE, DECREASING
    historical_avg_7d: float
    historical_avg_30d: float

class DemandForecastResponse(BaseModel):
    item_id: int
    item_name: str
    location_id: int
    location_name: str
    category: str
    current_stock: float
    forecast: ForecastHorizon
    historical_series: List[Dict[str, Any]]
    projected_series: List[Dict[str, Any]]
    stockout_predicted_days: float
    weather_impact_factor: float
    risk_assessment: str

class RouteBase(BaseModel):
    origin_id: int
    destination_id: int
    route_name: str
    distance_km: float
    base_eta_hours: float
    terrain_risk: float
    weather_risk: float
    road_condition: str
    reliability_score: float
    composite_score: float
    is_recommended: bool
    checkpoints_json: str
    geometry_json: str

class RouteResponse(RouteBase):
    id: int
    origin_name: Optional[str] = None
    destination_name: Optional[str] = None
    checkpoints: Optional[List[Dict[str, Any]]] = None
    geometry: Optional[List[List[float]]] = None
    class Config:
        from_attributes = True

class RouteOptimizeRequest(BaseModel):
    origin_id: int
    destination_id: int
    vehicle_type: Optional[str] = "Heavy Transport 4x4"
    weather_priority: Optional[bool] = True
    speed_priority: Optional[bool] = False

class RouteComparisonResponse(BaseModel):
    recommended_route_id: int
    summary_reason: str
    routes: List[RouteResponse]

class VehicleResponse(BaseModel):
    id: int
    vehicle_number: str
    model_type: str
    capacity_tons: float
    current_lat: float
    current_lng: float
    status: str
    fuel_pct: float
    assigned_driver_id: Optional[int] = None
    assigned_driver_name: Optional[str] = None
    current_shipment_number: Optional[str] = None
    connectivity_status: str
    last_sync_at: Optional[datetime.datetime] = None
    odometer_km: float
    class Config:
        from_attributes = True

class DriverResponse(BaseModel):
    id: int
    name: str
    service_id: str
    phone: str
    status: str
    assigned_vehicle_id: Optional[int] = None
    assigned_vehicle_number: Optional[str] = None
    current_shipment_id: Optional[int] = None
    current_shipment_number: Optional[str] = None
    class Config:
        from_attributes = True

class ShipmentCreate(BaseModel):
    origin_id: int
    destination_id: int
    category: str
    item_id: Optional[int] = None
    quantity: float
    unit: str = "Units"
    priority: str = "HIGH"
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    route_id: Optional[int] = None
    notes: Optional[str] = ""

class ShipmentResponse(BaseModel):
    id: int
    tracking_number: str
    origin_id: int
    origin_name: Optional[str] = None
    destination_id: int
    destination_name: Optional[str] = None
    category: str
    item_id: Optional[int] = None
    item_name: Optional[str] = None
    quantity: float
    unit: str
    priority: str
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    route_id: Optional[int] = None
    route_name: Optional[str] = None
    status: str
    eta_hours: float
    remaining_km: float
    last_known_checkpoint: str
    notes: str
    created_at: Optional[datetime.datetime] = None
    dispatched_at: Optional[datetime.datetime] = None
    delivered_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class OfflineSyncEventCreate(BaseModel):
    event_id: str
    device_id: str
    shipment_id: Optional[int] = None
    driver_id: Optional[int] = None
    event_type: str # DELAY, OBSTRUCTION, ARRIVAL, DELIVERY_COMPLETE, STATUS_UPDATE
    payload_json: str
    event_timestamp: str

class OfflineSyncBatchRequest(BaseModel):
    device_id: str
    events: List[OfflineSyncEventCreate]

class OfflineSyncBatchResponse(BaseModel):
    status: str
    processed_count: int
    conflicts_detected: int
    sync_timestamp: str
    synced_events: List[Dict[str, Any]]

class SimulationRequest(BaseModel):
    demand_multiplier: float = 1.0 # e.g. 1.25 for +25%
    weather_severity: str = "NORMAL" # NORMAL, RAINSTORM, SNOWFALL, LANDSLIDE_RISK
    route_disruption: bool = False
    vehicle_availability_pct: float = 100.0 # 100% down to 60%
    target_location_id: Optional[int] = None

class SimulationResponse(BaseModel):
    scenario_name: str
    baseline: Dict[str, Any]
    projected: Dict[str, Any]
    impact_delta: Dict[str, Any]
    recommended_mitigation: str
    high_risk_supplies: List[Dict[str, Any]]

class AIRecommendationResponse(BaseModel):
    id: int
    title: str
    category: str
    target_location_id: Optional[int] = None
    target_location_name: Optional[str] = None
    target_item_id: Optional[int] = None
    target_item_name: Optional[str] = None
    priority: str
    reasoning: str
    action_suggested: str
    confidence_pct: float
    status: str
    created_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class DashboardKPISummary(BaseModel):
    total_locations: int
    total_inventory_items: int
    fleet_total_count: int
    inventory_health_pct: float
    at_risk_locations_count: int
    predicted_shortages_count: int
    active_shipments_count: int
    vehicles_en_route_count: int
    weather_alerts_count: int
    ai_brief: str
    system_status: str

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime.datetime
    user_role: str
    user_name: str
    action: str
    entity_type: str
    entity_id: str
    details: str
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    alert_type: str
    priority: str
    target_role: str
    is_read: bool
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class AssistantQueryRequest(BaseModel):
    query: str
    role: Optional[str] = "COMMANDER"

class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    data_context: Dict[str, Any]
    suggested_actions: List[str]
