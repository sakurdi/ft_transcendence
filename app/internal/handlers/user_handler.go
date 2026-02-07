package UserHandler

import (
	"encoding/json"
	"fmt"
	password "ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"io"
	"net/http"
)

func LoginHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserLogin

		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		fmt.Fprintf(w, "Recieved user: %v password: %v\n", userInfo.Login, userInfo.Password)

		passwordHash, err := store.GetUserPassword(c.DB, r.Context(), userInfo.Login)
		if err != nil || !password.CheckPasswordHash(userInfo.Password, passwordHash) {
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
		fmt.Fprintf(w, "User successfully logged in with session: %v\n", c.Session.Get(r.Context(), userID))

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
		hash, err := password.HashPassword("123")
		if err != nil {

		}
		fmt.Fprintf(w, "hash: %s", hash)
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
