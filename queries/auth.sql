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