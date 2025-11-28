import React from 'react';

export default function ClassSummary({ students, feed, onBack }) {
  const values = Object.values(students || {});
  const total = values.length;
  const nonAttentive = values.filter(s => s.status === 'non_attentive');
  const attentivePct = total
    ? Math.round(((total - nonAttentive.length) / total) * 100)
    : 0;

  const recentEvents = feed.slice(0, 20); // show last 20 events

  return (
    <div className="summary-root">
      <div className="section-header">
        <h2>Class Summary</h2>
        <div className="section-actions">
          <button className="btn small" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="cards">
        <div className="card kpi">
          <div className="card-title">Total Students</div>
          <div className="card-value">{total}</div>
        </div>

        <div className="card kpi">
          <div className="card-title">Non-attentive Now</div>
          <div className="card-value danger">{nonAttentive.length}</div>
        </div>

        <div className="card kpi">
          <div className="card-title">Average Attentiveness</div>
          <div
            className={
              'card-value ' +
              (attentivePct >= 80
                ? 'success'
                : attentivePct >= 60
                ? 'warning'
                : 'danger')
            }
          >
            {attentivePct}%
          </div>
        </div>
      </div>

      {/* Non-attentive list */}
      <div className="section">
        <h3>Non-attentive Students</h3>
        <div className="list">
          {nonAttentive.length === 0 ? (
            <div className="muted small">No distractions detected right now.</div>
          ) : (
            nonAttentive.map(s => (
              <div key={s.student_id} className="list-item">
                <div className="list-left">
                  <span className="badge danger">Non-attentive</span>
                  <div>
                    <div className="mono">{s.student_id}</div>
                    {s.name && (
                      <div className="small muted">{s.name}</div>
                    )}
                  </div>
                </div>
                <div className="list-right small">
                  {s.lastSeen
                    ? new Date(s.lastSeen).toLocaleTimeString()
                    : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🔥 Improved Recently Seen table */}
      <div className="section">
        <h3>Recently Seen</h3>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Seen At</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="small muted">
                    No events yet — waiting for camera feed…
                  </td>
                </tr>
              ) : (
                recentEvents.map((e, idx) => {
                  const s = students[e.student_id] || {};
                  const status = e.status || 'unknown';
                  const badgeClass =
                    status === 'attentive'
                      ? 'badge success'
                      : status === 'non_attentive'
                      ? 'badge danger'
                      : 'badge warning';

                  const confidence =
                    typeof e.confidence === 'number'
                      ? `${Math.round(e.confidence * 100)}%`
                      : '—';

                  const seenAt = e.timestamp
                    ? new Date(e.timestamp).toLocaleTimeString()
                    : '—';

                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="mono">{e.student_id}</td>
                      <td>{s.name || '—'}</td>
                      <td>
                        <span className={badgeClass}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{confidence}</td>
                      <td>{seenAt}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
