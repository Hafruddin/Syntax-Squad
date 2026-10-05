import React, { useState } from 'react';

export default function InventoryIntelligence({
  inventory = [],
  locations = [],
  onRefresh,
  onNavigate
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [consumeModalItem, setConsumeModalItem] = useState(null);
  const [consumeQty, setConsumeQty] = useState(10);
  const [consumeReason, setConsumeReason] = useState('Daily Tactical Consumption Log');

  const categories = [
    "ALL",
    "Food / Rations",
    "Water",
    "Fuel & Energy",
    "Medical Supplies",
    "Maintenance & Spare Parts",
    "Shelter & General Supplies",
    "Communication Equipment",
    "Controlled Stores"
  ];

  const filtered = inventory.filter((item) => {
    const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchLocation = selectedLocation === 'ALL' || String(item.location_id) === String(selectedLocation);
    const matchRisk = selectedRisk === 'ALL' || item.risk_level === selectedRisk;
    const matchSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.location_name && item.location_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchLocation && matchRisk && matchSearch;
  });

  const handleConsumeSubmit = async (e) => {
    e.preventDefault();
    if (!consumeModalItem) return;

    try {
      const res = await fetch(`/api/inventory/${consumeModalItem.id}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumed_quantity: parseFloat(consumeQty),
          reason: consumeReason
        })
      });
      if (res.ok) {
        setConsumeModalItem(null);
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to record consumption", err);
    }
  };

  return (
    <div className="container">
      <div className="section-title">
        <span>Inventory Intelligence & Forward Buffer Management ({inventory.length} Stores)</span>
        <button
          className="btn-primary btn-sm"
          onClick={() => onNavigate('SHIPMENTS')}
        >
          + Plan Replenishment Convoy
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <div className="table-toolbar">
          <div className="search-input-box" style={{ width: '280px' }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search stores or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Supply Categories' : c}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="ALL">All Forward Nodes</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">CRITICAL (&le; 2.5d)</option>
              <option value="HIGH_RISK">HIGH RISK (&le; 4.5d)</option>
              <option value="MEDIUM_RISK">MEDIUM RISK (&le; 7.0d)</option>
              <option value="HEALTHY">HEALTHY (&gt; 7.0d)</option>
            </select>
          </div>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Store Item</th>
              <th>Category</th>
              <th>Forward Post</th>
              <th>Current Stock</th>
              <th>Daily Burn Rate</th>
              <th>Days of Supply (DOS)</th>
              <th>Safety Stock</th>
              <th>Risk Status</th>
              <th>AI Predictive Action</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isCrit = item.risk_level === 'CRITICAL';
              const isHigh = item.risk_level === 'HIGH_RISK';
              return (
                <tr key={item.id} style={{ backgroundColor: isCrit ? '#fff5f5' : 'transparent' }}>
                  <td>
                    <strong>{item.item_name}</strong>
                    {item.category === 'Controlled Stores' && (
                      <span style={{ fontSize: '0.68rem', background: '#334155', color: '#fff', padding: '1px 5px', borderRadius: '2px', marginLeft: '6px' }}>
                        GENERIC
                      </span>
                    )}
                  </td>
                  <td>{item.category}</td>
                  <td>{item.location_name || 'Forward Post'}</td>
                  <td>
                    <strong>{item.current_quantity}</strong> {item.unit}
                  </td>
                  <td>{item.daily_consumption_base} {item.unit}/day</td>
                  <td>
                    <strong style={{
                      color: isCrit ? '#d9381e' : (isHigh ? '#e65100' : '#2e7d32'),
                      fontSize: '0.95rem'
                    }}>
                      {item.days_of_supply} Days
                    </strong>
                  </td>
                  <td>{item.safety_stock} {item.unit}</td>
                  <td>
                    <span className={`badge ${
                      isCrit ? 'badge-critical' :
                      isHigh ? 'badge-medium' :
                      item.risk_level === 'MEDIUM_RISK' ? 'badge-low' : 'badge-healthy'
                    }`}>
                      {item.risk_level.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.78rem', color: '#475569' }}>
                    {item.ai_recommendation}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-secondary btn-sm"
                        title="Record forward consumption"
                        onClick={() => {
                          setConsumeModalItem(item);
                          setConsumeQty(Math.round(item.daily_consumption_base || 10));
                        }}
                      >
                        Log Burn
                      </button>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => onNavigate('SHIPMENTS')}
                      >
                        Resupply
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: RECORD CONSUMPTION */}
      {consumeModalItem && (
        <div className="modal-overlay" onClick={() => setConsumeModalItem(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Forward Post Consumption</h3>
              <button className="modal-close-btn" onClick={() => setConsumeModalItem(null)}>✕</button>
            </div>
            <form onSubmit={handleConsumeSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '14px', fontSize: '0.88rem' }}>
                  Logging consumption for <strong>{consumeModalItem.item_name}</strong> at <strong>{consumeModalItem.location_name}</strong>.
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                    Current Available Balance:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${consumeModalItem.current_quantity} ${consumeModalItem.unit}`}
                    style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                    Quantity Consumed ({consumeModalItem.unit}):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={consumeModalItem.current_quantity}
                    value={consumeQty}
                    onChange={(e) => setConsumeQty(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                    Operational Reason / Remarks:
                  </label>
                  <input
                    type="text"
                    value={consumeReason}
                    onChange={(e) => setConsumeReason(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setConsumeModalItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Commit Consumption</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
