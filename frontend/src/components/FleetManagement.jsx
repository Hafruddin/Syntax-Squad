import React, { useState } from 'react';

export default function FleetManagement({ vehicles = [], onNavigate }) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = vehicles.filter((v) => filterStatus === 'ALL' || v.status === filterStatus);

  return (
    <div className="container">
      <div className="section-title">
        <span>Tactical Fleet Management & Telemetry Grid ({vehicles.length} Units)</span>
        <button className="btn-secondary btn-sm" onClick={() => onNavigate('DRIVER')}>
          Switch to Driver Mobile Cockpit 📱
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <span style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>
            Vehicle Assets & Telematics
          </span>

          <div className="filter-group">
            <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Filter Fleet Status:</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Fleet Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="EN_ROUTE">EN ROUTE</option>
              <option value="DELAYED">DELAYED</option>
              <option value="LOADING">LOADING</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Vehicle Number & Model</th>
              <th>Payload Capacity</th>
              <th>Current Coordinates</th>
              <th>Fuel Reserve</th>
              <th>Assigned Driver</th>
              <th>Active Mission</th>
              <th>Connectivity</th>
              <th>Odometer</th>
              <th>Fleet Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const isOffline = v.connectivity_status === 'OFFLINE';
              return (
                <tr key={v.id}>
                  <td>
                    <strong>{v.vehicle_number}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.model_type}</div>
                  </td>
                  <td>{v.capacity_tons} Tons</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {v.current_lat.toFixed(4)}° N, {v.current_lng.toFixed(4)}° E
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '40px',
                        height: '6px',
                        background: '#e2e8f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${v.fuel_pct}%`,
                          height: '100%',
                          background: v.fuel_pct < 50 ? '#d97706' : '#16a34a'
                        }} />
                      </div>
                      <span style={{ fontWeight: 'bold' }}>{v.fuel_pct}%</span>
                    </div>
                  </td>
                  <td>{v.assigned_driver_name || 'Standby Pool'}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                      {v.current_shipment_number || 'None'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isOffline ? 'badge-offline' : 'badge-online'}`}>
                      {v.connectivity_status}
                    </span>
                  </td>
                  <td>{v.odometer_km.toLocaleString()} km</td>
                  <td>
                    <span className={`badge ${
                      v.status === 'AVAILABLE' ? 'badge-healthy' :
                      v.status === 'EN_ROUTE' ? 'badge-online' :
                      v.status === 'DELAYED' ? 'badge-critical' :
                      v.status === 'MAINTENANCE' ? 'badge-medium' : 'badge-low'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => onNavigate('DRIVER')}
                    >
                      Inspect HUD
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
