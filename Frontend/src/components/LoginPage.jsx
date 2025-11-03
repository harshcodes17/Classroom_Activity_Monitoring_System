import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await onLogin({ username, password });
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <h1 className="brand">CAMS Lecturer</h1>
        <p className="muted">Sign in to access the live classroom dashboard</p>
        <form onSubmit={submit} className="login-form">
          <label>
            <div className="label">Username</div>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="faculty@example.edu" required />
          </label>
          <label>
            <div className="label">Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </label>
          <button className="btn primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="note">Please sign in to use the service</div>
      </div>
    </div>
  );
}
