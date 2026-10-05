import React, { useState } from 'react';

const WEATHER_ALERTS = [
  { zone: "Pass Echo Corridor (High Altitude)", type: "HEAVY RAIN + SLEET", severity: "CRITICAL", detail: "42mm precipitation forecast. Slush accumulation on switchbacks. Route A degraded.", expires: "Next 48h", icon: "🌧️" },
  { zone: "Glacier Valley Approach", type: "SUB-ZERO BLIZZARD", severity: "HIGH", detail: "Wind chill -18°C. Mandatory chains. Heating fuel burn +35%.", expires: "Next 36h", icon: "❄️" },
  { zone: "River Crossing Charlie", type: "FLASH FLOOD WARNING", severity: "HIGH", detail: "Swollen river bed. Bridge load limit reduced to 12T. Large convoys reroute.", expires: "Next 24h", icon: "🌊" },
  { zone: "Foothill Transit Axis", type: "DENSE MORNING FOG", severity: "MEDIUM", detail: "Visibility <200m 0500-0900. Convoy departure delay recommended.", expires: "Morning only", icon: "🌫️" },
  { zone: "Southern Valley Route B", type: "CLEAR WITH GUSTS", severity: "LOW", detail: "Wind 35km/h. Light HT impact. Route B all-weather passage OPEN.", expires: "24h stable", icon: "💨" },
];

const TERRAIN_DATA = [
  { name: "High-Altitude Pass Approach", gradient: "18°", surface: "Broken Shale + Ice", passability: "RESTRICTED", danger: "HIGH", vehicleLimit: "8T Max" },
  { name: "Valley All-Weather Axis (Rt-B)", gradient: "5°", surface: "Paved + Gravel", passability: "OPEN", danger: "LOW", vehicleLimit: "35T Max" },
  { name: "Mountain Switchback Spine", gradient: "22°", surface: "Mud + Ruts", passability: "CAUTION", danger: "MEDIUM", vehicleLimit: "12T Max" },
  { name: "River Delta Plain", gradient: "2°", surface: "Hardpack Sand", passability: "OPEN", danger: "LOW", vehicleLimit: "35T Max" },
];

function WeatherCard({ loc }) {
  const wc = (loc.weather_condition || '').toLowerCase();
  const isAdverse = wc.includes('rain') || wc.includes('snow') || wc.includes('sleet') || wc.includes('blizzard') || wc.includes('fog') || loc.precipitation_mm > 15;
  const riskColor = isAdverse ? '#d9381e' : '#005a9c';
  const riskLabel = isAdverse ? '+25-35% Fuel Burn / Speed Cut' : 'Nominal Transit Viability';

  return (
    <div
      className="service-card"
      style={{ borderTopColor: riskColor, borderTopWidth: '4px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ color: 'var(--primary-navy)', margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>
          {loc.name}
        </h4>
        <span className={`badge ${isAdverse ? 'badge-critical' : 'badge-healthy'}`}>
          {loc.weather_condition || 'Clear'}
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
        {loc.sector} • {loc.terrain_type} ({loc.altitude_m}m ASL)
      </div>

      {/* Mini Weather Grid */}
      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>🌡️ Temp: <strong>{loc.temp_c}°C</strong></div>
          <div>🌧️ Precip: <strong>{loc.precipitation_mm} mm</strong></div>
          <div>💨 Wind: <strong>{loc.wind_speed_kmh} km/h</strong></div>
          <div>👁️ Visibility: <strong>{loc.visibility_km} km</strong></div>
        </div>
      </div>

      {/* Visual temperature bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '3px' }}>Temperature Index:</div>
        <div style={{ background: '#e2e8f0', borderRadius: '3px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, (loc.temp_c + 30) / 60 * 100))}%`,
            height: '100%',
            background: loc.temp_c < 0 ? '#3b82f6' : (loc.temp_c < 10 ? '#22c55e' : '#f97316')
          }} />
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '10px' }}>
        <strong>Transit Axis Status:</strong> {loc.road_condition}
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
        <span style={{ color: '#64748b' }}>Environmental Risk:</span>
        <strong style={{ color: isAdverse ? '#d9381e' : '#16a34a' }}>
          {riskLabel}
        </strong>
      </div>
    </div>
  );
}

export default function WeatherTerrainIntelligence({ locations = [], onNavigate }) {
  const [tab, setTab] = useState('WEATHER');

  return (
    <div className="container">
      <div className="section-title">
        <span>Meteorological & Terrain Intelligence Grid</span>
        <button className="btn-secondary btn-sm" onClick={() => onNavigate('MAP')}>
          View on GIS Map ↗
        </button>
      </div>

      {/* ACTIVE WEATHER ALERT BANNER */}
      <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderLeft: '5px solid #d9381e', borderRadius: '6px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.3rem' }}>🌧️</span>
        <div>
          <strong style={{ color: '#d9381e', fontSize: '0.9rem' }}>ACTIVE METEOROLOGICAL ALERT — NORTHERN SECTOR</strong>
          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
            Pass Echo corridor: 42mm precipitation, sleet, Road A severely degraded. All heavy transport re-routed to Route B (Valley All-Weather Axis). +35% heating fuel burn expected.
          </div>
        </div>
        <span className="badge badge-critical" style={{ whiteSpace: 'nowrap' }}>ACTIVE</span>
      </div>

      {/* TAB SWITCHER */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['WEATHER', 'ALERTS', 'TERRAIN'].map(t => (
          <button
            key={t}
            className={tab === t ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
            onClick={() => setTab(t)}
          >
            {t === 'WEATHER' ? '🌦️ Location Weather' : t === 'ALERTS' ? '⚠️ Zone Alerts' : '🏔️ Terrain Assessment'}
          </button>
        ))}
      </div>

      {tab === 'WEATHER' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {locations.length > 0 ? locations.map((loc) => (
            <WeatherCard key={loc.id} loc={loc} />
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Loading location weather data...
            </div>
          )}
        </div>
      )}

      {tab === 'ALERTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {WEATHER_ALERTS.map((a, i) => (
            <div key={i} className="service-card" style={{
              borderTopColor: a.severity === 'CRITICAL' ? '#d9381e' : a.severity === 'HIGH' ? '#e65100' : a.severity === 'MEDIUM' ? '#d97706' : '#16a34a',
              borderTopWidth: '4px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
                  <div>
                    <strong style={{ color: 'var(--primary-navy)' }}>{a.zone}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.type}</div>
                  </div>
                </div>
                <span className={`badge ${a.severity === 'CRITICAL' ? 'badge-critical' : a.severity === 'HIGH' ? 'badge-medium' : a.severity === 'MEDIUM' ? 'badge-low' : 'badge-healthy'}`}>
                  {a.severity}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '8px' }}>{a.detail}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>⏱️ Alert Window: <strong>{a.expires}</strong></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'TERRAIN' && (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <div className="table-toolbar">
            <span style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>
              Terrain Passability & Transport Assessment
            </span>
          </div>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Transit Axis</th>
                <th>Gradient</th>
                <th>Surface Condition</th>
                <th>Vehicle Limit</th>
                <th>Passability</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {TERRAIN_DATA.map((t, i) => (
                <tr key={i}>
                  <td><strong>{t.name}</strong></td>
                  <td><strong>{t.gradient}</strong></td>
                  <td>{t.surface}</td>
                  <td><strong>{t.vehicleLimit}</strong></td>
                  <td>
                    <span className={`badge ${t.passability === 'OPEN' ? 'badge-healthy' : t.passability === 'CAUTION' ? 'badge-low' : 'badge-critical'}`}>
                      {t.passability}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${t.danger === 'HIGH' ? 'badge-critical' : t.danger === 'MEDIUM' ? 'badge-medium' : 'badge-healthy'}`}>
                      {t.danger}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
