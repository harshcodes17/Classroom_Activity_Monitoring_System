# CAMS Starter Codebase (Kafka + FastAPI + Postgres)

A minimal, Dockerized starter to give GitHub Copilot **project context** for the Classroom Activity Monitoring System (CAMS):
- **Kafka** for streaming events from the AI model
- **FastAPI** for REST + WebSocket and a background Kafka consumer
- **PostgreSQL** for storage
- **Mock Producer** to simulate the model output

## Quick Start

1) Install Docker & Docker Compose.
2) From this folder run:
   ```bash
   docker compose up -d --build
   ```
3) Visit API docs: http://localhost:8000/docs
4) Get recent events:
   ```
   GET http://localhost:8000/recent
   ```
6) Attendance predictions from CSV (cached for 15s):
    ```
    GET http://localhost:8000/attendance?status=Attentive&limit=50&offset=0&q=PartA_00
    ```
    Response shape:
    ```json
    {
       "total": 500,
       "items": [
            {
               "image": "PartA_00047_jpg.rf....jpg",
               "attentive_prob": 0.42,
               "non_attentive_prob": 0.57,
               "status": "Attentive"
            }
       ]
    }
    ```
5) WebSocket alerts:
   ```
   ws://localhost:8000/ws/alerts
   ```

The **producer** generates random student activity events and publishes them to Kafka every ~1.5s. The **FastAPI** service consumes them, writes to Postgres, and broadcasts alerts to any connected WebSocket clients.

## Project Structure
```
cams-starter/
  ├── docker-compose.yml
  ├── .env
  ├── db_init/
  │   └── 01_schema.sql
  ├── fastapi_app/
  │   ├── Dockerfile
  │   ├── requirements.txt
  │   └── main.py
  └── producer/
      ├── Dockerfile
      ├── requirements.txt
      └── producer.py
```

## Environment
- Edit `.env` to change Kafka/Postgres settings.
- Default topic: `student-activity`.
- Set `CSV_PATH` (mounted via docker-compose under `/data`) to enable `/attendance` endpoint.
- Optional: `CSV_CACHE_TTL` (seconds, default 15) to adjust caching of CSV reads.

## Integrating the Real Model
Replace the **producer** with your inference service. Send events to Kafka in the same JSON format:
```json
{
  "student_id": "S101",
  "status": "attentive | sleeping | phone",
  "confidence": 0.93,
  "timestamp": 1699999999.123
}
```

## Notes
- This starter uses **aiokafka** (async) for both producer and consumer.
- For production: add auth, metrics, retries, and consider Kafka partitions and message keys by `student_id`.
