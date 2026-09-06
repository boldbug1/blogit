package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"blogit/internal/api"
	"blogit/internal/db"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"
)

func runMigrations(dsn string) {
	if _, err := os.Stat("migrations"); os.IsNotExist(err) {
		return
	}

	if err := goose.SetDialect("postgres"); err != nil {
		log.Printf("Migration notice: could not set dialect: %v", err)
		return
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Printf("Migration notice: could not open db connection: %v", err)
		return
	}
	defer db.Close()

	log.Println("Applying database migrations...")
	if err := goose.Up(db, "migrations"); err != nil {
		log.Printf("Migration notice: %v", err)
	} else {
		log.Println("Database migrations are up to date.")
	}
}

func main() {
	_ = godotenv.Load()
	ctx := context.Background()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET not set")
	}
	if len(secret) < 32 {
		log.Fatal("JWT_SECRET must be at least 32 characters")
	}

	// Apply migrations on startup using unpooled URL if available
	migrationDSN := os.Getenv("DATABASE_URL_UNPOOLED")
	if migrationDSN == "" {
		migrationDSN = dsn
	}
	runMigrations(migrationDSN)

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}

	queries := db.New(pool)
	server := api.NewServer(queries,[]byte(secret))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	httpServer := &http.Server{
		Addr:         port,
		Handler:      server.Routes(),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("Server running on http://localhost%s\n", port)
	if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}