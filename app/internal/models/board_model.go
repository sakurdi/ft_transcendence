package models

import "time"

type Board struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     int       `json:"owner_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type Post struct {
	ID        int       `json:"id"`
	BoardID   int       `json:"board_id"`
	AuthorID  *int      `json:"author_id"`
	Username  string    `json:"username"`
	Title     *string   `json:"title"`
	Content   string    `json:"content"`
	ParentID  *int      `json:"parent_id"`
	CreatedAt time.Time `json:"created_at"`
}

type BoardCreate struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type PostCreate struct {
	Title    *string `json:"title"`
	Content  string  `json:"content"`
	ParentID *int    `json:"parent_id"`
}

type BoardRole struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}
