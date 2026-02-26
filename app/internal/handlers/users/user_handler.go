package users

import (
	"encoding/json"
	"fmt"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	store "ft_transcendence/internal/store/users"
	"io"
	"net/http"
)

type registerResonseJSON struct {
	Success bool `json:"success"`
	Context string `json:"context"`
}

func LogoutHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		responseJSON := registerResonseJSON{false, ""}

		w.Header().Set("Content-Type", "application/json")
		if err := c.Session.Destroy(r.Context()); err != nil {
			responseJSON.Context = "Internal Server Error"
		} else {
			responseJSON.Context = "Logged out"
			responseJSON.Success = true;
		}
		json.NewEncoder(w).Encode(responseJSON)
		w.WriteHeader(http.StatusOK)
	}
}

func LoginHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		responseJSON := registerResonseJSON{false, ""}
		var userInfo models.UserLogin

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			responseJSON.Context = "Invalid request"
		} else if passwordHash, err := store.GetUserPassword(c.DB, r.Context(), userInfo.Login);
				err != nil || !auth.CheckPasswordHash(userInfo.Password, passwordHash) {
			responseJSON.Context = "Invalid login or password";
			// fmt.Printf("Recieved user: %v password: %v\n", userInfo.Login, userInfo.Password)
			//fmt.Fprintf(w, "passwordHah = %v | err = %v\n", passwordHash, err)
		} else if renew := c.Session.RenewToken(r.Context());
				renew != nil {
			responseJSON.Context = "Internal Server Error";
		} else if userID, err := store.GetUserId(c.DB, r.Context(), userInfo.Login);
				err != nil {
			responseJSON.Context = "Internal Server Error";
		} else {
			c.Session.Put(r.Context(), "user_id", userID)
			c.Session.Put(r.Context(), "username", userInfo.Login)
			responseJSON.Context = "Loged in successfully"
			responseJSON.Success = true
		}
		// fmt.Printf("Recieved user: %v password: %v\n", userInfo.Login, userInfo.Password)
		json.NewEncoder(w).Encode(responseJSON)
		w.WriteHeader(http.StatusOK)
	}
}

func RegisterHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		responseJSON := registerResonseJSON{false, ""}

		var userInfo models.UserRegistration
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			// http.Error(w, "Invalid request", http.StatusBadRequest)
			responseJSON.Context = "Invalid request"
		} else if !auth.IsValidMail(userInfo.Mail) || len(userInfo.Password) <= 3 || len(userInfo.Login) <= 2 {
			responseJSON.Context = "Invalid request"
		} else if exists, err := store.CheckDuplicateCreds(c.DB, r.Context(), userInfo); err != nil {
			responseJSON.Context = "Internal server error"
		} else if exists {
			responseJSON.Context = "User or Email already exists"
		} else if err = store.RegisterUser(c.DB, r.Context(), userInfo); err != nil {
			responseJSON.Context = "Failed to create user"
		} else if userID, err := store.GetUserId(c.DB, r.Context(), userInfo.Login);
			err != nil{
			responseJSON.Context = "Internal server error"
		} else {
			c.Session.Put(r.Context(), "user_id", userID)
			c.Session.Put(r.Context(), "username", userInfo.Login)
			responseJSON.Context = "Registered successfully"
			responseJSON.Success = true
		}
		json.NewEncoder(w).Encode(responseJSON)
		w.WriteHeader(http.StatusOK)
	}
}

func GetUserById(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// idStr := chi.URLParam(r, "id")

		// login, err := store.GetUserLogin(c.DB, r.Context(), idStr)

		// if err != nil {
		// 	http.Error(w, "User not found", http.StatusNotFound)
		// 	return
		// }
		hash, err := auth.HashPassword("123")
		if err != nil {

		}
		ret := auth.CheckPasswordHash("123", hash)
		fmt.Fprintf(w, "hash: %s\n hash compare: %v", hash, ret)
	}
}

func SessionNewHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		c.Session.Put(r.Context(), "Test", "Test session message")
		fmt.Fprintf(w, "%v created", c.Session.Get(r.Context(), "Test"))
	}
}

func SessionGetHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		msg := c.Session.GetString(r.Context(), "Test")
		if msg != "" {
			io.WriteString(w, msg)
		} else {
			http.Error(w, "Session not found", 404)
		}
	}
}


//-H 'Content-Type: application/json' -d '{ "title":"foo","body":"bar", "id": 1}'
