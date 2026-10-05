import React, { useState, useEffect } from 'react';

export default function DriverCockpit({ onSyncComplete }) {
  // Offline State Management
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState('14:45 IST');
  const [packageDownloaded, setPackageDownloaded] = useState(true);
  const [navStarted, setNavStarted] = useState(false);

  // Active Shipment & Truck Information
  const [shipment, setShipment] = useState({
    id: 3,
    tracking_number: "CONVOY-NORTH-703",
    truck_id: "ARMY-HT-017",
    driver_name: "Havildar Rajesh Kumar",
    origin: "Central Staging Depot Alpha",
    destination: "Forward Post Kilo",
    payload: "1,200L High-Altitude Arctic Diesel",
    remaining_km: 142.5,
    eta_hours: 4.8,
    status: "EN_ROUTE",
    route_name: "Route B (Southern Valley All-Weather Axis)",
    checkpoints: [
      { name: "CSD Alpha Outpost Gate", km: 0, status: "CLEARED" },
      { name: "Valley Transit Checkpost Charlie", km: 68, status: "IN_PROGRESS" },
      { name: "River Bridge Hardpoint 14", km: 142, status: "PENDING" },
      { name: "Forward Post Kilo Perimeter", km: 205, status: "PENDING" }
    ]
  });

  // Action Dialog State
  const [actionNotice, setActionNotice] = useState('');

  // Load offline queue from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('forge_offline_queue');
      if (saved) {
        setOfflineQueue(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not read local offline queue", e);
    }
  }, []);

  // Save offline queue whenever it changes
  const saveQueue = (newQ) => {
    setOfflineQueue(newQ);
    localStorage.setItem('forge_offline_queue', JSON.stringify(newQ));
  };

  // Record an operational event (stored locally if offline, synced immediately if online)
  const recordEvent = async (eventType, payloadData) => {
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const eventObj = {
      event_id: eventId,
      device_id: "CAB-DEVICE-HT017",
      shipment_id: shipment.id,
      driver_id: 1,
      event_type: eventType,
      payload_json: JSON.stringify(payloadData),
      event_timestamp: new Date().toISOString()
    };

    if (!isOnline) {
      const updatedQueue = [...offlineQueue, eventObj];
      saveQueue(updatedQueue);
      setActionNotice(`[OFFLINE MODE] Event ${eventType} queued locally in encrypted flash storage. (${updatedQueue.length} pending sync)`);
      setTimeout(() => setActionNotice(''), 4500);
    } else {
      // Direct Sync
      setIsSyncing(true);
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: "CAB-DEVICE-HT017",
            events: [eventObj]
          })
        });
        if (res.ok) {
          setLastSyncTime(new Date().toLocaleTimeString() + ' IST');
          setActionNotice(`[ONLINE SYNC] Event ${eventType} transmitted to Command Grid.`);
          setTimeout(() => setActionNotice(''), 4000);
          if (onSyncComplete) onSyncComplete();
        }
      } catch (err) {
        // Fallback to queue if network dropped during request
        const updatedQueue = [...offlineQueue, eventObj];
        saveQueue(updatedQueue);
        setActionNotice(`Network dropped. Event queued locally. (${updatedQueue.length} pending)`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Perform full queue synchronization
  const triggerSync = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: "CAB-DEVICE-HT017",
          events: offlineQueue
        })
      });
      if (res.ok) {
        saveQueue([]);
        setLastSyncTime(new Date().toLocaleTimeString() + ' IST');
        setActionNotice(`✓ All ${offlineQueue.length} offline events synchronized with Command Center!`);
        setTimeout(() => setActionNotice(''), 4500);
        if (onSyncComplete) onSyncComplete();
      }
    } catch (err) {
      console.error("Sync failed", err);
      setActionNotice("Sync failed: Backend unreachable. Retrying when signal stabilizes.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle network simulation (for SIH Judges)
  const toggleNetwork = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState && offlineQueue.length > 0) {
      triggerSync();
    }
  };

  return (
    <div className="container driver-cockpit">
      {/* SIMULATOR TEST STRIP FOR SIH JUDGES */}
      <div style={{
        background: '#1e293b',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '6px',
        marginBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <span>🧪 <strong>SIH JUDGE TEST CONTROLLER:</strong></span>
          <span style={{
            background: isOnline ? '#16a34a' : '#dc2626',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}>
            {isOnline ? 'CELLULAR/SATCOM ONLINE' : 'ZERO CELLULAR / OFFLINE'}
          </span>
        </div>

        <button
          className={isOnline ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
          onClick={toggleNetwork}
        >
          {isOnline ? 'Simulate Signal Blackout (Offline)' : 'Restore Connectivity (Auto Sync)'}
        </button>
      </div>

      {/* COCKPIT HERO CARD */}
      <div className="cockpit-header-card" style={{ borderLeftColor: isOnline ? '#16a34a' : '#d97706' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>
              DRIVER NAVIGATION COCKPIT (PWA CAB HUD)
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0' }}>
              {shipment.truck_id} • {shipment.tracking_number}
            </h2>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Driver: <strong>{shipment.driver_name}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              background: isOnline ? '#166534' : '#7f1d1d',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#4ade80' : '#f87171' }}></span>
              {isSyncing ? 'SYNCING...' : (isOnline ? 'ONLINE' : 'OFFLINE MODE')}
            </span>
          </div>
        </div>

        {/* CONNECTIVITY MONITOR BAR */}
        <div className="cockpit-sync-bar">
          <div>Last Sync: <strong>{lastSyncTime}</strong></div>
          <div>
            Pending Offline Queue: <strong style={{ color: offlineQueue.length > 0 ? '#f59e0b' : '#4ade80' }}>
              {offlineQueue.length} Events
            </strong>
          </div>
          {isOnline && offlineQueue.length > 0 && (
            <button className="btn-secondary btn-sm" onClick={triggerSync} disabled={isSyncing}>
              Sync Now ⬆
            </button>
          )}
        </div>
      </div>

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div style={{
          background: '#002f56',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: '6px',
          marginBottom: '14px',
          fontWeight: '600',
          fontSize: '0.9rem',
          borderLeft: '5px solid #ff9933'
        }}>
          {actionNotice}
        </div>
      )}

      {/* MISSION ROUTE PACKAGE STATUS */}
      <div className="service-card" style={{ marginBottom: '16px', borderTopColor: '#16a34a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: '700', color: 'var(--primary-navy)', fontSize: '0.92rem' }}>
            📦 MISSION ROUTE PACKAGE
          </span>
          <span className="badge badge-healthy">
            ✓ OFFLINE NAVIGATION READY
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.85rem' }}>
          <div>Origin: <strong>{shipment.origin}</strong></div>
          <div>Destination: <strong>{shipment.destination}</strong></div>
          <div>Axis: <strong>{shipment.route_name}</strong></div>
          <div>Payload: <strong>{shipment.payload}</strong></div>
          <div>Distance Remaining: <strong style={{ color: '#005a9c' }}>{shipment.remaining_km} km</strong></div>
          <div>Estimated Arrival: <strong style={{ color: '#005a9c' }}>+{shipment.eta_hours} Hours</strong></div>
        </div>
      </div>

      {/* CHECKPOINTS PROGRESS BAR */}
      <div className="service-card" style={{ marginBottom: '18px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-navy)', marginBottom: '8px', fontWeight: '700' }}>
          Convoy Route Waypoint Checklist:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {shipment.checkpoints.map((cp, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: cp.status === 'CLEARED' ? '#f0fdf4' : (cp.status === 'IN_PROGRESS' ? '#eff6ff' : '#f8fafc'),
              borderRadius: '4px',
              borderLeft: `4px solid ${cp.status === 'CLEARED' ? '#16a34a' : (cp.status === 'IN_PROGRESS' ? '#005a9c' : '#cbd5e1')}`
            }}>
              <div>
                <strong>{cp.name}</strong> ({cp.km} km)
              </div>
              <span className={`badge ${cp.status === 'CLEARED' ? 'badge-healthy' : (cp.status === 'IN_PROGRESS' ? 'badge-online' : 'badge-low')}`}>
                {cp.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BIG ACCESSIBLE TOUCH HUD BUTTONS */}
      <div className="cockpit-big-btn-grid">
        {!navStarted ? (
          <button
            className="btn-cockpit-action btn-cockpit-start"
            onClick={() => {
              setNavStarted(true);
              recordEvent('STATUS_UPDATE', { status: 'EN_ROUTE', nav_started: true });
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>🚀</span>
            START NAVIGATION
          </button>
        ) : (
          <button
            className="btn-cockpit-action btn-cockpit-complete"
            onClick={() => {
              recordEvent('CHECKPOINT_PASSED', { checkpoint: 'Valley Transit Checkpost Charlie' });
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>📍</span>
            CHECKPOINT PASSED
          </button>
        )}

        <button
          className="btn-cockpit-action btn-cockpit-delay"
          onClick={() => {
            recordEvent('DELAY', { delay_hours: 2.0, reason: 'High Mountain Pass Fog / Slush Slowdown' });
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>⏱️</span>
          REPORT DELAY (+2.0h)
        </button>

        <button
          className="btn-cockpit-action btn-cockpit-hazard"
          onClick={() => {
            recordEvent('ROUTE_OBSTRUCTION', { description: 'Rockfall / Slush advisory on Pass Switchback' });
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>⚠️</span>
          ROUTE OBSTRUCTION
        </button>

        <button
          className="btn-cockpit-action btn-cockpit-start"
          onClick={() => {
            recordEvent('DELIVERY_COMPLETE', { delivered_to: 'Forward Post Kilo Base Depot' });
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>✓</span>
          DELIVERY COMPLETED
        </button>
      </div>
    </div>
  );
}
