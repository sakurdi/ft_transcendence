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
			utils.WriteNewResponse(w, false, "Invalid friendUsername")
			return
		}
		if userID == friendID {
			utils.WriteNewResponse(w, false, "Cannot add yourself as a friend")
			return
		}
		if err := store.AddFriend(c.DB, r.Context(), userID, friendID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to add friend")
			return
		}
		utils.WriteNewResponse(w, true, "Friend added", map[string]string{"status": "friend added"})
	}
}

func UnfriendHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid friendUsername")
			return
		}
		if userID == friendID {
			utils.WriteNewResponse(w, false, "Cannot remove yourself as a friend")
			return
		}
		if err := store.DeleteFriend(c.DB, r.Context(), userID, friendID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to remove friend")
			return
		}
		utils.WriteNewResponse(w, true, "Friend removed", map[string]string{"status": "friend removed"})
	}
}

func GetFriendsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friends, err := store.GetFriends(c.DB, r.Context(), userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to get friends")
			return
		}
		utils.WriteNewResponse(w, true, "Success", friends)
	}
}

func SendFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid friendUsername")
			return
		}
		if userID == friendID {
			utils.WriteNewResponse(w, false, "Cannot add yourself as a friend")
			return
		}
		if err := store.SendFriendRequest(c.DB, r.Context(), userID, friendID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to send request")
			return
		}
		utils.WriteNewResponse(w, true, "Request sent", map[string]string{"status": "Request sent"})
	}
}

func AcceptFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid friendUsername")
			return
		}
		if userID == friendID {
			utils.WriteNewResponse(w, false, "Cannot accept your own friend request")
			return
		}

		if err := store.AcceptFriendRequest(c.DB, r.Context(), userID, friendID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to accept request")
			return
		}
		utils.WriteNewResponse(w, true, "Friend request accepted", map[string]string{"status": "Friend request accepted"})
	}
}

func DeclineFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		friendUsername := chi.URLParam(r, "friendUsername")
		friendID, err := store.GetUserID(c.DB, r.Context(), friendUsername)
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid friendUsername")
			return
		}
		if userID == friendID {
			utils.WriteNewResponse(w, false, "Cannot decline your own friend request")
			return
		}

		if err := store.DeclineFriendRequest(c.DB, r.Context(), userID, friendID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to decline request")
			return
		}
		utils.WriteNewResponse(w, true, "Friend request declined", map[string]string{"status": "Friend request declined"})
	}
}

func GetFriendRequestHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		requests, err := store.GetPendingFriendRequests(c.DB, r.Context(), userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to get requests")
			return
		}
		utils.WriteNewResponse(w, true, "Success", requests)
	}
}

func GetUserProfileHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := chi.URLParam(r, "username")
		_, err := store.GetUserID(c.DB, r.Context(), username)
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid username")
			return
		}
		if _, err := store.GetUserProfile(c.DB, r.Context(), username); err != nil {
			utils.WriteNewResponse(w, false, "Failed to get user profile")
			return
		}
		utils.WriteNewResponse(w, true, "Success", models.UserProfile{
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
			utils.WriteNewResponse(w, false, "File not found")
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
			utils.WriteNewResponse(w, false, "Error retrieving file")
			return
		}
		defer file.Close()

		ext := filepath.Ext(handler.Filename)
		if ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
			utils.WriteNewResponse(w, false, "Format not authorized")
			return
		}

		newuuid := uuid.New()

		fileName := fmt.Sprintf("user_%d_%s%s", userID, newuuid.String(), ext)
		savePath := filepath.Join("/app/uploads/avatars", fileName)
		
		dst, err := os.Create(savePath)
		if err != nil {
			utils.WriteNewResponse(w, false, "Error saving file")
			return
		}
		defer dst.Close()
		io.Copy(dst, file)

		avatarURL := "/api/uploads/avatars/" + fileName
		store.UpdateAvatar(c.DB, r.Context(), userID, avatarURL)

		utils.WriteNewResponse(w, true, "Avatar uploaded", map[string]string{"avatar_url": avatarURL})
	}
}