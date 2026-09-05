package api

import (
  "context"
  "net/http"
  "strings"

  "github.com/golang-jwt/jwt/v5"
  "github.com/jackc/pgx/v5/pgtype"
)

type ctxKey string
const userIDKey ctxKey = "authorID"

func (s *Server) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    header := r.Header.Get("Authorization")
    if !strings.HasPrefix(header, "Bearer ") {
      writeError(w, http.StatusUnauthorized, "missing or invalid authorization header")
      return
    }
    tokenStr := strings.TrimPrefix(header, "Bearer ")
    claims := &jwt.RegisteredClaims{}
    token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
      return s.jwtSecret, nil
    })
    if err != nil || !token.Valid || claims.Subject == "" {
      writeError(w, http.StatusUnauthorized, "invalid or expired token")
      return
    }
    var id pgtype.UUID
    if err := id.Scan(claims.Subject); err != nil {
      writeError(w, http.StatusUnauthorized, "invalid token subject")
      return
    }
    ctx := context.WithValue(r.Context(), userIDKey, id)
    next(w, r.WithContext(ctx))
  }
}

func CurrentUserID(r *http.Request) (pgtype.UUID, bool) {
  id, ok := r.Context().Value(userIDKey).(pgtype.UUID)
  return id, ok
}

func (s *Server) EnableCORS(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, X-CSRF-Token")

    if r.Method == http.MethodOptions {
      w.WriteHeader(http.StatusOK)
      return
    }

    next.ServeHTTP(w, r)
  })
}