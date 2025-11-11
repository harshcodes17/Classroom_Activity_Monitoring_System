import os, sys, asyncio, time, json, csv
from aiokafka import AIOKafkaProducer

KAFKA_BROKERS = os.getenv('KAFKA_BROKERS', 'kafka:9092')
TOPIC = os.getenv('KAFKA_TOPIC', 'student-activity')
FINAL_CSV_PATH = os.getenv('FINAL_CSV_PATH', '/data/final.csv')  # strictly use final.csv
SEND_DELAY = float(os.getenv('SEND_DELAY', '1.0'))
LOOP = os.getenv('LOOP', 'false').lower() in ('1','true','yes','y')

def map_final_row_to_event(row: dict) -> dict:
    """Map a final.csv row to the outbound Kafka event using explicit columns.
    Columns: PRN, Attentive_Confidence, Non_Attentive_Confidence, Status.
    Logic changes per request:
      - student_id now ALWAYS comes from PRN column.
      - status derived from Status suffix (after last underscore) and normalized.
      - confidence chosen from Attentive_Confidence if status == attentive else Non_Attentive_Confidence.
      - Provide both raw confidences for downstream optional use.
    """
    status_token = (row.get('Status') or '').strip()
    # Extract student code before FIRST underscore, label after underscore (keeps 'non_attentive')
    code = ''
    if '_' in status_token:
        code, label = status_token.split('_', 1)
    else:
        label = status_token
    label_lower = label.lower()
    # Normalize label to expected set; detect non_attentive first.
    if 'non_attentive' in label_lower:
        norm_status = 'non_attentive'
    elif 'attentive' in label_lower:
        norm_status = 'attentive'
    else:
        norm_status = 'unknown'
    def to_float(v):
        try:
            return float(v)
        except Exception:
            return 0.0
    att_conf = to_float(row.get('Attentive_Confidence'))
    non_conf = to_float(row.get('Non_Attentive_Confidence'))
    chosen = att_conf if norm_status == 'attentive' else non_conf
    return {
        'student_id': (code or 'unknown').strip(),
        'status': norm_status,
        'confidence': round(chosen, 3),
        'attentive_confidence': att_conf,
        'non_attentive_confidence': non_conf,
        'source_status': status_token,  # original combined token for traceability
        'timestamp': time.time(),
    }

async def produce_from_csv(producer: AIOKafkaProducer):
    path = FINAL_CSV_PATH
    label = 'final.csv'
    if not path or not os.path.exists(path):
        raise FileNotFoundError(f"final.csv not found at {path}")
    while True:
        with open(path, newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                event = map_final_row_to_event(row)
                await producer.send_and_wait(TOPIC, event)
                print(f"Produced ({label}):", event, flush=True)
                await asyncio.sleep(SEND_DELAY)
        if not LOOP:
            break

async def main():
    # Fail fast if final.csv is missing
    if not FINAL_CSV_PATH or not os.path.exists(FINAL_CSV_PATH):
        print(f"[ERROR] final.csv not found at {FINAL_CSV_PATH}", file=sys.stderr, flush=True)
        sys.exit(1)

    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BROKERS,
                                value_serializer=lambda v: json.dumps(v).encode('utf-8'))
    await producer.start()
    try:
        await produce_from_csv(producer)
    finally:
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(main())
