package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGenerateUUID(t *testing.T) {
	uuid1, str1, err1 := generateUUID()
	if err1 != nil {
		t.Fatalf("generateUUID failed: %v", err1)
	}
	if len(str1) != 36 {
		t.Errorf("expected UUID string length 36, got %d (%s)", len(str1), str1)
	}

	uuid2, str2, err2 := generateUUID()
	if err2 != nil {
		t.Fatalf("generateUUID failed: %v", err2)
	}

	if str1 == str2 || uuid1 == uuid2 {
		t.Errorf("expected unique UUIDs, got identical: %s == %s", str1, str2)
	}
}

func TestHandleGetMedia_MissingID(t *testing.T) {
	s := &Server{}
	req := httptest.NewRequest("GET", "/media/", nil)
	rec := httptest.NewRecorder()

	s.handleGetMedia(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400 for missing id, got %d", rec.Code)
	}
}

func TestHandleGetMedia_IfNoneMatch(t *testing.T) {
	s := &Server{}
	req := httptest.NewRequest("GET", "/media/e492890b-6bde-47a5-a3e8-97ac9180b847", nil)
	req.SetPathValue("id", "e492890b-6bde-47a5-a3e8-97ac9180b847")
	req.Header.Set("If-None-Match", `"e492890b-6bde-47a5-a3e8-97ac9180b847"`)
	rec := httptest.NewRecorder()

	s.handleGetMedia(rec, req)

	if rec.Code != http.StatusNotModified {
		t.Errorf("expected status 304 Not Modified for matching ETag, got %d", rec.Code)
	}
	if rec.Header().Get("Cache-Control") != "public, max-age=31536000, immutable" {
		t.Errorf("expected immutable Cache-Control header, got %q", rec.Header().Get("Cache-Control"))
	}
}
