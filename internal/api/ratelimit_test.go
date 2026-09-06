package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestIPRateLimiter_Allow(t *testing.T) {
	// Limiter: 3 requests per 100ms
	rl := NewIPRateLimiter(3, 100*time.Millisecond)

	ip := "192.168.1.100"

	// First 3 requests should be allowed
	for i := 0; i < 3; i++ {
		if !rl.Allow(ip) {
			t.Fatalf("expected request %d to be allowed", i+1)
		}
	}

	// 4th immediate request should be rejected
	if rl.Allow(ip) {
		t.Fatal("expected 4th immediate request to be rejected")
	}

	// Wait for tokens to replenish
	time.Sleep(120 * time.Millisecond)

	// Should be allowed again
	if !rl.Allow(ip) {
		t.Fatal("expected request after replenishment to be allowed")
	}
}

func TestIPRateLimiter_Middleware(t *testing.T) {
	rl := NewIPRateLimiter(1, time.Second)
	handler := rl.Middleware(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// 1st request succeeds
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.RemoteAddr = "10.0.0.1:12345"
	rec1 := httptest.NewRecorder()
	handler(rec1, req1)

	if rec1.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec1.Code)
	}

	// 2nd immediate request gets 429
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.RemoteAddr = "10.0.0.1:12345"
	rec2 := httptest.NewRecorder()
	handler(rec2, req2)

	if rec2.Code != http.StatusTooManyRequests {
		t.Fatalf("expected status 429 Too Many Requests, got %d", rec2.Code)
	}

	if rec2.Header().Get("Retry-After") != "60" {
		t.Fatalf("expected Retry-After header 60, got %s", rec2.Header().Get("Retry-After"))
	}
}