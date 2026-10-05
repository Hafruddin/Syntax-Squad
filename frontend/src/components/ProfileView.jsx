import React, { useState } from 'react';

const PROFILES = {
  COMMANDER: {
    name: 'Col. Ranjit Sharma',
    rank: 'Colonel',
    role: 'Commander / System Administrator',
    unit: 'Directorate of Forward Logistics Command — Northern Sector',
    badge: 'CO/NLC/2026/001',
    joined: '15 Jan 2022',
    lastLogin: new Date().toLocaleString('en-IN', { hour12: false }),
    avatar: '⭐',
    permissions: ['View All Modules', 'Approve Recommendations', 'Authorize Convoys', 'Run Simulations', 'View Audit Logs', 'System Settings', 'Reset Demo Environment'],
    stats: { decisions: 47, convoys_approved: 23, recommendations_acted: 18, simulations_run: 5 }
  },
  LOGISTICS_OFFICER: {
    name: 'Capt. Priya Nair',
    rank: 'Captain',
    role: 'Logistics Officer',
    unit: '72nd Mountain Supply Regiment — Forward Operations Cell',
    badge: 'LO/NLC/2026/014',
    joined: '10 Mar 2023',
    lastLogin: new Date().toLocaleString('en-IN', { hour12: false }),
    avatar: '🎖️',
    permissions: ['View Inventory', 'Create Shipments', 'Assign Vehicles', 'Compare Routes', 'Monitor Convoys', 'View Forecasts', 'Run Simulations', 'Manage Alerts'],
    stats: { decisions: 112, convoys_approved: 67, recommendations_acted: 34, simulations_run: 12 }
  },
  TRUCK_DRIVER: {
    name: 'Hav. Rajesh Kumar',
    rank: 'Havildar',
    role: 'Tactical Truck Driver',
    unit: 'Army Service Corps — 3rd Convoy Battalion',
    badge: 'DR/NLC/2026/031',
    joined: '05 Jul 2021',
    lastLogin: new Date().toLocaleString('en-IN', { hour12: false }),
    avatar: '🚛',
    permissions: ['View Assigned Shipment', 'Navigation (Online + Offline)', 'Report Delays', 'Report Obstructions', 'Mark Checkpoints', 'Offline Sync'],
    stats: { decisions: 0, convoys_approved: 0, recommendations_acted: 0, missions_completed: 47 }
  },
  FORWARD_OPERATOR: {
    name: 'L/Nk. Mohan Das',
    rank: 'Lance Naik',
    role: 'Forward Post Operator',
    unit: 'Forward Post Kilo — Quartermaster Cell',
    badge: 'FP/NLC/2026/072',
    joined: '20 Sep 2023',
    lastLogin: new Date().toLocaleString('en-IN', { hour12: false }),
    avatar: '📦',
    permissions: ['View Current Inventory', 'Log Consumption', 'View ETA of Convoys', 'Report Shortages', 'View Weather Alerts'],
    stats: { decisions: 0, convoys_approved: 0, recommendations_acted: 0, consumption_logs: 134 }
  }
};

export default function ProfileView({ currentRole, onNavigate }) {
  const profile = PROFILES[currentRole] || PROFILES.COMMANDER;
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="section-title">
        <span>Officer Profile & Access Control</span>
        <button className="btn-secondary btn-sm" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* PROFILE HERO */}
      <div className="service-card" style={{ marginBottom: '20px', borderTopColor: '#002f56', borderTopWidth: '5px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #002f56, #005a9c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', flexShrink: 0
          }}>
            {profile.avatar}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ color: 'var(--primary-navy)', margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: '800' }}>
              {profile.name}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '4px' }}>
              {profile.rank} · <strong>{profile.role}</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' }}>
              {profile.unit}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-online">ACTIVE SESSION</span>
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                Badge: {profile.badge}
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
            <div>Joined: <strong>{profile.joined}</strong></div>
            <div>Last Login: <strong>{profile.lastLogin}</strong></div>
            <div style={{ marginTop: '8px' }}>
              <span className="badge badge-healthy">AUTHENTICATED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {Object.entries(profile.stats).map(([k, v]) => (
          <div key={k} className="service-card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-navy)' }}>{v}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {k.replace(/_/g, ' ')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Permissions */}
        <div className="service-card">
          <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontWeight: '700' }}>
            🔐 Module Access Permissions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profile.permissions.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#334155' }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Settings */}
        <div className="service-card">
          <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px', fontWeight: '700' }}>
            ⚙️ Session & Security
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Authentication Method</span>
              <strong>Demo Token (SIH Mode)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Session Expiry</span>
              <strong>8 Hours (Tactical Session)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Data Classification</span>
              <strong style={{ color: '#d97706' }}>SYNTHETIC / ACADEMIC</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Network Mode</span>
              <strong style={{ color: '#16a34a' }}>ONLINE</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Current Role</span>
              <span className="badge badge-online">{currentRole}</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '12px', display: 'flex', gap: '8px' }}>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('SETTINGS')}>
              ⚙️ System Settings
            </button>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('AUDIT')}>
              📋 My Audit Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
