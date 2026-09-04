package api

import (
	"errors"
	"net/http"
	"regexp"
	"strings"

	"blogit/internal/db"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var nonAlphanumericRegex = regexp.MustCompile(`[^a-z0-9\s-]+`)
var whitespaceRegex = regexp.MustCompile(`[\s-]+`)

func slugify(s string) string {
	clean := strings.ToLower(strings.TrimSpace(s))
	clean = nonAlphanumericRegex.ReplaceAllString(clean, "")
	clean = whitespaceRegex.ReplaceAllString(clean, "-")
	return strings.Trim(clean, "-")
}

type CreateBlogRequest struct {
	AuthorID string `json:"author_id"`
	Title    string `json:"title"`
	Body     string `json:"body"`
}

type UpdateBlogRequest struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

func (s *Server) handleListBlogs(w http.ResponseWriter, r *http.Request) {
	params := db.ListBlogsParams{
		Limit:  20,
		Offset: 0,
	}

	blogs, err := s.queries.ListBlogs(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch blogs")
		return
	}

	writeJSON(w, http.StatusOK, blogs)
}

func (s *Server) handleGetBlog(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if slug == "" {
		writeError(w, http.StatusBadRequest, "missing blog slug")
		return
	}

	blog, err := s.queries.GetBlogBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "blog post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	writeJSON(w, http.StatusOK, blog)
}

func (s *Server) handleCreateBlog(w http.ResponseWriter, r *http.Request) {
	var req CreateBlogRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Body = strings.TrimSpace(req.Body)

	if req.Title == "" || req.Body == "" {
		writeError(w, http.StatusUnprocessableEntity, "title and body are required")
		return
	}

	var authorUUID pgtype.UUID
	if err := authorUUID.Scan(req.AuthorID); err != nil {
		writeError(w, http.StatusBadRequest, "invalid author_id format")
		return
	}

	slug := slugify(req.Title)
	if slug == "" {
		writeError(w, http.StatusUnprocessableEntity, "title must contain valid alphanumeric characters")
		return
	}

	blog, err := s.queries.CreateBlog(r.Context(), db.CreateBlogParams{
		AuthorID: authorUUID,
		Title:    req.Title,
		Slug:     slug,
		Body:     req.Body,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create blog post")
		return
	}

	writeJSON(w, http.StatusCreated, blog)
}

func (s *Server) handleUpdateBlog(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	var id pgtype.UUID
	if err := id.Scan(idStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id format")
		return
	}

	var req UpdateBlogRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Body = strings.TrimSpace(req.Body)

	if req.Title == "" && req.Body == "" {
		writeError(w, http.StatusUnprocessableEntity, "at least one of title or body must be provided")
		return
	}

	blog, err := s.queries.UpdateBlogById(r.Context(), db.UpdateBlogByIdParams{
		ID: id,
		Title: pgtype.Text{
			String: req.Title,
			Valid:  req.Title != "",
		},
		Body: pgtype.Text{
			String: req.Body,
			Valid:  req.Body != "",
		},
	})

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "blog post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update blog post")
		return
	}

	writeJSON(w, http.StatusOK, blog)
}
