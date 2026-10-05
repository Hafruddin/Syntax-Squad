import React, { useState } from 'react';

/* Inline SVG Bar Chart */
function BarChart({ data, labels, title, colorFn }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '12px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 'bold' }}>{v}</div>
            <div style={{
              width: '100%',
              height: `${(v / max) * 70}px`,
              background: colorFn ? colorFn(v, i) : '#005a9c',
              borderRadius: '3px 3px 0 0',
              minHeight: '4px'
            }} />
            {labels && <div style={{ fontSize: '0.55rem', color: '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap' }}>{labels[i]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Inline SVG Line Chart */
function LineChart({ data, labels, color = '#005a9c', height = 80, fill = 'rgba(0,90,156,0.08)' }) {
  const w = 320, h = height;
  const min = Math.min(...data);
  const max = Math.max(...data, min + 1);
  const range = max - min;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - 10 - ((v - min) / range) * (h - 20);
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `${pts[0][0]},${h - 5} ${polyline} ${pts[pts.length - 1][0]},${h - 5}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}>
        <polygon points={area} fill={fill} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill={color} />
        ))}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px', padding: '0 8px' }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

/* Donut Chart via SVG */
function DonutChart({ segments, size = 90 }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  let cumAngle = -90;
  const r = 32, cx = size / 2, cy = size / 2;
  const arcs = segments.map(s => {
    const angle = (s.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(cumAngle - 0.001));
    const y2 = cy + r * Math.sin(toRad(cumAngle - 0.001));
    const large = angle > 180 ? 1 : 0;
    return { ...s, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` };
  });
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} opacity="0.9" />)}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
    </svg>
  );
}

const WEEKLY_CONVOYS = [2, 3, 2, 4, 3, 3, 2];
const WEEKLY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEALTH_TREND = [80, 79, 77, 76, 75, 76, 76, 76.2];
const RISK_TREND = [28, 30, 34, 38, 42, 45, 48, 50];
const DELIVERY_PCT = [96, 94, 91, 95, 94, 93, 96, 94];

export default function AnalyticsReports({ kpis, locations, shipments }) {
  const [tab, setTab] = useState('OVERVIEW');

  const handlePrint = () => { window.print(); };

  return (
    <div className="container">
      <div className="section-title">
        <span>Logistics Analytics & Official Intelligence Reports</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['OVERVIEW', 'TRENDS', 'REPORT'].map(t => (
            <button key={t} className={tab === t ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setTab(t)}>
              {t === 'OVERVIEW' ? '📊 Overview' : t === 'TRENDS' ? '📈 Trends' : '🖨️ Print Report'}
            </button>
          ))}
        </div>
      </div>

      {/* STRATEGIC KPIS */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="service-card border-success">
          <div className="kpi-header"><span className="title">Stockout Prevention</span><span>🛡️</span></div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>98.5%</div>
          <div className="kpi-sub">Critical shortages mitigated proactively</div>
        </div>
        <div className="service-card border-success">
          <div className="kpi-header"><span className="title">Convoy On-Time Rate</span><span>⏱️</span></div>
          <div className="kpi-value" style={{ color: '#005a9c' }}>94.2%</div>
          <div className="kpi-sub">Checkpoints cleared on schedule</div>
        </div>
        <div className="service-card">
          <div className="kpi-header"><span className="title">Fleet Utilization</span><span>🚛</span></div>
          <div className="kpi-value">84.0%</div>
          <div className="kpi-sub">Active in transport or staged reserve</div>
        </div>
        <div className="service-card border-warning">
          <div className="kpi-header"><span className="title">Avg Transit Delay</span><span>⚠️</span></div>
          <div className="kpi-value" style={{ color: '#d97706' }}>+1.4h</div>
          <div className="kpi-sub">High-altitude pass weather factor</div>
        </div>
        <div className="service-card">
          <div className="kpi-header"><span className="title">AI Forecast Accuracy</span><span>🎯</span></div>
          <div className="kpi-value" style={{ color: '#005a9c' }}>93.25%</div>
          <div className="kpi-sub">MAPE 6.75% — gradient boosting</div>
        </div>
        <div className="service-card border-success">
          <div className="kpi-header"><span className="title">Offline Sync Success</span><span>📡</span></div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>100%</div>
          <div className="kpi-sub">All driver events synced on reconnect</div>
        </div>
      </div>

      {tab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Convoy volume */}
          <div className="service-card" style={{ padding: '20px' }}>
            <BarChart
              data={WEEKLY_CONVOYS}
              labels={WEEKLY_LABELS}
              title="🚚 Convoy Dispatches — Last 7 Days"
              colorFn={(v) => v >= 4 ? '#005a9c' : '#64748b'}
            />
          </div>

          {/* Delivery success */}
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>✅ Delivery Success Rate — 8 Day Window</div>
            <LineChart data={DELIVERY_PCT} labels={['8d ago','7d','6d','5d','4d','3d','2d','Today']} color="#16a34a" fill="rgba(22,163,74,0.08)" height={80} />
          </div>

          {/* Inventory health */}
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>🛡️ Inventory Health % — 8-Day Trend</div>
            <LineChart data={HEALTH_TREND} labels={['8d','7d','6d','5d','4d','3d','2d','Now']} color="#005a9c" height={80} />
          </div>

          {/* Shipment status donut */}
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '12px' }}>📦 Active Shipment Status Mix</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <DonutChart segments={[
                { value: 2, color: '#005a9c' },
                { value: 1, color: '#d9381e' },
                { value: 1, color: '#16a34a' },
                { value: 1, color: '#64748b' },
              ]} size={90} />
              <div style={{ fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><div style={{ width: '10px', height: '10px', background: '#005a9c', borderRadius: '2px' }} /> EN ROUTE (2)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><div style={{ width: '10px', height: '10px', background: '#d9381e', borderRadius: '2px' }} /> DELAYED (1)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><div style={{ width: '10px', height: '10px', background: '#16a34a', borderRadius: '2px' }} /> DELIVERED (1)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '2px' }} /> PLANNED (1)</div>
              </div>
            </div>
          </div>

          {/* Risk score trend */}
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>⚠️ Sector Risk Index — 8-Day Trend</div>
            <LineChart data={RISK_TREND} labels={['8d','7d','6d','5d','4d','3d','2d','Now']} color="#d9381e" fill="rgba(217,56,30,0.08)" height={80} />
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Risk increasing — weather + demand surge</div>
          </div>

          {/* Supply category health bars */}
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '12px' }}>📊 Supply Category Health</div>
            {[
              { cat: 'Food / Rations', pct: 88, color: '#16a34a' },
              { cat: 'Water', pct: 92, color: '#16a34a' },
              { cat: 'Fuel & Energy', pct: 34, color: '#d9381e' },
              { cat: 'Medical', pct: 95, color: '#16a34a' },
              { cat: 'Maintenance', pct: 78, color: '#2e7d32' },
              { cat: 'Communication', pct: 72, color: '#d97706' },
              { cat: 'Controlled Stores', pct: 60, color: '#64748b' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '120px', fontSize: '0.72rem', color: '#334155', flexShrink: 0 }}>{c.cat}</div>
                <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: c.color, width: '32px', textAlign: 'right' }}>{c.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'TRENDS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>📈 30-Day Convoy Volume</div>
            <BarChart
              data={[2,3,1,4,2,3,2,4,3,2,3,3,4,3,3,4,2,3,2,3,3,4,3,2,3,2,3,4,3,2]}
              colorFn={(v) => v >= 4 ? '#d9381e' : '#005a9c'}
            />
          </div>
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>📉 Cumulative Fuel Consumption — FP-KILO</div>
            <LineChart data={[980, 960, 940, 918, 895, 870, 843, 814, 784, 752, 718, 682, 643, 601, 556]} color="#e65100" fill="rgba(230,81,0,0.08)" height={100} />
          </div>
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>🛡️ AI Recommendation Approval Rate</div>
            <LineChart data={[70, 75, 78, 82, 85, 88, 88, 91]} labels={['W1','W2','W3','W4','W5','W6','W7','W8']} color="#16a34a" height={80} />
          </div>
          <div className="service-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>⚡ Average ETA Accuracy (Predicted vs Actual)</div>
            <BarChart
              data={[95, 92, 94, 88, 94, 95, 91, 96, 94, 93]}
              labels={['M','T','W','T','F','S','S','M','T','W']}
              colorFn={(v) => v >= 93 ? '#16a34a' : '#d97706'}
            />
          </div>
        </div>
      )}

      {tab === 'REPORT' && (
        <div>
          <div style={{ textAlign: 'right', marginBottom: '12px' }}>
            <button className="btn-primary btn-sm" onClick={handlePrint}>🖨️ Print / Export PDF Daily Report</button>
          </div>
          {/* FORMAL DAILY LOGISTICS REPORT */}
          <div className="service-card" style={{ padding: '30px', borderTopColor: '#002f56', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #002f56', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', color: '#64748b' }}>
                MINISTRY OF DEFENCE • DEFENCE SERVICES STAFF COLLEGE
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#002f56', margin: '4px 0', fontWeight: '800' }}>
                DAILY SECTOR LOGISTICS & SUPPLY CHAIN INTELLIGENCE REPORT
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                Northern Logistics Frontier (Synthetic Academic Sandbox) • Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} 14:00 IST
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#002f56', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px' }}>
                1. Executive Operational Overview
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
                The Forward Operational Resource & Logistics Grid Engine (FORGE) is monitoring <strong>{kpis.total_locations || 10} operational nodes</strong> and <strong>{kpis.total_inventory_items || 21} forward inventory lines</strong> across the Northern sector. Overall grid inventory health is rated at <strong>{kpis.inventory_health_pct || 76.2}%</strong>. Three forward locations currently operate under high or critical watch due to accelerated heating fuel consumption and snow-slush accumulation along high mountain switchbacks.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#002f56', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px' }}>
                2. High-Priority Shortage Warnings (≤ 5 Days)
              </h4>
              <table className="gov-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Node</th><th>Supply Line</th><th>Coverage (DOS)</th><th>Predicted Depletion Window</th><th>Action Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Forward Post Kilo</strong></td><td>Arctic Grade Diesel Fuel (320L)</td><td><strong style={{ color: '#d9381e' }}>3.4 Days</strong></td><td>Within 72 Hours</td><td><span className="badge badge-critical">Convoy Resupply Recommended</span></td></tr>
                  <tr><td><strong>Forward Post Kilo</strong></td><td>Kerosene Heating Barrels (18 Barrels)</td><td><strong style={{ color: '#e65100' }}>4.5 Days</strong></td><td>Within 5 Days</td><td><span className="badge badge-medium">Buffer Monitored</span></td></tr>
                  <tr><td><strong>Forward Post Sierra</strong></td><td>Arctic Grade Diesel Fuel (450L)</td><td><strong style={{ color: '#e65100' }}>5.2 Days</strong></td><td>Within 6 Days</td><td><span className="badge badge-low">Scheduled Next Cycle</span></td></tr>
                  <tr><td><strong>Base Bravo</strong></td><td>Emergency Ration Packs (240 Packs)</td><td><strong style={{ color: '#e65100' }}>4.8 Days</strong></td><td>Within 5 Days</td><td><span className="badge badge-medium">Under Review</span></td></tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#002f56', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px' }}>
                3. Tactical Route & Convoy Directives
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.6' }}>
                Adverse meteorological radar indicates 42mm precipitation across Pass Echo corridor. All heavy transport dispatches bound for Forward Post Kilo and Base Bravo are ordered diverted to <strong>Route B (Southern Valley All-Weather Axis)</strong>. Route B provides an all-weather paved gradient with an 88/100 composite safety score, negating the +3.5h mud-slush bottleneck observed on Route A. CONVOY-NORTH-703 confirmed en route via Route B. ETA FP-KILO: 4.8 hours.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#002f56', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px' }}>
                4. Fleet & Telematics Status
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.6' }}>
                Fleet inventory: 8 vehicles (3 AVAILABLE, 2 EN ROUTE, 1 DELAYED, 1 LOADING, 1 MAINTENANCE). ARMY-HT-031 connectivity status: OFFLINE — last synced 2h15m ago. Driver offline events will synchronize on next signal acquisition. Fleet utilization: 84%.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
              <div>Classification: <strong>FOR OFFICIAL SIH EVALUATION ONLY (SYNTHETIC)</strong></div>
              <div>Authorized By: <strong>Directorate of Forward Logistics Command</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
