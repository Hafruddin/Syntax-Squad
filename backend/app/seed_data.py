import datetime
import json
from sqlalchemy.orm import Session
from .models import (
    User, Location, InventoryItem, Vehicle, Driver, Route, Shipment,
    AIRecommendation, AuditLog, SystemNotification
)
from .services.route_optimizer import route_optimizer

def seed_database(db: Session, force: bool = False):
    """
    Populates the database with realistic synthetic demo data for the SIH-2026 Academic Evaluation.
    Guarantees that all KPIs, maps, charts, simulations, and driver scenarios operate immediately out of the box.
    """
    if not force and db.query(Location).count() > 0:
        print("[SEED] Database already populated. Skipping.")
        return

    # Clear existing if force
    if force:
        db.query(SystemNotification).delete()
        db.query(AuditLog).delete()
        db.query(AIRecommendation).delete()
        db.query(Shipment).delete()
        db.query(Route).delete()
        db.query(Driver).delete()
        db.query(Vehicle).delete()
        db.query(InventoryItem).delete()
        db.query(Location).delete()
        db.query(User).delete()
        db.commit()

    print("[SEED] Seeding realistic synthetic military logistics dataset...")

    # 1. USERS & ROLES
    users_data = [
        User(
            username="commander",
            role="COMMANDER",
            full_name="Brig. Vikram S. Rathore",
            rank="Brigadier (Logistics Command)",
            is_active=True
        ),
        User(
            username="logistics_officer",
            role="LOGISTICS_OFFICER",
            full_name="Lt. Col. Ananya Sharma",
            rank="Lt. Colonel (Forward Supply Division)",
            is_active=True
        ),
        User(
            username="driver",
            role="DRIVER",
            full_name="Havildar Rajesh Kumar",
            rank="Havildar (Heavy Transport Convoy)",
            is_active=True
        ),
        User(
            username="operator",
            role="FORWARD_OPERATOR",
            full_name="Subedar Major Gurpreet Singh",
            rank="Subedar Major (Forward Post Kilo Command)",
            is_active=True
        )
    ]
    db.add_all(users_data)
    db.flush()

    # 2. LOCATIONS (Academic Synthetic Sector Nodes in Northern & Western Frontiers)
    # Reference coordinates around Leh/Ladakh, Udhampur, Dras, Kargil, Zanskar, etc.
    locations_data = [
        Location(
            name="Central Staging Depot Alpha",
            code="CSD-01",
            sector="Northern Logistics Hub (Synthetic)",
            location_type="CENTRAL_DEPOT",
            latitude=32.9265,
            longitude=75.1415, # Near Udhampur / Jammu axis
            altitude_m=750,
            terrain_type="Plain Foothill",
            road_condition="Clear / All-Weather Highway",
            current_risk_score=15.0,
            weather_condition="Clear",
            temp_c=22.0,
            precipitation_mm=0.0,
            wind_speed_kmh=10.0,
            visibility_km=12.0,
            status="HEALTHY",
            incoming_shipments_count=2
        ),
        Location(
            name="Forward Logistics Base Bravo",
            code="FLB-02",
            sector="High-Altitude Sector North",
            location_type="FORWARD_OPERATING_BASE",
            latitude=34.1526,
            longitude=77.5771, # Near Leh axis
            altitude_m=3500,
            terrain_type="High Altitude Plateau",
            road_condition="Passable Mountain Highway",
            current_risk_score=38.0,
            weather_condition="Cloudy",
            temp_c=4.0,
            precipitation_mm=2.0,
            wind_speed_kmh=18.0,
            visibility_km=9.0,
            status="WATCH",
            incoming_shipments_count=3
        ),
        Location(
            name="Forward Post Kilo",
            code="FP-KILO",
            sector="Northern Mountain Frontier",
            location_type="FORWARD_POST",
            latitude=34.4285,
            longitude=76.1332, # High-altitude forward spur
            altitude_m=4150,
            terrain_type="Mountain Rugged",
            road_condition="Restricted - Slush & Rockfall Advisory",
            current_risk_score=86.0, # CRITICAL DEMO SCENARIO
            weather_condition="Heavy Rain & Sleet",
            temp_c=-2.0,
            precipitation_mm=42.0,
            wind_speed_kmh=35.0,
            visibility_km=2.5,
            status="CRITICAL",
            incoming_shipments_count=1
        ),
        Location(
            name="Forward Operating Base Tango",
            code="FOB-TANGO",
            sector="Eastern High Plateau",
            location_type="FORWARD_OPERATING_BASE",
            latitude=33.5200,
            longitude=76.8500,
            altitude_m=3200,
            terrain_type="Mountain",
            road_condition="Passable",
            current_risk_score=48.0,
            weather_condition="Overcast",
            temp_c=6.0,
            precipitation_mm=5.0,
            wind_speed_kmh=20.0,
            visibility_km=7.0,
            status="WATCH",
            incoming_shipments_count=1
        ),
        Location(
            name="Forward Post Sierra",
            code="FP-SIERRA",
            sector="Valley Defile Sector",
            location_type="FORWARD_POST",
            latitude=34.2800,
            longitude=75.7600,
            altitude_m=2800,
            terrain_type="Mountain Forest",
            road_condition="Mud Slush Advisory",
            current_risk_score=68.0,
            weather_condition="Heavy Rain",
            temp_c=8.0,
            precipitation_mm=38.0,
            wind_speed_kmh=28.0,
            visibility_km=4.0,
            status="AT_RISK",
            incoming_shipments_count=1
        ),
        Location(
            name="Forward Outpost Zulu",
            code="FO-ZULU",
            sector="Glacial Ridge Synthetic Sector",
            location_type="FORWARD_POST",
            latitude=34.8500,
            longitude=76.9500,
            altitude_m=4600,
            terrain_type="High Altitude Glacier Spur",
            road_condition="Single-Track Packed Snow",
            current_risk_score=76.0,
            weather_condition="Snow Flurries",
            temp_c=-11.0,
            precipitation_mm=12.0,
            wind_speed_kmh=40.0,
            visibility_km=3.0,
            status="AT_RISK",
            incoming_shipments_count=0
        ),
        Location(
            name="Forward Post Delta",
            code="FP-DELTA",
            sector="Central Valley Link",
            location_type="FORWARD_POST",
            latitude=33.2000,
            longitude=75.6000,
            altitude_m=1800,
            terrain_type="Forest Valley",
            road_condition="Clear Paved",
            current_risk_score=22.0,
            weather_condition="Clear",
            temp_c=18.0,
            precipitation_mm=0.0,
            wind_speed_kmh=8.0,
            visibility_km=14.0,
            status="HEALTHY",
            incoming_shipments_count=1
        ),
        Location(
            name="Staging Hub Echo",
            code="SH-ECHO",
            sector="Intermediate Supply Axis",
            location_type="FORWARD_OPERATING_BASE",
            latitude=33.8000,
            longitude=75.4000,
            altitude_m=2200,
            terrain_type="Foothill Basin",
            road_condition="Clear",
            current_risk_score=28.0,
            weather_condition="Partly Cloudy",
            temp_c=14.0,
            precipitation_mm=1.0,
            wind_speed_kmh=12.0,
            visibility_km=10.0,
            status="HEALTHY",
            incoming_shipments_count=2
        ),
        Location(
            name="Forward Post Victor",
            code="FP-VICTOR",
            sector="Western Synthetic Ridge",
            location_type="FORWARD_POST",
            latitude=33.9500,
            longitude=74.6500,
            altitude_m=3400,
            terrain_type="Mountain",
            road_condition="Passable",
            current_risk_score=35.0,
            weather_condition="Breezy",
            temp_c=7.0,
            precipitation_mm=0.0,
            wind_speed_kmh=22.0,
            visibility_km=11.0,
            status="HEALTHY",
            incoming_shipments_count=1
        ),
        Location(
            name="Tactical Support Base Romeo",
            code="TSB-ROMEO",
            sector="Southern Staging Corridor",
            location_type="CENTRAL_DEPOT",
            latitude=32.6500,
            longitude=74.8700,
            altitude_m=350,
            terrain_type="Plain",
            road_condition="Optimal All-Weather",
            current_risk_score=12.0,
            weather_condition="Clear",
            temp_c=26.0,
            precipitation_mm=0.0,
            wind_speed_kmh=6.0,
            visibility_km=15.0,
            status="HEALTHY",
            incoming_shipments_count=1
        )
    ]
    db.add_all(locations_data)
    db.flush()

    # Map locations by code for easy reference
    loc_by_code = {loc.code: loc for loc in locations_data}

    # 3. INVENTORY ITEMS (Covering all 8 official categories)
    # Notice the critical demo item: Fuel at Forward Post Kilo!
    items_data = [
        # --- FORWARD POST KILO (CRITICAL DEMO FOCUS) ---
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="High-Altitude Diesel Fuel (Arctic Grade)",
            category="Fuel & Energy",
            unit="Litres",
            current_quantity=320.0, # Will exhaust in 3.4 days!
            daily_consumption_base=94.0,
            safety_stock=500.0,
            reorder_threshold=700.0,
            status="CRITICAL"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="Kerosene Room Heating Barrels",
            category="Fuel & Energy",
            unit="Barrels",
            current_quantity=18.0,
            daily_consumption_base=4.0,
            safety_stock=25.0,
            reorder_threshold=35.0,
            status="HIGH_RISK"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="High-Altitude Composite Ration Packs (One-Man)",
            category="Food / Rations",
            unit="Packs",
            current_quantity=480.0,
            daily_consumption_base=65.0,
            safety_stock=400.0,
            reorder_threshold=600.0,
            status="MEDIUM_RISK"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="Potable Water 20L Jerrycans",
            category="Water",
            unit="Cans",
            current_quantity=75.0,
            daily_consumption_base=18.0,
            safety_stock=60.0,
            reorder_threshold=100.0,
            status="MEDIUM_RISK"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="High Altitude Pulmonary Edema (HAPE) Drug Packs",
            category="Medical Supplies",
            unit="Kits",
            current_quantity=14.0,
            daily_consumption_base=1.2,
            safety_stock=10.0,
            reorder_threshold=20.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="Sub-Zero Extreme Cold Weather Tents (4-Man)",
            category="Shelter & General Supplies",
            unit="Units",
            current_quantity=8.0,
            daily_consumption_base=0.1,
            safety_stock=5.0,
            reorder_threshold=10.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="Tactical VHF Handheld Radios (Encrypted)",
            category="Communication Equipment",
            unit="Sets",
            current_quantity=16.0,
            daily_consumption_base=0.2,
            safety_stock=10.0,
            reorder_threshold=18.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-KILO"].id,
            item_name="Controlled Technical Defence Stores (Generic Class Alpha)",
            category="Controlled Stores",
            unit="Units",
            current_quantity=12.0,
            daily_consumption_base=0.5,
            safety_stock=8.0,
            reorder_threshold=15.0,
            status="LOW"
        ),

        # --- CENTRAL STAGING DEPOT ALPHA (HIGH CAPACITY) ---
        InventoryItem(
            location_id=loc_by_code["CSD-01"].id,
            item_name="High-Altitude Diesel Fuel (Arctic Grade)",
            category="Fuel & Energy",
            unit="Litres",
            current_quantity=45000.0,
            daily_consumption_base=500.0,
            safety_stock=8000.0,
            reorder_threshold=15000.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["CSD-01"].id,
            item_name="High-Altitude Composite Ration Packs (One-Man)",
            category="Food / Rations",
            unit="Packs",
            current_quantity=12000.0,
            daily_consumption_base=150.0,
            safety_stock=2000.0,
            reorder_threshold=4000.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["CSD-01"].id,
            item_name="Potable Water 20L Jerrycans",
            category="Water",
            unit="Cans",
            current_quantity=3200.0,
            daily_consumption_base=40.0,
            safety_stock=500.0,
            reorder_threshold=1000.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["CSD-01"].id,
            item_name="Emergency Field Surgical & Trauma Kits",
            category="Medical Supplies",
            unit="Kits",
            current_quantity=450.0,
            daily_consumption_base=5.0,
            safety_stock=80.0,
            reorder_threshold=150.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["CSD-01"].id,
            item_name="Heavy 4x4 Snow Chains & Axle Spares",
            category="Maintenance & Spare Parts",
            unit="Sets",
            current_quantity=220.0,
            daily_consumption_base=3.0,
            safety_stock=40.0,
            reorder_threshold=80.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["CSD-01"].id,
            item_name="Controlled Technical Defence Stores (Generic Class Alpha)",
            category="Controlled Stores",
            unit="Units",
            current_quantity=120.0,
            daily_consumption_base=1.0,
            safety_stock=20.0,
            reorder_threshold=40.0,
            status="HEALTHY"
        ),

        # --- FORWARD BASE BRAVO ---
        InventoryItem(
            location_id=loc_by_code["FLB-02"].id,
            item_name="High-Altitude Diesel Fuel (Arctic Grade)",
            category="Fuel & Energy",
            unit="Litres",
            current_quantity=8400.0,
            daily_consumption_base=320.0,
            safety_stock=2500.0,
            reorder_threshold=4500.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["FLB-02"].id,
            item_name="High-Altitude Composite Ration Packs (One-Man)",
            category="Food / Rations",
            unit="Packs",
            current_quantity=2100.0,
            daily_consumption_base=120.0,
            safety_stock=800.0,
            reorder_threshold=1400.0,
            status="HEALTHY"
        ),
        InventoryItem(
            location_id=loc_by_code["FLB-02"].id,
            item_name="Sub-Zero Extreme Cold Weather Tents (4-Man)",
            category="Shelter & General Supplies",
            unit="Units",
            current_quantity=45.0,
            daily_consumption_base=1.5,
            safety_stock=20.0,
            reorder_threshold=35.0,
            status="HEALTHY"
        ),

        # --- FORWARD POST SIERRA (AT RISK) ---
        InventoryItem(
            location_id=loc_by_code["FP-SIERRA"].id,
            item_name="High-Altitude Diesel Fuel (Arctic Grade)",
            category="Fuel & Energy",
            unit="Litres",
            current_quantity=450.0,
            daily_consumption_base=85.0,
            safety_stock=400.0,
            reorder_threshold=650.0,
            status="LOW"
        ),
        InventoryItem(
            location_id=loc_by_code["FP-SIERRA"].id,
            item_name="Potable Water 20L Jerrycans",
            category="Water",
            unit="Cans",
            current_quantity=60.0,
            daily_consumption_base=22.0,
            safety_stock=50.0,
            reorder_threshold=90.0,
            status="LOW"
        ),

        # --- FORWARD OUTPOST ZULU (GLACIER RIDGE) ---
        InventoryItem(
            location_id=loc_by_code["FO-ZULU"].id,
            item_name="Kerosene Room Heating Barrels",
            category="Fuel & Energy",
            unit="Barrels",
            current_quantity=12.0,
            daily_consumption_base=3.8,
            safety_stock=15.0,
            reorder_threshold=25.0,
            status="HIGH_RISK"
        ),
        InventoryItem(
            location_id=loc_by_code["FO-ZULU"].id,
            item_name="High-Altitude Composite Ration Packs (One-Man)",
            category="Food / Rations",
            unit="Packs",
            current_quantity=290.0,
            daily_consumption_base=45.0,
            safety_stock=200.0,
            reorder_threshold=350.0,
            status="MEDIUM_RISK"
        )
    ]
    db.add_all(items_data)
    db.flush()

    # 4. VEHICLES (Fleet across sectors)
    vehicles_data = [
        Vehicle(
            vehicle_number="ARMY-HT-017",
            model_type="Heavy All-Terrain 6x6 Tanker",
            capacity_tons=10.0,
            current_lat=33.4500,
            current_lng=75.6200,
            status="EN_ROUTE",
            fuel_pct=78.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=18450.0
        ),
        Vehicle(
            vehicle_number="ARMY-HT-024",
            model_type="Heavy Transport 4x4 Cargo",
            capacity_tons=7.5,
            current_lat=32.9265,
            current_lng=75.1415, # At Central Depot Alpha
            status="AVAILABLE",
            fuel_pct=95.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=14200.0
        ),
        Vehicle(
            vehicle_number="ARMY-TC-009",
            model_type="Light Tactical Carrier 4x4",
            capacity_tons=3.5,
            current_lat=34.1526,
            current_lng=77.5771, # At Base Bravo
            status="AVAILABLE",
            fuel_pct=88.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=9850.0
        ),
        Vehicle(
            vehicle_number="ARMY-HT-031",
            model_type="All-Terrain 6x6 Cold Climate",
            capacity_tons=8.0,
            current_lat=34.3100,
            current_lng=75.9500,
            status="DELAYED", # Delayed Convoy
            fuel_pct=62.0,
            connectivity_status="OFFLINE", # OFFLINE DEMO VEHICLE
            last_sync_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=15),
            odometer_km=21300.0
        ),
        Vehicle(
            vehicle_number="ARMY-HT-042",
            model_type="Heavy All-Terrain 6x6 Tanker",
            capacity_tons=10.0,
            current_lat=32.9265,
            current_lng=75.1415,
            status="LOADING",
            fuel_pct=100.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=11200.0
        ),
        Vehicle(
            vehicle_number="ARMY-TC-015",
            model_type="High Altitude Utility Truck",
            capacity_tons=5.0,
            current_lat=33.8000,
            current_lng=75.4000,
            status="AVAILABLE",
            fuel_pct=82.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=16500.0
        ),
        Vehicle(
            vehicle_number="ARMY-HT-055",
            model_type="Heavy Transport 4x4 Cargo",
            capacity_tons=7.5,
            current_lat=32.6500,
            current_lng=74.8700,
            status="MAINTENANCE",
            fuel_pct=40.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=32100.0
        ),
        Vehicle(
            vehicle_number="ARMY-TC-022",
            model_type="Light Tactical Carrier 4x4",
            capacity_tons=3.5,
            current_lat=33.2000,
            current_lng=75.6000,
            status="AVAILABLE",
            fuel_pct=90.0,
            connectivity_status="ONLINE",
            last_sync_at=datetime.datetime.utcnow(),
            odometer_km=8700.0
        )
    ]
    db.add_all(vehicles_data)
    db.flush()

    # 5. DRIVERS
    drivers_data = [
        Driver(
            name="Havildar Rajesh Kumar",
            service_id="DRV-98421",
            phone="+91-9876543210",
            status="EN_ROUTE",
            assigned_vehicle_id=vehicles_data[0].id
        ),
        Driver(
            name="Naik Devendra Rawat",
            service_id="DRV-74125",
            phone="+91-9876543211",
            status="AVAILABLE",
            assigned_vehicle_id=vehicles_data[1].id
        ),
        Driver(
            name="Lance Naik Harpal Singh",
            service_id="DRV-56238",
            phone="+91-9876543212",
            status="AVAILABLE",
            assigned_vehicle_id=vehicles_data[2].id
        ),
        Driver(
            name="Havildar Sunil Thapa",
            service_id="DRV-33981",
            phone="+91-9876543213",
            status="EN_ROUTE", # Offline delayed driver
            assigned_vehicle_id=vehicles_data[3].id
        ),
        Driver(
            name="Naik Amit Kumar",
            service_id="DRV-11847",
            phone="+91-9876543214",
            status="AVAILABLE",
            assigned_vehicle_id=vehicles_data[4].id
        ),
        Driver(
            name="Sepoy Kuldeep Yadav",
            service_id="DRV-88241",
            phone="+91-9876543215",
            status="AVAILABLE",
            assigned_vehicle_id=vehicles_data[5].id
        )
    ]
    db.add_all(drivers_data)
    db.flush()

    # Link vehicles with driver id
    vehicles_data[0].assigned_driver_id = drivers_data[0].id
    vehicles_data[1].assigned_driver_id = drivers_data[1].id
    vehicles_data[2].assigned_driver_id = drivers_data[2].id
    vehicles_data[3].assigned_driver_id = drivers_data[3].id
    vehicles_data[4].assigned_driver_id = drivers_data[4].id
    vehicles_data[5].assigned_driver_id = drivers_data[5].id
    db.flush()

    # 6. ROUTES (Between Central Depot Alpha and Forward Post Kilo, etc.)
    c_depot = loc_by_code["CSD-01"]
    fp_kilo = loc_by_code["FP-KILO"]
    routes_raw = route_optimizer.generate_candidate_routes(
        c_depot.name, c_depot.latitude, c_depot.longitude,
        fp_kilo.name, fp_kilo.latitude, fp_kilo.longitude,
        weather_condition="Heavy Rain & Sleet"
    )

    created_routes = []
    for r in routes_raw:
        rt = Route(
            origin_id=c_depot.id,
            destination_id=fp_kilo.id,
            route_name=r["route_name"],
            distance_km=r["distance_km"],
            base_eta_hours=r["base_eta_hours"],
            terrain_risk=r["terrain_risk"],
            weather_risk=r["weather_risk"],
            road_condition=r["road_condition"],
            reliability_score=r["reliability_score"],
            composite_score=r["composite_score"],
            is_recommended=r["is_recommended"],
            checkpoints_json=json.dumps(r["checkpoints"]),
            geometry_json=json.dumps(r["geometry"])
        )
        db.add(rt)
        created_routes.append(rt)
    db.flush()

    # 7. ACTIVE SHIPMENTS
    fuel_kilo_item = next(it for it in items_data if it.item_name.startswith("High-Altitude Diesel Fuel") and it.location_id == fp_kilo.id)
    
    shipments_data = [
        Shipment(
            tracking_number="CONVOY-NORTH-701",
            origin_id=c_depot.id,
            destination_id=loc_by_code["FLB-02"].id,
            category="Fuel & Energy",
            item_id=items_data[0].id,
            quantity=8000.0,
            unit="Litres",
            priority="HIGH",
            vehicle_id=vehicles_data[0].id,
            driver_id=drivers_data[0].id,
            route_id=created_routes[0].id,
            status="EN_ROUTE",
            eta_hours=3.4,
            remaining_km=95.0,
            last_known_checkpoint="Valley Transit Checkpost Charlie",
            notes="Convoy on schedule. Weather stable on Southern Valley Axis.",
            dispatched_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        ),
        Shipment(
            tracking_number="CONVOY-NORTH-702",
            origin_id=c_depot.id,
            destination_id=loc_by_code["FP-SIERRA"].id,
            category="Food / Rations",
            item_id=items_data[2].id,
            quantity=500.0,
            unit="Packs",
            priority="HIGH",
            vehicle_id=vehicles_data[3].id,
            driver_id=drivers_data[3].id,
            route_id=created_routes[1].id,
            status="DELAYED",
            eta_hours=6.8,
            remaining_km=110.0,
            last_known_checkpoint="Mountain Ridge Pass Echo",
            notes="Mud and slush accumulation. Convoy traveling under 20km/h safety restrictions.",
            dispatched_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
        ),
        Shipment(
            tracking_number="CONVOY-NORTH-703",
            origin_id=c_depot.id,
            destination_id=fp_kilo.id,
            category="Fuel & Energy",
            item_id=fuel_kilo_item.id,
            quantity=1200.0,
            unit="Litres",
            priority="URGENT",
            vehicle_id=vehicles_data[1].id,
            driver_id=drivers_data[1].id,
            route_id=created_routes[0].id,
            status="PLANNED",
            eta_hours=5.9,
            remaining_km=205.0,
            last_known_checkpoint="Central Staging Depot Gate",
            notes="Proactive fuel replenishment mission authorized under AI Recommendation #REC-01.",
            created_at=datetime.datetime.utcnow()
        ),
        Shipment(
            tracking_number="CONVOY-NORTH-699",
            origin_id=c_depot.id,
            destination_id=loc_by_code["FP-DELTA"].id,
            category="Medical Supplies",
            quantity=80.0,
            unit="Kits",
            priority="STANDARD",
            vehicle_id=vehicles_data[4].id,
            driver_id=drivers_data[4].id,
            status="DELIVERED",
            eta_hours=0.0,
            remaining_km=0.0,
            last_known_checkpoint="FP Delta Base Perimeter",
            notes="Mission completed successfully. Proof of delivery signed.",
            dispatched_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            delivered_at=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
        )
    ]
    db.add_all(shipments_data)
    db.flush()

    # 8. AI RECOMMENDATIONS
    recommendations_data = [
        AIRecommendation(
            title="CRITICAL: Emergency Fuel Replenishment for Forward Post Kilo",
            category="INVENTORY_REPLENISHMENT",
            target_location_id=fp_kilo.id,
            target_item_id=fuel_kilo_item.id,
            priority="CRITICAL",
            reasoning=(
                "Problem: Arctic Fuel stock at Forward Post Kilo stands at 320 Litres (Coverage: 3.4 days). "
                "Cause: Consumption increased by +22% due to sub-zero night heating, while inclement weather threatens transit passes. "
                "Prediction: Total stockout will occur within 3.4 days if replenishment is not dispatched within the next 24 hours. "
                "Impact: Generator shutdown will degrade high-altitude communications and heating."
            ),
            action_suggested=(
                "Action: Approve Convoy CONVOY-NORTH-703 dispatching 1,200L Arctic Diesel via Route B (Southern Valley Axis). "
                "Route B bypasses the active storm warning across Mountain Pass Echo."
            ),
            confidence_pct=93.4,
            status="ACTIVE"
        ),
        AIRecommendation(
            title="ROUTE REROUTE: Avoid High Pass Echo Corridor",
            category="ROUTE_SAFETY",
            target_location_id=fp_kilo.id,
            priority="HIGH",
            reasoning=(
                "Problem: Heavy rain and sleet advisory issued across Pass Echo (Route A). "
                "Cause: Weather radar indicates 42mm precipitation, elevating rockfall risk to 85%. "
                "Prediction: Heavy transport convoys using Route A face an expected delay of +3.5 to 5 hours or road blockage. "
                "Impact: Delay in critical supply arrivals."
            ),
            action_suggested="Action: Mandatory diversion of all military logistics traffic to All-Weather Axis Route B.",
            confidence_pct=88.5,
            status="ACTIVE"
        ),
        AIRecommendation(
            title="PREVENTIVE FLEET: Vehicle ARMY-HT-055 Service Interval",
            category="FLEET_MAINTENANCE",
            priority="MEDIUM",
            reasoning="Problem: Vehicle ARMY-HT-055 has completed 32,100 km. Heavy axle suspension requires routine scheduled depot inspection before next high-altitude sortie.",
            action_suggested="Action: Direct vehicle to Tactical Support Base Romeo maintenance bay.",
            confidence_pct=95.0,
            status="ACTIVE"
        )
    ]
    db.add_all(recommendations_data)

    # 9. SYSTEM NOTIFICATIONS
    notifications_data = [
        SystemNotification(
            title="CRITICAL STOCK ALERT: Forward Post Kilo",
            message="Diesel fuel reserves below 4.0 days of supply threshold (Current: 3.4 days). Urgent replenishment required.",
            alert_type="CRITICAL",
            priority="HIGH",
            target_role="COMMANDER"
        ),
        SystemNotification(
            title="INCLEMENT WEATHER WARNING: Pass Echo Sector",
            message="Heavy rain and sleet detected along Route A corridor. Route risk index elevated to 85/100.",
            alert_type="WEATHER",
            priority="HIGH",
            target_role="LOGISTICS_OFFICER"
        ),
        SystemNotification(
            title="CONVOY DELAY RECORDED: CONVOY-NORTH-702",
            message="Convoy delayed +2.8h due to mud slush advisory at Pass Echo. Telemetry synced.",
            alert_type="DELAY",
            priority="MEDIUM",
            target_role="LOGISTICS_OFFICER"
        ),
        SystemNotification(
            title="DELIVERY COMPLETE: CONVOY-NORTH-699",
            message="Medical supplies successfully delivered to Forward Post Delta. Stock registers updated.",
            alert_type="SUCCESS",
            priority="LOW",
            target_role="COMMANDER"
        )
    ]
    db.add_all(notifications_data)

    # 10. AUDIT LOGS
    audit_data = [
        AuditLog(
            user_role="COMMANDER",
            user_name="Brig. Vikram S. Rathore",
            action="INITIALIZE_GRID_STATE",
            entity_type="SYSTEM",
            entity_id="SYS-2026",
            details="FORGE Predictive Logistics Grid initialized for Northern Synthetic Sector."
        ),
        AuditLog(
            user_role="LOGISTICS_OFFICER",
            user_name="Lt. Col. Ananya Sharma",
            action="PLAN_SHIPMENT",
            entity_type="SHIPMENT",
            entity_id="CONVOY-NORTH-703",
            details="Created replenishment draft for Forward Post Kilo fuel stores."
        ),
        AuditLog(
            user_role="SYSTEM_AI",
            user_name="FORGE AI Engine",
            action="GENERATE_RECOMMENDATION",
            entity_type="RECOMMENDATION",
            entity_id="REC-01",
            details="Triggered proactive stockout warning for Arctic Diesel Fuel at FP Kilo."
        )
    ]
    db.add_all(audit_data)

    db.commit()
    print("[SEED] Successfully seeded complete realistic dataset!")

if __name__ == "__main__":
    from .database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db, force=True)
    db.close()
