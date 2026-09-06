package api

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestSlugify(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Hello World", "hello-world"},
		{"  Go 1.24 & Next.js 16!  ", "go-124-nextjs-16"},
		{"Why I Left Big Tech -- 2026", "why-i-left-big-tech-2026"},
		{"Special @#$% Characters", "special-characters"},
	}

	for _, tt := range tests {
		got := slugify(tt.input)
		if got != tt.expected {
			t.Errorf("slugify(%q) = %q; want %q", tt.input, got, tt.expected)
		}
	}
}

func TestValidateEmail(t *testing.T) {
	valid := []string{"test@example.com", "user.name+tag@sub.domain.co", "hello@blogit.dev"}
	for _, e := range valid {
		if err := validateEmail(e); err != nil {
			t.Errorf("expected %q to be valid email, got error: %v", e, err)
		}
	}

	invalid := []string{"", "notanemail", "@missinguser.com", "missingdomain@"}
	for _, e := range invalid {
		if err := validateEmail(e); err == nil {
			t.Errorf("expected %q to be invalid email, got nil error", e)
		}
	}
}

func TestEnableCORS_AllowedOrigin(t *testing.T) {
	os.Setenv("ALLOWED_ORIGIN", "https://blogit.vercel.app")
	defer os.Unsetenv("ALLOWED_ORIGIN")

	server := &Server{}
	handler := server.EnableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("OPTIONS", "/test", nil)
	req.Header.Set("Origin", "https://other.com")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Header().Get("Access-Control-Allow-Origin") != "https://blogit.vercel.app" {
		t.Errorf("expected Access-Control-Allow-Origin https://blogit.vercel.app, got %q", rec.Header().Get("Access-Control-Allow-Origin"))
	}
	if rec.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Errorf("expected Access-Control-Allow-Credentials true, got %q", rec.Header().Get("Access-Control-Allow-Credentials"))
	}
}