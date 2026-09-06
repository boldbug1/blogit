-- name: SubscribeNewsletter :one
INSERT INTO newsletter_subscribers (email)
VALUES ($1)
ON CONFLICT (email) DO UPDATE
SET email = EXCLUDED.email
RETURNING *;

-- name: ListNewsletterSubscribers :many
SELECT * FROM newsletter_subscribers
ORDER BY created_at DESC;