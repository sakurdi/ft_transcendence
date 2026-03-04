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

	"ft_transcendence/internal/middleware"
	// "ft_transcendence/internal/ws"
	// // "log"
	// "strconv"
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


func FriendHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)

		if err != nil {
			http.Error(w, "Invalid friendUsername", http.StatusBadRequest)
			return
		}
		if userID == friendID {
			http.Error(w, "Cannot add yourself as a friend", http.StatusBadRequest)
			return
		}
		if err := store.AddFriend(c.DB, r.Context(), userID, friendID); err != nil {
			http.Error(w, "Failed to add friend", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]string{"status": "friend added"})
	}
}

func UnfriendHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			http.Error(w, "Invalid friendUsername", http.StatusBadRequest)
			return
		}
		if userID == friendID {
			http.Error(w, "Cannot remove yourself as a friend", http.StatusBadRequest)
			return
		}
		if err := store.DeleteFriend(c.DB, r.Context(), userID, friendID); err != nil {
			http.Error(w, "Failed to remove friend", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]string{"status": "friend removed"})
	}
}

func GetFriendsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friends, err := store.GetFriends(c.DB, r.Context(), userID)
		if err != nil {
			http.Error(w, "Failed to get friends", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, friends)
	}
}

func SendFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			http.Error(w, "Invalid friendUsername", http.StatusBadRequest)
			return
		}
		if userID == friendID {
			http.Error(w, "Cannot add yourself as a friend", http.StatusBadRequest)
			return
		}
		if err := store.SendFriendRequest(c.DB, r.Context(), userID, friendID); err != nil {
			http.Error(w, "Failed to send request", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]string{"status": "Request sent"})
	}
}

func AcceptFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			http.Error(w, "Invalid friendUsername", http.StatusBadRequest)
			return
		}
		if userID == friendID {
			http.Error(w, "Cannot accept your own friend request", http.StatusBadRequest)
			return
		}

		if err := store.AcceptFriendRequest(c.DB, r.Context(), userID, friendID); err != nil {
			http.Error(w, "Failed to accept request", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]string{"status": "Friend added"})
	}
}

func DeclineFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			http.Error(w, "Invalid friendUsername", http.StatusBadRequest)
			return
		}
		if userID == friendID {
			http.Error(w, "Cannot decline your own friend request", http.StatusBadRequest)
			return
		}

		if err := store.DeclineFriendRequest(c.DB, r.Context(), userID, friendID); err != nil {
			http.Error(w, "Failed to decline request", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, map[string]string{"status": "Friend request declined"})
	}
}

func GetFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		requests, err := store.GetPendingFriendRequests(c.DB, r.Context(), userID)
		if err != nil {
			http.Error(w, "Failed to get requests", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, requests)
	}
}

func GetUserProfileHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := chi.URLParam(r, "username")
		_, err := store.GetUserID(c.DB, r.Context(), username)
		if err != nil {
			http.Error(w, "Failed to get user profile", http.StatusInternalServerError)
			return
		}
		if _, err := store.GetUserProfile(c.DB, r.Context(), username); err != nil {
			http.Error(w, "Failed to get user profile", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, models.UserProfile{
			Username: username,
			Profil: "photo placeholder"})
	}
}