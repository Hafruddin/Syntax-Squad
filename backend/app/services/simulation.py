from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models import Location, InventoryItem

class LogisticsSimulationEngine:
    """
    What-If Strategic Simulation Engine.
    Allows Logistics Commanders to stress-test the forward grid under demand spikes,
    inclement weather, route blockages, and vehicle shortages.
    """

    def run_simulation(
        self,
        db: Session,
        demand_multiplier: float = 1.20,
        weather_severity: str = "RAINSTORM",
        route_disrupted: bool = True,
        vehicle_availability_pct: float = 80.0,
        target_location_id: int = None
    ) -> Dict[str, Any]:
        # Query items (filter by location if specified)
        query = db.query(InventoryItem)
        if target_location_id:
            query = query.filter(InventoryItem.location_id == target_location_id)
        items = query.all()

        # Compute baseline metrics
        baseline_total_stock = sum(it.current_quantity for it in items)
        baseline_daily_burn = sum(it.daily_consumption_base for it in items)
        baseline_coverage_days = round(baseline_total_stock / baseline_daily_burn, 1) if baseline_daily_burn > 0 else 14.0
        baseline_eta_hrs = 5.2
        baseline_risk_score = 32.0

        # Compute projected impact under stress parameters
        weather_burn_factor = 1.0
        weather_eta_delay = 0.0
        weather_risk_add = 0.0

        if weather_severity == "RAINSTORM":
            weather_burn_factor = 1.15
            weather_eta_delay = 1.8
            weather_risk_add = 20.0
        elif weather_severity == "SNOWFALL":
            weather_burn_factor = 1.30
            weather_eta_delay = 3.2
            weather_risk_add = 30.0
        elif weather_severity == "LANDSLIDE_RISK":
            weather_burn_factor = 1.20
            weather_eta_delay = 4.5
            weather_risk_add = 40.0

        route_delay = 2.5 if route_disrupted else 0.0
        fleet_capacity_penalty = (100.0 - vehicle_availability_pct) * 0.25

        simulated_daily_burn = baseline_daily_burn * demand_multiplier * weather_burn_factor
        simulated_coverage_days = round(baseline_total_stock / simulated_daily_burn, 1) if simulated_daily_burn > 0 else 4.0
        simulated_eta_hrs = round(baseline_eta_hrs + weather_eta_delay + route_delay, 1)
        simulated_risk_score = min(98.0, round(baseline_risk_score + weather_risk_add + (demand_multiplier - 1.0) * 80.0 + (15.0 if route_disrupted else 0.0) + fleet_capacity_penalty, 1))

        # Classify simulated risk
        if simulated_risk_score >= 80:
            sim_level = "CRITICAL"
        elif simulated_risk_score >= 60:
            sim_level = "HIGH"
        elif simulated_risk_score >= 35:
            sim_level = "MEDIUM"
        else:
            sim_level = "LOW"

        # Identify high-risk supplies under this simulation
        high_risk_supplies = []
        for it in items[:6]:
            eff_burn = it.daily_consumption_base * demand_multiplier * weather_burn_factor
            days_left = round(it.current_quantity / eff_burn, 1) if eff_burn > 0 else 99.0
            loc = db.query(Location).filter(Location.id == it.location_id).first()
            loc_name = loc.name if loc else "Forward Base"
            if days_left <= 5.0:
                high_risk_supplies.append({
                    "item_name": it.item_name,
                    "location_name": loc_name,
                    "category": it.category,
                    "baseline_days": round(it.current_quantity / it.daily_consumption_base, 1),
                    "simulated_days": days_left,
                    "stockout_window": f"{days_left} Days"
                })

        # Mitigation plan
        mitigation = (
            f"STRATEGIC MITIGATION: Pre-position {int(simulated_daily_burn * 3)} units of emergency buffer stock at intermediate staging depots. "
            f"Activate secondary Valley bypass corridor to circumvent the +{route_delay + weather_eta_delay:.1f}h convoy bottleneck. "
            f"Authorize night dispatch for high-capacity 6x6 all-terrain transport units."
        )

        return {
            "scenario_name": f"Simulation: Demand x{demand_multiplier} | {weather_severity} | Disruption={'YES' if route_disrupted else 'NO'}",
            "baseline": {
                "coverage_days": baseline_coverage_days,
                "eta_hours": baseline_eta_hrs,
                "risk_score": baseline_risk_score,
                "risk_level": "LOW / NOMINAL"
            },
            "projected": {
                "coverage_days": simulated_coverage_days,
                "eta_hours": simulated_eta_hrs,
                "risk_score": simulated_risk_score,
                "risk_level": sim_level
            },
            "impact_delta": {
                "coverage_loss_days": round(baseline_coverage_days - simulated_coverage_days, 1),
                "eta_increase_hours": round(simulated_eta_hrs - baseline_eta_hrs, 1),
                "risk_score_increase": round(simulated_risk_score - baseline_risk_score, 1)
            },
            "recommended_mitigation": mitigation,
            "high_risk_supplies": high_risk_supplies
        }

simulation_engine = LogisticsSimulationEngine()
