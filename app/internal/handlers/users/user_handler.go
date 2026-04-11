package users

import (
	"encoding/json"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
	"log"
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
		role, err := store.GetUserRole(c.DB, r.Context(), userID)
		if err == nil && role == "banned" {
			utils.WriteNewResponse(w, false, "User account is banned")
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
		if !utils.IsLegalName(userInfo.Login) {
			utils.WriteNewResponse(w, false, "Only [a-zA-Z0-9+_@\".<>()[]{}-] characters are allowed")
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
			utils.WriteNewResponse(w, false, "Forbdiden")
			return
		}
	
		var input models.UserEdit
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		if len(input.Login) == 0 || len(input.Email) == 0 {
			utils.WriteNewResponse(w, false, "Empty login and/or email field")
			return
		}
		if !utils.IsLegalName(input.Login) {
			utils.WriteNewResponse(w, false, "Illegal characters in login field")
			return
		}
		if !auth.IsValidMail(input.Email) {
			utils.WriteNewResponse(w, false, "Invalid email format")
			return
		}
		if len(input.Login) <= 2 {
			utils.WriteNewResponse(w, false, "Login needs to be 3 characters minimum")
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
			if sessionUserID == targetUserID && input.Login != "" {
				c.Session.Put(r.Context(), "username", input.Login)
			}
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
		//sessionUserID := middleware.GetUserID(c, r)
		targetUserID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		// if sessionUserID != targetUserID {
		// 	utils.WriteNewResponse(w, false, "Forbidden")
		// 	return
		// }
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
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		if userInfo.Role != "superadmin" && userInfo.Role != "user" && userInfo.Role != "banned" {
			utils.WriteNewResponse(w, false, "Invalid role: must be 'superadmin', 'user', or 'banned'")
			return
		}
		if err := store.SetUserRole(c.DB, r.Context(), targetUserID, userInfo.Role); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
		} else {
			utils.WriteNewResponse(w, true, "Role updated")
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

func ChangePasswordHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		sessionUserID := middleware.GetUserID(c, r)

		targetLogin := chi.URLParam(r, "username")
		targetID, err := store.GetUserID(c.DB, r.Context(), targetLogin)
		if err != nil {
			utils.WriteNewResponse(w, false, "User not found")
			return
		}
		role, _ := store.GetUserRole(c.DB, r.Context(), sessionUserID)
		if sessionUserID != targetID && role != "superadmin" {
			utils.WriteNewResponse(w, false, "Forbidden")
			return
		}

		var body models.UserPassword
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		if body.OldPassword == "" || body.NewPassword == "" {
			utils.WriteNewResponse(w, false, "Both old and new passwords are required")
			return
		}
		if body.OldPassword == body.NewPassword {
			utils.WriteNewResponse(w, false, "New pass must be different from the previous one")
			return
		}
		if len(body.NewPassword) < 2 {
			utils.WriteNewResponse(w, false, "New password too short (min 3 characters)")
			return
		}

		currentHash, err := store.GetUserPassword(c.DB, r.Context(), targetLogin)
		if err != nil {
			utils.WriteNewResponse(w, false, "User not found")
			return
		}
		if !auth.CheckPasswordHash(body.OldPassword, currentHash) {
			utils.WriteNewResponse(w, false, "Old password is incorrect")
			return
		}
		hashed, err := auth.HashPassword(body.NewPassword)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		if err := store.UpdatePassword(c.DB, r.Context(), targetID, hashed); err != nil {
			utils.WriteNewResponse(w, false, "Failed to update password")
			return
		}
		utils.WriteNewResponse(w, true, "Password successfuly changed")
	}
}

func CreateAPIKeyHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		var body models.APIKeyCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}

		prefix, fullKey, hash := auth.GenerateAPIKey()
		id, err := store.CreateAPIKey(c.DB, r.Context(), userID, body.Name, prefix, hash)
		if err != nil {
			log.Printf("CreateAPIKey error: %v", err)
			utils.WriteNewResponse(w, false, "Failed to create API key")
			return
		}

		utils.WriteNewResponse(w, true, "API key created", models.APIKeyCreatedResponse{
			ID:     id,
			Name:   body.Name,
			Prefix: prefix,
			APIKey: fullKey,
		})
	}
}

func ListAPIKeysHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		keys, err := store.ListAPIKeys(c.DB, r.Context(), userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to list API keys")
			return
		}
		utils.WriteNewResponse(w, true, "Success", keys)
	}
}

func RevokeAPIKeyHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		keyID, err := strconv.Atoi(chi.URLParam(r, "keyID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid key ID")
			return
		}
		if err := store.RevokeAPIKey(c.DB, r.Context(), userID, keyID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to revoke API key")
			return
		}
		utils.WriteNewResponse(w, true, "API key revoked")
	}
}
