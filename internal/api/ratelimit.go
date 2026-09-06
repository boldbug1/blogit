package api

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type clientTokenBucket struct {
	tokens     float64
	lastRefill time.Time
}

// IPRateLimiter implements a thread-safe token bucket rate limiter per client IP.
type IPRateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*clientTokenBucket
	rate     float64       // tokens added per second
	capacity float64       // maximum burst tokens
	window   time.Duration
}

// NewIPRateLimiter creates a new rate limiter allowing maxRequests per window.
func NewIPRateLimiter(maxRequests int, window time.Duration) *IPRateLimiter {
	limiter := &IPRateLimiter{
		clients:  make(map[string]*clientTokenBucket),
		rate:     float64(maxRequests) / window.Seconds(),
		capacity: float64(maxRequests),
		window:   window,
	}

	// Periodic cleanup of stale IPs every 5 minutes
	go limiter.cleanupLoop(5 * time.Minute)

	return limiter
}

func (rl *IPRateLimiter) cleanupLoop(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.window * 2)
		for ip, bucket := range rl.clients {
			if bucket.lastRefill.Before(cutoff) {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Allow checks if the given IP has available token capacity.
func (rl *IPRateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	bucket, exists := rl.clients[ip]
	if !exists {
		rl.clients[ip] = &clientTokenBucket{
			tokens:     rl.capacity - 1,
			lastRefill: now,
		}
		return true
	}

	// Replenish tokens based on elapsed time
	elapsed := now.Sub(bucket.lastRefill).Seconds()
	bucket.tokens += elapsed * rl.rate
	if bucket.tokens > rl.capacity {
		bucket.tokens = rl.capacity
	}
	bucket.lastRefill = now

	if bucket.tokens >= 1.0 {
		bucket.tokens -= 1.0
		return true
	}

	return false
}

// GetClientIP extracts the real IP from X-Forwarded-For, X-Real-IP, or RemoteAddr.
func GetClientIP(r *http.Request) string {
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		parts := strings.Split(xff, ",")
		ip := strings.TrimSpace(parts[0])
		if ip != "" {
			return ip
		}
	}

	xri := strings.TrimSpace(r.Header.Get("X-Real-IP"))
	if xri != "" {
		return xri
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// Middleware wraps an http.HandlerFunc with rate limiting.
func (rl *IPRateLimiter) Middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := GetClientIP(r)
		if !rl.Allow(ip) {
			w.Header().Set("Retry-After", "60")
			writeError(w, http.StatusTooManyRequests, "Too many requests. Please slow down.")
			return
		}
		next(w, r)
	}
}