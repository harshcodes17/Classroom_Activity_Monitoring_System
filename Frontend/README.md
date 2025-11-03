# CAMS Frontend (React + CSS)

This is a complete React frontend for the Classroom Activity Monitoring System (CAMS).
It follows the provided project synopsis: uses a WebSocket connection to receive real-time events
of the form `{ student_id, status, confidence, timestamp }`.

## Features
- Login page (simple token-based login against `/api/login`)
- Live dashboard that receives real-time events from WebSocket (`ws://localhost:8000/ws?token=...`)
- Live pop-up alerts / toasts for distracted students
- Student list with status badges and last-seen
- Live activity feed and session history (falls back to in-memory aggregation if backend endpoints are not available)
- Plain CSS — no Tailwind or other UI frameworks

## How to run
1. Ensure you have Node.js and npm installed.
2. `npm install`
3. `npm start`
4. By default the app expects the backend WebSocket at `ws://localhost:8000/ws`.
   - The login POST endpoint expected: `POST /api/login` with JSON `{ "username": "...", "password": "..." }`.
   - The login response is expected to return JSON `{ "access_token": "..." }`.
5. If you don't have a backend yet, the UI will still work and populate students dynamically from incoming events
   (or you can simulate events from browser console).

## Integration notes
- WebSocket URL: `ws://<HOST>:<PORT>/ws?token=<access_token>`
- Student roster fetch (optional): `GET /api/students` (returns array of `{ student_id, name }`)
- Sessions/history fetch (optional): `GET /api/sessions`

## Folder structure
- public/index.html
- src/
  - index.js
  - App.jsx
  - api/auth.js
  - ws/WebSocketClient.js
  - components/
    - LoginPage.jsx
    - Dashboard.jsx
    - LiveAlerts.jsx
    - StudentList.jsx
    - History.jsx
    - Navbar.jsx
    - StudentCard.jsx
    - Popup.jsx
  - styles.css

