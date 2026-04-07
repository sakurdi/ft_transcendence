package models

import "time"

type APIKey struct {
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	Name        string     `json:"name"`
	KeyPrefix   string     `json:"key_prefix"`
	KeyHash     string     `json:"-"`
	CreatedAt   time.Time  `json:"created_at"`
	LastUsedAt  *time.Time `json:"last_used_at,omitempty"`
	RevokedAt   *time.Time `json:"revoked_at,omitempty"`
}

type APIKeyCreate struct {
	Name string `json:"name"`
}

type APIKeyCreatedResponse struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Prefix string `json:"prefix"`
	APIKey string `json:"api_key"`
}
