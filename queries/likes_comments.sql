-- name: GetLikeByUser :one
SELECT id FROM blog_likes
WHERE blog_id = $1 AND author_id = $2
LIMIT 1;

-- name: InsertLike :exec
INSERT INTO blog_likes (blog_id, author_id)
VALUES ($1, $2)
ON CONFLICT (blog_id, author_id) DO NOTHING;

-- name: DeleteLike :exec
DELETE FROM blog_likes
WHERE blog_id = $1 AND author_id = $2;

-- name: CountLikes :one
SELECT COUNT(*)::bigint FROM blog_likes
WHERE blog_id = $1;

-- name: CreateComment :one
INSERT INTO blog_comments (blog_id, author_id, parent_id, content)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListCommentsByBlogId :many
SELECT 
    c.id, c.blog_id, c.author_id, c.parent_id, c.content, c.created_at, c.updated_at,
    a.name AS author_name, a.avatar_url AS author_avatar_url
FROM blog_comments c
JOIN authors a ON a.id = c.author_id
WHERE c.blog_id = $1
ORDER BY c.created_at ASC;

-- name: DeleteComment :exec
DELETE FROM blog_comments
WHERE id = $1 AND author_id = $2;
