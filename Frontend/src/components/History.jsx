import React from 'react';

export default function History({ feed = [] }) {
  if (!feed || feed.length === 0) {
    return <div className="muted">No history available yet.</div>;
  }

  // Simple aggregation: group by minute and count distracted events
  const rows = feed.slice(0, 30).map((e, idx) => ({
    time: new Date(e.timestamp).toLocaleString(),
    student: e.student_id,
    status: e.status,
    confidence: e.confidence
  }));

  return (
    <div className="history-root">
      <table className="history-table">
        <thead>
          <tr><th>Time</th><th>Student</th><th>Status</th><th>Conf.</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="mono small">{r.time}</td>
              <td>{r.student}</td>
              <td>{r.status}</td>
              <td>{r.confidence !== undefined ? Math.round(r.confidence*100) + '%' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
