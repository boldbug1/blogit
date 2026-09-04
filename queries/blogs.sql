-- name: CreateAuthor :one
INSERT INTO authors (name, email)
VALUES ($1, $2)
RETURNING *;

-- name: CreateBlog :one
INSERT INTO blogs (author_id, title, slug, body)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetBlogBySlug :one
SELECT 
    b.id, b.title, b.slug, b.body, b.created_at, b.updated_at,
    a.id AS author_id, a.name AS author_name, a.email AS author_email
FROM blogs b
JOIN authors a ON a.id = b.author_id
WHERE b.slug = $1 LIMIT 1;

-- name: ListBlogs :many
SELECT 
    b.id, b.title, b.slug, b.created_at,
    a.name AS author_name
FROM blogs b
JOIN authors a ON a.id = b.author_id
ORDER BY b.created_at DESC
LIMIT $1 OFFSET $2;

-- name: UpdateBlogById :one
UPDATE blogs
SET 
    title      = COALESCE(sqlc.narg('title'), title),
    body       = COALESCE(sqlc.narg('body'), body),
    updated_at = NOW()
WHERE id = $1
RETURNING *;