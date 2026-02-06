package models

type UserLogin struct{
	Login string `json:"username"`
	Password string `json:"password"`
}