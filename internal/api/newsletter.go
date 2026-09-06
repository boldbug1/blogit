package api

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
)

type SubscribeNewsletterRequest struct {
	Email string `json:"email"`
}

func (s *Server) handleSubscribeNewsletter(w http.ResponseWriter, r *http.Request) {
	var req SubscribeNewsletterRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	req.Email = normalizeEmail(req.Email)
	if err := validateEmail(req.Email); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "Please provide a valid email address")
		return
	}

	_, err := s.queries.SubscribeNewsletter(r.Context(), req.Email)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusInternalServerError, "Failed to subscribe to newsletter")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Thank you for subscribing to the Blogit newsletter!",
	})
}