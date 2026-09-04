package api

import (
	"net/http"
	"time"

	"blogit/internal/db"
)

type Server struct {
	queries   *db.Queries
	startTime time.Time
}

func NewServer(queries *db.Queries) *Server {
	return &Server{
		queries:   queries,
		startTime: time.Now(),
	}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("GET /health", s.handleHealth)

	// Blogs CRUD
	mux.HandleFunc("GET /blogs", s.handleListBlogs)
	mux.HandleFunc("GET /blogs/{slug}", s.handleGetBlog)
	mux.HandleFunc("POST /blogs", s.handleCreateBlog)
	mux.HandleFunc("PATCH /blogs/{id}",s.handleUpdateBlog)

	return mux
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"uptime": time.Since(s.startTime).Truncate(time.Second).String(),
	})
}