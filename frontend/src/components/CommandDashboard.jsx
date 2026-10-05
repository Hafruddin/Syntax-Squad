import React, { useState } from 'react';
import LogisticsMap from './LogisticsMap';

/* ── Inline SVG Sparkline ── */
function Sparkline({ data, color = '#005a9c', height = 40, width = 120 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
}

/* ── Mini Bar Chart ── */
function MiniBar({ values, labels, colors }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 'bold' }}>{v}</div>
          <div style={{
            width: '100%',
            height: `${(v / max) * 52}px`,
            background: colors[i] || '#005a9c',
            borderRadius: '2px 2px 0 0',
            minHeight: '4px'
          }} />
          <div style={{ fontSize: '0.55rem', color: '#94a3b8', whiteSpace: 'nowrap', textAlign: 'center' }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Activity Feed ── */
const ACTIVITY_FEED = [
  { time: '14:52 IST', icon: '🚀', text: 'CONVOY-NORTH-703 dispatched from CSD-01 → FP-KILO (1200L Diesel)', role: 'LOGISTICS', color: '#005a9c' },
  { time: '14:31 IST', icon: '📍', text: 'ARMY-HT-017 cleared Valley Checkpost Charlie. ETA FP-KILO: 2h40m.', role: 'DRIVER', color: '#16a34a' },
  { time: '14:08 IST', icon: '⚡', text: 'AI Recommendation #1 approved by Col. Ranjit Sharma — fuel convoy authorized.', role: 'COMMANDER', color: '#d9381e' },
  { time: '13:45 IST', icon: '⚠️', text: 'CONVOY-NORTH-702 reporting +3.5h delay — Pass Echo mud obstruction.', role: 'DRIVER', color: '#d97706' },
  { time: '13:22 IST', icon: '🌧️', text: 'Weather Alert: 42mm precipitation Pass Echo. Route A degraded. Reroute active.', role: 'SYSTEM', color: '#7c3aed' },
  { time: '12:58 IST', icon: '📊', text: 'L/Nk. Mohan Das logged 94L diesel consumption at FP-KILO. DOS now 3.4 days.', role: 'OPERATOR', color: '#0891b2' },
  { time: '12:30 IST', icon: '🤖', text: 'FORGE AI generated CRITICAL recommendation: FP-KILO fuel buffer at risk.', role: 'SYSTEM', color: '#7c3aed' },
];

/* ── Forecast sparklines data ── */
const INVENTORY_TREND = [82, 79, 76, 74, 71, 68, 66, 64];
const SHORTAGE_TREND = [3, 4, 5, 5, 6, 7, 7, 8];
const CONVOY_TREND = [1, 2, 2, 3, 2, 2, 3, 2];
const DELIVERY_SUCCESS = [92, 94, 91, 95, 94, 93, 96, 94];

export default function CommandDashboard({
  kpis,
  locations,
  vehicles,
  routes,
  recommendations,
  shipments,
  stockouts,
  onNavigate,
  onSelectLocation,
  onApproveRecommendation,
  onRunDemo
}) {
  const [activeSection, setActiveSection] = useState('OVERVIEW');

  return (
    <div className="container">
      {/* AI LOGISTICS BRIEF BAR */}
      <div className="ai-brief-bar">
        <div className="ai-brief-icon">⚡</div>
        <div className="ai-brief-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>STRATEGIC AI LOGISTICS BRIEF — NORTHERN SYNTHETIC SECTOR</h4>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
              UPDATED LIVE • DEFENCE LOGISTICS GRID
            </span>
          </div>
          <p>{kpis.ai_brief || "CRITICAL: Forward Post Kilo fuel reserves at 3.4 days. CONVOY-NORTH-703 en route via Route B (Southern Valley). CONVOY-NORTH-702 delayed +3.5h — Pass Echo mud obstruction. 42mm precipitation advisory active on Route A. Route B designated Primary Axis."}</p>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="kpi-grid">
        <div className="service-card" onClick={() => onNavigate('LOCATIONS')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">Forward Locations</span>
            <span className="kpi-icon">📍</span>
          </div>
          <div className="kpi-value">{kpis.total_locations || 10}</div>
          <div className="kpi-sub">Northern Logistics Frontier</div>
          <Sparkline data={[8, 9, 9, 10, 10, 10, 10]} color="#005a9c" />
        </div>

        <div className="service-card" onClick={() => onNavigate('INVENTORY')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">Inventory Items</span>
            <span className="kpi-icon">📦</span>
          </div>
          <div className="kpi-value">{kpis.total_inventory_items || 21}</div>
          <div className="kpi-sub">8 Standard Categories</div>
          <Sparkline data={[20, 21, 21, 21, 21, 21, 21]} color="#005a9c" />
        </div>

        <div className="service-card border-success" onClick={() => onNavigate('INVENTORY')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">Inventory Health</span>
            <span className="kpi-icon">🛡️</span>
          </div>
          <div className="kpi-value" style={{ color: '#2e7d32' }}>{kpis.inventory_health_pct || 76.2}%</div>
          <div className="kpi-sub">Supplies with ≥ 5d reserve</div>
          <Sparkline data={INVENTORY_TREND} color="#16a34a" />
        </div>

        <div className="service-card border-critical" onClick={() => onNavigate('LOCATIONS')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">At-Risk Posts</span>
            <span className="kpi-icon">⚠️</span>
          </div>
          <div className="kpi-value" style={{ color: '#d9381e' }}>{kpis.at_risk_locations_count || 3}</div>
          <div className="kpi-sub">High-altitude & weather affected</div>
          <Sparkline data={[1, 1, 2, 2, 3, 3, 3]} color="#d9381e" />
        </div>

        <div className="service-card border-warning" onClick={() => onNavigate('STOCKOUT')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">Predicted Shortages</span>
            <span className="kpi-icon">📉</span>
          </div>
          <div className="kpi-value" style={{ color: '#e65100' }}>{kpis.predicted_shortages_count || 5}</div>
          <div className="kpi-sub">Within 5-day horizon</div>
          <Sparkline data={SHORTAGE_TREND} color="#e65100" />
        </div>

        <div className="service-card" onClick={() => onNavigate('SHIPMENTS')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">Active Convoys</span>
            <span className="kpi-icon">🚚</span>
          </div>
          <div className="kpi-value">{kpis.active_shipments_count || 2}</div>
          <div className="kpi-sub">{kpis.vehicles_en_route_count || 1} En Route, 1 Delayed</div>
          <Sparkline data={CONVOY_TREND} color="#005a9c" />
        </div>

        <div className="service-card border-warning" onClick={() => onNavigate('WEATHER')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="title">Weather Alerts</span>
            <span className="kpi-icon">🌧️</span>
          </div>
          <div className="kpi-value" style={{ color: '#d97706' }}>{kpis.weather_alerts_count || 3}</div>
          <div className="kpi-sub">Pass Echo heavy rain & sleet</div>
          <Sparkline data={[1, 1, 2, 3, 3, 3, 3]} color="#d97706" />
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Inventory Health by Category */}
        <div className="service-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '12px' }}>
            📊 Supply Health by Category
          </div>
          <MiniBar
            values={[88, 92, 34, 95, 78, 85, 72, 60]}
            labels={['Food', 'Water', 'Fuel', 'Med', 'Maint', 'Shelter', 'Comms', 'CS']}
            colors={['#16a34a','#16a34a','#d9381e','#16a34a','#2e7d32','#16a34a','#d97706','#64748b']}
          />
          <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#64748b' }}>% of items with ≥5 DOS</div>
        </div>

        {/* Delivery Success Rate trend */}
        <div className="service-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '4px' }}>
            ✅ Convoy Delivery Success Rate
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#16a34a', marginBottom: '4px' }}>94.2%</div>
          <Sparkline data={DELIVERY_SUCCESS} color="#16a34a" width={200} height={50} />
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>8-day rolling window</div>
        </div>

        {/* Stockout countdown */}
        <div className="service-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '12px' }}>
            ⏱️ Critical Stockout Countdown
          </div>
          {(stockouts || []).slice(0, 4).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ flex: 1, fontSize: '0.72rem', color: '#334155', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{s.item_name}</div>
              <div style={{
                background: '#e2e8f0', borderRadius: '3px', height: '6px', width: '60px', overflow: 'hidden', flexShrink: 0
              }}>
                <div style={{
                  width: `${Math.min(100, (s.days_remaining / 10) * 100)}%`,
                  height: '100%',
                  background: s.days_remaining <= 3 ? '#d9381e' : s.days_remaining <= 5 ? '#e65100' : '#16a34a'
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: s.days_remaining <= 3 ? '#d9381e' : '#e65100', width: '30px', textAlign: 'right' }}>
                {s.days_remaining}d
              </div>
            </div>
          ))}
          {(!stockouts || stockouts.length === 0) && (
            ['FP-KILO Diesel (3.4d)', 'FP-KILO Kerosene (4.5d)', 'FP-SIERRA Fuel (5.2d)'].map((s, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: i === 0 ? '#d9381e' : '#e65100', marginBottom: '4px' }}>⚠️ {s}</div>
            ))
          )}
        </div>

        {/* Fleet utilization */}
        <div className="service-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '12px' }}>
            🚛 Fleet Status Distribution
          </div>
          <MiniBar
            values={[3, 2, 1, 1, 1]}
            labels={['AVAIL', 'EN RT', 'DELAY', 'LOAD', 'MAINT']}
            colors={['#16a34a', '#005a9c', '#d9381e', '#d97706', '#64748b']}
          />
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '8px' }}>8 total vehicles deployed</div>
        </div>
      </div>

      {/* MIDDLE SECTION: GIS MAP & PROACTIVE RECOMMENDATIONS */}
      <div className="section-grid-2">
        <div>
          <div className="section-title">
            <span>Live GIS Tactical Logistics Map</span>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('MAP')}>
              Expand Tactical Map ↗
            </button>
          </div>
          <LogisticsMap
            locations={locations}
            vehicles={vehicles}
            routes={routes}
            onSelectLocation={onSelectLocation}
            height="460px"
          />
        </div>

        {/* AI PROACTIVE LOGISTICS RECOMMENDATIONS */}
        <div>
          <div className="section-title">
            <span>AI Proactive Recommendations</span>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('RECOMMENDATIONS')}>
              View All ({recommendations.length || 3})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(recommendations.length > 0 ? recommendations : FALLBACK_RECS).slice(0, 3).map((rec, idx) => (
              <div
                key={rec.id || idx}
                className="service-card"
                style={{
                  borderTopColor: rec.priority === 'CRITICAL' ? '#d9381e' : '#e65100',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className={`badge ${rec.priority === 'CRITICAL' ? 'badge-critical' : 'badge-medium'}`}>
                    {rec.priority}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Confidence: <strong>{rec.confidence_pct}%</strong>
                  </span>
                </div>

                <h4 style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', marginBottom: '6px', fontWeight: '700' }}>
                  {rec.title}
                </h4>

                <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px', lineHeight: '1.4' }}>
                  {rec.reasoning}
                </p>

                <div style={{
                  background: '#f8fafc',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  borderLeft: '3px solid #005a9c',
                  fontSize: '0.8rem',
                  marginBottom: '12px',
                  color: '#1e293b'
                }}>
                  {rec.action_suggested}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Status: <strong style={{ color: rec.status === 'APPROVED' ? '#2e7d32' : '#005a9c' }}>{rec.status}</strong>
                  </span>
                  {rec.status === 'ACTIVE' && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => onApproveRecommendation(rec.id)}
                    >
                      ✓ Approve & Dispatch
                    </button>
                  )}
                  {rec.status === 'APPROVED' && (
                    <span className="badge badge-healthy">APPROVED ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PREDICTED STOCKOUTS & CONVOY TRACKING */}
      <div className="section-grid-equal">
        {/* PREDICTED SHORTAGES WINDOW */}
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontWeight: '700', color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
              🚨 Imminent Stockout Warnings (≤ 5 Days)
            </span>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('STOCKOUT')}>
              Full Predictor ↗
            </button>
          </div>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Item & Post</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Days Remaining</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(stockouts.length > 0 ? stockouts : FALLBACK_STOCKOUTS).slice(0, 5).map((s, idx) => (
                <tr key={idx} style={{ backgroundColor: s.days_remaining <= 3.5 ? '#fff5f5' : 'transparent' }}>
                  <td>
                    <strong>{s.item_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.location_name}</div>
                  </td>
                  <td>{s.category}</td>
                  <td>{s.current_stock} {s.unit}</td>
                  <td>
                    <span style={{
                      fontWeight: 'bold',
                      color: s.days_remaining <= 3.5 ? '#d9381e' : '#e65100'
                    }}>
                      {s.days_remaining} Days
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.risk_level === 'CRITICAL' ? 'badge-critical' : 'badge-medium'}`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => onNavigate('SHIPMENTS')}
                    >
                      Plan Resupply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ACTIVE CONVOY DISPATCHES */}
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontWeight: '700', color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
              🚚 Active Convoy Movements
            </span>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('SHIPMENTS')}>
              All Shipments ↗
            </button>
          </div>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Convoy #</th>
                <th>Route & Target</th>
                <th>Vehicle & Driver</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(shipments.length > 0 ? shipments : FALLBACK_SHIPMENTS).slice(0, 4).map((s, idx) => (
                <tr key={s.id || idx}>
                  <td>
                    <strong>{s.tracking_number}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.category}</div>
                  </td>
                  <td>
                    <div>{s.destination_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.route_name}</div>
                  </td>
                  <td>
                    <div>{s.vehicle_number}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.driver_name}</div>
                  </td>
                  <td><strong>{s.eta_hours}h</strong></td>
                  <td>
                    <span className={`badge ${
                      s.status === 'DELIVERED' ? 'badge-healthy' :
                      s.status === 'DELAYED' ? 'badge-critical' :
                      s.status === 'EN_ROUTE' ? 'badge-online' : 'badge-low'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE ACTIVITY FEED */}
      <div className="table-container" style={{ marginTop: '24px' }}>
        <div className="table-toolbar">
          <span style={{ fontWeight: '700', color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
            🔴 Live Operational Activity Feed
          </span>
          <button className="btn-secondary btn-sm" onClick={() => onNavigate('AUDIT')}>
            Full Audit Logs ↗
          </button>
        </div>
        <div style={{ padding: '4px 0' }}>
          {ACTIVITY_FEED.map((a, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 16px',
              borderBottom: i < ACTIVITY_FEED.length - 1 ? '1px solid #f1f5f9' : 'none',
              background: i % 2 === 0 ? '#fff' : '#fafafa'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: a.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                flexShrink: 0,
                color: '#fff'
              }}>
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: '1.4' }}>{a.text}</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Fallback demo data (displayed when API not yet loaded) ── */
const FALLBACK_RECS = [
  {
    id: 1, priority: 'CRITICAL', confidence_pct: 94, status: 'ACTIVE',
    title: 'Urgent Fuel Resupply — Forward Post Kilo',
    reasoning: 'FP-KILO diesel at 320L (3.4 days). Predicted burn acceleration due to sub-zero temperatures. Convoy transit time via Route B: 4.8h. Zero margin for delay.',
    action_suggested: 'Dispatch ARMY-HT-017 with 1200L Arctic Grade Diesel via Route B (Valley All-Weather Axis) immediately.'
  },
  {
    id: 2, priority: 'HIGH', confidence_pct: 87, status: 'ACTIVE',
    title: 'Route A Hazard — Pass Echo Closure',
    reasoning: '42mm precipitation and sleet on Route A. Slush accumulation at switchbacks is creating +3.5h delay. CONVOY-NORTH-702 already delayed.',
    action_suggested: 'Divert all pending Route A convoys to Route B. Alert drivers en route. Update CONVOY-NORTH-702 reroute order.'
  },
  {
    id: 3, priority: 'CRITICAL', confidence_pct: 91, status: 'APPROVED',
    title: 'Pre-Position Kerosene Heating Barrels — FP-KILO',
    reasoning: 'Kerosene heating at FP-KILO will run out in 4.5 days. Temperature dropping to -12°C tonight. Heating is non-negotiable for personnel safety.',
    action_suggested: 'Pre-position 30 barrels kerosene in next outgoing convoy. Combine with fuel shipment to reduce vehicle requirement.'
  }
];

const FALLBACK_STOCKOUTS = [
  { item_name: 'Arctic Grade Diesel Fuel', location_name: 'Forward Post Kilo', category: 'Fuel & Energy', current_stock: 320, unit: 'L', days_remaining: 3.4, risk_level: 'CRITICAL' },
  { item_name: 'Kerosene Heating Barrels', location_name: 'Forward Post Kilo', category: 'Fuel & Energy', current_stock: 18, unit: 'Barrels', days_remaining: 4.5, risk_level: 'HIGH' },
  { item_name: 'HSD Diesel', location_name: 'Forward Post Sierra', category: 'Fuel & Energy', current_stock: 450, unit: 'L', days_remaining: 5.2, risk_level: 'HIGH' },
  { item_name: 'Emergency Ration Packs', location_name: 'Base Bravo', category: 'Food / Rations', current_stock: 240, unit: 'Packs', days_remaining: 4.8, risk_level: 'HIGH' },
  { item_name: 'IV Fluids & Emergency Kit', location_name: 'Forward Post Kilo', category: 'Medical Supplies', current_stock: 12, unit: 'Kits', days_remaining: 6.0, risk_level: 'MEDIUM' },
];

const FALLBACK_SHIPMENTS = [
  { id: 1, tracking_number: 'CONVOY-NORTH-701', category: 'Food / Rations', destination_name: 'Forward Logistics Base 02', route_name: 'Route B', vehicle_number: 'ARMY-HT-012', driver_name: 'Hav. Dev Singh', eta_hours: 2.5, status: 'EN_ROUTE' },
  { id: 2, tracking_number: 'CONVOY-NORTH-702', category: 'Maintenance & Spare Parts', destination_name: 'Forward Logistics Base 02', route_name: 'Route A (DELAYED)', vehicle_number: 'ARMY-HT-031', driver_name: 'Nk. Arjun Rao', eta_hours: 6.0, status: 'DELAYED' },
  { id: 3, tracking_number: 'CONVOY-NORTH-703', category: 'Fuel & Energy', destination_name: 'Forward Post Kilo', route_name: 'Route B (All-Weather)', vehicle_number: 'ARMY-HT-017', driver_name: 'Hav. Rajesh Kumar', eta_hours: 4.8, status: 'EN_ROUTE' },
  { id: 4, tracking_number: 'CONVOY-SOUTH-404', category: 'Medical Supplies', destination_name: 'Base Bravo', route_name: 'Foothills Axis', vehicle_number: 'ARMY-HT-022', driver_name: 'Sep. Kiran Menon', eta_hours: 1.2, status: 'DELIVERED' },
];
