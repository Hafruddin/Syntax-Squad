import React, { useState } from 'react';

export default function ShipmentManagement({
  shipments = [],
  locations = [],
  vehicles = [],
  onRefresh,
  onNavigate
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [originId, setOriginId] = useState(locations[0]?.id || 1);
  const [destId, setDestId] = useState(locations[2]?.id || 3);
  const [category, setCategory] = useState('Fuel & Energy');
  const [quantity, setQuantity] = useState(1200);
  const [unit, setUnit] = useState('Litres');
  const [priority, setPriority] = useState('URGENT');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || 1);
  const [notes, setNotes] = useState('High-altitude replenishment mission');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = shipments.filter((s) => statusFilter === 'ALL' || s.status === statusFilter);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_id: parseInt(originId),
          destination_id: parseInt(destId),
          category: category,
          quantity: parseFloat(quantity),
          unit: unit,
          priority: priority,
          vehicle_id: parseInt(vehicleId),
          driver_id: 1,
          route_id: 1,
          notes: notes
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error("Failed creating shipment", err);
    }
  };

  const handleDispatch = async (shipmentId) => {
    try {
      await fetch(`/api/shipments/${shipmentId}/dispatch`, { method: 'POST' });
      onRefresh();
    } catch (err) {
      console.error("Failed dispatching shipment", err);
    }
  };

  const handleDeliver = async (shipmentId) => {
    try {
      await fetch(`/api/shipments/${shipmentId}/deliver`, { method: 'POST' });
      onRefresh();
    } catch (err) {
      console.error("Failed confirming delivery", err);
    }
  };

  return (
    <div className="container">
      <div className="section-title">
        <span>Convoy & Forward Replenishment Shipments ({shipments.length})</span>
        <button className="btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          + Create New Replenishment Convoy
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <span style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>
            Active Supply Line Convoys
          </span>

          <div className="filter-group">
            <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Filter Status:</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">PLANNED</option>
              <option value="EN_ROUTE">EN ROUTE</option>
              <option value="DELAYED">DELAYED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Tracking #</th>
              <th>Origin & Destination</th>
              <th>Payload Category</th>
              <th>Quantity</th>
              <th>Priority</th>
              <th>Vehicle & Driver</th>
              <th>Route Axis</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Operational Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.tracking_number}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {s.notes || 'Routine Mission'}
                  </div>
                </td>
                <td>
                  <div>From: <strong>{s.origin_name}</strong></div>
                  <div>To: <strong>{s.destination_name}</strong></div>
                </td>
                <td>{s.category}</td>
                <td>
                  <strong>{s.quantity}</strong> {s.unit}
                </td>
                <td>
                  <span className={`badge ${
                    s.priority === 'URGENT' ? 'badge-critical' :
                    s.priority === 'HIGH' ? 'badge-medium' : 'badge-healthy'
                  }`}>
                    {s.priority}
                  </span>
                </td>
                <td>
                  <div>{s.vehicle_number}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.driver_name}</div>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem' }}>{s.route_name}</span>
                </td>
                <td>
                  <strong>{s.eta_hours} Hours</strong>
                </td>
                <td>
                  <span className={`badge ${
                    s.status === 'DELIVERED' ? 'badge-healthy' :
                    s.status === 'DELAYED' ? 'badge-critical' :
                    s.status === 'EN_ROUTE' ? 'badge-online' : 'badge-low'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {s.status === 'PLANNED' && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleDispatch(s.id)}
                      >
                        Dispatch 🚀
                      </button>
                    )}
                    {s.status === 'EN_ROUTE' && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => onNavigate('DRIVER')}
                      >
                        Driver View 📱
                      </button>
                    )}
                    {s.status === 'EN_ROUTE' && (
                      <button
                        className="btn-primary btn-sm"
                        style={{ background: '#16a34a' }}
                        onClick={() => handleDeliver(s.id)}
                      >
                        Confirm Delivery ✓
                      </button>
                    )}
                    {s.status === 'DELAYED' && (
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => onNavigate('ROUTE_PLANNER')}
                      >
                        Reroute ⚠️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE SHIPMENT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Plan & Authorize Replenishment Convoy</h3>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Dispatch Origin:
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={originId}
                      onChange={(e) => setOriginId(e.target.value)}
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Forward Destination:
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={destId}
                      onChange={(e) => setDestId(e.target.value)}
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Stores Category:
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (e.target.value.includes('Fuel')) setUnit('Litres');
                        else if (e.target.value.includes('Rations')) setUnit('Packs');
                        else if (e.target.value.includes('Water')) setUnit('Cans');
                        else setUnit('Units');
                      }}
                    >
                      <option value="Fuel & Energy">Fuel & Energy</option>
                      <option value="Food / Rations">Food / Rations</option>
                      <option value="Water">Water</option>
                      <option value="Medical Supplies">Medical Supplies</option>
                      <option value="Maintenance & Spare Parts">Maintenance & Spare Parts</option>
                      <option value="Shelter & General Supplies">Shelter & General Supplies</option>
                      <option value="Communication Equipment">Communication Equipment</option>
                      <option value="Controlled Stores">Controlled Stores (Generic)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Quantity:
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Unit:
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Priority Level:
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="URGENT">URGENT (Critical Stockout)</option>
                      <option value="HIGH">HIGH (Proactive Resupply)</option>
                      <option value="STANDARD">STANDARD (Nominal Cycle)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      Assigned Vehicle:
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.vehicle_number} ({v.model_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    Mission Remarks:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Authorize & Create Convoy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
