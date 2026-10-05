import React, { useState, useEffect } from 'react';
import EmblemSvg from './components/EmblemSvg';
import CommandDashboard from './components/CommandDashboard';
import LogisticsMap from './components/LogisticsMap';
import LocationsView from './components/LocationsView';
import LocationDetailsModal from './components/LocationDetailsModal';
import InventoryIntelligence from './components/InventoryIntelligence';
import DemandForecasting from './components/DemandForecasting';
import StockoutPredictor from './components/StockoutPredictor';
import RoutePlanner from './components/RoutePlanner';
import ShipmentManagement from './components/ShipmentManagement';
import FleetManagement from './components/FleetManagement';
import DriverCockpit from './components/DriverCockpit';
import WhatIfSimulation from './components/WhatIfSimulation';
import WeatherTerrainIntelligence from './components/WeatherTerrainIntelligence';
import AIAdvisor from './components/AIAdvisor';
import AnalyticsReports from './components/AnalyticsReports';
import AuditLogsView from './components/AuditLogsView';
import SystemSettings from './components/SystemSettings';
import DemoScenarioModal from './components/DemoScenarioModal';
import ProfileView from './components/ProfileView';
import NotificationsPanel from './components/NotificationsPanel';

import {
  INITIAL_KPIS,
  INITIAL_LOCATIONS,
  INITIAL_INVENTORY,
  INITIAL_VEHICLES,
  INITIAL_SHIPMENTS,
  INITIAL_ROUTES,
  INITIAL_RECOMMENDATIONS,
  INITIAL_STOCKOUTS
} from './data/mockData';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState('DASHBOARD');

  // Role-Based Access State
  const [currentRole, setCurrentRole] = useState('COMMANDER'); // COMMANDER, LOGISTICS_OFFICER, DRIVER, FORWARD_OPERATOR

  // Global Data State (Pre-populated with rich demo data for instant load on Netlify / local)
  const [kpis, setKpis] = useState(INITIAL_KPIS);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const [stockouts, setStockouts] = useState(INITIAL_STOCKOUTS);

  // Modals & UI Toggles
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('md'); // sm, md, lg
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString() + ' IST');

  // Load backend data if available, with graceful fallback
  const fetchData = async () => {
    try {
      const fetchJson = async (url, fallback) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return fallback;
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return fallback;
          }
        } catch {
          return fallback;
        }
      };

      const [kpiRes, locRes, invRes, shipRes, vehRes, rtRes, recRes, stockRes] = await Promise.all([
        fetchJson('/api/dashboard', INITIAL_KPIS),
        fetchJson('/api/locations', INITIAL_LOCATIONS),
        fetchJson('/api/inventory', INITIAL_INVENTORY),
        fetchJson('/api/shipments', INITIAL_SHIPMENTS),
        fetchJson('/api/fleet', INITIAL_VEHICLES),
        fetchJson('/api/routes', INITIAL_ROUTES),
        fetchJson('/api/recommendations', INITIAL_RECOMMENDATIONS),
        fetchJson('/api/stockout-predictions', INITIAL_STOCKOUTS)
      ]);

      if (kpiRes && typeof kpiRes === 'object' && Object.keys(kpiRes).length > 0) setKpis(kpiRes);
      if (Array.isArray(locRes) && locRes.length > 0) setLocations(locRes);
      if (Array.isArray(invRes) && invRes.length > 0) setInventory(invRes);
      if (Array.isArray(shipRes) && shipRes.length > 0) setShipments(shipRes);
      if (Array.isArray(vehRes) && vehRes.length > 0) setVehicles(vehRes);
      if (Array.isArray(rtRes) && rtRes.length > 0) setRoutes(rtRes);
      if (Array.isArray(recRes) && recRes.length > 0) setRecommendations(recRes);
      if (Array.isArray(stockRes) && stockRes.length > 0) setStockouts(stockRes);
    } catch (err) {
      console.warn("Using built-in high-fidelity FORGE dataset", err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString() + ' IST');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleApproveRecommendation = async (recId) => {
    try {
      await fetch(`/api/recommendations/${recId}/approve`, { method: 'POST' });
    } catch (err) {
      console.warn("Local approval mode", err);
    }
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'APPROVED' } : r))
    );
  };

  const handleResetDemo = async () => {
    if (window.confirm("Reset entire synthetic demo environment to clean baseline state?")) {
      try {
        await fetch('/api/demo/reset', { method: 'POST' });
      } catch (e) {
        console.warn("Local reset", e);
      }
      setKpis(INITIAL_KPIS);
      setLocations(INITIAL_LOCATIONS);
      setInventory(INITIAL_INVENTORY);
      setShipments(INITIAL_SHIPMENTS);
      setVehicles(INITIAL_VEHICLES);
      setRoutes(INITIAL_ROUTES);
      setRecommendations(INITIAL_RECOMMENDATIONS);
      setStockouts(INITIAL_STOCKOUTS);
      setCurrentView('DASHBOARD');
    }
  };

  const roleNames = {
    COMMANDER: 'Col. Ranjit Sharma (Commander)',
    LOGISTICS_OFFICER: 'Capt. Priya Nair (Logistics)',
    DRIVER: 'Hav. Rajesh Kumar (Driver)',
    FORWARD_OPERATOR: 'L/Nk. Mohan Das (FP Operator)'
  };

  return (
    <div style={{
      fontSize: fontSize === 'sm' ? '14px' : (fontSize === 'lg' ? '18px' : '16px'),
      filter: highContrast ? 'contrast(125%)' : 'none'
    }}>
      {/* 1. OFFICIAL ACCESSIBILITY & UTILITY BAR (EXACT TEMPLATE STYLE) */}
      <div className="utility-bar">
        <div className="container">
          <div className="utility-left">
            <span>GOVERNMENT OF INDIA • MINISTRY OF DEFENCE • DEFENCE SERVICES STAFF COLLEGE</span>
            <span className="utility-badge">SIH-2026 ACADEMIC PROTOTYPE (SYNTHETIC)</span>
          </div>

          <div className="accessibility-links">
            <span>{currentTime}</span> | 
            <a href="#main-content">Skip to Content</a> | 
            <button onClick={() => setHighContrast(!highContrast)}>
              {highContrast ? 'Normal View' : 'High Contrast'}
            </button> | 
            <span className="font-size-btns">
              <button onClick={() => setFontSize('sm')}>A-</button>
              <button onClick={() => setFontSize('md')}>A</button>
              <button onClick={() => setFontSize('lg')}>A+</button>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & COMMAND PORTAL BRANDING */}
      <header className="main-header">
        <div className="container header-flex">
          <div className="logo-area">
            <div className="emblem-wrapper">
              <EmblemSvg />
            </div>
            <div className="title-area">
              <div className="subhead">
                <span>भारतीय सेना</span> | <span>INDIAN ARMY</span>
                <span style={{ fontSize: '0.75rem', background: '#005a9c', color: '#fff', padding: '1px 6px', borderRadius: '3px', marginLeft: '6px' }}>
                  DEFENCE SERVICES STAFF COLLEGE
                </span>
              </div>
              <h1>FORGE: FORWARD OPERATIONAL RESOURCE & LOGISTICS GRID ENGINE</h1>
              <div className="tagline">
                "PREDICT BEFORE YOU TRANSPORT" — Predictive Forward Supply Chain Decision-Support Platform
              </div>
            </div>
          </div>

          <div className="header-actions">
            {/* NOTIFICATIONS BELL */}
            <button
              className="btn-secondary"
              style={{ position: 'relative', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setShowNotifications(true)}
              title="View Live Notifications"
            >
              <span style={{ fontSize: '1.1rem' }}>🔔</span>
              <span style={{
                background: '#d9381e', color: '#fff', fontSize: '0.7rem', fontWeight: '800',
                padding: '1px 6px', borderRadius: '10px'
              }}>3</span>
            </button>

            {/* ROLE SELECTOR */}
            <div className="role-selector-box">
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>ROLE:</label>
              <select
                value={currentRole}
                onChange={(e) => {
                  const r = e.target.value;
                  setCurrentRole(r);
                  if (r === 'DRIVER') setCurrentView('DRIVER');
                  else if (r === 'FORWARD_OPERATOR') setCurrentView('INVENTORY');
                }}
              >
                <option value="COMMANDER">Commander / Admin</option>
                <option value="LOGISTICS_OFFICER">Logistics Officer</option>
                <option value="TRUCK_DRIVER">Truck Driver (Mobile)</option>
                <option value="FORWARD_OPERATOR">Forward Post Operator</option>
              </select>
            </div>

            {/* PROFILE BUTTON */}
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600' }}
              onClick={() => setCurrentView('PROFILE')}
              title="View Officer Profile"
            >
              <span>👤</span>
              <span>{roleNames[currentRole] ? roleNames[currentRole].split(' ')[0] + ' ' + roleNames[currentRole].split(' ')[1] : 'Profile'}</span>
            </button>

            {/* DEMO SCENARIO WALKTHROUGH */}
            <button className="btn-demo-scenario" onClick={() => setShowDemoModal(true)}>
              ⚡ Run Demo Scenario
            </button>

            {/* RESET DEMO */}
            <button className="btn-demo-reset" onClick={handleResetDemo}>
              🔄 Reset Demo
            </button>
          </div>
        </div>
      </header>

      {/* 3. NAVIGATION BAR (CIVIC BLUE PALETTE) */}
      <nav className="navbar">
        <div className="container">
          <ul className="nav-links">
            <li>
              <button
                className={currentView === 'DASHBOARD' ? 'active' : ''}
                onClick={() => setCurrentView('DASHBOARD')}
              >
                Command Dashboard
              </button>
            </li>
            <li>
              <button
                className={currentView === 'MAP' ? 'active' : ''}
                onClick={() => setCurrentView('MAP')}
              >
                Logistics Map (GIS)
              </button>
            </li>
            <li>
              <button
                className={currentView === 'LOCATIONS' ? 'active' : ''}
                onClick={() => setCurrentView('LOCATIONS')}
              >
                Forward Locations
              </button>
            </li>
            <li>
              <button
                className={currentView === 'INVENTORY' ? 'active' : ''}
                onClick={() => setCurrentView('INVENTORY')}
              >
                Inventory Intelligence
              </button>
            </li>
            <li>
              <button
                className={currentView === 'FORECAST' ? 'active' : ''}
                onClick={() => setCurrentView('FORECAST')}
              >
                Demand Forecast (ML)
              </button>
            </li>
            <li>
              <button
                className={currentView === 'STOCKOUT' ? 'active' : ''}
                onClick={() => setCurrentView('STOCKOUT')}
              >
                Stockout Predictor
                <span className="badge-count">{stockouts.filter(s => s.days_remaining <= 5).length}</span>
              </button>
            </li>
            <li>
              <button
                className={currentView === 'ROUTE_PLANNER' ? 'active' : ''}
                onClick={() => setCurrentView('ROUTE_PLANNER')}
              >
                Route Optimizer
              </button>
            </li>
            <li>
              <button
                className={currentView === 'SHIPMENTS' ? 'active' : ''}
                onClick={() => setCurrentView('SHIPMENTS')}
              >
                Convoys & Shipments
              </button>
            </li>
            <li>
              <button
                className={currentView === 'FLEET' ? 'active' : ''}
                onClick={() => setCurrentView('FLEET')}
              >
                Fleet Telematics
              </button>
            </li>
            <li>
              <button
                className={currentView === 'DRIVER' ? 'active' : ''}
                onClick={() => setCurrentView('DRIVER')}
                style={{ background: currentView === 'DRIVER' ? '#16a34a' : 'transparent', fontWeight: 'bold' }}
              >
                📱 Driver Cockpit (PWA)
              </button>
            </li>
            <li>
              <button
                className={currentView === 'SIMULATION' ? 'active' : ''}
                onClick={() => setCurrentView('SIMULATION')}
              >
                What-If Simulation
              </button>
            </li>
            <li>
              <button
                className={currentView === 'WEATHER' ? 'active' : ''}
                onClick={() => setCurrentView('WEATHER')}
              >
                Weather & Terrain
              </button>
            </li>
            <li>
              <button
                className={currentView === 'AI_COPILOT' ? 'active' : ''}
                onClick={() => setCurrentView('AI_COPILOT')}
              >
                AI Advisor
              </button>
            </li>
            <li>
              <button
                className={currentView === 'REPORTS' ? 'active' : ''}
                onClick={() => setCurrentView('REPORTS')}
              >
                Reports
              </button>
            </li>
            <li>
              <button
                className={currentView === 'AUDIT' ? 'active' : ''}
                onClick={() => setCurrentView('AUDIT')}
              >
                Audit Logs
              </button>
            </li>
            <li>
              <button
                className={currentView === 'SETTINGS' ? 'active' : ''}
                onClick={() => setCurrentView('SETTINGS')}
              >
                Settings
              </button>
            </li>
            <li>
              <button
                className={currentView === 'PROFILE' ? 'active' : ''}
                onClick={() => setCurrentView('PROFILE')}
              >
                Profile
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. HERO STRATEGIC SITUATION BANNER */}
      <section className="hero-banner">
        <div className="container hero-flex">
          <div className="hero-left">
            <h2>NORTHERN SECTOR PREDICTIVE SUPPLY COMMAND GRID</h2>
            <p>
              Integrated decision-support engine monitoring inventory levels, anticipating meteorological disruptions,
              optimizing all-weather convoy axes, and maintaining offline operational continuity.
            </p>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-pill" onClick={() => setCurrentView('LOCATIONS')} style={{ cursor: 'pointer' }}>
              <div className="val">{kpis.total_locations || 10}</div>
              <div className="lbl">Forward Posts</div>
            </div>
            <div className="hero-stat-pill" onClick={() => setCurrentView('INVENTORY')} style={{ cursor: 'pointer' }}>
              <div className="val" style={{ color: '#4ade80' }}>{kpis.inventory_health_pct || 76.2}%</div>
              <div className="lbl">Reserve Health</div>
            </div>
            <div className="hero-stat-pill" onClick={() => setCurrentView('LOCATIONS')} style={{ cursor: 'pointer' }}>
              <div className="val" style={{ color: '#f87171' }}>{kpis.at_risk_locations_count || 3}</div>
              <div className="lbl">Watch Nodes</div>
            </div>
            <div className="hero-stat-pill" onClick={() => setCurrentView('SHIPMENTS')} style={{ cursor: 'pointer' }}>
              <div className="val">{kpis.active_shipments_count || 3}</div>
              <div className="lbl">Active Convoys</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAIN CONTENT ROUTER */}
      <main id="main-content" className="main-content">
        {currentView === 'DASHBOARD' && (
          <CommandDashboard
            kpis={kpis}
            locations={locations}
            vehicles={vehicles}
            routes={routes}
            recommendations={recommendations}
            shipments={shipments}
            stockouts={stockouts}
            onNavigate={(view) => setCurrentView(view)}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onApproveRecommendation={handleApproveRecommendation}
            onRunDemo={() => setShowDemoModal(true)}
          />
        )}

        {currentView === 'MAP' && (
          <div className="container">
            <div className="section-title">
              <span>Full-Spectrum GIS Tactical Logistics Grid</span>
            </div>
            <LogisticsMap
              locations={locations}
              vehicles={vehicles}
              routes={routes}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              height="680px"
            />
          </div>
        )}

        {currentView === 'LOCATIONS' && (
          <LocationsView
            locations={locations}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
          />
        )}

        {currentView === 'INVENTORY' && (
          <InventoryIntelligence
            inventory={inventory}
            locations={locations}
            onRefresh={fetchData}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'FORECAST' && (
          <DemandForecasting />
        )}

        {currentView === 'STOCKOUT' && (
          <StockoutPredictor
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'ROUTE_PLANNER' && (
          <RoutePlanner
            locations={locations}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'SHIPMENTS' && (
          <ShipmentManagement
            shipments={shipments}
            locations={locations}
            vehicles={vehicles}
            onRefresh={fetchData}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'FLEET' && (
          <FleetManagement
            vehicles={vehicles}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'DRIVER' && (
          <DriverCockpit
            onSyncComplete={fetchData}
          />
        )}

        {currentView === 'SIMULATION' && (
          <WhatIfSimulation
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'WEATHER' && (
          <WeatherTerrainIntelligence
            locations={locations}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'AI_COPILOT' && (
          <AIAdvisor
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'REPORTS' && (
          <AnalyticsReports
            kpis={kpis}
            locations={locations}
            shipments={shipments}
          />
        )}

        {currentView === 'AUDIT' && (
          <AuditLogsView />
        )}

        {currentView === 'SETTINGS' && (
          <SystemSettings
            onResetDemo={handleResetDemo}
          />
        )}

        {currentView === 'PROFILE' && (
          <ProfileView
            currentRole={currentRole}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* 6. MODALS & SLIDE-IN PANELS */}
      {selectedLocation && (
        <LocationDetailsModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onNavigate={(view) => {
            setSelectedLocation(null);
            setCurrentView(view);
          }}
        />
      )}

      {showDemoModal && (
        <DemoScenarioModal
          onClose={() => setShowDemoModal(false)}
          onNavigate={(view) => setCurrentView(view)}
          onRefresh={fetchData}
        />
      )}

      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onNavigate={(view) => {
            setShowNotifications(false);
            setCurrentView(view);
          }}
        />
      )}

      {/* 7. OFFICIAL GOVERNMENT FOOTER (EXACT TEMPLATE STYLE) */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h5>FORGE Decision-Support Grid</h5>
              <p>
                Forward Operational Resource & Logistics Grid Engine is an academic SIH 2026 solution for
                Problem Statement ID 26251 (Ministry of Defence / Defence Services Staff College).
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#ff9933', fontWeight: 'bold' }}>
                "PREDICT BEFORE YOU TRANSPORT"
              </div>
            </div>

            <div className="footer-col">
              <h5>Tactical Logistics Modules</h5>
              <ul>
                <li><button onClick={() => setCurrentView('DASHBOARD')}>Command Dashboard</button></li>
                <li><button onClick={() => setCurrentView('MAP')}>GIS Logistics Grid</button></li>
                <li><button onClick={() => setCurrentView('FORECAST')}>ML Demand Forecasting</button></li>
                <li><button onClick={() => setCurrentView('STOCKOUT')}>Stockout Predictor</button></li>
                <li><button onClick={() => setCurrentView('ROUTE_PLANNER')}>Multi-Factor Route Optimizer</button></li>
                <li><button onClick={() => setCurrentView('DRIVER')}>Driver Offline Navigation (PWA)</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Resilience & Continuity</h5>
              <ul>
                <li><button onClick={() => setCurrentView('SIMULATION')}>What-If Strategic Simulator</button></li>
                <li><button onClick={() => setCurrentView('WEATHER')}>Weather Radar & Terrain</button></li>
                <li><button onClick={() => setCurrentView('AI_COPILOT')}>Grounded Logistics Copilot</button></li>
                <li><button onClick={() => setCurrentView('AUDIT')}>Audit Logs & Chain of Custody</button></li>
                <li><button onClick={() => setShowDemoModal(true)}>End-to-End Judge Walkthrough</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Safety & Compliance Notice</h5>
              <p>
                Designed in compliance with Guidelines for Indian Government Websites (GIGW).
                Uses strictly non-operational synthetic datasets. No classified or sensitive defence tactical data is modeled.
              </p>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                Security Tier: Academic Prototype Level 3
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              © 2026 Smart India Hackathon Prototype | Ministry of Defence • Defence Services Staff College.
            </div>
            <div style={{ marginTop: '4px' }}>
              Built for Problem Statement ID: 26251 — Indian Army: Predictive Logistics & Forward Supply Chain.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
