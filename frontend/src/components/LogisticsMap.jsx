import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export default function LogisticsMap({
  locations = [],
  vehicles = [],
  routes = [],
  onSelectLocation = () => {},
  height = '540px'
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, CRITICAL, VEHICLES, ROUTES

  useEffect(() => {
    if (!mapRef.current) return;

    // Center near Northern Logistics Frontier (Leh-Udhampur corridor)
    if (!mapInstanceRef.current) {
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }
      const map = L.map(mapRef.current).setView([33.80, 75.80], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors | FORGE Indian Army Grid'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing dynamic layers except base tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon Generator
    const createMarkerIcon = (color, label, isDepot = false) => {
      const shapeHtml = isDepot
        ? `<div style="background:${color};width:28px;height:28px;border-radius:4px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:11px;">★</div>`
        : `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:10px;">${label}</div>`;

      return L.divIcon({
        className: 'custom-map-icon',
        html: shapeHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });
    };

    // Render Routes
    if (filterMode === 'ALL' || filterMode === 'ROUTES') {
      routes.forEach((r) => {
        if (r.geometry && r.geometry.length > 0) {
          const isRec = r.is_recommended;
          const routeColor = isRec ? '#1b5e20' : '#d9381e'; // Green for Route B recommended, Red for Route A hazard
          const weight = isRec ? 5 : 3;
          const dashArray = isRec ? null : '6, 6';

          const polyline = L.polyline(r.geometry, {
            color: routeColor,
            weight: weight,
            opacity: 0.85,
            dashArray: dashArray
          }).addTo(map);

          polyline.bindPopup(`
            <div style="font-family:'Segoe UI',sans-serif;padding:4px;">
              <h4 style="margin:0 0 4px 0;color:#002f56;font-size:14px;">${r.route_name}</h4>
              <p style="margin:2px 0;font-size:12px;"><strong>Distance:</strong> ${r.distance_km} km | <strong>Base ETA:</strong> ${r.base_eta_hours}h</p>
              <p style="margin:2px 0;font-size:12px;"><strong>Composite Score:</strong> <span style="color:${isRec ? '#2e7d32' : '#d9381e'};font-weight:bold;">${r.composite_score}/100</span></p>
              <p style="margin:2px 0;font-size:11px;color:#64748b;">${r.road_condition}</p>
            </div>
          `);
        }
      });
    }

    // Render Forward Locations & Central Depots
    locations.forEach((loc) => {
      const isCritical = loc.current_risk_score >= 61.0 || loc.status === 'CRITICAL';
      if (filterMode === 'CRITICAL' && !isCritical) return;

      let color = '#2e7d32'; // Healthy
      if (loc.current_risk_score >= 81.0) color = '#d9381e'; // Critical
      else if (loc.current_risk_score >= 61.0) color = '#e65100'; // High
      else if (loc.current_risk_score >= 31.0) color = '#f57c00'; // Medium

      const isDepot = loc.location_type === 'CENTRAL_DEPOT';
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: createMarkerIcon(color, loc.code.substring(0, 2), isDepot)
      }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family:'Segoe UI',sans-serif;min-width:200px;padding:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <h4 style="margin:0;color:#002f56;font-size:14px;font-weight:700;">${loc.name}</h4>
            <span style="background:${color};color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;font-weight:bold;">
              ${loc.status}
            </span>
          </div>
          <div style="font-size:12px;color:#334155;line-height:1.5;">
            <div><strong>Sector:</strong> ${loc.sector}</div>
            <div><strong>Terrain:</strong> ${loc.terrain_type} (${loc.altitude_m}m)</div>
            <div><strong>Risk Score:</strong> ${loc.current_risk_score}/100</div>
            <div><strong>Weather:</strong> ${loc.weather_condition} (${loc.temp_c}°C)</div>
            <div><strong>Road Status:</strong> ${loc.road_condition}</div>
            <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;">
              <span style="font-weight:bold;color:#005a9c;">Min Coverage: ${loc.days_of_supply_min || '~3.4'} Days</span>
            </div>
          </div>
          <button id="btn-popup-${loc.id}" style="margin-top:8px;width:100%;background:#005a9c;color:#fff;border:none;padding:5px 8px;border-radius:4px;cursor:pointer;font-weight:600;font-size:11px;">
            View Detailed Intelligence
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${loc.id}`);
        if (btn) {
          btn.onclick = () => onSelectLocation(loc);
        }
      });
    });

    // Render Fleet Vehicles
    if (filterMode === 'ALL' || filterMode === 'VEHICLES') {
      vehicles.forEach((v) => {
        const isOffline = v.connectivity_status === 'OFFLINE';
        const isDelayed = v.status === 'DELAYED';
        const vColor = isDelayed ? '#d97706' : (isOffline ? '#475569' : '#0284c7');

        const truckIcon = L.divIcon({
          className: 'truck-map-icon',
          html: `
            <div style="background:${vColor};width:26px;height:26px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;">
              🚚
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const vMarker = L.marker([v.current_lat, v.current_lng], { icon: truckIcon }).addTo(map);
        vMarker.bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;padding:4px;">
            <h4 style="margin:0 0 4px 0;color:#002f56;font-size:13px;">${v.vehicle_number} (${v.model_type})</h4>
            <div style="font-size:11px;color:#334155;">
              <div><strong>Status:</strong> ${v.status} | <strong>Fuel:</strong> ${v.fuel_pct}%</div>
              <div><strong>Driver:</strong> ${v.assigned_driver_name || 'Assigned'}</div>
              <div><strong>Connectivity:</strong> <span style="color:${isOffline ? '#dc2626' : '#16a34a'};font-weight:bold;">${v.connectivity_status}</span></div>
            </div>
          </div>
        `);
      });
    }

  }, [locations, vehicles, routes, filterMode]);

  return (
    <div className="map-card">
      <div className="map-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="filter-group">
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
            GIS Tactical Logistics Grid
          </span>
          <div className="filter-group">
            <button
              className={`btn-secondary btn-sm ${filterMode === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterMode('ALL')}
            >
              All Layers
            </button>
            <button
              className={`btn-secondary btn-sm ${filterMode === 'CRITICAL' ? 'active' : ''}`}
              onClick={() => setFilterMode('CRITICAL')}
            >
              Critical Nodes Only
            </button>
            <button
              className={`btn-secondary btn-sm ${filterMode === 'VEHICLES' ? 'active' : ''}`}
              onClick={() => setFilterMode('VEHICLES')}
            >
              Fleet En Route
            </button>
            <button
              className={`btn-secondary btn-sm ${filterMode === 'ROUTES' ? 'active' : ''}`}
              onClick={() => setFilterMode('ROUTES')}
            >
              Routes & Corridors
            </button>
          </div>
        </div>

        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot" style={{ background: '#2e7d32' }}></span> Healthy</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f57c00' }}></span> Watch</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#e65100' }}></span> High Risk</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#d9381e' }}></span> Critical</div>
          <div className="legend-item"><span style={{ color: '#002f56' }}>★</span> Base Depot</div>
        </div>
      </div>

      <div ref={mapRef} style={{ height: height, width: '100%' }} />
    </div>
  );
}
