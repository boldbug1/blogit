package api

import (
	"net/http"
	"time"

	"blogit/internal/db"
)

type Server struct {
	queries      *db.Queries
	startTime    time.Time
	jwtSecret    []byte
	authLimiter  *IPRateLimiter
	writeLimiter *IPRateLimiter
	readLimiter  *IPRateLimiter
}

func NewServer(queries *db.Queries, secret []byte) *Server {
	return &Server{
		queries:      queries,
		startTime:    time.Now(),
		jwtSecret:    secret,
		authLimiter:  NewIPRateLimiter(10, time.Minute),  // 10 req/min for auth
		writeLimiter: NewIPRateLimiter(30, time.Minute),  // 30 req/min for mutations
		readLimiter:  NewIPRateLimiter(120, time.Minute), // 120 req/min for reads
	}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.handleHealth)

	// Public auth (rate limited)
	mux.HandleFunc("POST /auth/google", s.authLimiter.Middleware(s.handleGoogleAuth))
	mux.HandleFunc("POST /auth/register", s.authLimiter.Middleware(s.handleRegister))
	mux.HandleFunc("POST /auth/login", s.authLimiter.Middleware(s.handleLogin))
	mux.HandleFunc("GET /auth/check-username", s.readLimiter.Middleware(s.handleCheckUsername))

	// Public blogs & topics (rate limited)
	mux.HandleFunc("GET /blogs", s.readLimiter.Middleware(s.handleListBlogs))
	mux.HandleFunc("GET /blogs/{slug}", s.readLimiter.Middleware(s.handleGetBlog))
	mux.HandleFunc("GET /tags", s.readLimiter.Middleware(s.handleListTags))

	// Public newsletter subscribe
	mux.HandleFunc("POST /newsletter/subscribe", s.writeLimiter.Middleware(s.handleSubscribeNewsletter))

	// Public social metrics
	mux.HandleFunc("GET /blogs/{id}/likes", s.readLimiter.Middleware(s.handleGetLikes))
	mux.HandleFunc("GET /blogs/{id}/comments", s.readLimiter.Middleware(s.handleListComments))

	// Public media serving (cached & rate limited)
	mux.HandleFunc("GET /media/{id}", s.readLimiter.Middleware(s.handleGetMedia))

	// Protected, requires Bearer JWT
	mux.HandleFunc("GET /me", s.RequireAuth(s.handleMe))
	mux.HandleFunc("POST /media/upload", s.RequireAuth(s.writeLimiter.Middleware(s.handleUploadMedia)))
	mux.HandleFunc("POST /blogs", s.RequireAuth(s.writeLimiter.Middleware(s.handleCreateBlog)))
	mux.HandleFunc("PATCH /blogs/{id}", s.RequireAuth(s.writeLimiter.Middleware(s.handleUpdateBlog)))
	mux.HandleFunc("DELETE /blogs/{id}", s.RequireAuth(s.writeLimiter.Middleware(s.handleDeleteBlog)))
	mux.HandleFunc("POST /blogs/{id}/like", s.RequireAuth(s.writeLimiter.Middleware(s.handleToggleLike)))
	mux.HandleFunc("POST /blogs/{id}/comments", s.RequireAuth(s.writeLimiter.Middleware(s.handleCreateComment)))
	return s.EnableCORS(s.CompressResponse(mux))
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"uptime": time.Since(s.startTime).Truncate(time.Second).String(),
	})
}