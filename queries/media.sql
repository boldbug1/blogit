-- name: CreateMediaUpload :one
INSERT INTO media_uploads (id, filename, content_type, byte_size, data)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, filename, content_type, byte_size, created_at;

-- name: GetMediaUploadById :one
SELECT id, filename, content_type, byte_size, data, created_at
FROM media_uploads
WHERE id = $1 LIMIT 1;
