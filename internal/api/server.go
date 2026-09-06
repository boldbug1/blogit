package api

import (
	"net/http"
	"time"

	"blogit/internal/db"
)

type Server struct {
	queries   *db.Queries
	startTime time.Time
	jwtSecret	[]byte
}

func NewServer(queries *db.Queries,secret []byte) *Server {
	return &Server{
		queries:   queries,
		startTime: time.Now(),
		jwtSecret: secret,
	}
}

func (s *Server) Routes() http.Handler {
  mux := http.NewServeMux()
  mux.HandleFunc("GET /health", s.handleHealth)

  // Public auth
  mux.HandleFunc("POST /auth/register", s.handleRegister)
  mux.HandleFunc("POST /auth/login", s.handleLogin)
  mux.HandleFunc("GET /auth/check-username", s.handleCheckUsername)

  // Public blogs & topics
  mux.HandleFunc("GET /blogs", s.handleListBlogs)
  mux.HandleFunc("GET /blogs/{slug}", s.handleGetBlog)
  mux.HandleFunc("GET /tags", s.handleListTags)

  // Public social metrics
  mux.HandleFunc("GET /blogs/{id}/likes", s.handleGetLikes)
  mux.HandleFunc("GET /blogs/{id}/comments", s.handleListComments)

  // Protected, requires Bearer JWT
  mux.HandleFunc("GET /me", s.RequireAuth(s.handleMe))
  mux.HandleFunc("POST /blogs", s.RequireAuth(s.handleCreateBlog))
  mux.HandleFunc("PATCH /blogs/{id}", s.RequireAuth(s.handleUpdateBlog))
  mux.HandleFunc("POST /blogs/{id}/like", s.RequireAuth(s.handleToggleLike))
  mux.HandleFunc("POST /blogs/{id}/comments", s.RequireAuth(s.handleCreateComment))
  return s.EnableCORS(mux)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"uptime": time.Since(s.startTime).Truncate(time.Second).String(),
	})
}