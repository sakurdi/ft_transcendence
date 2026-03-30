package users

import (
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	
	"ft_transcendence/internal/middleware"

    "io"
    "os"
    "path/filepath"
    "fmt"
)
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
			Login: username,
			Avatar: store.GetAvatarURL(c.DB, r.Context(), username),
		})
	}
}

func ServeAvatar(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileName := chi.URLParam(r, "fileName")
		filePath := filepath.Join("/app/uploads/avatars", fileName)
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		http.ServeFile(w, r, filePath)
	}
}

func UploadAvatarHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)

		r.ParseMultipartForm(1 << 20) 

		file, handler, err := r.FormFile("avatar")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		ext := filepath.Ext(handler.Filename)
		if ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
			http.Error(w, "Format not authorized", http.StatusUnsupportedMediaType)
			return
		}

		newuuid := uuid.New()

		fileName := fmt.Sprintf("user_%d_%s%s", userID, newuuid.String(), ext)
		savePath := filepath.Join("/app/uploads/avatars", fileName)
		
		dst, err := os.Create(savePath)
		if err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()
		io.Copy(dst, file)

		avatarURL := "/api/uploads/avatars/" + fileName
		store.UpdateAvatar(c.DB, r.Context(), userID, avatarURL)

		utils.JSON(w, http.StatusOK, map[string]string{"avatar_url": avatarURL})
	}
}