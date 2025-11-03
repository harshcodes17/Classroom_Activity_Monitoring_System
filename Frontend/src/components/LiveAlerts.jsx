import React from 'react';
import Popup from './Popup';

export default function LiveAlerts({ alerts, onDismiss }) {
  return (
    <div className="alerts-root">
      {alerts.length === 0 && <div className="muted">No active alerts</div>}
      <div className="alerts-stack">
        {alerts.map(a => (
          <Popup key={a.id} id={a.id} title={`Alert: ${a.status}`} onClose={() => onDismiss(a.id)}>
            <div><strong>{a.student_id}</strong></div>
            <div>Confidence: {a.confidence !== undefined ? Math.round(a.confidence * 100) + '%' : 'N/A'}</div>
            <div className="muted small">{new Date(a.timestamp).toLocaleString()}</div>
          </Popup>
        ))}
      </div>
    </div>
  );
}
