package users

import (
	"encoding/json"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func LogoutHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := c.Session.Destroy(r.Context()); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]string{"status": "Logged out"})
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

		utils.JSON(w, http.StatusOK, map[string]string{"status": "Logged in"})
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

		utils.JSON(w, http.StatusCreated, map[string]string{"status": "Registered successfully"})
	}
}

func GetHash(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		hash, _ := auth.HashPassword(chi.URLParam(r, "pass"))
		utils.JSON(w, http.StatusOK, map[string]string{"status": hash})
	}
}

func LoginPing(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := c.Session.GetInt(r.Context(), "user_id")
		username := c.Session.GetString(r.Context(), "username")
		if userID == 0 || username == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]any{
			"id":       userID,
			"username": username,
		})
	}
}

func GetUserInfo(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if _, err := store.GetUserID(c.DB, r.Context(), chi.URLParam(r, "username")); err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return 
		}
		info, err := store.GetUserInfo(c.DB, r.Context(), chi.URLParam(r, "username"));
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return 
		}
		utils.JSON(w, http.StatusOK, info)
	}
}

func UpdateUserInfo(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// verifier si l'utilisateur est admin
		if 	username := c.Session.GetString(r.Context(), "username"); username !=  chi.URLParam(r, "username"){
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return 
		}
		var userInfo models.UserInfo
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
	}
}