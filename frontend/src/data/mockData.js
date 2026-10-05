// Comprehensive Synthetic Demo Dataset for FORGE Logistics Grid
// Problem Statement ID: 26251 - Ministry of Defence / Defence Services Staff College

export const INITIAL_KPIS = {
  total_locations: 10,
  total_inventory_items: 21,
  inventory_health_pct: 76.2,
  at_risk_locations_count: 3,
  predicted_shortages_count: 5,
  active_shipments_count: 3,
  vehicles_en_route_count: 2,
  weather_alerts_count: 3,
  ai_brief: "CRITICAL: Forward Post Kilo fuel reserves at 3.4 days. CONVOY-NORTH-703 en route via Route B (Southern Valley). CONVOY-NORTH-702 delayed +3.5h — Pass Echo mud obstruction. 42mm precipitation advisory active on Route A. Route B designated Primary Axis."
};

export const INITIAL_LOCATIONS = [
  {
    id: 1,
    name: "Central Staging Depot Alpha",
    code: "CSD-01",
    location_type: "CENTRAL_DEPOT",
    latitude: 32.9265,
    longitude: 75.1415,
    altitude_m: 1200,
    terrain_type: "Foothill / Staging Plain",
    sector: "Sector North HQ",
    weather_condition: "Clear",
    temp_c: 18.5,
    precipitation_mm: 0.0,
    wind_speed_kmh: 8.5,
    visibility_km: 12.0,
    road_condition: "All-Weather Double Paved",
    current_risk_score: 12.0,
    status: "HEALTHY",
    days_of_supply_min: 28.5
  },
  {
    id: 2,
    name: "Forward Logistics Base 02",
    code: "FLB-02",
    location_type: "FORWARD_BASE",
    latitude: 33.7782,
    longitude: 75.8234,
    altitude_m: 2450,
    terrain_type: "Mountain Valley Axis",
    sector: "Sector North Forward",
    weather_condition: "Scattered Clouds",
    temp_c: 9.2,
    precipitation_mm: 2.1,
    wind_speed_kmh: 14.0,
    visibility_km: 9.5,
    road_condition: "Single Lane Tarred / Gravel Shoulder",
    current_risk_score: 34.0,
    status: "WATCH",
    days_of_supply_min: 14.2
  },
  {
    id: 3,
    name: "Forward Post Kilo",
    code: "FP-KILO",
    location_type: "FORWARD_POST",
    latitude: 34.4285,
    longitude: 76.1332,
    altitude_m: 4300,
    terrain_type: "High Altitude Rugged Spine",
    sector: "Glacier Approach Sector",
    weather_condition: "Heavy Rain & Sleet",
    temp_c: -4.2,
    precipitation_mm: 42.0,
    wind_speed_kmh: 48.0,
    visibility_km: 1.8,
    road_condition: "Mud & Slush Switchback (Restricted)",
    current_risk_score: 86.0,
    status: "CRITICAL",
    days_of_supply_min: 3.4
  },
  {
    id: 4,
    name: "Forward Post Sierra",
    code: "FP-SIERRA",
    location_type: "FORWARD_POST",
    latitude: 34.1950,
    longitude: 76.5120,
    altitude_m: 3850,
    terrain_type: "High Altitude Plateau",
    sector: "Eastern Ridgeline Sector",
    weather_condition: "Light Snow Flurries",
    temp_c: -2.0,
    precipitation_mm: 14.5,
    wind_speed_kmh: 22.0,
    visibility_km: 4.5,
    road_condition: "Compacted Snow & Gravel",
    current_risk_score: 64.0,
    status: "AT_RISK",
    days_of_supply_min: 5.2
  },
  {
    id: 5,
    name: "Base Bravo Tactical Supply Node",
    code: "BB-03",
    location_type: "FORWARD_BASE",
    latitude: 33.3150,
    longitude: 75.4120,
    altitude_m: 1850,
    terrain_type: "Inter-Mountain Basin",
    sector: "Central Sector Reserve",
    weather_condition: "Clear",
    temp_c: 14.0,
    precipitation_mm: 0.0,
    wind_speed_kmh: 6.0,
    visibility_km: 15.0,
    road_condition: "Paved Heavy Axis",
    current_risk_score: 22.0,
    status: "HEALTHY",
    days_of_supply_min: 21.0
  },
  {
    id: 6,
    name: "Observation Post Tango",
    code: "OP-TANGO",
    location_type: "OBSERVATION_POST",
    latitude: 34.5800,
    longitude: 76.3500,
    altitude_m: 4800,
    terrain_type: "Glaciated Ridge",
    sector: "Northern Observation Line",
    weather_condition: "Freezing Fog",
    temp_c: -9.5,
    precipitation_mm: 18.0,
    wind_speed_kmh: 38.0,
    visibility_km: 0.8,
    road_condition: "Trackway Only (Mule / Light Vehicle)",
    current_risk_score: 72.0,
    status: "AT_RISK",
    days_of_supply_min: 6.8
  },
  {
    id: 7,
    name: "Transit Checkpoint Echo",
    code: "TCP-ECHO",
    location_type: "TRANSIT_CAMP",
    latitude: 33.9500,
    longitude: 75.9800,
    altitude_m: 3100,
    terrain_type: "Pass Approach Gorge",
    sector: "Sector North Transit Axis",
    weather_condition: "Rain Showers",
    temp_c: 4.5,
    precipitation_mm: 26.0,
    wind_speed_kmh: 28.0,
    visibility_km: 3.2,
    road_condition: "Slush Accumulation at Switchbacks",
    current_risk_score: 58.0,
    status: "WATCH",
    days_of_supply_min: 12.0
  },
  {
    id: 8,
    name: "Helipad Supply Node Delta",
    code: "HLS-DELTA",
    location_type: "FORWARD_BASE",
    latitude: 34.1200,
    longitude: 75.6500,
    altitude_m: 2900,
    terrain_type: "Valley Terrace",
    sector: "Western Sector Link",
    weather_condition: "Overcast",
    temp_c: 7.0,
    precipitation_mm: 4.0,
    wind_speed_kmh: 12.0,
    visibility_km: 8.0,
    road_condition: "All-Weather Paved Link",
    current_risk_score: 28.0,
    status: "HEALTHY",
    days_of_supply_min: 18.4
  },
  {
    id: 9,
    name: "Forward Post Victor",
    code: "FP-VICTOR",
    location_type: "FORWARD_POST",
    latitude: 34.3500,
    longitude: 76.7200,
    altitude_m: 4100,
    terrain_type: "Rugged Mountain Spur",
    sector: "Eastern Border Axis",
    weather_condition: "Cold & Windy",
    temp_c: -3.5,
    precipitation_mm: 8.0,
    wind_speed_kmh: 32.0,
    visibility_km: 6.0,
    road_condition: "Unpaved Rocky Gradient",
    current_risk_score: 45.0,
    status: "WATCH",
    days_of_supply_min: 9.5
  },
  {
    id: 10,
    name: "Sector Reserve Depot Gamma",
    code: "SRD-GAMMA",
    location_type: "CENTRAL_DEPOT",
    latitude: 33.1000,
    longitude: 74.8500,
    altitude_m: 950,
    terrain_type: "Southern Plains Staging Area",
    sector: "Rear Logistics Sector",
    weather_condition: "Clear",
    temp_c: 22.0,
    precipitation_mm: 0.0,
    wind_speed_kmh: 5.0,
    visibility_km: 18.0,
    road_condition: "National Highway Grade 4-Lane",
    current_risk_score: 8.0,
    status: "HEALTHY",
    days_of_supply_min: 45.0
  }
];

export const INITIAL_INVENTORY = [
  {
    id: 1, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "Arctic Grade Diesel Fuel", category: "Fuel & Energy",
    current_quantity: 320, unit: "Litres", safety_stock: 500, daily_consumption_base: 94.0,
    days_of_supply: 3.4, risk_level: "CRITICAL",
    ai_recommendation: "URGENT: Convoy resupply via Route B required within 48h."
  },
  {
    id: 2, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "Kerosene Heating Barrels", category: "Fuel & Energy",
    current_quantity: 18, unit: "Barrels", safety_stock: 25, daily_consumption_base: 4.0,
    days_of_supply: 4.5, risk_level: "HIGH_RISK",
    ai_recommendation: "Include in next scheduled convoy dispatch."
  },
  {
    id: 3, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "Emergency Ration Packs (MRE)", category: "Food / Rations",
    current_quantity: 120, unit: "Packs", safety_stock: 80, daily_consumption_base: 15.0,
    days_of_supply: 8.0, risk_level: "HEALTHY",
    ai_recommendation: "Buffer adequate for 8 days."
  },
  {
    id: 4, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "Potable Water Canisters (20L)", category: "Water",
    current_quantity: 45, unit: "Canisters", safety_stock: 30, daily_consumption_base: 6.0,
    days_of_supply: 7.5, risk_level: "HEALTHY",
    ai_recommendation: "Sufficient buffer maintained."
  },
  {
    id: 5, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "High-Altitude Trauma Medical Kit", category: "Medical Supplies",
    current_quantity: 12, unit: "Kits", safety_stock: 10, daily_consumption_base: 2.0,
    days_of_supply: 6.0, risk_level: "MEDIUM_RISK",
    ai_recommendation: "Monitor reserve burn."
  },
  {
    id: 6, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "Cold-Weather Field Tent Spares", category: "Shelter & General Supplies",
    current_quantity: 8, unit: "Sets", safety_stock: 5, daily_consumption_base: 0.5,
    days_of_supply: 16.0, risk_level: "HEALTHY",
    ai_recommendation: "Nominal reserve balance."
  },
  {
    id: 7, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "VHF Tactical Radio Battery Packs", category: "Communication Equipment",
    current_quantity: 14, unit: "Packs", safety_stock: 12, daily_consumption_base: 2.0,
    days_of_supply: 7.0, risk_level: "MEDIUM_RISK",
    ai_recommendation: "Stage spare lithium modules at Base Bravo."
  },
  {
    id: 8, location_id: 3, location_name: "Forward Post Kilo",
    item_name: "Generic Controlled Stores Level-1", category: "Controlled Stores",
    current_quantity: 20, unit: "Sealed Containers", safety_stock: 15, daily_consumption_base: 2.5,
    days_of_supply: 8.0, risk_level: "HEALTHY",
    ai_recommendation: "Controlled stores within standard security threshold."
  },
  {
    id: 9, location_id: 4, location_name: "Forward Post Sierra",
    item_name: "Arctic Grade Diesel Fuel", category: "Fuel & Energy",
    current_quantity: 450, unit: "Litres", safety_stock: 400, daily_consumption_base: 86.0,
    days_of_supply: 5.2, risk_level: "HIGH_RISK",
    ai_recommendation: "Schedule resupply within 4 days."
  },
  {
    id: 10, location_id: 4, location_name: "Forward Post Sierra",
    item_name: "Emergency Ration Packs (MRE)", category: "Food / Rations",
    current_quantity: 210, unit: "Packs", safety_stock: 100, daily_consumption_base: 18.0,
    days_of_supply: 11.6, risk_level: "HEALTHY",
    ai_recommendation: "Well-stocked."
  },
  {
    id: 11, location_id: 4, location_name: "Forward Post Sierra",
    item_name: "Vehicle Snow Chains (Heavy Duty)", category: "Maintenance & Spare Parts",
    current_quantity: 6, unit: "Sets", safety_stock: 8, daily_consumption_base: 1.0,
    days_of_supply: 6.0, risk_level: "MEDIUM_RISK",
    ai_recommendation: "Replenish 4 sets before blizzard window."
  },
  {
    id: 12, location_id: 2, location_name: "Forward Logistics Base 02",
    item_name: "High-Speed Diesel (HSD)", category: "Fuel & Energy",
    current_quantity: 4800, unit: "Litres", safety_stock: 3000, daily_consumption_base: 340.0,
    days_of_supply: 14.1, risk_level: "HEALTHY",
    ai_recommendation: "Staging buffer optimal."
  },
  {
    id: 13, location_id: 2, location_name: "Forward Logistics Base 02",
    item_name: "Standard Ration Packs (Dry)", category: "Food / Rations",
    current_quantity: 1400, unit: "Packs", safety_stock: 800, daily_consumption_base: 95.0,
    days_of_supply: 14.7, risk_level: "HEALTHY",
    ai_recommendation: "Adequate stock level."
  },
  {
    id: 14, location_id: 2, location_name: "Forward Logistics Base 02",
    item_name: "Field Antibiotics & Plasma Expanders", category: "Medical Supplies",
    current_quantity: 180, unit: "Units", safety_stock: 100, daily_consumption_base: 12.0,
    days_of_supply: 15.0, risk_level: "HEALTHY",
    ai_recommendation: "Ready for forward allocation."
  },
  {
    id: 15, location_id: 1, location_name: "Central Staging Depot Alpha",
    item_name: "Bulk Aviation Turbine & Diesel Reserve", category: "Fuel & Energy",
    current_quantity: 45000, unit: "Litres", safety_stock: 15000, daily_consumption_base: 1200.0,
    days_of_supply: 37.5, risk_level: "HEALTHY",
    ai_recommendation: "Strategic central reserves nominal."
  },
  {
    id: 16, location_id: 1, location_name: "Central Staging Depot Alpha",
    item_name: "Combat Ration Packs", category: "Food / Rations",
    current_quantity: 8500, unit: "Packs", safety_stock: 3000, daily_consumption_base: 250.0,
    days_of_supply: 34.0, risk_level: "HEALTHY",
    ai_recommendation: "Ample depot surplus."
  },
  {
    id: 17, location_id: 5, location_name: "Base Bravo Tactical Supply Node",
    item_name: "Emergency Ration Packs", category: "Food / Rations",
    current_quantity: 240, unit: "Packs", safety_stock: 200, daily_consumption_base: 50.0,
    days_of_supply: 4.8, risk_level: "HIGH_RISK",
    ai_recommendation: "Dispatch replenishment pallet from CSD-01."
  },
  {
    id: 18, location_id: 6, location_name: "Observation Post Tango",
    item_name: "Arctic Grade Diesel Fuel", category: "Fuel & Energy",
    current_quantity: 180, unit: "Litres", safety_stock: 150, daily_consumption_base: 26.0,
    days_of_supply: 6.9, risk_level: "MEDIUM_RISK",
    ai_recommendation: "Stage helidrop or light convoy window."
  },
  {
    id: 19, location_id: 6, location_name: "Observation Post Tango",
    item_name: "High-Altitude Medical Oxygen Cylinders", category: "Medical Supplies",
    current_quantity: 8, unit: "Cylinders", safety_stock: 6, daily_consumption_base: 1.0,
    days_of_supply: 8.0, risk_level: "HEALTHY",
    ai_recommendation: "Buffer sufficient."
  },
  {
    id: 20, location_id: 7, location_name: "Transit Checkpoint Echo",
    item_name: "Heavy Vehicle Engine Oil & Filters", category: "Maintenance & Spare Parts",
    current_quantity: 24, unit: "Kits", safety_stock: 15, daily_consumption_base: 3.0,
    days_of_supply: 8.0, risk_level: "HEALTHY",
    ai_recommendation: "Checkpoint recovery stock available."
  },
  {
    id: 21, location_id: 9, location_name: "Forward Post Victor",
    item_name: "Potable Water Jerry Cans", category: "Water",
    current_quantity: 60, unit: "Cans", safety_stock: 40, daily_consumption_base: 8.0,
    days_of_supply: 7.5, risk_level: "HEALTHY",
    ai_recommendation: "Adequate drinking water stores."
  }
];

export const INITIAL_VEHICLES = [
  {
    id: 1, vehicle_number: "ARMY-HT-012", model_type: "Ashok Leyland Stallion 4x4",
    capacity_tons: 5.0, fuel_pct: 82, current_lat: 33.7782, current_lng: 75.8234,
    assigned_driver_name: "Hav. Dev Singh", current_shipment_number: "CONVOY-NORTH-701",
    status: "EN_ROUTE", connectivity_status: "ONLINE", odometer_km: 18420
  },
  {
    id: 2, vehicle_number: "ARMY-HT-017", model_type: "Tata LPTA 713 TC 4x4",
    capacity_tons: 2.5, fuel_pct: 90, current_lat: 33.4500, current_lng: 75.5500,
    assigned_driver_name: "Hav. Rajesh Kumar", current_shipment_number: "CONVOY-NORTH-703",
    status: "EN_ROUTE", connectivity_status: "ONLINE", odometer_km: 9840
  },
  {
    id: 3, vehicle_number: "ARMY-HT-031", model_type: "Ashok Leyland Super Stallion 6x6",
    capacity_tons: 10.0, fuel_pct: 68, current_lat: 33.9500, current_lng: 75.9800,
    assigned_driver_name: "Nk. Arjun Rao", current_shipment_number: "CONVOY-NORTH-702",
    status: "DELAYED", connectivity_status: "OFFLINE", odometer_km: 34120
  },
  {
    id: 4, vehicle_number: "ARMY-HT-022", model_type: "Tata Xenon 4x4 Quick Response",
    capacity_tons: 1.2, fuel_pct: 95, current_lat: 32.9265, current_lng: 75.1415,
    assigned_driver_name: "Sep. Kiran Menon", current_shipment_number: null,
    status: "AVAILABLE", connectivity_status: "ONLINE", odometer_km: 5600
  },
  {
    id: 5, vehicle_number: "ARMY-HT-008", model_type: "Ashok Leyland Stallion 4x4",
    capacity_tons: 5.0, fuel_pct: 100, current_lat: 32.9265, current_lng: 75.1415,
    assigned_driver_name: "Hav. Gurdeep Singh", current_shipment_number: null,
    status: "AVAILABLE", connectivity_status: "ONLINE", odometer_km: 12300
  },
  {
    id: 6, vehicle_number: "ARMY-HT-019", model_type: "Tata LPTA 2038 6x6 Heavy",
    capacity_tons: 12.0, fuel_pct: 45, current_lat: 32.9265, current_lng: 75.1415,
    assigned_driver_name: "Nk. Balwant Singh", current_shipment_number: null,
    status: "MAINTENANCE", connectivity_status: "ONLINE", odometer_km: 48900
  },
  {
    id: 7, vehicle_number: "ARMY-HT-025", model_type: "Ashok Leyland Stallion 4x4",
    capacity_tons: 5.0, fuel_pct: 88, current_lat: 33.3150, current_lng: 75.4120,
    assigned_driver_name: "Sep. Manoj Tiwari", current_shipment_number: null,
    status: "AVAILABLE", connectivity_status: "ONLINE", odometer_km: 15200
  },
  {
    id: 8, vehicle_number: "ARMY-HT-034", model_type: "Tata LPTA 713 TC 4x4",
    capacity_tons: 2.5, fuel_pct: 74, current_lat: 32.9265, current_lng: 75.1415,
    assigned_driver_name: "Hav. Ramesh Patil", current_shipment_number: null,
    status: "LOADING", connectivity_status: "ONLINE", odometer_km: 21400
  }
];

export const INITIAL_SHIPMENTS = [
  {
    id: 1, tracking_number: "CONVOY-NORTH-701",
    origin_name: "Central Staging Depot Alpha", destination_name: "Forward Logistics Base 02",
    route_name: "Route B (Valley Axis)", category: "Food / Rations",
    quantity: 600, unit: "Packs", priority: "HIGH",
    vehicle_number: "ARMY-HT-012", driver_name: "Hav. Dev Singh",
    eta_hours: 2.5, status: "EN_ROUTE",
    notes: "Regular weekly forward replenishment ration dispatch."
  },
  {
    id: 2, tracking_number: "CONVOY-NORTH-702",
    origin_name: "Forward Logistics Base 02", destination_name: "Forward Post Sierra",
    route_name: "Route A (High Pass - SLUSH DELAY)", category: "Maintenance & Spare Parts",
    quantity: 12, unit: "Kits", priority: "URGENT",
    vehicle_number: "ARMY-HT-031", driver_name: "Nk. Arjun Rao",
    eta_hours: 6.0, status: "DELAYED",
    notes: "Delayed by mud/slush at Pass Echo km 68. Driver reporting +3.5h delay."
  },
  {
    id: 3, tracking_number: "CONVOY-NORTH-703",
    origin_name: "Central Staging Depot Alpha", destination_name: "Forward Post Kilo",
    route_name: "Route B (Southern Valley All-Weather Axis)", category: "Fuel & Energy",
    quantity: 1200, unit: "Litres", priority: "URGENT",
    vehicle_number: "ARMY-HT-017", driver_name: "Hav. Rajesh Kumar",
    eta_hours: 4.8, status: "EN_ROUTE",
    notes: "Critical fuel resupply for FP-KILO sub-zero heating and generator operations."
  },
  {
    id: 4, tracking_number: "CONVOY-SOUTH-404",
    origin_name: "Central Staging Depot Alpha", destination_name: "Base Bravo Tactical Supply Node",
    route_name: "Foothills Axis", category: "Medical Supplies",
    quantity: 80, unit: "Units", priority: "STANDARD",
    vehicle_number: "ARMY-HT-022", driver_name: "Sep. Kiran Menon",
    eta_hours: 1.2, status: "DELIVERED",
    notes: "Medical stock delivery completed and verified at Base Bravo."
  }
];

export const INITIAL_ROUTES = [
  {
    id: 1, name: "Route A — High Pass Direct Corridor",
    origin_name: "Central Staging Depot Alpha", destination_name: "Forward Post Kilo",
    distance_km: 180, base_eta_hours: 4.5,
    road_condition: "Degraded — Mud / Slush on Switchbacks",
    terrain_risk: 78, weather_risk: 85, composite_score: 61,
    is_recommended: false,
    recommendation_note: "HAZARD: 42mm precipitation active at Pass Echo. High mud-slide risk. Speed cut by 40%."
  },
  {
    id: 2, name: "Route B — Southern Valley All-Weather Axis",
    origin_name: "Central Staging Depot Alpha", destination_name: "Forward Post Kilo",
    distance_km: 205, base_eta_hours: 4.8,
    road_condition: "All-Weather Paved + Graded Hardpack",
    terrain_risk: 24, weather_risk: 30, composite_score: 88,
    is_recommended: true,
    recommendation_note: "PRIMARY RECOMMENDED: +25km longer but bypasses active Pass Echo weather hazard with 98% passability."
  },
  {
    id: 3, name: "Route C — Ridgeline Secondary Axis",
    origin_name: "Central Staging Depot Alpha", destination_name: "Forward Post Kilo",
    distance_km: 230, base_eta_hours: 6.2,
    road_condition: "Unpaved Gravel / Rocky Shoulders",
    terrain_risk: 60, weather_risk: 50, composite_score: 68,
    is_recommended: false,
    recommendation_note: "SECONDARY BACKUP: Heavy vehicle transit speed restricted to 25 km/h."
  }
];

export const INITIAL_RECOMMENDATIONS = [
  {
    id: 1, priority: "CRITICAL", confidence_pct: 94, status: "ACTIVE",
    title: "Urgent Fuel Resupply — Forward Post Kilo",
    reasoning: "FP-KILO Arctic Diesel balance stands at 320L (3.4 days). Meteorological forecast predicts -4.2°C temperature drop and 42mm sleet over next 48h, accelerating generator heating burn by +28%. Convoy transit window via Route B is 4.8 hours.",
    action_suggested: "Dispatch ARMY-HT-017 carrying 1,200L Arctic Grade Diesel via Route B (Valley All-Weather Axis) immediately."
  },
  {
    id: 2, priority: "HIGH", confidence_pct: 87, status: "ACTIVE",
    title: "Route A Hazard Diversion — Pass Echo Obstruction",
    reasoning: "Pass Echo corridor has received 42mm precipitation. High mud-slide probability on hairpin switchbacks. CONVOY-NORTH-702 is already experiencing +3.5h delay on Route A.",
    action_suggested: "Divert all planned and pending heavy transport to Route B (Southern Valley Axis). Issue reroute order to CONVOY-NORTH-702."
  },
  {
    id: 3, priority: "CRITICAL", confidence_pct: 91, status: "APPROVED",
    title: "Pre-Position Kerosene Heating Stores — FP-KILO",
    reasoning: "Kerosene heating reserve at FP-KILO will breach safety stock in 4.5 days. Sub-zero temperatures are critical for troop shelter warmth.",
    action_suggested: "Pre-position 30 barrels of kerosene in the next convoy payload departing from CSD-01."
  }
];

export const INITIAL_STOCKOUTS = [
  {
    item_id: 1, item_name: "Arctic Grade Diesel Fuel", location_name: "Forward Post Kilo",
    category: "Fuel & Energy", current_stock: 320, unit: "Litres", effective_daily_demand: 94.0,
    days_remaining: 3.4, stockout_date: "08 Oct 2026", weather_adjustment_risk: "+28% burn due to sub-zero cold",
    risk_level: "CRITICAL", recommended_action: "Dispatch urgent 1200L fuel convoy via Route B within 24 hours."
  },
  {
    item_id: 2, item_name: "Kerosene Heating Barrels", location_name: "Forward Post Kilo",
    category: "Fuel & Energy", current_stock: 18, unit: "Barrels", effective_daily_demand: 4.0,
    days_remaining: 4.5, stockout_date: "09 Oct 2026", weather_adjustment_risk: "+35% heating demand under sleet",
    risk_level: "HIGH", recommended_action: "Pre-position 30 barrels in scheduled outbound convoy."
  },
  {
    item_id: 9, item_name: "Arctic Grade Diesel Fuel", location_name: "Forward Post Sierra",
    category: "Fuel & Energy", current_stock: 450, unit: "Litres", effective_daily_demand: 86.0,
    days_remaining: 5.2, stockout_date: "10 Oct 2026", weather_adjustment_risk: "+15% generator burn",
    risk_level: "HIGH", recommended_action: "Queue resupply dispatch for cycle starting 07 Oct."
  },
  {
    item_id: 17, item_name: "Emergency Ration Packs", location_name: "Base Bravo Tactical Supply Node",
    category: "Food / Rations", current_stock: 240, unit: "Packs", effective_daily_demand: 50.0,
    days_remaining: 4.8, stockout_date: "10 Oct 2026", weather_adjustment_risk: "Nominal consumption profile",
    risk_level: "HIGH", recommended_action: "Dispatch 500-pack replenishment pallet from CSD-01."
  },
  {
    item_id: 5, item_name: "High-Altitude Trauma Medical Kit", location_name: "Forward Post Kilo",
    category: "Medical Supplies", current_stock: 12, unit: "Kits", effective_daily_demand: 2.0,
    days_remaining: 6.0, stockout_date: "11 Oct 2026", weather_adjustment_risk: "Altitude casualty buffer monitoring",
    risk_level: "MEDIUM", recommended_action: "Include 10 spare kits in upcoming supply convoy."
  }
];
