package UserHandler

import (
	"encoding/json"
	"fmt"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"io"
	"net/http"
)

func SecretHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := c.Session.GetString(r.Context(), "user_id")
		username := c.Session.GetString(r.Context(), "username")
		fmt.Fprintf(w, "[ID: %s] %s", userID, username)

	}
}

func LoginHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserLogin

		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		//fmt.Fprintf(w, "Recieved user: %v password: %v\n", userInfo.Login, userInfo.Password)

		passwordHash, err := store.GetUserPassword(c.DB, r.Context(), userInfo.Login)
		//fmt.Fprintf(w, "passwordHah = %v | err = %v\n", passwordHash, err)

		if err != nil || !auth.CheckPasswordHash(userInfo.Password, passwordHash) {
			http.Error(w, "Invalid login or password", http.StatusUnauthorized)
			return
		}
		renew := c.Session.RenewToken(r.Context())
		if renew != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		userID, err := store.GetUserId(c.DB, r.Context(), userInfo.Login)
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		//fmt.Fprintf(w, "User successfully logged in with session id: %v\n", c.Session.Get(r.Context(), "user_id"))

	}
}

func RegisterHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var userInfo models.UserRegistration
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		fmt.Printf("Decoded User: %+v\n", userInfo)
		if !auth.IsValidMail(userInfo.Mail) || len(userInfo.Password) <= 3 || len(userInfo.Login) <= 2 {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		exists, err := store.CheckDuplicateCreds(c.DB, r.Context(), userInfo)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		if exists {
			http.Error(w, "User or Email already exists", http.StatusConflict)
			return
		}
		err = store.RegisterUser(c.DB, r.Context(), userInfo)
		if err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		userID, err := store.GetUserId(c.DB, r.Context(), userInfo.Login)
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Registered user %v", userInfo.Login)

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
