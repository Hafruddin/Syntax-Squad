import React, { useState } from 'react';

export default function DemoScenarioModal({ onClose, onNavigate, onRefresh }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const steps = [
    {
      title: "1. Predictive Shortage Triggered",
      desc: "Simulate an unpredicted winter heating demand surge at Forward Post Kilo. Diesel fuel drops to 280 Litres (Coverage: ~2.9 days).",
      actionLabel: "Simulate Fuel Surge & Stockout",
      action: async () => {
        setLoading(true);
        const res = await fetch('/api/demo/run-scenario', { method: 'POST' });
        const data = await res.json();
        setLoading(false);
        setStatusText(`Alert posted: Forward Post Kilo risk elevated to ${data.risk_score}/100 (CRITICAL).`);
        onRefresh();
      }
    },
    {
      title: "2. Environmental Storm Threat",
      desc: "Weather radar predicts 42mm precipitation across Mountain Pass Echo (Route A). Road condition deteriorates to slush/mud, skyrocketing Route A risk to 85%.",
      actionLabel: "Inspect Weather Hazard & Reroute",
      action: async () => {
        setStatusText("Weather hazard flagged on Route A. AI advises mandatory detour to All-Weather Axis Route B.");
        onNavigate('ROUTE_PLANNER');
        onRefresh();
      }
    },
    {
      title: "3. Proactive AI Replenishment Recommendation",
      desc: "Rather than waiting for stockout, FORGE generates Recommendation REC-01: 'Authorize dispatch of 1,200L Arctic Diesel to FP Kilo via Route B'.",
      actionLabel: "Review & Approve Recommendation",
      action: async () => {
        setLoading(true);
        await fetch('/api/recommendations/1/approve', { method: 'POST' });
        setLoading(false);
        setStatusText("Convoy CONVOY-NORTH-703 authorized and dispatched under AI Recommendation.");
        onRefresh();
      }
    },
    {
      title: "4. Driver Offline Cockpit Navigation",
      desc: "Driver downloads Mission Route Package with offline map geometry and enters the zero-connectivity defile.",
      actionLabel: "Open Driver Offline Cockpit",
      action: () => {
        setStatusText("Switching to Driver PWA Cockpit. Test signal blackout simulation and offline event logging.");
        onNavigate('DRIVER');
      }
    },
    {
      title: "5. Delivery & Risk Fall Verification",
      desc: "Convoy arrives at Forward Post Kilo. Stock replenished to 1,480 Litres. Location risk score plummets from 92% (CRITICAL) to 22% (HEALTHY).",
      actionLabel: "Confirm Mission Completed & Risk Fall",
      action: async () => {
        setLoading(true);
        await fetch('/api/shipments/3/deliver', { method: 'POST' });
        setLoading(false);
        setStatusText("Delivery completed! Forward Post Kilo returned to HEALTHY state.");
        onRefresh();
        onNavigate('DASHBOARD');
      }
    }
  ];

  const handleStepAction = async () => {
    await steps[currentStep].action();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>SIH-2026 Interactive End-to-End Demo Scenario</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              "PREDICT BEFORE YOU TRANSPORT" — 5-Step Evaluator Story
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* STEP PROGRESS INDICATOR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            {steps.map((s, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '6px 4px',
                  borderBottom: `3px solid ${currentStep >= idx ? '#d9381e' : '#cbd5e1'}`,
                  fontWeight: currentStep === idx ? 'bold' : 'normal',
                  fontSize: '0.78rem',
                  color: currentStep >= idx ? '#002f56' : '#94a3b8'
                }}
              >
                Step {idx + 1}
              </div>
            ))}
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '6px', borderLeft: '5px solid #d9381e', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#002f56', marginBottom: '6px' }}>
              {steps[currentStep].title}
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
              {steps[currentStep].desc}
            </p>
          </div>

          {statusText && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>
              ✓ {statusText}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={onClose}>Close Walkthrough</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button className="btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                &lt; Previous Step
              </button>
            )}
            <button className="btn-danger" onClick={handleStepAction} disabled={loading}>
              {loading ? 'Executing...' : `${steps[currentStep].actionLabel} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
