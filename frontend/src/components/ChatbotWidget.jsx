import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || '';

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: '🌤️ Weather Check',    text: 'Check weather in Mumbai' },
  { label: '🌧️ Rain in Pune?',    text: 'Is it raining in Pune today? Should I travel?' },
  { label: '🚌 Search Buses',     text: 'How do I search for a bus on EasyTravel?' },
  { label: '🎫 Book Ticket',      text: 'How do I book a bus ticket?' },
  { label: '❌ Cancel Booking',   text: 'How do I cancel my booking?' },
  { label: '📍 Delhi Weather',    text: 'What is the weather in Delhi? Is it a good day to travel?' },
];

// ─── Weather Card ─────────────────────────────────────────────────────────────
function WeatherCard({ data }) {
  const cond = (data.condition || '').toLowerCase();
  const isRainy = ['rain', 'drizzle', 'thunderstorm', 'snow'].some(k => cond.includes(k));
  const isCloudy = cond.includes('cloud');
  const isClear  = cond.includes('clear') || cond.includes('sunny');
  const isFog    = cond.includes('mist') || cond.includes('fog') || cond.includes('haze');

  const icon = isRainy ? '🌧️' : isFog ? '🌫️' : isCloudy ? '⛅' : isClear ? '☀️' : '🌡️';
  const bgGrad = isRainy
    ? 'linear-gradient(135deg,#1a3a5c,#2c5f8a)'
    : isFog
    ? 'linear-gradient(135deg,#4a5568,#718096)'
    : isClear
    ? 'linear-gradient(135deg,#e67e22,#f39c12)'
    : 'linear-gradient(135deg,#2980b9,#6dd5fa)';

  return (
    <div style={{
      background: bgGrad,
      borderRadius: '14px',
      padding: '12px 14px',
      color: '#fff',
      margin: '4px 0 8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px' }}>📍 {data.city}</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1 }}>{data.temperature}</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '3px', textTransform: 'capitalize' }}>{data.condition}</div>
        </div>
        <div style={{ fontSize: '2.8rem' }}>{icon}</div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        marginTop: '10px',
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '8px 10px',
        fontSize: '0.7rem',
      }}>
        <div>💧 Humidity: <strong>{data.humidity}</strong></div>
        <div>🌬️ Wind: <strong>{data.wind}</strong></div>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="et-chat-msg et-bot">
      <div className="et-avatar">🚌</div>
      <div className="et-bubble et-bubble-bot">
        <div className="et-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot = msg.role === 'model';

  const renderText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      line = line.replace(/`(.*?)`/g, '<code>$1</code>');
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* '))
        return <li key={i} dangerouslySetInnerHTML={{ __html: line.slice(2) }} />;
      if (line.match(/^\d+\. /))
        return <li key={i} style={{ listStyleType: 'decimal', marginLeft: '1.2rem' }}
          dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '') }} />;
      if (line === '') return <br key={i} />;
      return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className={`et-chat-msg ${isBot ? 'et-bot' : 'et-user'}`}>
      {isBot && <div className="et-avatar">🚌</div>}
      <div className={`et-bubble ${isBot ? 'et-bubble-bot' : 'et-bubble-user'}`}>
        {/* Weather card if this message has weather action data */}
        {msg.weatherCard && <WeatherCard data={msg.weatherCard} />}
        <div className="et-msg-text">{renderText(msg.content)}</div>
        <div className="et-msg-time">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {!isBot && <div className="et-avatar et-avatar-user">👤</div>}
    </div>
  );
}

// ─── Main Chatbot Widget ──────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const { user } = useContext(AuthContext);
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Hi there! 👋 I'm **EasyTravel Assistant** — your AI-powered travel advisor!

I can help you:
🌤️ **Check real-time weather** for any city
🌧️ **Tell if it's safe to travel** (rain, storms, fog, heat)
🧳 **Suggest what to carry** based on the weather
🚌 **Guide you to book** bus tickets on EasyTravel
📋 **Explain booking, cancellation** & platform features

Try asking me:
• *"Is it raining in Mumbai today?"*
• *"Should I travel to Pune — what's the weather?"*
• *"How do I book a bus ticket?"*`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const [serviceOnline, setServiceOnline] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Health check on mount
  useEffect(() => {
    fetch(`${CHATBOT_URL}/health`)
      .then((r) => r.ok ? setServiceOnline(true) : setServiceOnline(false))
      .catch(() => setServiceOnline(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setUnread(0);
    }
  }, [open]);

  const getToken = () => localStorage.getItem('token') || null;

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages
      .filter((_, i) => i > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${CHATBOT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history, auth_token: getToken() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();

      // Extract weather card from actions if present
      const weatherAction = data.actions?.find(a => a.type === 'weather_card');

      const botMsg = {
        role: 'model',
        content: data.reply,
        timestamp: Date.now(),
        weatherCard: weatherAction || null,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((u) => u + 1);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'model',
        content: `⚠️ Sorry, I couldn't connect to the chatbot service.\n\n**Error:** ${err.message}\n\nPlease make sure the chatbot service is running on port 8085.`,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'model',
      content: `Chat cleared! 👋 Ask me about the weather in any city or how to book a bus ticket!`,
      timestamp: Date.now(),
    }]);
  };

  return (
    <>
      <style>{`
        /* ── Floating Button ── */
        .et-fab {
          position: fixed; bottom: 28px; right: 28px;
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 6px 24px rgba(11,60,93,0.45);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.7rem; z-index: 9999;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
        }
        .et-fab:hover { transform: scale(1.12); box-shadow: 0 10px 32px rgba(11,60,93,0.55); }
        .et-fab-badge {
          position: absolute; top: -4px; right: -4px;
          background: #E07B39; color: #fff; border-radius: 50%;
          width: 20px; height: 20px; font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff; animation: et-pulse 1.5s infinite;
        }
        @keyframes et-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }

        /* ── Chat Window ── */
        .et-window {
          position: fixed; bottom: 108px; right: 28px;
          width: 400px; height: 600px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          border-radius: 22px;
          box-shadow: 0 20px 60px rgba(11,60,93,0.28), 0 0 0 1px rgba(255,255,255,0.6);
          display: flex; flex-direction: column; overflow: hidden;
          z-index: 9998; transform-origin: bottom right;
          animation: et-open 0.3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes et-open {
          from { opacity:0; transform: scale(0.7) translateY(20px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 480px) {
          .et-window { width: calc(100vw - 20px); right: 10px; bottom: 90px; height: 72vh; border-radius: 16px; }
          .et-fab { bottom: 16px; right: 16px; width: 54px; height: 54px; font-size: 1.4rem; }
        }

        /* ── Header ── */
        .et-header {
          background: linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .et-header-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.18); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem; flex-shrink: 0;
        }
        .et-header-info { flex: 1; }
        .et-header-name { color:#fff; font-weight:700; font-size:0.97rem; line-height:1.2; }
        .et-header-sub  { color: rgba(255,255,255,0.75); font-size:0.73rem; display:flex; align-items:center; gap:4px; }
        .et-status-dot  { width:7px; height:7px; border-radius:50%; background:#27AE60; display:inline-block; animation:et-blink 2s infinite; }
        .et-status-dot.offline { background:#E74C3C; animation:none; }
        @keyframes et-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .et-header-btn {
          background: rgba(255,255,255,0.15); border: none; border-radius: 8px;
          color: #fff; cursor: pointer; padding: 5px 9px; font-size: 0.85rem;
          transition: background 0.2s; flex-shrink: 0;
        }
        .et-header-btn:hover { background: rgba(255,255,255,0.28); }

        /* ── Weather hint strip ── */
        .et-weather-strip {
          background: linear-gradient(90deg, #1a3a5c, #2c5f8a);
          color: rgba(255,255,255,0.9);
          font-size: 0.72rem;
          padding: 5px 14px;
          display: flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }

        /* ── Messages ── */
        .et-messages {
          flex: 1; overflow-y: auto; padding: 14px 12px;
          display: flex; flex-direction: column; gap: 10px;
          background: #F0F4F8; scroll-behavior: smooth;
        }
        .et-messages::-webkit-scrollbar { width: 4px; }
        .et-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius:2px; }

        /* ── Message rows ── */
        .et-chat-msg { display:flex; align-items:flex-end; gap:7px; max-width:100%; }
        .et-chat-msg.et-user { flex-direction: row-reverse; }
        .et-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #0B3C5D, #328CC1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        .et-avatar-user { background: linear-gradient(135deg, #E07B39, #f0a060); }

        /* ── Bubbles ── */
        .et-bubble {
          max-width: 85%; border-radius: 16px; padding: 10px 14px;
          font-size: 0.84rem; line-height: 1.55; word-break: break-word;
        }
        .et-bubble-bot {
          background: #fff; border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07); color: #1A1A2E;
        }
        .et-bubble-user {
          background: linear-gradient(135deg, #0B3C5D, #328CC1);
          border-bottom-right-radius: 4px; color: #fff;
        }
        .et-bubble-user .et-msg-time { color: rgba(255,255,255,0.6); }
        .et-msg-text p  { margin: 0; }
        .et-msg-text strong { font-weight: 700; }
        .et-msg-text code {
          background: rgba(0,0,0,0.08); padding: 1px 5px;
          border-radius: 4px; font-family: monospace; font-size: 0.8rem;
        }
        .et-msg-text li { margin-left: 1rem; }
        .et-msg-time { font-size: 0.65rem; color: #9CA3AF; margin-top: 4px; text-align: right; }

        /* ── Typing indicator ── */
        .et-typing { display:flex; gap:4px; align-items:center; padding:2px 0; }
        .et-typing span {
          width:7px; height:7px; background:#328CC1; border-radius:50%;
          animation: et-bounce 1.2s infinite;
        }
        .et-typing span:nth-child(2) { animation-delay: 0.2s; }
        .et-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes et-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }

        /* ── Quick actions ── */
        .et-quick-actions {
          padding: 8px 12px 4px; display:flex; gap:6px; flex-wrap:wrap;
          background: #F0F4F8; flex-shrink: 0;
          border-top: 1px solid #e5e7eb;
        }
        .et-quick-btn {
          background: #fff; border: 1.5px solid #CBD5E1; border-radius: 20px;
          padding: 5px 11px; font-size: 0.74rem; font-weight: 600;
          cursor: pointer; color: #0B3C5D; transition: all 0.18s; white-space: nowrap;
        }
        .et-quick-btn:hover { background: #0B3C5D; color: #fff; border-color: #0B3C5D; transform: translateY(-1px); }
        .et-quick-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* ── Input area ── */
        .et-input-area {
          padding: 10px 12px; background: #fff;
          border-top: 1px solid #E5E7EB;
          display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;
        }
        .et-textarea {
          flex: 1; border: 1.5px solid #E5E7EB; border-radius: 12px;
          padding: 9px 13px; font-size: 0.85rem; resize: none; outline: none;
          line-height: 1.4; max-height: 100px; overflow-y: auto;
          font-family: inherit; transition: border-color 0.2s;
        }
        .et-textarea:focus { border-color: #328CC1; }
        .et-send-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #0B3C5D, #328CC1);
          border: none; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; flex-shrink: 0; transition: all 0.2s;
        }
        .et-send-btn:hover:not(:disabled) { transform:scale(1.08); box-shadow:0 4px 12px rgba(50,140,193,0.4); }
        .et-send-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }

        /* ── Banners ── */
        .et-offline-banner { background:#FEE2E2; color:#991B1B; font-size:0.75rem; padding:6px 12px; text-align:center; flex-shrink:0; }
        .et-auth-hint { background:#FFF7ED; color:#92400E; font-size:0.75rem; padding:5px 12px; text-align:center; flex-shrink:0; border-top:1px solid #FDE68A; }
        .et-auth-link { color:#0B3C5D; font-weight:700; cursor:pointer; text-decoration:underline; }
      `}</style>

      {/* ── Floating Action Button ── */}
      <button
        className="et-fab"
        onClick={() => setOpen((o) => !o)}
        title="EasyTravel Assistant"
        aria-label="Open chatbot"
        id="et-chatbot-fab"
      >
        {open ? '✕' : '🌤️'}
        {!open && unread > 0 && (
          <span className="et-fab-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div className="et-window" role="dialog" aria-label="EasyTravel Chatbot">

          {/* Header */}
          <div className="et-header">
            <div className="et-header-icon">🚌</div>
            <div className="et-header-info">
              <div className="et-header-name">EasyTravel Assistant</div>
              <div className="et-header-sub">
                <span className={`et-status-dot${serviceOnline === false ? ' offline' : ''}`} />
                {serviceOnline === null ? 'Connecting...'
                  : serviceOnline ? 'Online • Weather + AI'
                  : 'Service Offline'}
              </div>
            </div>
            <button className="et-header-btn" onClick={clearChat} title="Clear chat">🗑️</button>
            <button className="et-header-btn" onClick={() => setOpen(false)} title="Close">✕</button>
          </div>

          {/* Weather tip strip */}
          {serviceOnline && (
            <div className="et-weather-strip">
              🌤️ Ask me <em>"Is it raining in Mumbai?"</em> before you travel!
            </div>
          )}

          {/* Offline warning */}
          {serviceOnline === false && (
            <div className="et-offline-banner">
              ⚠️ Chatbot service is offline. Start it with <strong>start_chatbot.bat</strong>
            </div>
          )}

          {/* Auth hint */}
          {!user && (
            <div className="et-auth-hint">
              🔒 <span
                className="et-auth-link"
                onClick={() => window.location.href = '/login'}
              >Log in</span> to book tickets or manage bookings.
            </div>
          )}

          {/* Messages */}
          <div className="et-messages" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="et-quick-actions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                className="et-quick-btn"
                onClick={() => sendMessage(action.text)}
                disabled={loading}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="et-input-area">
            <textarea
              ref={inputRef}
              className="et-textarea"
              rows={1}
              placeholder="Ask about weather, buses, bookings..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              id="et-chatbot-input"
            />
            <button
              className="et-send-btn"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              title="Send message"
              id="et-chatbot-send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
