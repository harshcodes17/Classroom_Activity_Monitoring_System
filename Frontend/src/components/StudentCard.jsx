import React from 'react';

function statusColor(status) {
  if (!status) return '#999';
  const s = status.toLowerCase();
  if (s.includes('attent')) return '#16a34a'; // green
  if (s.includes('distract') || s.includes('phone')) return '#dc2626'; // red
  if (s.includes('sleep')) return '#7c3aed'; // purple
  return '#f59e0b'; // amber unknown/neutral
}

export default function StudentCard({ student }) {
  const lastSeen = student?.lastSeen ? new Date(student.lastSeen).toLocaleTimeString() : '—';
  const color = statusColor(student?.status);
  return (
    <div className="student-card">
      <div className="student-left">
        <div className="avatar" aria-hidden style={{ backgroundColor: color }}>{(student.name || student.student_id || '').slice(0,2).toUpperCase()}</div>
        <div className="student-info">
          <div className="student-name">{student.name || student.student_id}</div>
          <div className="student-id muted">{student.student_id}</div>
        </div>
      </div>
      <div className="student-right">
        <div className="status" style={{ borderColor: color, color }}>{student.status || 'unknown'}</div>
        <div className="small muted">Seen {lastSeen}</div>
      </div>
    </div>
  );
}
