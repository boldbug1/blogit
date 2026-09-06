-- +goose Up
ALTER TABLE authors ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';
ALTER TABLE authors ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE authors ALTER COLUMN password_hash SET DEFAULT '';

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authors_google_id ON authors(google_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- +goose Down
DROP TABLE IF EXISTS newsletter_subscribers;
DROP INDEX IF EXISTS idx_authors_google_id;
ALTER TABLE authors DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE authors DROP COLUMN IF EXISTS google_id;
