import config from "../config";

export async function login(username, password) {
  const res = await fetch(`${config.API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    throw new Error("Login failed: " + (await res.text()));
  }
  return res.json(); // expected { access_token: "..." }
}
