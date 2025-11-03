import config from "../config";

export default function createWebSocket({ token, onOpen, onMessage, onClose, onError }) {
  let ws = null;
  let shouldReconnect = true;
  let reconnectAttempts = 0;
  const maxReconnect = 10;

  function connect() {
    const url = `${config.WS_BASE}?token=${encodeURIComponent(token || "")}`;
    ws = new WebSocket(url);

    ws.onopen = (ev) => {
      reconnectAttempts = 0;
      if (onOpen) onOpen(ev);
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.warn("Invalid WS message", ev.data);
      }
    };

    ws.onclose = (ev) => {
      if (onClose) onClose(ev);
      if (shouldReconnect && reconnectAttempts < maxReconnect) {
        reconnectAttempts++;
        const timeout = Math.min(5000, 500 * reconnectAttempts);
        setTimeout(connect, timeout);
      }
    };

    ws.onerror = (ev) => {
      if (onError) onError(ev);
    };
  }

  connect();

  return {
    send: (obj) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
      }
    },
    close: () => {
      shouldReconnect = false;
      if (ws) ws.close();
    }
  };
}
