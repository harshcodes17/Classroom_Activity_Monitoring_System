# consumer.py for kafka_consumer
import os, asyncio, json
from aiokafka import AIOKafkaConsumer
import asyncpg

KAFKA_BROKERS = os.getenv('KAFKA_BROKERS', 'kafka:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'student-activity')
PG_DSN = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

async def consume():
    db_pool = await asyncpg.create_pool(PG_DSN, min_size=1, max_size=5)
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKERS,
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        enable_auto_commit=True,
        group_id="kafka-consumer",
        auto_offset_reset="earliest"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            data = msg.value
            async with db_pool.acquire() as conn:
                await conn.execute(
                    "INSERT INTO activity (student_id, status, confidence, ts) VALUES ($1,$2,$3, to_timestamp($4))",
                    data.get('student_id'),
                    data.get('status'),
                    data.get('confidence'),
                    data.get('timestamp')
                )
            print("Consumed and inserted:", data, flush=True)
    finally:
        await consumer.stop()
        await db_pool.close()

if __name__ == "__main__":
    asyncio.run(consume())
