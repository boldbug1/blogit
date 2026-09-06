package api

import (
	"errors"
	"net/http"
	"strings"

	"blogit/internal/db"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type CreateCommentRequest struct {
	Content  string `json:"content"`
	ParentID string `json:"parent_id,omitempty"`
}

type LikeResponse struct {
	Liked bool  `json:"liked"`
	Count int64 `json:"count"`
}

func (s *Server) handleToggleLike(w http.ResponseWriter, r *http.Request) {
	blogIDStr := r.PathValue("id")
	var blogID pgtype.UUID
	if err := blogID.Scan(blogIDStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id")
		return
	}

	authorID, ok := CurrentUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx := r.Context()
	_, err := s.queries.GetLikeByUser(ctx, db.GetLikeByUserParams{
		BlogID:   blogID,
		AuthorID: authorID,
	})

	liked := false
	if err == nil {
		// Already liked, so unlike
		_ = s.queries.DeleteLike(ctx, db.DeleteLikeParams{
			BlogID:   blogID,
			AuthorID: authorID,
		})
		liked = false
	} else if errors.Is(err, pgx.ErrNoRows) {
		// Not liked yet, so insert
		_ = s.queries.InsertLike(ctx, db.InsertLikeParams{
			BlogID:   blogID,
			AuthorID: authorID,
		})
		liked = true
	} else {
		writeError(w, http.StatusInternalServerError, "database error checking like")
		return
	}

	count, _ := s.queries.CountLikes(ctx, blogID)
	writeJSON(w, http.StatusOK, LikeResponse{
		Liked: liked,
		Count: count,
	})
}

func (s *Server) handleGetLikes(w http.ResponseWriter, r *http.Request) {
	blogIDStr := r.PathValue("id")
	var blogID pgtype.UUID
	if err := blogID.Scan(blogIDStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id")
		return
	}

	ctx := r.Context()
	count, err := s.queries.CountLikes(ctx, blogID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get like count")
		return
	}

	liked := false
	if authorID, ok := CurrentUserID(r); ok {
		_, err := s.queries.GetLikeByUser(ctx, db.GetLikeByUserParams{
			BlogID:   blogID,
			AuthorID: authorID,
		})
		liked = (err == nil)
		w.Header().Set("Cache-Control", "private, max-age=10")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
	}

	writeJSON(w, http.StatusOK, LikeResponse{
		Liked: liked,
		Count: count,
	})
}

func (s *Server) handleListComments(w http.ResponseWriter, r *http.Request) {
	blogIDStr := r.PathValue("id")
	var blogID pgtype.UUID
	if err := blogID.Scan(blogIDStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id")
		return
	}

	comments, err := s.queries.ListCommentsByBlogId(r.Context(), blogID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch comments")
		return
	}

	if comments == nil {
		comments = []db.ListCommentsByBlogIdRow{}
	}
	w.Header().Set("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
	writeJSON(w, http.StatusOK, comments)
}

func (s *Server) handleCreateComment(w http.ResponseWriter, r *http.Request) {
	blogIDStr := r.PathValue("id")
	var blogID pgtype.UUID
	if err := blogID.Scan(blogIDStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid blog id")
		return
	}

	authorID, ok := CurrentUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateCommentRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	req.Content = strings.TrimSpace(req.Content)
	if req.Content == "" {
		writeError(w, http.StatusUnprocessableEntity, "comment content cannot be empty")
		return
	}

	var parentUUID pgtype.UUID
	if strings.TrimSpace(req.ParentID) != "" {
		if err := parentUUID.Scan(req.ParentID); err != nil {
			writeError(w, http.StatusBadRequest, "invalid parent comment id")
			return
		}
	}

	comment, err := s.queries.CreateComment(r.Context(), db.CreateCommentParams{
		BlogID:   blogID,
		AuthorID: authorID,
		ParentID: parentUUID,
		Content:  req.Content,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create comment")
		return
	}

	writeJSON(w, http.StatusCreated, comment)
}
