package models

import "time"

type Blog struct {
    ID          string    `json:"id" db:"id"`
    Title       string    `json:"title" db:"title"`
    Slug        string    `json:"slug" db:"slug"`
    Description string    `json:"description" db:"description"`
    Body        string    `json:"body" db:"body"`
    AuthorID    string    `json:"author_id" db:"author_id"`
    Author      *Author   `json:"author,omitempty" db:"-"`
    Status      string    `json:"status" db:"status"` // draft, published, archived
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Author struct {
    ID        string    `json:"id" db:"id"`
    Name      string    `json:"name" db:"name"`
    Email     string    `json:"email" db:"email"`
    AvatarURL string    `json:"avatar_url,omitempty" db:"avatar_url"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
}