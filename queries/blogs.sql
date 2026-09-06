-- name: CreateBlog :one
INSERT INTO blogs (author_id, title, slug, body, banner_image, tags)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetBlogBySlug :one
SELECT 
    b.id, b.title, b.slug, b.body, b.banner_image, b.tags, b.created_at, b.updated_at,
    a.id AS author_id, a.name AS author_name, a.email AS author_email,
    (SELECT COUNT(*)::bigint FROM blog_likes WHERE blog_id = b.id) AS likes_count,
    (SELECT COUNT(*)::bigint FROM blog_comments WHERE blog_id = b.id) AS comments_count
FROM blogs b
JOIN authors a ON a.id = b.author_id
WHERE b.slug = $1 LIMIT 1;

-- name: ListBlogs :many
SELECT 
    b.id, b.title, b.slug, b.body, b.banner_image, b.tags, b.created_at,
    b.author_id,
    a.name AS author_name,
    (SELECT COUNT(*)::bigint FROM blog_likes WHERE blog_id = b.id) AS likes_count,
    (SELECT COUNT(*)::bigint FROM blog_comments WHERE blog_id = b.id) AS comments_count
FROM blogs b
JOIN authors a ON a.id = b.author_id
ORDER BY b.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListBlogsByTag :many
SELECT 
    b.id, b.title, b.slug, b.body, b.banner_image, b.tags, b.created_at,
    b.author_id,
    a.name AS author_name,
    (SELECT COUNT(*)::bigint FROM blog_likes WHERE blog_id = b.id) AS likes_count,
    (SELECT COUNT(*)::bigint FROM blog_comments WHERE blog_id = b.id) AS comments_count
FROM blogs b
JOIN authors a ON a.id = b.author_id
WHERE sqlc.arg(tag)::text = ANY(b.tags)
ORDER BY b.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListBlogsByAuthor :many
SELECT 
    b.id, b.title, b.slug, b.body, b.banner_image, b.tags, b.created_at,
    b.author_id,
    a.name AS author_name,
    (SELECT COUNT(*)::bigint FROM blog_likes WHERE blog_id = b.id) AS likes_count,
    (SELECT COUNT(*)::bigint FROM blog_comments WHERE blog_id = b.id) AS comments_count
FROM blogs b
JOIN authors a ON a.id = b.author_id
WHERE b.author_id = $1
ORDER BY b.created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetBlogById :one
SELECT 
    b.id, b.title, b.slug, b.body, b.banner_image, b.tags, b.created_at, b.updated_at,
    b.author_id, a.name AS author_name, a.email AS author_email,
    (SELECT COUNT(*)::bigint FROM blog_likes WHERE blog_id = b.id) AS likes_count,
    (SELECT COUNT(*)::bigint FROM blog_comments WHERE blog_id = b.id) AS comments_count
FROM blogs b
JOIN authors a ON a.id = b.author_id
WHERE b.id = $1 LIMIT 1;

-- name: ListDistinctTags :many
SELECT DISTINCT unnest(tags)::text AS tag
FROM blogs
WHERE array_length(tags, 1) > 0;

-- name: UpdateBlogById :one
UPDATE blogs
SET 
    title        = COALESCE(sqlc.narg('title'), title),
    body         = COALESCE(sqlc.narg('body'), body),
    banner_image = COALESCE(sqlc.narg('banner_image'), banner_image),
    tags         = COALESCE(sqlc.narg('tags'), tags),
    updated_at   = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteBlogById :exec
DELETE FROM blogs
WHERE id = $1;
