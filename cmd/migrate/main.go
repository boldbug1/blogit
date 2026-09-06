package main

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"
)

func main() {
	_ = godotenv.Load()
	dsn := os.Getenv("DATABASE_URL_UNPOOLED")
	if dsn == "" {
		dsn = os.Getenv("DATABASE_URL")
	}
	if dsn == "" {
		log.Fatal("Neither DATABASE_URL_UNPOOLED nor DATABASE_URL is set in environment")
	}

	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatalf("SetDialect failed: %v", err)
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("sql.Open failed: %v", err)
	}
	defer db.Close()

	log.Println("Connecting to database and running migrations...")
	if err := goose.Up(db, "migrations"); err != nil {
		log.Fatalf("goose.Up failed: %v", err)
	}
	log.Println("All migrations applied successfully!")
}