import React, { useEffect } from 'react';

export default function Popup({ id, title, children, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup">
      <div className="popup-header">
        <div className="popup-title">{title}</div>
        <button className="btn small ghost" onClick={() => onClose && onClose(id)}>✕</button>
      </div>
      <div className="popup-body">
        {children}
      </div>
    </div>
  );
}
