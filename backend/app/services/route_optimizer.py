from typing import Dict, Any, List
import json

class RouteOptimizationEngine:
    """
    Evaluates multi-criteria routes between Central Logistics Depots and Forward Operating Posts.
    Does not purely minimize distance: balances road stability, weather exposure, terrain gradient,
    and historical delay to maximize operational mission success probability.
    """

    def calculate_route_score(
        self,
        distance_km: float,
        eta_hours: float,
        terrain_risk: float,  # 0 to 100
        weather_risk: float,  # 0 to 100
        road_condition: str,
        reliability_score: float
    ) -> Dict[str, Any]:
        road_penalty = 0.0
        if "Blocked" in road_condition:
            road_penalty = 50.0
        elif "Restricted" in road_condition:
            road_penalty = 25.0
        elif "Rough" in road_condition:
            road_penalty = 12.0

        # Composite score formula: Higher is better (0 to 100)
        # Baseline from reliability (30%), inverted weather (25%), inverted terrain (20%), speed factor (15%), road condition (10%)
        speed_factor = max(10.0, 100.0 - (eta_hours * 8.0))
        composite = (
            (reliability_score * 0.30) +
            ((100.0 - weather_risk) * 0.25) +
            ((100.0 - terrain_risk) * 0.20) +
            (speed_factor * 0.15) +
            ((100.0 - road_penalty) * 0.10)
        )
        composite = round(min(100.0, max(1.0, composite)), 1)

        recommendation_reason = ""
        if composite >= 80:
            recommendation_reason = "Recommended: Superior weather resilience, minimal mountain pass delay risk, and paved all-weather segments."
        elif composite >= 65:
            recommendation_reason = "Viable secondary axis: Passable with caution under standard convoy speed restrictions."
        else:
            recommendation_reason = "High hazard: Prone to bottlenecking, active weather advisories, or degraded trail surface."

        return {
            "composite_score": composite,
            "road_penalty": road_penalty,
            "reason": recommendation_reason
        }

    def generate_candidate_routes(
        self,
        origin_name: str,
        origin_lat: float,
        origin_lng: float,
        dest_name: str,
        dest_lat: float,
        dest_lng: float,
        weather_condition: str = "Clear"
    ) -> List[Dict[str, Any]]:
        """
        Generates realistic synthetic multi-route alternatives for forward supply delivery.
        Route A: Direct arterial (shorter distance, but high mountain pass risk in adverse weather)
        Route B: Valley bypass route (longer distance, lower gradient, paved, safer)
        Route C: Tactical high-altitude spur (rugged emergency backup)
        """
        is_bad_weather = "Rain" in weather_condition or "Snow" in weather_condition or "Storm" in weather_condition

        # Route A: Mountain Highway Corridor
        route_a_dist = 180.0
        route_a_eta = 6.3 if is_bad_weather else 4.8
        route_a_terrain_risk = 72.0
        route_a_weather_risk = 85.0 if is_bad_weather else 25.0
        route_a_road = "Restricted - Mud / Snow slush" if is_bad_weather else "Passable Mountain Highway"
        eval_a = self.calculate_route_score(route_a_dist, route_a_eta, route_a_terrain_risk, route_a_weather_risk, route_a_road, 70.0)

        # Route B: Valley Bypass / All-Weather Axis
        route_b_dist = 205.0
        route_b_eta = 5.9 if is_bad_weather else 5.2
        route_b_terrain_risk = 28.0
        route_b_weather_risk = 32.0 if is_bad_weather else 15.0
        route_b_road = "All-Weather Paved Highway"
        eval_b = self.calculate_route_score(route_b_dist, route_b_eta, route_b_terrain_risk, route_b_weather_risk, route_b_road, 92.0)

        # Route C: Strategic Foothill Connector
        route_c_dist = 230.0
        route_c_eta = 7.1
        route_c_terrain_risk = 45.0
        route_c_weather_risk = 40.0
        route_c_road = "Rough Gravel / Graded"
        eval_c = self.calculate_route_score(route_c_dist, route_c_eta, route_c_terrain_risk, route_c_weather_risk, route_c_road, 78.0)

        # Interpolate coordinates for map rendering
        mid_lat = (origin_lat + dest_lat) / 2.0
        mid_lng = (origin_lng + dest_lng) / 2.0

        routes = [
            {
                "route_name": f"Route B: Southern Valley All-Weather Axis",
                "axis_type": "PRIMARY_RECOMMENDED" if eval_b["composite_score"] >= eval_a["composite_score"] else "SECONDARY",
                "distance_km": route_b_dist,
                "base_eta_hours": round(route_b_eta, 1),
                "terrain_risk": route_b_terrain_risk,
                "weather_risk": route_b_weather_risk,
                "road_condition": route_b_road,
                "reliability_score": 92.0,
                "composite_score": eval_b["composite_score"],
                "is_recommended": eval_b["composite_score"] >= eval_a["composite_score"],
                "recommendation_note": "Recommended Route: Although Route B is +25 km longer, its predicted delay and weather exposure are significantly lower, resulting in a faster, safer convoy arrival.",
                "checkpoints": [
                    {"name": f"{origin_name} Staging Gate", "km": 0, "status": "CLEARED"},
                    {"name": "Valley Transit Checkpost Charlie", "km": 68, "status": "NORMAL"},
                    {"name": "River Bridge Hardpoint 14", "km": 142, "status": "OPEN"},
                    {"name": f"{dest_name} Ingress Perimeter", "km": 205, "status": "READY"}
                ],
                "geometry": [
                    [origin_lat, origin_lng],
                    [origin_lat + 0.08, origin_lng - 0.12],
                    [mid_lat - 0.15, mid_lng - 0.08],
                    [mid_lat + 0.05, mid_lng + 0.10],
                    [dest_lat - 0.05, dest_lng - 0.04],
                    [dest_lat, dest_lng]
                ]
            },
            {
                "route_name": f"Route A: High Pass Direct Highway",
                "axis_type": "HIGH_PASS_DIRECT",
                "distance_km": route_a_dist,
                "base_eta_hours": round(route_a_eta, 1),
                "terrain_risk": route_a_terrain_risk,
                "weather_risk": route_a_weather_risk,
                "road_condition": route_a_road,
                "reliability_score": 68.0,
                "composite_score": eval_a["composite_score"],
                "is_recommended": eval_a["composite_score"] > eval_b["composite_score"],
                "recommendation_note": "Direct corridor across high-altitude pass. Heavy risk of weather stoppage or rockfall.",
                "checkpoints": [
                    {"name": f"{origin_name} Staging Gate", "km": 0, "status": "CLEARED"},
                    {"name": "Mountain Ridge Pass Echo", "km": 84, "status": "WEATHER_RESTRICTED"},
                    {"name": "Steep Switchback Mile 120", "km": 135, "status": "SLOW"},
                    {"name": f"{dest_name} Ingress Perimeter", "km": 180, "status": "READY"}
                ],
                "geometry": [
                    [origin_lat, origin_lng],
                    [origin_lat + 0.18, origin_lng + 0.06],
                    [mid_lat + 0.22, mid_lng + 0.04],
                    [dest_lat - 0.10, dest_lng + 0.02],
                    [dest_lat, dest_lng]
                ]
            },
            {
                "route_name": f"Route C: Foothill Reserve Connector",
                "axis_type": "TACTICAL_RESERVE",
                "distance_km": route_c_dist,
                "base_eta_hours": round(route_c_eta, 1),
                "terrain_risk": route_c_terrain_risk,
                "weather_risk": route_c_weather_risk,
                "road_condition": route_c_road,
                "reliability_score": 78.0,
                "composite_score": eval_c["composite_score"],
                "is_recommended": False,
                "recommendation_note": "Long distance tertiary detour. Recommended only if primary and secondary axes are obstructed.",
                "checkpoints": [
                    {"name": f"{origin_name} Staging Gate", "km": 0, "status": "CLEARED"},
                    {"name": "Outer Foothill Depot Sector 4", "km": 110, "status": "NORMAL"},
                    {"name": "Paved Link Road Junction", "km": 195, "status": "OPEN"},
                    {"name": f"{dest_name} Ingress Perimeter", "km": 230, "status": "READY"}
                ],
                "geometry": [
                    [origin_lat, origin_lng],
                    [origin_lat - 0.12, origin_lng - 0.20],
                    [mid_lat - 0.25, mid_lng - 0.18],
                    [dest_lat - 0.15, dest_lng - 0.12],
                    [dest_lat, dest_lng]
                ]
            }
        ]

        return routes

route_optimizer = RouteOptimizationEngine()
