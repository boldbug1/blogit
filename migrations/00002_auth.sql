-- +goose Up
ALTER TABLE authors ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';

-- +goose Down
ALTER TABLE authors DROP COLUMN password_hash;