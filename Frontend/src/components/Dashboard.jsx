import React, { useEffect, useState, useRef } from 'react';
import createWebSocket from '../ws/WebSocketClient';
import LiveAlerts from './LiveAlerts';
import StudentList from './StudentList';
import History from './History';
import Navbar from './Navbar';

export default function Dashboard({ token, onLogout, user }) {
  const [students, setStudents] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [feed, setFeed] = useState([]);
  const wsRef = useRef(null);

  // 🧠 Dummy Data Configuration
  const dummyStudents = ["S101", "S102", "S103", "S104", "S105"];
  const statuses = ["Attentive", "Using Phone", "Sleeping", "Distracted"];

  // Fetch roster (if API works)
  useEffect(() => {
    fetch('/api/students')
      .then(r => {
        if (!r.ok) throw new Error('No roster');
        return r.json();
      })
      .then(list => {
        const map = {};
        list.forEach(s => {
          map[s.student_id] = {
            ...s,
            status: 'unknown',
            confidence: 0,
            lastSeen: null,
          };
        });
        setStudents(map);
      })
      .catch(() => {
        console.info('No roster fetched; will build from events');
      });
  }, []);

  // ✅ Main Effect: Always start dummy feed + try WebSocket if available
  useEffect(() => {
    console.log("🔄 Starting dashboard…");

    // Always start dummy feed first
    const dummyTimer = startDummyFeed();

    // Try WebSocket connection
    let ws;
    try {
      ws = createWebSocket({
        token,
        onOpen: () => {
          console.log("✅ WS Connected — stopping dummy feed");
          clearInterval(dummyTimer);
        },
        onMessage: (data) => {
          clearInterval(dummyTimer); // stop dummy once real data comes
          handleEvent(data);
        },
        onClose: () => console.log("🔴 WS Closed"),
        onError: (e) => console.log("⚠️ WS Error", e),
      });
      wsRef.current = ws;
    } catch (err) {
      console.warn("Backend WS failed — staying in dummy mode");
    }

    return () => {
      if (ws) ws.close();
      clearInterval(dummyTimer);
    };
  }, [token]);

  // 🟢 Dummy feed generator
  function startDummyFeed() {
    console.log("⚙️ Dummy mode active...");
    return setInterval(() => {
      const randomStudent =
        dummyStudents[Math.floor(Math.random() * dummyStudents.length)];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      const confidence = (Math.random() * 0.2 + 0.8).toFixed(2);
      const timestamp = new Date().toISOString();

      handleEvent({
        student_id: randomStudent,
        status: randomStatus,
        confidence: parseFloat(confidence),
        timestamp,
      });
    }, 3000); // every 3 seconds
  }

  // 🟢 Handle event (either from WS or dummy)
  function handleEvent(evt) {
    const id = evt.student_id || ('s_' + Math.random().toString(36).slice(2, 9));
    const timestamp = evt.timestamp || new Date().toISOString();

    setFeed(prev => [{ ...evt, student_id: id, timestamp }, ...prev].slice(0, 200));

    setStudents(prev => {
      const next = { ...prev };
      const existing = next[id] || { student_id: id, name: evt.name || id };
      existing.status = evt.status || 'unknown';
      existing.confidence = evt.confidence || 0;
      existing.lastSeen = timestamp;
      next[id] = existing;
      return next;
    });

    if (evt.status && /(distract|sleep|phone)/i.test(evt.status)) {
      const alert = {
        id: Math.random().toString(36).slice(2, 9),
        student_id: id,
        status: evt.status,
        confidence: evt.confidence,
        timestamp,
      };
      setAlerts(prev => [alert, ...prev].slice(0, 20));
    }
  }

  function dismissAlert(alertId) {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }

  return (
    <div className="app-root">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container">
        {/* LEFT PANEL */}
        <aside className="left-panel">
          <h3>Students</h3>
          <StudentList students={Object.values(students)} />
        </aside>

        {/* MAIN PANEL */}
        <main className="main-panel">
          <div className="section">
            <h2>Live Activity Feed</h2>
            <div className="feed">
              {feed.length === 0 && (
                <div className="muted">
                  Waiting for events from AI inference server...
                </div>
              )}
              {feed.map((e, idx) => (
                <div key={idx} className="feed-item">
                  <div className="feed-time">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="feed-text">
                    <strong>{e.student_id}</strong> — {e.status}{" "}
                    {e.confidence ? `(${Math.round(e.confidence * 100)}%)` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="right-panel">
          <div className="section">
            <h3>Alerts</h3>
            <LiveAlerts alerts={alerts} onDismiss={dismissAlert} />
          </div>
          <div className="section">
            <h3>Session History</h3>
            <History feed={feed} />
          </div>
        </aside>
      </div>
    </div>
  );
}
