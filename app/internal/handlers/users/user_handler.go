package users

import (
	"encoding/json"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	store "ft_transcendence/internal/store/users"
	"net/http"
)

func LogoutHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := c.Session.Destroy(r.Context()); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "Logged out",
		})
	}
}

func LoginHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserLogin

		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		passwordHash, err := store.GetUserPassword(c.DB, r.Context(), userInfo.Login)
		if err != nil || !auth.CheckPasswordHash(userInfo.Password, passwordHash) {
			http.Error(w, "Invalid login or password", http.StatusUnauthorized)
			return
		}

		if err := c.Session.RenewToken(r.Context()); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		userID, err := store.GetUserID(c.DB, r.Context(), userInfo.Login)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "Logged in",
		})
	}
}

func RegisterHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserRegistration
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if !auth.IsValidMail(userInfo.Mail) || len(userInfo.Password) <= 3 || len(userInfo.Login) <= 2 {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		exists, err := store.CheckDuplicateCreds(c.DB, r.Context(), userInfo)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		if exists {
			http.Error(w, "User or email already exists", http.StatusConflict)
			return
		}

		if err := store.RegisterUser(c.DB, r.Context(), userInfo); err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		userID, err := store.GetUserID(c.DB, r.Context(), userInfo.Login)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "Registered successfully",
		})
	}
}
