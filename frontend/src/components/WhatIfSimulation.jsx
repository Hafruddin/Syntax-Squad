import React, { useState } from 'react';

function calculateLocalSimulation(demandMultiplier, weatherSeverity, routeDisrupted, fleetPct) {
  const baseCoverage = 14.5;
  const baseEta = 4.2;
  const baseRisk = 32.0;

  let demandLoss = (demandMultiplier - 1.0) * 8.0;
  let weatherLoss = weatherSeverity === 'SNOWFALL' ? 2.5 : weatherSeverity === 'RAINSTORM' ? 1.5 : weatherSeverity === 'LANDSLIDE_RISK' ? 3.0 : 0.0;
  let fleetLoss = (100 - fleetPct) * 0.06;

  let simCoverage = Math.max(1.8, +(baseCoverage - demandLoss - weatherLoss - fleetLoss).toFixed(1));
  let etaDelay = (routeDisrupted ? 3.5 : 0) + (weatherSeverity === 'SNOWFALL' ? 2.0 : weatherSeverity === 'RAINSTORM' ? 1.4 : 0);
  let simEta = +(baseEta + etaDelay).toFixed(1);

  let riskIncrease = Math.round((demandMultiplier - 1.0) * 40 + (routeDisrupted ? 25 : 0) + (100 - fleetPct) * 0.3 + (weatherSeverity === 'SNOWFALL' ? 20 : 10));
  let simRisk = Math.min(95, baseRisk + riskIncrease);

  return {
    scenario_parameters: { demand_multiplier: demandMultiplier, weather_severity: weatherSeverity, route_disrupted: routeDisrupted, fleet_availability_pct: fleetPct },
    baseline: { coverage_days: baseCoverage, eta_hours: baseEta, risk_score: baseRisk, risk_level: "WATCH" },
    projected: {
      coverage_days: simCoverage,
      eta_hours: simEta,
      risk_score: simRisk,
      risk_level: simRisk >= 75 ? "CRITICAL" : simRisk >= 55 ? "HIGH" : "WATCH"
    },
    impact_delta: {
      coverage_loss_days: +(baseCoverage - simCoverage).toFixed(1),
      eta_increase_hours: +(simEta - baseEta).toFixed(1),
      risk_score_increase: riskIncrease
    },
    recommended_mitigation: `Pre-position 2,400L Arctic Grade Diesel and 450 ration packs at Forward Logistics Base 02. Route all convoys via Route B (Southern Valley Axis). Activate standby ASC vehicle pool (+3 Stallion 4x4s) to restore buffer capacity before weather window closes.`,
    high_risk_supplies: [
      { item_name: "Arctic Grade Diesel Fuel", location_name: "Forward Post Kilo", category: "Fuel & Energy", baseline_days: 3.4, simulated_days: +(3.4 / demandMultiplier - 0.8).toFixed(1), stockout_window: "Within 48h" },
      { item_name: "Kerosene Heating Barrels", location_name: "Forward Post Kilo", category: "Fuel & Energy", baseline_days: 4.5, simulated_days: +(4.5 / demandMultiplier - 0.6).toFixed(1), stockout_window: "Within 72h" },
      { item_name: "Arctic Grade Diesel Fuel", location_name: "Forward Post Sierra", category: "Fuel & Energy", baseline_days: 5.2, simulated_days: +(5.2 / demandMultiplier - 0.9).toFixed(1), stockout_window: "Within 4 Days" },
      { item_name: "Emergency Ration Packs", location_name: "Base Bravo", category: "Food / Rations", baseline_days: 4.8, simulated_days: +(4.8 / demandMultiplier - 0.5).toFixed(1), stockout_window: "Within 4 Days" }
    ]
  };
}

export default function WhatIfSimulation({ onNavigate }) {
  const [demandMultiplier, setDemandMultiplier] = useState(1.25); // +25%
  const [weatherSeverity, setWeatherSeverity] = useState('RAINSTORM');
  const [routeDisrupted, setRouteDisrupted] = useState(true);
  const [fleetPct, setFleetPct] = useState(80);
  const [simulationResult, setSimulationResult] = useState(calculateLocalSimulation(1.25, 'RAINSTORM', true, 80));
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demand_multiplier: parseFloat(demandMultiplier),
          weather_severity: weatherSeverity,
          route_disruption: routeDisrupted,
          vehicle_availability_pct: parseFloat(fleetPct)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      } else {
        setSimulationResult(calculateLocalSimulation(demandMultiplier, weatherSeverity, routeDisrupted, fleetPct));
      }
    } catch (err) {
      setSimulationResult(calculateLocalSimulation(demandMultiplier, weatherSeverity, routeDisrupted, fleetPct));
    } finally {
      setLoading(false);
    }
  };

  // Run on first load
  React.useEffect(() => {
    handleRunSimulation();
  }, []);

  return (
    <div className="container">
      <div className="section-title">
        <span>Strategic What-If Scenario Stress-Testing Engine</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
          Predictive Resilience Simulation • Before vs After Analysis
        </span>
      </div>

      {/* SIMULATION CONTROLS CARD */}
      <div className="service-card" style={{ marginBottom: '24px', borderTopColor: '#005a9c' }}>
        <h4 style={{ color: 'var(--primary-navy)', marginBottom: '14px', fontWeight: '700' }}>
          Scenario Parameter Modulation
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Demand Surge Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700' }}>Operational Demand Surge:</label>
              <strong style={{ color: demandMultiplier > 1 ? '#d9381e' : '#16a34a' }}>
                +{Math.round((demandMultiplier - 1.0) * 100)}% ({demandMultiplier}x)
              </strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.05"
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#005a9c', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
              <span>Baseline (1.0x)</span>
              <span>Moderate (+25%)</span>
              <span>Extreme (+100%)</span>
            </div>
          </div>

          {/* Meteorological Stress */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
              Weather Condition Severity:
            </label>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={weatherSeverity}
              onChange={(e) => setWeatherSeverity(e.target.value)}
            >
              <option value="NORMAL">Normal / Clear (Nominal Burn)</option>
              <option value="RAINSTORM">Heavy Rainstorm (+15% Burn, Slush)</option>
              <option value="SNOWFALL">Sub-Zero Blizzard (+30% Heating Fuel)</option>
              <option value="LANDSLIDE_RISK">Monsoon Landslide Warning</option>
            </select>
          </div>

          {/* Route Blockage Switch */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
              Primary Pass Status:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn-secondary btn-sm ${!routeDisrupted ? 'btn-primary' : ''}`}
                onClick={() => setRouteDisrupted(false)}
                style={{ flex: 1 }}
              >
                Pass Open
              </button>
              <button
                type="button"
                className={`btn-secondary btn-sm ${routeDisrupted ? 'btn-danger' : ''}`}
                onClick={() => setRouteDisrupted(true)}
                style={{ flex: 1 }}
              >
                Pass Restricted / Blocked
              </button>
            </div>
          </div>

          {/* Fleet Availability */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700' }}>Active Fleet Availability:</label>
              <strong>{fleetPct}%</strong>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={fleetPct}
              onChange={(e) => setFleetPct(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#005a9c', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
              <span>50% (Heavy Shortage)</span>
              <span>80%</span>
              <span>100% (Full Depot)</span>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleRunSimulation}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '0.95rem' }}
        >
          {loading ? 'Computing Multi-Echelon Stress Vectors...' : '⚡ EXECUTE LOGISTICS STRESS SIMULATION'}
        </button>
      </div>

      {/* SIMULATION RESULTS: BEFORE VS AFTER COMPARISON */}
      {simulationResult && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* BASELINE CARD */}
            <div className="service-card" style={{ borderTopColor: '#16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-healthy">BASELINE NOMINAL CONDITIONS</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Pre-Simulation State</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Reserve Coverage</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a' }}>
                    {simulationResult.baseline.coverage_days} Days
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Average Convoy ETA</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#005a9c' }}>
                    {simulationResult.baseline.eta_hours}h
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sector Risk Index</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a' }}>
                    {simulationResult.baseline.risk_score}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.5' }}>
                Operational conditions within peacetime tolerance. Standard supply corridors open with 100% fleet availability.
              </div>
            </div>

            {/* SIMULATED STRESS CARD */}
            <div className="service-card" style={{ borderTopColor: '#d9381e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-critical">PROJECTED UNDER STRESS SCENARIO</span>
                <span style={{ fontSize: '0.78rem', color: '#d9381e', fontWeight: 'bold' }}>
                  Risk Surge: +{simulationResult.impact_delta.risk_score_increase} pts
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9f1239' }}>Simulated Coverage</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d9381e' }}>
                    {simulationResult.projected.coverage_days} Days
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#e11d48' }}>
                    (-{simulationResult.impact_delta.coverage_loss_days}d loss)
                  </div>
                </div>
                <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9f1239' }}>Simulated Convoy ETA</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d9381e' }}>
                    {simulationResult.projected.eta_hours}h
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#e11d48' }}>
                    (+{simulationResult.impact_delta.eta_increase_hours}h delay)
                  </div>
                </div>
                <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9f1239' }}>Simulated Risk Index</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d9381e' }}>
                    {simulationResult.projected.risk_score}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#e11d48' }}>
                    {simulationResult.projected.risk_level}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.5' }}>
                Critical buffer collapse detected across high-altitude forward posts due to accelerated burn and pass bottlenecks.
              </div>
            </div>
          </div>

          {/* RECOMMENDED MITIGATION STRATEGY */}
          <div className="ai-brief-bar" style={{ marginBottom: '24px', borderLeftColor: '#d9381e' }}>
            <div className="ai-brief-icon" style={{ background: '#fee2e2', color: '#d9381e' }}>🛡️</div>
            <div className="ai-brief-content">
              <h4>AI STRATEGIC MITIGATION PROTOCOL</h4>
              <p>{simulationResult.recommended_mitigation}</p>
            </div>
          </div>

          {/* HIGH-RISK IMPACTED SUPPLIES */}
          <div className="table-container">
            <div className="table-toolbar">
              <span style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>
                Vulnerable Supply Lines Identified in Simulation
              </span>
              <button className="btn-primary btn-sm" onClick={() => onNavigate('SHIPMENTS')}>
                Pre-Position Resupply Convoys 🚚
              </button>
            </div>

            <table className="gov-table">
              <thead>
                <tr>
                  <th>Store Item & Node</th>
                  <th>Category</th>
                  <th>Nominal Coverage</th>
                  <th>Simulated Depletion Coverage</th>
                  <th>Exhaustion Window</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {simulationResult.high_risk_supplies.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{s.item_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.location_name}</div>
                    </td>
                    <td>{s.category}</td>
                    <td>{s.baseline_days} Days</td>
                    <td>
                      <strong style={{ color: '#d9381e', fontSize: '0.95rem' }}>
                        {s.simulated_days} Days
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-critical">{s.stockout_window}</span>
                    </td>
                    <td>
                      <span className="badge badge-medium">PRIORITY BUFFER DEFICIT</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
