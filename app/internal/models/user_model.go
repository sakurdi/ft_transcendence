package models

import "time"

type UserLogin struct{

	Login string	`json:"username"`
	Password string	`json:"password"`

}

type UserRegistration struct{
	
	Login string	`json:"username"`
	Mail string		`json:"email"`
	Password string	`json:"password"`

}

type UserInfo struct {
	Login string	`json:"username"`
	EMail string	`json:"email"`
	Id int32		`json:"id"`
	Created time.Time `json:"created_at"`
}
