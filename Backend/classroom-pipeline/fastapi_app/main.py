# main.py for FastAPI app
import asyncio, json, os
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from aiokafka import AIOKafkaConsumer
import asyncpg
from fastapi.middleware.cors import CORSMiddleware

PG_DSN = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"
KAFKA_BROKERS = os.getenv('KAFKA_BROKERS', 'kafka:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'student-activity')

app = FastAPI(title="CAMS Pipeline API", docs_url="/")

# Enable permissive CORS for local dev; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No REST CSV exposure; only WebSocket streaming from Kafka

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: str):
        to_remove = []
        for connection in self.active:
            try:
                await connection.send_text(message)
            except Exception:
                to_remove.append(connection)
        for c in to_remove:
            self.disconnect(c)

manager = ConnectionManager()

@app.on_event("startup")
async def startup():
    app.state.db = await asyncpg.create_pool(PG_DSN, min_size=1, max_size=5)
    app.state.kafka_task = asyncio.create_task(kafka_consumer_task())

@app.on_event("shutdown")
async def shutdown():
    app.state.kafka_task.cancel()
    await app.state.db.close()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/recent")
async def recent():
    async with app.state.db.acquire() as conn:
        rows = await conn.fetch("SELECT student_id, status, confidence, ts FROM activity ORDER BY ts DESC LIMIT 20")
    return [dict(r) for r in rows]

@app.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keepalive / ignore
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Back-compat alias so frontend can connect to /ws as configured
@app.websocket("/ws")
async def ws_alias(websocket: WebSocket):
    await ws_alerts(websocket)

async def kafka_consumer_task():
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKERS,
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        enable_auto_commit=True,
        group_id="fastapi-consumer-v2",
        auto_offset_reset="latest"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            data = msg.value
            # Broadcast to websockets first so UI is live even if DB write fails
            await manager.broadcast(json.dumps({"type":"ALERT", **data}))
            # Persist to DB (best-effort)
            try:
                async with app.state.db.acquire() as conn:
                    await conn.execute(
                        "INSERT INTO activity (student_id, status, confidence, ts) VALUES ($1,$2,$3, to_timestamp($4))",
                        data.get('student_id'),
                        data.get('status'),
                        data.get('confidence'),
                        data.get('timestamp')
                    )
            except Exception as e:
                # Log and continue; do not block streaming
                print(f"[DB insert error] {e}", flush=True)
    finally:
        await consumer.stop()
