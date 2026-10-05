import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(30), nullable=False) # COMMANDER, LOGISTICS_OFFICER, DRIVER, FORWARD_OPERATOR
    full_name = Column(String(100), nullable=False)
    rank = Column(String(50), default="Officer")
    assigned_location_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    sector = Column(String(50), default="Northern Synthetic Sector") # Academic synthetic sector
    location_type = Column(String(50), default="FORWARD_POST") # CENTRAL_DEPOT, FORWARD_OPERATING_BASE, FORWARD_POST
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude_m = Column(Integer, default=3200)
    terrain_type = Column(String(50), default="Mountain") # Mountain, Desert, Plain, Forest, High Altitude
    road_condition = Column(String(50), default="Passable") # Clear, Rough, Restricted, Blocked
    current_risk_score = Column(Float, default=25.0) # 0 to 100
    weather_condition = Column(String(50), default="Clear")
    temp_c = Column(Float, default=12.0)
    precipitation_mm = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=14.0)
    visibility_km = Column(Float, default=10.0)
    status = Column(String(30), default="HEALTHY") # HEALTHY, WATCH, AT_RISK, CRITICAL
    incoming_shipments_count = Column(Integer, default=0)

    # Relationships
    inventory_items = relationship("InventoryItem", back_populates="location", cascade="all, delete-orphan")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    item_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # Food / Rations, Water, Fuel & Energy, Medical Supplies, Maintenance & Spare Parts, Shelter & General Supplies, Communication Equipment, Controlled Stores
    unit = Column(String(20), default="Units") # Litres, Kg, Kits, Boxes, Packs, Barrels
    current_quantity = Column(Float, default=100.0)
    daily_consumption_base = Column(Float, default=10.0)
    safety_stock = Column(Float, default=30.0)
    reorder_threshold = Column(Float, default=50.0)
    status = Column(String(30), default="HEALTHY") # HEALTHY, LOW, MEDIUM_RISK, HIGH_RISK, CRITICAL
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    location = relationship("Location", back_populates="inventory_items")

class ConsumptionRecord(Base):
    __tablename__ = "consumption_records"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    consumed_qty = Column(Float, nullable=False)
    recorded_by = Column(String(100), default="Forward Logistics Post")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(30), unique=True, nullable=False)
    model_type = Column(String(50), default="Heavy Transport 4x4") # Heavy Transport 4x4, All-Terrain 6x6, Light Tactical Carrier, Cold-Climate Tanker
    capacity_tons = Column(Float, default=7.5)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, LOADING, EN_ROUTE, DELAYED, MAINTENANCE, OFFLINE, ARRIVED
    fuel_pct = Column(Float, default=85.0)
    assigned_driver_id = Column(Integer, nullable=True)
    connectivity_status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, SYNCING
    last_sync_at = Column(DateTime, default=datetime.datetime.utcnow)
    odometer_km = Column(Float, default=14200.0)

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    service_id = Column(String(30), unique=True, nullable=False)
    phone = Column(String(20), default="+91-9876543210")
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, ASSIGNED, EN_ROUTE, RESTING
    assigned_vehicle_id = Column(Integer, nullable=True)
    current_shipment_id = Column(Integer, nullable=True)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    origin_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    route_name = Column(String(100), nullable=False)
    distance_km = Column(Float, nullable=False)
    base_eta_hours = Column(Float, nullable=False)
    terrain_risk = Column(Float, default=20.0) # 0-100
    weather_risk = Column(Float, default=15.0) # 0-100
    road_condition = Column(String(50), default="Optimal")
    reliability_score = Column(Float, default=92.0)
    composite_score = Column(Float, default=88.0) # Higher is better
    is_recommended = Column(Boolean, default=False)
    checkpoints_json = Column(Text, default="[]") # JSON list of checkpoints
    geometry_json = Column(Text, default="[]") # JSON list of [lat, lng] coordinates

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    origin_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    category = Column(String(50), default="Fuel & Energy")
    item_id = Column(Integer, nullable=True)
    quantity = Column(Float, default=500.0)
    unit = Column(String(20), default="Litres")
    priority = Column(String(20), default="HIGH") # URGENT, HIGH, STANDARD, ROUTINE
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    status = Column(String(30), default="PLANNED") # PLANNED, LOADING, DISPATCHED, EN_ROUTE, DELAYED, ARRIVED, DELIVERED, CANCELLED
    eta_hours = Column(Float, default=5.5)
    remaining_km = Column(Float, default=140.0)
    last_known_checkpoint = Column(String(100), default="Central Base Logistics Outpost")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    dispatched_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

class OfflineSyncEvent(Base):
    __tablename__ = "offline_sync_events"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), unique=True, index=True, nullable=False)
    device_id = Column(String(50), nullable=False)
    shipment_id = Column(Integer, nullable=True)
    driver_id = Column(Integer, nullable=True)
    event_type = Column(String(50), nullable=False) # DELAY, OBSTRUCTION, ARRIVAL, DELIVERY_COMPLETE, GPS_BREADCRUMB, STATUS_CHANGE
    payload_json = Column(Text, default="{}")
    event_timestamp = Column(String(50), nullable=False)
    server_synced_at = Column(DateTime, default=datetime.datetime.utcnow)
    sync_status = Column(String(30), default="SYNCED") # PENDING, SYNCED, CONFLICT

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), default="INVENTORY_REPLENISHMENT")
    target_location_id = Column(Integer, nullable=True)
    target_item_id = Column(Integer, nullable=True)
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    reasoning = Column(Text, nullable=False)
    action_suggested = Column(Text, nullable=False)
    confidence_pct = Column(Float, default=88.0)
    status = Column(String(30), default="ACTIVE") # ACTIVE, APPROVED, DISMISSED, EXECUTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_role = Column(String(50), default="COMMANDER")
    user_name = Column(String(100), default="Commander Sector Logistics")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), default="SYSTEM")
    entity_id = Column(String(50), default="N/A")
    details = Column(Text, default="")

class SystemNotification(Base):
    __tablename__ = "system_notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String(30), default="INFO") # CRITICAL, HIGH_RISK, WEATHER, DELAY, SYNC, SUCCESS
    priority = Column(String(20), default="MEDIUM")
    target_role = Column(String(50), default="ALL")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
