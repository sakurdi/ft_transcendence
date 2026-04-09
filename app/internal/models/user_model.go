package models

import "time"

type UserLogin struct {
	Login    string `json:"username"`
	Password string `json:"password"`
}

type UserRegistration struct {
	Login    string `json:"username"`
	Mail     string `json:"email"`
	Password string `json:"password"`
}

type UserInfo struct {
	ID            int       `json:"id"`
	Login         string    `json:"username"`
	Email         string    `json:"email"`
	Role          string    `json:"role"`
	Avatar        string    `json:"avatar_url,omitempty"`
	Creation_date time.Time `json:"member_since"`
}

type UserProfile struct {
	ID            int       `json:"id"`
	Login         string    `json:"username"`
	Role          string    `json:"role"`
	Avatar        string    `json:"avatar_url"`
	Creation_date time.Time `json:"member_since"`
}

type UserEdit struct {
	Login    string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserPassword struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}
