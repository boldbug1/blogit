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
	Title       string   `json:"title"`
	Body        string   `json:"body"`
	BannerImage string   `json:"banner_image"`
	Tags        []string `json:"tags"`
}

type UpdateBlogRequest struct {
	Title       string   `json:"title"`
	Body        string   `json:"body"`
	BannerImage *string  `json:"banner_image"`
	Tags        []string `json:"tags"`
}

func (s *Server) handleListBlogs(w http.ResponseWriter, r *http.Request) {
	authorIDStr := strings.TrimSpace(r.URL.Query().Get("author_id"))
	if authorIDStr != "" {
		var authorUUID pgtype.UUID
		if err := authorUUID.Scan(authorIDStr); err != nil {
			writeError(w, http.StatusBadRequest, "invalid author_id format")
			return
		}
		blogs, err := s.queries.ListBlogsByAuthor(r.Context(), db.ListBlogsByAuthorParams{
			AuthorID: authorUUID,
			Limit:    50,
			Offset:   0,
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch author blogs")
			return
		}
		if blogs == nil {
			blogs = []db.ListBlogsByAuthorRow{}
		}
		w.Header().Set("Cache-Control", "public, max-age=30, stale-while-revalidate=120")
		writeJSON(w, http.StatusOK, blogs)
		return
	}

	tag := strings.TrimSpace(r.URL.Query().Get("tag"))

	if tag != "" {
		blogs, err := s.queries.ListBlogsByTag(r.Context(), db.ListBlogsByTagParams{
			Tag:    tag,
			Limit:  30,
			Offset: 0,
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch blogs by tag")
			return
		}
		if blogs == nil {
			blogs = []db.ListBlogsByTagRow{}
		}
		w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
		writeJSON(w, http.StatusOK, blogs)
		return
	}

	params := db.ListBlogsParams{
		Limit:  30,
		Offset: 0,
	}

	blogs, err := s.queries.ListBlogs(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch blogs")
		return
	}

	if blogs == nil {
		blogs = []db.ListBlogsRow{}
	}
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	writeJSON(w, http.StatusOK, blogs)
}

func (s *Server) handleListTags(w http.ResponseWriter, r *http.Request) {
	tags, err := s.queries.ListDistinctTags(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch tags")
		return
	}
	if tags == nil {
		tags = []string{}
	}
	w.Header().Set("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
	writeJSON(w, http.StatusOK, tags)
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
			var uuidVal pgtype.UUID
			if scanErr := uuidVal.Scan(slug); scanErr == nil {
				if idBlog, idErr := s.queries.GetBlogById(r.Context(), uuidVal); idErr == nil {
					w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
					writeJSON(w, http.StatusOK, idBlog)
					return
				}
			}
			writeError(w, http.StatusNotFound, "blog post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
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

	authorUUID, ok := CurrentUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if len(req.Title) > 300 {
		writeError(w, http.StatusUnprocessableEntity, "title cannot exceed 300 characters")
		return
	}

	slug := slugify(req.Title)
	if slug == "" {
		writeError(w, http.StatusUnprocessableEntity, "title must contain valid alphanumeric characters")
		return
	}

	cleanTags := make([]string, 0, len(req.Tags))
	for _, t := range req.Tags {
		t = strings.TrimSpace(t)
		if t != "" {
			if len(t) > 50 {
				t = t[:50]
			}
			cleanTags = append(cleanTags, t)
			if len(cleanTags) >= 10 {
				break
			}
		}
	}

	blog, err := s.queries.CreateBlog(r.Context(), db.CreateBlogParams{
		AuthorID:    authorUUID,
		Title:       req.Title,
		Slug:        slug,
		Body:        req.Body,
		BannerImage: strings.TrimSpace(req.BannerImage),
		Tags:        cleanTags,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create blog post")
		return
	}

	writeJSON(w, http.StatusCreated, blog)
}

func (s *Server) handleUpdateBlog(w http.ResponseWriter, r *http.Request) {
	currentUserID, ok := CurrentUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	var id pgtype.UUID
	if err := id.Scan(idStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id format")
		return
	}

	// Verify blog exists and that requesting user is the author
	existing, err := s.queries.GetBlogById(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "blog post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to fetch blog post")
		return
	}

	if existing.AuthorID != currentUserID {
		writeError(w, http.StatusForbidden, "you can only edit your own stories")
		return
	}

	var req UpdateBlogRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Body = strings.TrimSpace(req.Body)

	if len(req.Title) > 300 {
		writeError(w, http.StatusUnprocessableEntity, "title cannot exceed 300 characters")
		return
	}

	var bannerText pgtype.Text
	if req.BannerImage != nil {
		bannerText = pgtype.Text{
			String: *req.BannerImage,
			Valid:  true,
		}
	}

	cleanTags := make([]string, 0, len(req.Tags))
	for _, t := range req.Tags {
		t = strings.TrimSpace(t)
		if t != "" {
			if len(t) > 50 {
				t = t[:50]
			}
			cleanTags = append(cleanTags, t)
			if len(cleanTags) >= 10 {
				break
			}
		}
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
		BannerImage: bannerText,
		Tags:        cleanTags,
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

func (s *Server) handleDeleteBlog(w http.ResponseWriter, r *http.Request) {
	currentUserID, ok := CurrentUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	var id pgtype.UUID
	if err := id.Scan(idStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id format")
		return
	}

	// Verify blog exists and that requesting user is the author
	existing, err := s.queries.GetBlogById(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "blog post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to fetch blog post")
		return
	}

	if existing.AuthorID != currentUserID {
		writeError(w, http.StatusForbidden, "you can only delete your own stories")
		return
	}

	if err := s.queries.DeleteBlogById(r.Context(), id); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete blog post")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Blog deleted successfully",
	})
}

