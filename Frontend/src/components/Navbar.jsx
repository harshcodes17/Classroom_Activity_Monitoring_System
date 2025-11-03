import React from 'react';

export default function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <div className="brand-left">
        <div className="logo">CAMS</div>
        <div className="title">Classroom Activity Monitoring</div>
      </div>
      <div className="nav-right">
        <div className="user">Signed in as <strong>{user?.username || 'Faculty'}</strong></div>
        <button className="btn ghost" onClick={onLogout}>Sign out</button>
      </div>
    </div>
  );
}
