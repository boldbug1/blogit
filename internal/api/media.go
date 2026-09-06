package api

import (
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"blogit/internal/db"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// generateUUID returns a v4 RFC4122 UUID
func generateUUID() (pgtype.UUID, string, error) {
	var b [16]byte
	_, err := rand.Read(b[:])
	if err != nil {
		return pgtype.UUID{}, "", err
	}
	// set version 4 and variant
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	var uuidVal pgtype.UUID
	uuidStr := fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])

	if err := uuidVal.Scan(uuidStr); err != nil {
		return pgtype.UUID{}, "", err
	}
	return uuidVal, uuidStr, nil
}

func (s *Server) handleUploadMedia(w http.ResponseWriter, r *http.Request) {
	// Limit total multipart body size to 15MB
	if err := r.ParseMultipartForm(15 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "file exceeds 15MB limit or invalid form data")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing 'file' in multipart form")
		return
	}
	defer file.Close()

	// Read first 512 bytes to sniff content type
	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		writeError(w, http.StatusBadRequest, "unable to read uploaded file")
		return
	}

	detectedType := http.DetectContentType(buf[:n])
	headerType := header.Header.Get("Content-Type")

	// Determine effective content type
	contentType := detectedType
	if strings.HasPrefix(headerType, "image/") {
		contentType = headerType
	}

	// Validate allowed image MIME types
	if !strings.HasPrefix(contentType, "image/") {
		writeError(w, http.StatusBadRequest, "only image uploads (JPEG, PNG, WebP, GIF, SVG) are allowed")
		return
	}

	// Read remaining bytes
	restBytes, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to read file content")
		return
	}

	allBytes := append(buf[:n], restBytes...)
	if len(allBytes) == 0 {
		writeError(w, http.StatusBadRequest, "uploaded file is empty")
		return
	}

	uuidVal, uuidStr, err := generateUUID()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate media identifier")
		return
	}

	filename := filepath.Base(header.Filename)
	if filename == "" || filename == "." {
		filename = uuidStr + ".jpg"
	}

	// Store in PostgreSQL media_uploads table
	_, err = s.queries.CreateMediaUpload(r.Context(), db.CreateMediaUploadParams{
		ID:          uuidVal,
		Filename:    filename,
		ContentType: contentType,
		ByteSize:    int32(len(allBytes)),
		Data:        allBytes,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save media to storage")
		return
	}

	// Determine public base URL
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		scheme := "http"
		if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
			scheme = "https"
		}
		baseURL = fmt.Sprintf("%s://%s", scheme, r.Host)
	}

	publicURL := fmt.Sprintf("%s/media/%s", strings.TrimRight(baseURL, "/"), uuidStr)

	writeJSON(w, http.StatusCreated, map[string]string{
		"url":          publicURL,
		"id":           uuidStr,
		"content_type": contentType,
	})
}

func (s *Server) handleGetMedia(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "missing media id")
		return
	}

	// Strip optional file extension if client requested e.g. /media/abc-123.jpg
	if dotIdx := strings.LastIndex(idStr, "."); dotIdx != -1 {
		idStr = idStr[:dotIdx]
	}

	var uuidVal pgtype.UUID
	if err := uuidVal.Scan(idStr); err != nil {
		writeError(w, http.StatusBadRequest, "invalid media id format")
		return
	}

	etag := fmt.Sprintf(`"%s"`, idStr)
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Header().Set("ETag", etag)

	if match := r.Header.Get("If-None-Match"); match == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	media, err := s.queries.GetMediaUploadById(r.Context(), uuidVal)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "media file not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to fetch media")
		return
	}

	w.Header().Set("Content-Type", media.ContentType)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(media.Data)))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(media.Data)
}
