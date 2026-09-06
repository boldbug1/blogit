package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"
	"strings"
	"net/mail"
	"blogit/internal/db"
	"github.com/jackc/pgx/v5/pgconn"
)

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, `{"error":"failed to encode response"}`, http.StatusInternalServerError)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	// Allow up to 5MB for markdown content; binary uploads use multipart /media/upload
	r.Body = http.MaxBytesReader(w, r.Body, 5242880)

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields() // Catch typos in client request payloads

	err := dec.Decode(dst)
	if err != nil {
		return err
	}

	// Ensure there is only a single JSON value in the body
	err = dec.Decode(&struct{}{})
	if !errors.Is(err, io.EOF) {
		return errors.New("body must contain only a single JSON object")
	}

	return nil
}

// normalizeEmail trims and lowercases for consistent lookup.
func normalizeEmail(email string) string {
  return strings.ToLower(strings.TrimSpace(email))
}

// validateEmail uses net/mail for format checking.
func validateEmail(email string) error {
  email = normalizeEmail(email)
  if email == "" {
    return errors.New("email is required")
  }
  if _, err := mail.ParseAddress(email); err != nil {
    return errors.New("invalid email format")
  }
  return nil
}

// validatePassword enforces your open-registration policy.
func validatePassword(password string) error {
  if len(password) < 8 {
    return errors.New("password must be at least 8 characters")
  }
  return nil
}

// validateRegister centralizes checks so register handler stays thin.
func validateRegister(name, email, password string) error {
  if strings.TrimSpace(name) == "" {
    return errors.New("name is required")
  }
  if err := validateEmail(email); err != nil {
    return err
  }
  return validatePassword(password)
}

// isUniqueViolation reports Postgres 23505 for duplicate email to 409 mapping.
func isUniqueViolation(err error) bool {
  var pgErr *pgconn.PgError
  if errors.As(err, &pgErr) {
    return pgErr.Code == "23505"
  }
  return false
}

// newAuthorResponse maps db.Author to public JSON and never leaks password_hash.
func newAuthorResponse(a db.Author) authorResponse {
  return authorResponse{
    ID:        a.ID.String(),
    Name:      a.Name,
    Email:     a.Email,
    AvatarUrl: a.AvatarUrl,
    CreatedAt: a.CreatedAt.Time.Format(time.RFC3339),
  }
}