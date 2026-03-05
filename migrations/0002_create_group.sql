CREATE TABLE IF NOT EXISTS memo_group (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE memo ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES memo_group(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_memo_group_id ON memo (group_id);
