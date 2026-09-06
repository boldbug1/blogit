-- name: CreateAuthor :one
INSERT INTO authors (name,email,password_hash) VALUES ($1,$2,$3)
RETURNING *;

-- name: GetAuthorByEmail :one
SELECT * FROM authors
WHERE email=$1;

-- name: GetAuthorById :one
SELECT * FROM authors
WHERE id = $1;

-- name: GetAuthorByName :one
SELECT * FROM authors
WHERE LOWER(name) = LOWER($1);

-- name: GetAuthorByGoogleId :one
SELECT * FROM authors
WHERE google_id = $1;

-- name: UpsertAuthorFromGoogle :one
INSERT INTO authors (name, email, google_id, avatar_url, password_hash)
VALUES ($1, $2, $3, $4, '')
ON CONFLICT (email) DO UPDATE
SET 
    google_id = EXCLUDED.google_id,
    avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE authors.avatar_url END,
    name = CASE WHEN authors.name = '' OR authors.name IS NULL THEN EXCLUDED.name ELSE authors.name END
RETURNING *;