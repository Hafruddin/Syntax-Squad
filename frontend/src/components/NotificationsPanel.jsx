import React, { useState } from 'react';

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'CRITICAL', icon: '🚨', title: 'CRITICAL: FP-KILO Fuel at 3.4 Days', body: 'Arctic Grade Diesel at Forward Post Kilo will be exhausted in approximately 3.4 days. CONVOY-NORTH-703 dispatched. Monitor delivery.', time: '5m ago', read: false },
  { id: 2, type: 'WARNING', icon: '🌧️', title: 'Weather Alert: Pass Echo Heavy Rain', body: '42mm precipitation forecast on Route A Pass Echo corridor. All convoys rerouted to Route B. Expected transit delay: +3.5h.', time: '22m ago', read: false },
  { id: 3, type: 'WARNING', icon: '⚠️', title: 'CONVOY-NORTH-702 Delayed +3.5h', body: 'Vehicle ARMY-HT-031 reporting road obstruction at Pass Echo km 68. Slush/mud blockage. Driver requesting reroute instructions.', time: '1h ago', read: false },
  { id: 4, type: 'INFO', icon: '✅', title: 'AI Recommendation #1 Approved', body: 'Col. Ranjit Sharma approved urgent fuel resupply for FP-KILO. CONVOY-NORTH-703 authorized and dispatched via Route B.', time: '2h ago', read: true },
  { id: 5, type: 'INFO', icon: '📍', title: 'CONVOY-NORTH-703 — Checkpoint Cleared', body: 'ARMY-HT-017 cleared Valley Transit Checkpost Charlie. Remaining: 142km. ETA Forward Post Kilo: 2h40m.', time: '3h ago', read: true },
  { id: 6, type: 'SYSTEM', icon: '🤖', title: 'FORGE AI Generated 3 Recommendations', body: 'AI engine identified fuel shortage risk at FP-KILO (CRITICAL), kerosene depletion (HIGH), and Route A hazard (HIGH). Pending officer review.', time: '5h ago', read: true },
  { id: 7, type: 'INFO', icon: '📦', title: 'CONVOY-SOUTH-404 Delivered Successfully', body: 'Medical Supplies delivered to Base Bravo. 240 units received. Inventory updated. Delivery confirmation logged.', time: '1d ago', read: true },
];

export default function NotificationsPanel({ onClose, onNavigate }) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filterType, setFilterType] = useState('ALL');

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const filtered = notifications.filter(n => filterType === 'ALL' || n.type === filterType);
  const unread = notifications.filter(n => !n.read).length;

  const typeColor = { CRITICAL: '#d9381e', WARNING: '#d97706', INFO: '#005a9c', SYSTEM: '#7c3aed' };
  const typeBadge = { CRITICAL: 'badge-critical', WARNING: 'badge-medium', INFO: 'badge-online', SYSTEM: 'badge-low' };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '420px', background: '#fff',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ background: 'var(--primary-navy)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>🔔 Notifications</h3>
          <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '2px' }}>{unread} unread alerts</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
            onClick={markAllRead}
          >Mark All Read</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['ALL', 'CRITICAL', 'WARNING', 'INFO', 'SYSTEM'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600',
              cursor: 'pointer', border: '1px solid',
              background: filterType === t ? (typeColor[t] || '#002f56') : '#f8fafc',
              color: filterType === t ? '#fff' : '#475569',
              borderColor: filterType === t ? (typeColor[t] || '#002f56') : '#e2e8f0'
            }}
          >{t}</button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              background: n.read ? '#fff' : '#eff6ff',
              borderLeft: `4px solid ${n.read ? 'transparent' : (typeColor[n.type] || '#005a9c')}`,
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>{n.icon}</span>
                <span className={`badge ${typeBadge[n.type] || 'badge-low'}`} style={{ fontSize: '0.65rem' }}>{n.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{n.time}</span>
                {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#005a9c' }} />}
              </div>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{n.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>{n.body}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
        <button className="btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onNavigate('AUDIT'); onClose(); }}>
          View Full Audit Log
        </button>
        <button className="btn-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
