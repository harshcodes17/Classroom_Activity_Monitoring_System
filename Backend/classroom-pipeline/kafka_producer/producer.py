# producer.py for kafka_producer
import os, asyncio, random, time, json
from aiokafka import AIOKafkaProducer

KAFKA_BROKERS = os.getenv('KAFKA_BROKERS', 'kafka:9092')
TOPIC = os.getenv('KAFKA_TOPIC', 'student-activity')

students = [f"S{100+i}" for i in range(1, 31)]
states = ["attentive", "sleeping", "phone"]

async def main():
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BROKERS,
                                value_serializer=lambda v: json.dumps(v).encode('utf-8'))
    await producer.start()
    try:
        while True:
            event = {
                "student_id": random.choice(students),
                "status": random.choice(states),
                "confidence": round(random.uniform(0.7, 0.99), 2),
                "timestamp": time.time()
            }
            await producer.send_and_wait(TOPIC, event)
            print("Produced:", event, flush=True)
            await asyncio.sleep(1.5)
    finally:
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(main())
