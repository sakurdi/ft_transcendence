package models

type UserLogin struct{

	Login string `json:"username"`
	Password string `json:"password"`

}

type UserRegistration struct{
	
	Login string `json:"username"`
	Mail string `json:"email"`
	Password string `json:"password"`

}