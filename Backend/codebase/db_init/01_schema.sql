CREATE TABLE IF NOT EXISTS activity (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('attentive','sleeping','phone')),
    confidence REAL,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity (ts DESC);
CREATE INDEX IF NOT EXISTS idx_activity_student ON activity (student_id);
