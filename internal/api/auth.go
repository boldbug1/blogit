package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"blogit/internal/db"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GoogleAuthRequest struct {
	Credential string `json:"credential"`
}

type googleTokenPayload struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified any    `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Aud           string `json:"aud"`
}

type authorResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarUrl string `json:"avatar_url,omitempty"`
	CreatedAt string `json:"created_at"`
}

type LoginResponse struct {
	Token  string         `json:"token"`
	Author authorResponse `json:"author"`
}

func (s *Server) handleGoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req GoogleAuthRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	req.Credential = strings.TrimSpace(req.Credential)
	if req.Credential == "" {
		writeError(w, http.StatusBadRequest, "Credential is required")
		return
	}

	var email, name, sub, picture string

	// Support dev/mock credential prefix for offline local testing: "dev:alice@example.com:Alice Smith"
	if strings.HasPrefix(req.Credential, "dev:") || strings.HasPrefix(req.Credential, "mock:") {
		if os.Getenv("ENV") == "production" || os.Getenv("GOOGLE_CLIENT_ID") != "" {
			writeError(w, http.StatusUnauthorized, "Dev login is disabled in production")
			return
		}
		parts := strings.Split(req.Credential, ":")
		if len(parts) >= 3 {
			email = normalizeEmail(parts[1])
			name = strings.TrimSpace(parts[2])
			sub = "mock-google-" + email
			picture = "https://api.dicebear.com/7.x/bottts/svg?seed=" + email
		} else {
			writeError(w, http.StatusBadRequest, "Invalid dev credential format")
			return
		}
	} else {
		// Verify Google ID token via Google's tokeninfo API
		client := &http.Client{Timeout: 8 * time.Second}
		resp, err := client.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + url.QueryEscape(req.Credential))
		if err != nil {
			writeError(w, http.StatusBadGateway, "Failed to connect to Google verification service")
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			writeError(w, http.StatusUnauthorized, "Invalid or expired Google token")
			return
		}

		var payload googleTokenPayload
		if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to parse Google user payload")
			return
		}

		// Verify email verified
		verified := false
		switch v := payload.EmailVerified.(type) {
		case bool:
			verified = v
		case string:
			verified = (v == "true")
		}
		if !verified {
			writeError(w, http.StatusUnauthorized, "Google account email is not verified")
			return
		}

		// Optional client ID audience verification if configured
		expectedAud := os.Getenv("GOOGLE_CLIENT_ID")
		if expectedAud != "" && payload.Aud != expectedAud {
			writeError(w, http.StatusUnauthorized, "Token audience mismatch")
			return
		}

		email = normalizeEmail(payload.Email)
		name = strings.TrimSpace(payload.Name)
		if name == "" {
			name = strings.Split(email, "@")[0]
		}
		sub = payload.Sub
		picture = payload.Picture
	}

	author, err := s.queries.UpsertAuthorFromGoogle(r.Context(), db.UpsertAuthorFromGoogleParams{
		Name:      name,
		Email:     email,
		GoogleID:  pgtype.Text{String: sub, Valid: sub != ""},
		AvatarUrl: picture,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to save user account")
		return
	}

	token, err := s.issueToken(author.ID.String())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to issue session token")
		return
	}

	writeJSON(w, http.StatusOK, LoginResponse{
		Token:  token,
		Author: newAuthorResponse(author),
	})
}

func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest

	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = normalizeEmail(req.Email)

	if err := validateRegister(req.Name, req.Email, req.Password); err != nil {
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	// Check if username already taken
	existingAuthor, err := s.queries.GetAuthorByName(r.Context(), req.Name)
	if err == nil && existingAuthor.ID.Valid {
		writeError(w, http.StatusConflict, "Username is already taken. Please choose another.")
		return
	} else if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusInternalServerError, "failed to check username")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create account")
		return
	}

	author, err := s.queries.CreateAuthor(r.Context(), db.CreateAuthorParams{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: pgtype.Text{String: string(hash), Valid: true},
	})
	if err != nil {
		if isUniqueViolation(err) {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create account")
		return
	}

	writeJSON(w, http.StatusCreated, newAuthorResponse(author))
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	req.Email = normalizeEmail(req.Email)

	author, err := s.queries.GetAuthorByEmail(r.Context(), req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		writeError(w, http.StatusInternalServerError, "login failed")
		return
	}

	if !author.PasswordHash.Valid || bcrypt.CompareHashAndPassword([]byte(author.PasswordHash.String), []byte(req.Password)) != nil {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := s.issueToken(author.ID.String())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "login failed")
		return
	}

	writeJSON(w, http.StatusOK, LoginResponse{Token: token, Author: newAuthorResponse(author)})
}


func (s *Server) issueToken(authorID string) (string, error) {
  now := time.Now()
  claims := jwt.RegisteredClaims{
    Subject: authorID,
    IssuedAt: jwt.NewNumericDate(now),
    ExpiresAt: jwt.NewNumericDate(now.Add(24*time.Hour)),
  }
  return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
  id, ok := CurrentUserID(r)
  if !ok {
    writeError(w, http.StatusUnauthorized, "unauthorized")
    return
  }
  author, err := s.queries.GetAuthorById(r.Context(), id)
  // handle pgx.ErrNoRows -> 404, else 200 newAuthorResponse(author)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "author does not exist")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to fetch author profile")
		return
	}

  writeJSON(w,http.StatusOK,newAuthorResponse(author))
}

type CheckUsernameResponse struct {
	Available bool   `json:"available"`
	Message   string `json:"message,omitempty"`
}

func (s *Server) handleCheckUsername(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimSpace(r.URL.Query().Get("name"))
	if name == "" {
		writeError(w, http.StatusBadRequest, "name parameter is required")
		return
	}

	author, err := s.queries.GetAuthorByName(r.Context(), name)
	if err == nil && author.ID.Valid {
		writeJSON(w, http.StatusOK, CheckUsernameResponse{
			Available: false,
			Message:   "Username is already taken",
		})
		return
	}
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusOK, CheckUsernameResponse{
			Available: true,
			Message:   "Username is available",
		})
		return
	}
	writeError(w, http.StatusInternalServerError, "failed to check username")
}