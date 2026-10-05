from typing import Dict, Any, List

class LogisticsRiskEngine:
    """
    Weighted 5-Factor Operational Logistics Risk Scoring Engine:
    1. Inventory Coverage Risk (40%)
    2. Demand Acceleration Risk (25%)
    3. Weather Hazard Risk (15%)
    4. Route Condition & Terrain Risk (10%)
    5. Delivery Delay / Lead-Time Risk (10%)
    """

    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "inventory_coverage": 0.40,
            "demand_increase": 0.25,
            "weather_risk": 0.15,
            "route_condition": 0.10,
            "delivery_delay": 0.10
        }

    def evaluate_risk(
        self,
        days_of_supply: float,
        safety_stock_threshold_days: float = 5.0,
        demand_trend_ratio: float = 1.0,  # recent_7d / baseline_30d
        weather_condition: str = "Clear",
        precipitation_mm: float = 0.0,
        road_condition: str = "Passable",
        active_delay_hours: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates normalized scores (0-100) for each dimension and returns weighted composite score.
        """
        reasons: List[str] = []

        # 1. Inventory Coverage Risk (40%)
        # If days_of_supply <= 2: 100, if 3: 80, if 5: 50, if >= 10: 10
        if days_of_supply <= 2.0:
            inv_score = 100.0
            reasons.append(f"Critical inventory level: Only {days_of_supply} days of supply remaining")
        elif days_of_supply <= 3.5:
            inv_score = 80.0
            reasons.append(f"Depleted buffer: {days_of_supply} days of supply is below 5-day safety margin")
        elif days_of_supply <= 6.0:
            inv_score = 50.0
            reasons.append(f"Moderate inventory: {days_of_supply} days of supply")
        elif days_of_supply <= 10.0:
            inv_score = 25.0
        else:
            inv_score = 10.0

        # 2. Demand Acceleration Risk (25%)
        # Ratio of recent consumption vs standard baseline
        if demand_trend_ratio >= 1.30:
            demand_score = 95.0
            reasons.append(f"Severe demand surge: Daily consumption spiked +{int((demand_trend_ratio - 1)*100)}%")
        elif demand_trend_ratio >= 1.15:
            demand_score = 70.0
            reasons.append(f"Demand acceleration: Trend elevated by +{int((demand_trend_ratio - 1)*100)}%")
        elif demand_trend_ratio >= 1.05:
            demand_score = 45.0
        else:
            demand_score = 15.0

        # 3. Weather Hazard Risk (15%)
        weather_lower = weather_condition.lower()
        if "storm" in weather_lower or "blizzard" in weather_lower or precipitation_mm > 50:
            weather_score = 95.0
            reasons.append(f"Extreme weather alert: {weather_condition} ({precipitation_mm}mm precipitation)")
        elif "heavy rain" in weather_lower or "snow" in weather_lower or precipitation_mm > 25:
            weather_score = 75.0
            reasons.append(f"Inclement weather: {weather_condition} increasing supply line vulnerability")
        elif "fog" in weather_lower or precipitation_mm > 5:
            weather_score = 45.0
            reasons.append("Low visibility / light precipitation on sector transit routes")
        else:
            weather_score = 10.0

        # 4. Route Condition & Terrain Risk (10%)
        road_lower = road_condition.lower()
        if "blocked" in road_lower:
            route_score = 100.0
            reasons.append("Primary arterial route reported BLOCKED")
        elif "restricted" in road_lower or "rough" in road_lower:
            route_score = 65.0
            reasons.append(f"Challenging terrain transit: Route condition marked '{road_condition}'")
        else:
            route_score = 15.0

        # 5. Delivery Delay / Lead-Time Risk (10%)
        if active_delay_hours > 8.0:
            delay_score = 95.0
            reasons.append(f"Critical supply convoy delay: +{active_delay_hours}h behind schedule")
        elif active_delay_hours > 2.0:
            delay_score = 65.0
            reasons.append(f"Transit delay reported: +{active_delay_hours}h behind ETA")
        else:
            delay_score = 10.0

        # Weighted calculation
        composite = (
            inv_score * self.weights["inventory_coverage"] +
            demand_score * self.weights["demand_increase"] +
            weather_score * self.weights["weather_risk"] +
            route_score * self.weights["route_condition"] +
            delay_score * self.weights["delivery_delay"]
        )

        composite = round(min(100.0, max(0.0, composite)), 1)

        # Classification
        if composite >= 81.0:
            level = "CRITICAL"
            color = "#d9381e"
        elif composite >= 61.0:
            level = "HIGH"
            color = "#e65100"
        elif composite >= 31.0:
            level = "MEDIUM"
            color = "#f57c00"
        else:
            level = "LOW"
            color = "#2e7d32"

        return {
            "score": composite,
            "level": level,
            "color": color,
            "factors": {
                "inventory_coverage": {"score": inv_score, "weight": self.weights["inventory_coverage"]},
                "demand_increase": {"score": demand_score, "weight": self.weights["demand_increase"]},
                "weather_risk": {"score": weather_score, "weight": self.weights["weather_risk"]},
                "route_condition": {"score": route_score, "weight": self.weights["route_condition"]},
                "delivery_delay": {"score": delay_score, "weight": self.weights["delivery_delay"]}
            },
            "reasons": reasons if reasons else ["Operational parameters within standard nominal tolerance"]
        }

risk_engine = LogisticsRiskEngine()
