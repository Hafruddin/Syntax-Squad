import React, { useState } from 'react';

function getLocalAIResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('location') || q.includes('post') || q.includes('risk') || q.includes('kilo')) {
    return {
      answer: "Three forward locations are currently under high or critical watch:\n\n1. 🚨 Forward Post Kilo (FP-KILO): Critical risk (86/100). Arctic Diesel down to 3.4 days (320L). Weather: -4.2°C with 42mm sleet.\n2. ⚠️ Forward Post Sierra (FP-SIERRA): Risk 64/100. Fuel at 5.2 days (450L). Weather: Light snow flurries.\n3. ⚠️ Observation Post Tango (OP-TANGO): Risk 72/100. High-altitude glaciated ridge (4800m ASL). Trackway passability restricted.\n\nRecommended Action: Maintain active resupply dispatch for Forward Post Kilo via Route B.",
      suggested: ["Why is Route B recommended over Route A?", "Which supplies may run out this week?", "Show convoy status for FP-KILO"]
    };
  }
  if (q.includes('supply') || q.includes('shortage') || q.includes('run out') || q.includes('stockout') || q.includes('fuel')) {
    return {
      answer: "Imminent stockout forecast (≤ 5-day horizon):\n\n• Arctic Grade Diesel Fuel (FP-KILO): 320L remaining — 3.4 Days to zero buffer.\n• Kerosene Heating Barrels (FP-KILO): 18 Barrels remaining — 4.5 Days to exhaustion.\n• Emergency Ration Packs (Base Bravo): 240 Packs remaining — 4.8 Days of supply.\n• Arctic Grade Diesel (FP-SIERRA): 450L remaining — 5.2 Days of supply.\n\nCONVOY-NORTH-703 is currently en route carrying 1,200L Arctic Diesel to FP-KILO.",
      suggested: ["What locations are at high risk?", "Which shipment is delayed?", "Plan resupply convoy"]
    };
  }
  if (q.includes('shipment') || q.includes('convoy') || q.includes('delayed') || q.includes('truck')) {
    return {
      answer: "Current Convoy Telemetry Overview:\n\n• CONVOY-NORTH-703: EN ROUTE to Forward Post Kilo carrying 1,200L Diesel. Vehicle: ARMY-HT-017 (Driver: Hav. Rajesh Kumar). ETA: 4.8 Hours on Route B.\n• CONVOY-NORTH-702: DELAYED (+3.5h). Vehicle: ARMY-HT-031 (Nk. Arjun Rao) at Pass Echo km 68 due to mud/slush.\n• CONVOY-NORTH-701: EN ROUTE to Forward Logistics Base 02 (600 Ration Packs). ETA: 2.5 Hours.\n• CONVOY-SOUTH-404: DELIVERED to Base Bravo Tactical Supply Node.",
      suggested: ["Why is Route B recommended over Route A?", "View driver mobile HUD", "What locations are at high risk?"]
    };
  }
  if (q.includes('route') || q.includes('weather') || q.includes('pass') || q.includes('echo')) {
    return {
      answer: "Route Optimization Rationale (CSD-01 → FP-KILO):\n\n• Route B (Southern Valley All-Weather Axis): RECOMMENDED (Composite Score: 88/100). Distance: 205km, ETA: 4.8h. Paved and graded hardpack, bypassing active weather.\n• Route A (High Pass Direct Corridor): HAZARD (Score: 61/100). Distance: 180km. Active 42mm precipitation, mud-slush on hairpin switchbacks, +3.5h delay risk.\n\nLogistics recommendation: All heavy convoys are mandated to take Route B.",
      suggested: ["Which shipment is delayed?", "What locations are at high risk?", "Run What-If Simulation"]
    };
  }
  return {
    answer: `FORGE AI Analysis for query "${query}":\n\nAll Northern Sector telemetry indicates active monitoring across 10 forward locations. 5 critical supply items have replenishment actions scheduled. Route B remains the designated primary transit axis due to adverse weather at Pass Echo. CONVOY-NORTH-703 is on track for FP-KILO replenishment.`,
    suggested: ["What locations are at high risk?", "Which supplies may run out this week?", "Why is Route B recommended over Route A?"]
  };
}

export default function AIAdvisor({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'FORGE_AI',
      text: "Logistics Decision-Support Copilot online. All forward post telemetry, fuel reserves, and convoy tracking are synchronized. How can I assist logistics operations today?",
      suggested: [
        "What locations are at high risk?",
        "Which supplies may run out this week?",
        "Which shipment is delayed?",
        "Why is Route B recommended over Route A?"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg = { sender: 'USER', text: q };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'FORGE_AI',
            text: data.answer,
            suggested: data.suggested_actions || []
          }
        ]);
      } else {
        const local = getLocalAIResponse(q);
        setChatHistory((prev) => [
          ...prev,
          { sender: 'FORGE_AI', text: local.answer, suggested: local.suggested }
        ]);
      }
    } catch (err) {
      const local = getLocalAIResponse(q);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'FORGE_AI', text: local.answer, suggested: local.suggested }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '920px' }}>
      <div className="section-title">
        <span>Grounded Logistics AI Copilot (Natural-Language Assistant)</span>
      </div>

      <div className="service-card" style={{ padding: 0, overflow: 'hidden', borderTopColor: '#005a9c' }}>
        {/* Chat Thread */}
        <div style={{ height: '480px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <div style={{
                background: msg.sender === 'USER' ? 'var(--primary-navy)' : '#ffffff',
                color: msg.sender === 'USER' ? '#ffffff' : 'var(--text-primary)',
                padding: '14px 18px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-sm)',
                border: msg.sender === 'USER' ? 'none' : '1px solid #e2e8f0',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>

              {/* Action Pills */}
              {msg.suggested && msg.suggested.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {msg.suggested.map((s, sIdx) => (
                    <button
                      key={sIdx}
                      className="btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}
                      onClick={() => handleSend(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', color: '#64748b' }}>
              Querying live sector telemetry...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', padding: '14px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', gap: '10px' }}
        >
          <input
            type="text"
            placeholder="Ask about high-risk posts, supply shortages, weather impacts, or convoy delays..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            Send Query ↵
          </button>
        </form>
      </div>
    </div>
  );
}
