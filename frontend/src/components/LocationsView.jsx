import React, { useState } from 'react';

export default function LocationsView({ locations = [], onSelectLocation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [terrainFilter, setTerrainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = locations.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTerrain = terrainFilter === 'ALL' || l.terrain_type.includes(terrainFilter);
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchSearch && matchTerrain && matchStatus;
  });

  return (
    <div className="container">
      <div className="section-title">
        <span>Forward Operational Locations & Logistics Nodes ({locations.length})</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
          Northern Sector Grid Telemetry
        </span>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search post name, code, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--primary-navy)' }}>Terrain:</label>
            <select
              className="filter-select"
              value={terrainFilter}
              onChange={(e) => setTerrainFilter(e.target.value)}
            >
              <option value="ALL">All Terrains</option>
              <option value="Mountain">Mountain Rugged</option>
              <option value="High Altitude">High Altitude Plateau</option>
              <option value="Plain">Plain / Foothill</option>
              <option value="Forest">Forest Valley</option>
            </select>

            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--primary-navy)', marginLeft: '8px' }}>Status:</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="HEALTHY">HEALTHY</option>
              <option value="WATCH">WATCH</option>
              <option value="AT_RISK">AT RISK</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Node Name & Code</th>
              <th>Sector</th>
              <th>Terrain & Altitude</th>
              <th>Min Days of Supply</th>
              <th>Weather</th>
              <th>Road Condition</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((loc) => {
              const isCrit = loc.current_risk_score >= 81;
              const isHigh = loc.current_risk_score >= 61;
              return (
                <tr key={loc.id} style={{ backgroundColor: isCrit ? '#fff5f5' : 'transparent' }}>
                  <td>
                    <strong>{loc.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {loc.code} • {loc.location_type.replace('_', ' ')}
                    </div>
                  </td>
                  <td>{loc.sector}</td>
                  <td>
                    <div>{loc.terrain_type}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{loc.altitude_m}m ASL</div>
                  </td>
                  <td>
                    <strong style={{ color: (loc.days_of_supply_min || 15) <= 4 ? '#d9381e' : '#2e7d32' }}>
                      {loc.days_of_supply_min || '~3.4'} Days
                    </strong>
                  </td>
                  <td>
                    <div>{loc.weather_condition}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{loc.temp_c}°C | {loc.precipitation_mm}mm</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: loc.road_condition.includes('Slush') || loc.road_condition.includes('Restricted') ? '#d97706' : '#334155' }}>
                      {loc.road_condition}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '36px',
                        height: '6px',
                        background: '#e2e8f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${loc.current_risk_score}%`,
                          height: '100%',
                          background: isCrit ? '#d9381e' : (isHigh ? '#e65100' : '#2e7d32')
                        }} />
                      </div>
                      <strong>{loc.current_risk_score}/100</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      loc.status === 'CRITICAL' ? 'badge-critical' :
                      loc.status === 'AT_RISK' ? 'badge-medium' :
                      loc.status === 'WATCH' ? 'badge-low' : 'badge-healthy'
                    }`}>
                      {loc.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => onSelectLocation(loc)}
                    >
                      Details &gt;
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
