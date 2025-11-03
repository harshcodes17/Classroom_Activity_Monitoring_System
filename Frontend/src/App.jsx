import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { login as apiLogin } from './api/auth';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('cams_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cams_user') || 'null'));

  useEffect(() => {
    if (token) localStorage.setItem('cams_token', token);
    else localStorage.removeItem('cams_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('cams_user', JSON.stringify(user));
    else localStorage.removeItem('cams_user');
  }, [user]);

async function handleLogin(credentials) {
  try {
    const res = await apiLogin(credentials.username, credentials.password);
    if (res && res.access_token) {
      setToken(res.access_token);
      setUser({ username: credentials.username });
      return { success: true };
    }
  } catch (err) {
    console.warn("Backend not reachable, using dummy login for testing.");
    // ✅ Dummy login mode
    setToken("dummy_token");
    setUser({ username: credentials.username || "testuser" });
    return { success: true };
  }
  return { success: false, message: "Invalid response from server" };
}

  function handleLogout() {
    setToken(null);
    setUser(null);
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} user={user} />;
}
