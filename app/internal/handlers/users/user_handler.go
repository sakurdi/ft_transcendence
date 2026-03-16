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
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Invalid request",
		})
			return
		}

		if !auth.IsValidMail(userInfo.Mail) || len(userInfo.Password) <= 3 || len(userInfo.Login) <= 2 {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Invalid request",
		})
			return
		}

		exists, err := store.CheckDuplicateCreds(c.DB, r.Context(), userInfo)
		if err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Internal Server Error",
		})
			return
		}
		if exists {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Email or user already exists",
		})
			return
		}

		if err := store.RegisterUser(c.DB, r.Context(), userInfo); err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Failed to create user",
		})
			return
		}

		userID, err := store.GetUserID(c.DB, r.Context(), userInfo.Login)
		if err != nil {
			utils.JSON(w, http.StatusCreated, map[string]string{"success": false})
			return
		}
		c.Session.Put(r.Context(), "user_id", userID)
		c.Session.Put(r.Context(), "username", userInfo.Login)

		utils.JSON(w, http.StatusCreated, map[string]string{"success": true})
	}
}

// func GetHash(c *config.Config) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {

// 		hash, _ := auth.HashPassword(chi.URLParam(r, "pass"))
// 		utils.JSON(w, http.StatusOK, map[string]string{"status": hash})
// 	}
// }

func LoginPingHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := c.Session.GetInt(r.Context(), "user_id")
		username := c.Session.GetString(r.Context(), "username")
		if userID == 0 || username == "" {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Unauthorized",
		})
			return
		}
		utils.JSON(w, http.StatusOK, map[string]any{
			"success":	true,
			"message": []string{userID, username},
		})
	}
}

func GetUserInfoHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if _, err := store.GetUserID(c.DB, r.Context(), chi.URLParam(r, "username")); err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "User not found",
		})
			return
		}
		info, err := store.GetUserInfo(c.DB, r.Context(), chi.URLParam(r, "username"))
		if err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
				"status": "error",
			})
			return
		}
		utils.JSON(w, http.StatusOK, info)
	}
}

func UpdateUserHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		sessionUserID := middleware.GetUserID(c, r)
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Invalid user id",
		})
			return
		}
		if sessionUserID != targetUserID {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Forbidden",
		})

			return
		}
		var input models.UserEdit
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Invalid request",
		})
			return
		}
		if input.Password != "" {
			hashed, err := auth.HashPassword(input.Password)
			if err != nil {
				utils.JSON(w, http.StatusOK, map[string]any{
					"success":	false,
					"message": "Internal Server Error",
				})
				return
			}
			input.Password = hashed
		}
		if err := store.EditUserInfo(c.DB, r.Context(), targetUserID, input); err != nil {
			utils.JSON(w, http.StatusOK, map[string]any{
			"success":	false,
			"message": "Could not update user",
		})
			return
		}
		utils.JSON(w, http.StatusInternalServerError, map[string]any{
			"status": true
			"message": "Successfully updated user profile",
		})

	}
}

func ListUsersHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users, err := store.GetAllUsers(c.DB, r.Context())
		if err != nil {
			utils.JSON(w, http.StatusInternalServerError, map[string]any{
				"status": "Internal Server Error",
			})
			return
		}
		utils.JSON(w, http.StatusOK, users)
	}
}

func DeleteUserHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionUserID := middleware.GetUserID(c, r)
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.JSON(w, http.StatusBadRequest, map[string]any{
				"id":     targetUserID,
				"status": "Error",
			})
			return
		}
		if sessionUserID != targetUserID {
			utils.JSON(w, http.StatusForbidden, map[string]any{
				"id":     targetUserID,
				"status": "Forbidden",
			})
			return
		}
		if err := store.DeleteUser(c.DB, r.Context(), targetUserID); err != nil {
			utils.JSON(w, http.StatusInternalServerError, map[string]any{
				"id":     targetUserID,
				"status": "Error",
			})
			return
		}
		c.Session.Destroy(r.Context())
		utils.JSON(w, http.StatusNoContent, map[string]any{
			"id":     targetUserID,
			"status": "User removed",
		})
	}
}

func SetRoleHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.JSON(w, http.StatusBadRequest, map[string]any{
				"id":     targetUserID,
				"status": "Invalid user ID",
			})
			return
		}
		var userInfo models.UserProfile
		if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil || userInfo.Role == "" {
			utils.JSON(w, http.StatusNoContent, map[string]any{
				"id":     userInfo.ID,
				"status": "Error",
			})
			return
		}
		if err := store.SetUserRole(c.DB, r.Context(), targetUserID, userInfo.Role); err != nil {
			utils.JSON(w, http.StatusNoContent, map[string]any{
				"id":     targetUserID,
				"status": "Role updated",
			})
			return
		}
	}
}

func GetUserByIDHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.JSON(w, http.StatusBadRequest, map[string]any{
				"id":     userID,
				"status": "Error",
			})
			return
		}
		user, err := store.GetUserByID(c.DB, r.Context(), userID)
		if err != nil {
			utils.JSON(w, http.StatusNoContent, map[string]any{
				"id":     user.ID,
				"status": "User not found",
			})
			return
		}
		utils.JSON(w, http.StatusOK, user)
	}
}
