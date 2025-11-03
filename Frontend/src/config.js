const config = {
  API_BASE: process.env.REACT_APP_API_BASE || "http://localhost:8000", 
  WS_BASE: process.env.REACT_APP_WS_BASE || "ws://localhost:8000/ws"
};

export default config;
