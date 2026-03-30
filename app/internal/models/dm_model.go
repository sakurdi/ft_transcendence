package models

import "time"

type DMMessage struct {
	ID          int       `json:"id"`
	SenderID    int       `json:"sender_id"`
	RecipientID int       `json:"recipient_id"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
}

type Friend struct {
	ID 			int       `json:"id"`
	Username    string    `json:"username"`
	AvatarURL   string    `json:"avatar_url"`
}

type FriendRequest struct {
	ID        int         `json:"id"`
	FromUserID int        `json:"from_user_id"`
	ToUserID   int        `json:"to_user_id"`
	Status     string     `json:"status"`
	Username  string      `json:"username"`
}

type UserProfile struct {
	Username 	string    `json:"username"`
	AvatarURL   string    `json:"avatar_url"`
}