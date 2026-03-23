package users

import (
	"encoding/json"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
	"net/http"
	"strconv"

	// "fmt"
	"github.com/go-chi/chi/v5"
)

func LogoutHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := c.Session.Destroy(r.Context()); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
		} else {
			utils.WriteNewResponse(w, true, "Logged out")
		}
	}
}

func LoginHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserLogin
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		passwordHash, err := store.GetUserPassword(c.DB, r.Context(), userInfo.Login)
		if err != nil || !auth.CheckPasswordHash(userInfo.Password, passwordHash) {
			utils.WriteNewResponse(w, false, "Invalid login or password")
			return
		}
		if err := c.Session.RenewToken(r.Context()); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		userID, err := store.GetUserID(c.DB, r.Context(), userInfo.Login)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		utils.WriteNewResponse(w, true, "Logged in")
	}
}

func RegisterHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserRegistration
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}

		if !auth.IsValidMail(userInfo.Mail) || len(userInfo.Password) <= 3 || len(userInfo.Login) <= 2 {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}

		exists, err := store.CheckDuplicateCreds(c.DB, r.Context(), userInfo)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		if exists {
			utils.WriteNewResponse(w, false, "Email or user already exists")
			return
		}

		if err := store.RegisterUser(c.DB, r.Context(), userInfo); err != nil {
			utils.WriteNewResponse(w, false, "Failed to create user")
			return
		}

		userID, err := store.GetUserID(c.DB, r.Context(), userInfo.Login)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		utils.WriteNewResponse(w, true, "Registered")
	}
}

func MeHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := c.Session.GetInt(r.Context(), "user_id")
		username := c.Session.GetString(r.Context(), "username")
		if userID == 0 || username == "" {
			utils.WriteNewResponse(w, false, "Not logged in")
		} else {
			// fmt.Printf("Username: %v |\n", username)
			userInfo, err := store.GetUserInfo(c.DB, r.Context(), username)
			if err != nil {
				utils.WriteNewResponse(w, false, "Internal Server Error")
			} else {
				utils.WriteNewResponse(w, true, "Logged in", userInfo)
			}
		}
	}
}

func GetUserInfoHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if _, err := store.GetUserID(c.DB, r.Context(), chi.URLParam(r, "username")); err != nil {
			utils.WriteNewResponse(w, false, "User not found")
			return
		}
		info, err := store.GetUserInfo(c.DB, r.Context(), chi.URLParam(r, "username"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
		} else {
			utils.WriteNewResponse(w, true, "Success", info)
		}
	}
}

func UpdateUserHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		sessionUserID := middleware.GetUserID(c, r)
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		if sessionUserID != targetUserID {
			utils.WriteNewResponse(w, false, "Forbiden")
			return
		}
		var input models.UserEdit
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		if input.Password != "" {
			hashed, err := auth.HashPassword(input.Password)
			if err != nil {
				utils.WriteNewResponse(w, false, "Internal Server Error")
				return
			}
			input.Password = hashed
		}
		if err := store.EditUserInfo(c.DB, r.Context(), targetUserID, input); err != nil {
			utils.WriteNewResponse(w, false, "Could'nt update user")
		} else {
			utils.WriteNewResponse(w, true, "Successfully updated user profile")
		}
	}
}

func ListUsersHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users, err := store.GetAllUsers(c.DB, r.Context())
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		utils.WriteNewResponse(w, true, "Success", users)
	}
}

func DeleteUserHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionUserID := middleware.GetUserID(c, r)
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		if sessionUserID != targetUserID {
			utils.WriteNewResponse(w, false, "Forbiden")
			return
		}
		if err := store.DeleteUser(c.DB, r.Context(), targetUserID); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		c.Session.Destroy(r.Context())
		utils.WriteNewResponse(w, true, "User deleted")
	}
}

func SetRoleHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		var userInfo models.UserProfile
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil || userInfo.Role == "" {
			utils.WriteNewResponse(w, false, "Internal Server Error")
		} else if err := store.SetUserRole(c.DB, r.Context(), targetUserID, userInfo.Role); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
		} else {
			utils.WriteNewResponse(w, false, "Role set")
		}
	}
}

func GetUserByIDHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		user, err := store.GetUserByID(c.DB, r.Context(), userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "User not found")
		} else {
			utils.WriteNewResponse(w, true, "User found", user)
		}
	}
}
