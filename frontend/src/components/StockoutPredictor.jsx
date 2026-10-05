import React, { useState, useEffect } from 'react';

export default function StockoutPredictor({ onNavigate }) {
  const [stockouts, setStockouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');

  useEffect(() => {
    fetch('/api/stockout-predictions')
      .then((res) => res.json())
      .then((data) => {
        setStockouts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed fetching stockout predictions", err);
        setLoading(false);
      });
  }, []);

  const filtered = stockouts.filter((s) => filterLevel === 'ALL' || s.risk_level === filterLevel);

  return (
    <div className="container">
      <div className="section-title">
        <span>AI Stockout Prediction & Lead-Time Vulnerability Engine</span>
        <button className="btn-primary btn-sm" onClick={() => onNavigate('SHIPMENTS')}>
          + Plan Urgent Resupply Convoy
        </button>
      </div>

      {/* STRATEGIC RATIONALE BANNER */}
      <div className="service-card" style={{ marginBottom: '20px', borderTopColor: '#d9381e' }}>
        <h4 style={{ color: 'var(--primary-navy)', marginBottom: '4px', fontWeight: '700' }}>
          "PREDICT BEFORE YOU TRANSPORT" — Forward Supply Line Protection
        </h4>
        <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.5' }}>
          Traditional supply chains respond only after inventory reaches zero. FORGE applies predictive consumption physics,
          compensating for mountain road degradation, snowstorm closures, and convoy transit hours to calculate the exact
          depletion window before the shortage materializes.
        </p>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>
            Predicted Stockout Registry ({filtered.length} Monitored Items)
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Filter Risk:</label>
            <select
              className="filter-select"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">CRITICAL (&le; 3 Days)</option>
              <option value="HIGH">HIGH (&le; 5 Days)</option>
              <option value="MEDIUM">MEDIUM (&le; 8 Days)</option>
              <option value="LOW">LOW (&gt; 8 Days)</option>
            </select>
          </div>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Store Item & Node</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Daily Burn Rate</th>
              <th>Days Remaining</th>
              <th>Predicted Stockout Date</th>
              <th>Weather / Delay Exposure</th>
              <th>Risk Severity</th>
              <th>Proactive Action</th>
              <th>Dispatch</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isCrit = item.risk_level === 'CRITICAL';
              const isHigh = item.risk_level === 'HIGH';
              return (
                <tr key={item.item_id} style={{ backgroundColor: isCrit ? '#fff5f5' : 'transparent' }}>
                  <td>
                    <strong>{item.item_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.location_name}</div>
                  </td>
                  <td>{item.category}</td>
                  <td><strong>{item.current_stock}</strong> {item.unit}</td>
                  <td>{item.effective_daily_demand} {item.unit}/day</td>
                  <td>
                    <span style={{
                      fontWeight: '800',
                      fontSize: '1rem',
                      color: isCrit ? '#d9381e' : (isHigh ? '#e65100' : '#2e7d32')
                    }}>
                      {item.days_remaining} Days
                    </span>
                  </td>
                  <td>
                    <strong>{item.stockout_date}</strong>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {item.weather_adjustment_risk}
                  </td>
                  <td>
                    <span className={`badge ${
                      isCrit ? 'badge-critical' :
                      isHigh ? 'badge-medium' :
                      item.risk_level === 'MEDIUM' ? 'badge-low' : 'badge-healthy'
                    }`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td style={{ maxWidth: '220px', fontSize: '0.78rem', color: '#1e293b' }}>
                    {item.recommended_action}
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => onNavigate('SHIPMENTS')}
                    >
                      Resupply 🚚
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
