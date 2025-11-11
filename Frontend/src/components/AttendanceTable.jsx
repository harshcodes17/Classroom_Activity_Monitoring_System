import React from 'react';

export default function AttendanceTable({ data, loading, error, onRefresh }) {
  return (
    <div className="attendance-block">
      <div className="attendance-header">
        <h3>Attendance Predictions</h3>
        <button onClick={onRefresh} disabled={loading} className="btn-small">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {error && <div className="error">{String(error)}</div>}
      {!loading && data.items && data.items.length === 0 && <div className="muted">No rows.</div>}
      <div className="scroll-x">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Status</th>
              <th>Attentive %</th>
              <th>Non-Attentive %</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((r, i) => (
              <tr key={i}>
                <td className="mono small" title={r.image}>{r.image?.slice(0,40)}</td>
                <td>{r.status}</td>
                <td>{Math.round(r.attentive_prob * 100)}</td>
                <td>{Math.round(r.non_attentive_prob * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.total != null && (
        <div className="small muted">Showing {data.items?.length || 0} of {data.total}</div>
      )}
    </div>
  );
}
