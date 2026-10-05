import React, { useState } from 'react';

export default function SystemSettings({ onResetDemo }) {
  const [weights, setWeights] = useState({
    inventory: 40,
    demand: 25,
    weather: 15,
    route: 10,
    delay: 10
  });
  const [mockWeather, setMockWeather] = useState(true);
  const [offlineCaching, setOfflineCaching] = useState(true);
  const [savedNotice, setSavedNotice] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice("✓ Risk configuration and telemetry parameters updated successfully.");
    setTimeout(() => setSavedNotice(''), 3500);
  };

  return (
    <div className="container" style={{ maxWidth: '860px' }}>
      <div className="section-title">
        <span>System Parameters & Multi-Factor Risk Calibration</span>
      </div>

      {savedNotice && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 18px', borderRadius: '4px', marginBottom: '16px', fontWeight: 'bold' }}>
          {savedNotice}
        </div>
      )}

      {/* RISK WEIGHTS CALIBRATOR */}
      <div className="service-card" style={{ marginBottom: '24px', borderTopColor: '#005a9c' }}>
        <h4 style={{ color: 'var(--primary-navy)', marginBottom: '8px', fontWeight: '700' }}>
          Configurable 5-Factor Risk Weight Engine
        </h4>
        <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px' }}>
          Adjust mathematical weighting applied by the decision-support engine across all forward logistical posts.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Inventory Coverage Weight: {weights.inventory}%
              </label>
              <input
                type="range" min="10" max="60" value={weights.inventory}
                onChange={(e) => setWeights({ ...weights, inventory: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Demand Acceleration Weight: {weights.demand}%
              </label>
              <input
                type="range" min="10" max="40" value={weights.demand}
                onChange={(e) => setWeights({ ...weights, demand: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Weather Hazard Weight: {weights.weather}%
              </label>
              <input
                type="range" min="5" max="30" value={weights.weather}
                onChange={(e) => setWeights({ ...weights, weather: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Route Terrain & Condition Weight: {weights.route}%
              </label>
              <input
                type="range" min="5" max="25" value={weights.route}
                onChange={(e) => setWeights({ ...weights, route: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Delivery Delay / Lead-Time Weight: {weights.delay}%
              </label>
              <input
                type="range" min="5" max="25" value={weights.delay}
                onChange={(e) => setWeights({ ...weights, delay: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary">Save Weight Calibration</button>
          </div>
        </form>
      </div>

      {/* TELEMETRY & API RESILIENCE TOGGLES */}
      <div className="service-card" style={{ marginBottom: '24px' }}>
        <h4 style={{ color: 'var(--primary-navy)', marginBottom: '8px', fontWeight: '700' }}>
          API Resilience & Offline Fallbacks
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={mockWeather}
              onChange={(e) => setMockWeather(e.target.checked)}
            />
            <span><strong>Mock Weather Engine:</strong> Use autonomous synthetic meteorological telemetry if external radar API is offline.</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={offlineCaching}
              onChange={(e) => setOfflineCaching(e.target.checked)}
            />
            <span><strong>Pre-Cache Mission Packages:</strong> Automatically generate offline map tiles and checkpoints for truck driver PWAs.</span>
          </label>
        </div>
      </div>

      {/* DEMO ENVIRONMENT RESET */}
      <div className="service-card border-critical">
        <h4 style={{ color: '#d9381e', marginBottom: '6px', fontWeight: '700' }}>
          Demo Environment Reset (SIH Judges)
        </h4>
        <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '14px' }}>
          Restores the entire synthetic database back to clean nominal starting state: resets forward inventory stocks, clears test dispatches, and re-primes the end-to-end shortage story.
        </p>
        <button className="btn-danger" onClick={onResetDemo}>
          🔄 Reset Synthetic Demo Environment
        </button>
      </div>
    </div>
  );
}
