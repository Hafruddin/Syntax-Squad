import React, { useEffect, useState } from 'react';

export default function LocationDetailsModal({ location, onClose, onNavigate }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    fetch(`/api/locations/${location.id}`)
      .then((res) => res.json())
      .then((data) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed fetching location details", err);
        setLoading(false);
      });
  }, [location]);

  if (!location) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{location.name} ({location.code})</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {location.sector} • {location.location_type.replace('_', ' ')}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading tactical post telemetry...</div>
          ) : (
            <div>
              {/* Top Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #005a9c' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Current Risk</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: location.current_risk_score >= 61 ? '#d9381e' : '#2e7d32' }}>
                    {location.current_risk_score} / 100
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #ff9933' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Terrain & ASL</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                    {location.altitude_m}m ASL
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{location.terrain_type}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #0284c7' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Weather</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                    {location.temp_c}°C
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{location.weather_condition}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #16a34a' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Road Status</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: location.road_condition.includes('Slush') ? '#d97706' : '#1e293b' }}>
                    {location.road_condition}
                  </div>
                </div>
              </div>

              {/* Explainable Risk Attribution */}
              {details?.risk_evaluation && (
                <div style={{
                  background: location.current_risk_score >= 61 ? '#fff1f2' : '#f0fdf4',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${location.current_risk_score >= 61 ? '#fecdd3' : '#bbf7d0'}`,
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: location.current_risk_score >= 61 ? '#9f1239' : '#166534' }}>
                      Operational Risk Assessment: {details.risk_evaluation.level}
                    </strong>
                    <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>Score: {details.risk_evaluation.score}/100</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#334155' }}>
                    {details.risk_evaluation.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stationed Inventory Stores */}
              <h4 style={{ fontSize: '0.92rem', color: 'var(--primary-navy)', marginBottom: '8px', fontWeight: '700' }}>
                Inventory Stores & Days of Supply (DOS)
              </h4>
              <table className="gov-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Burn Rate</th>
                    <th>Coverage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {details?.inventory?.map((it) => {
                    const daily = it.daily_consumption_base || 1.0;
                    const dos = (it.current_quantity / daily).toFixed(1);
                    return (
                      <tr key={it.id}>
                        <td><strong>{it.item_name}</strong></td>
                        <td>{it.category}</td>
                        <td>{it.current_quantity} {it.unit}</td>
                        <td>{daily} {it.unit}/day</td>
                        <td>
                          <strong style={{ color: dos <= 3.5 ? '#d9381e' : '#2e7d32' }}>
                            {dos} Days
                          </strong>
                        </td>
                        <td>
                          <span className={`badge ${
                            it.status === 'CRITICAL' ? 'badge-critical' :
                            it.status === 'HIGH_RISK' ? 'badge-medium' :
                            it.status === 'LOW' ? 'badge-low' : 'badge-healthy'
                          }`}>
                            {it.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Incoming Convoys */}
              {details?.incoming_shipments && details.incoming_shipments.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '0.92rem', color: 'var(--primary-navy)', marginBottom: '6px', fontWeight: '700' }}>
                    Incoming Replenishment Convoys ({details.incoming_shipments.length})
                  </h4>
                  <table className="gov-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Tracking #</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>ETA</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.incoming_shipments.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.tracking_number}</strong></td>
                          <td>{s.category}</td>
                          <td>{s.quantity} {s.unit}</td>
                          <td>{s.eta_hours}h</td>
                          <td><span className="badge badge-online">{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              onNavigate('SHIPMENTS');
            }}
          >
            Dispatch Replenishment Convoy 🚚
          </button>
        </div>
      </div>
    </div>
  );
}
