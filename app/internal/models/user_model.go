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
	Login         string    `json:"username"`
	ID				int		`json:"id"`
	Role          string    `json:"role"`
	Password      string    `json:"-"`
	Email         string    `json:"-"`
	Avatar        string    `json:"avatar_url"`
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
