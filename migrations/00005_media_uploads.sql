-- +goose Up
CREATE TABLE IF NOT EXISTS media_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL DEFAULT '',
    content_type TEXT NOT NULL DEFAULT 'image/jpeg',
    byte_size INT NOT NULL DEFAULT 0,
    data BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_uploads_created_at ON media_uploads(created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS media_uploads;
