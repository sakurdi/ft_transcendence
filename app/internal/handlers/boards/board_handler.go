package boards

import (
	"encoding/json"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/ws"
	"log"

	"ft_transcendence/internal/utils"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"io"
	"os"
	"fmt"
	"path/filepath"
	// base64 "encoding/base64"
)

func CreateBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)

		var body models.BoardCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		id, err := store.CreateBoard(c.DB, r.Context(), body, userID)
		if err != nil {
			http.Error(w, "Failed to create board", http.StatusInternalServerError)
			return
		}

		utils.JSON(w, http.StatusCreated, map[string]int{"id": id})
	}
}

func GetBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			http.Error(w, "Board not found", http.StatusNotFound)
			return
		}

		utils.JSON(w, http.StatusOK, board)
	}
}

func IsModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			http.Error(w, "Board not found", http.StatusNotFound)
			return
		}

		isMod, err := store.IsBoardMod(c.DB, r.Context(), board.ID, userID)
		if err != nil || !isMod {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		utils.JSON(w, http.StatusOK, isMod)
	}
}

func GetThreadsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			http.Error(w, "Board not found", http.StatusNotFound)
			return
		}

		threads, err := store.GetThreads(c.DB, r.Context(), board.ID, 25, 0)
		if err != nil {
			http.Error(w, "Failed to fetch threads", http.StatusInternalServerError)
			return
		}

		utils.JSON(w, http.StatusOK, threads)
	}
}

func GetRepliesHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		replies, err := store.GetReplies(c.DB, r.Context(), postID)
		if err != nil {
			http.Error(w, "Failed to fetch replies", http.StatusInternalServerError)
			return
		}

		utils.JSON(w, http.StatusOK, replies)
	}
}

func ServeUpload(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileName := chi.URLParam(r, "fileName")
		filePath := filepath.Join("/app/uploads/database", fileName)

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		http.ServeFile(w, r, filePath)
	}
}

func CreatePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			http.Error(w, "Invalid board ID", http.StatusBadRequest)
			return
		}

		err2 := r.ParseMultipartForm(5 << 20)
		if (err2 != nil) {
			http.Error(w, "Error multipart form", http.StatusBadRequest)
			return
		}

		title_value := r.FormValue("title")

		parent_id := r.FormValue("parent_id")
		parent_id_int, err := strconv.Atoi(parent_id)
		if (err != nil) {
			http.Error(w, "Error parent_id_int when strconv", http.StatusBadRequest)
			return
		}
		var parentIDptr *int
		if (parent_id_int != 0) {
			parentIDptr = &parent_id_int
		}

		body := models.PostCreate {
			Title: &title_value,
			Content: r.FormValue("content"),
			ParentID: parentIDptr,
		}

		if body.ParentID == nil && (body.Title == nil || *body.Title == "") {
			http.Error(w, "Threads need a title", http.StatusBadRequest)
			return
		}

		file, _, err := r.FormFile("upload")
		if (err == nil) {
			defer file.Close()

			buffer := make([]byte, 512)
			_, err = file.Read(buffer)
			if err != nil {
				return
			}
			file.Seek(0, 0)

			contentType := http.DetectContentType(buffer)

			ext, err := utils.GetContentType(contentType)
			if (err != nil) {
				http.Error(w, "Format not authorized", http.StatusUnsupportedMediaType)
				return
			}
			
			newFilename := utils.GenerateFilename()

			fileName := fmt.Sprintf("user_%d_%s%s", userID, newFilename, ext)
			savePath := filepath.Join("/app/uploads/database", fileName)

			dst, err := os.Create((savePath))
			if err != nil {
				http.Error(w, "Error saving file", http.StatusInternalServerError)
				return
			}
			defer dst.Close()
			io.Copy(dst, file)

			body.UploadPath = savePath
		}

		id, err := store.CreatePost(c.DB, r.Context(), body, boardID, userID)
		if err != nil {
			http.Error(w, "Failed to create post", http.StatusInternalServerError)
			return
		}

		post, err := store.GetPost(c.DB, r.Context(), id)
		if err != nil {
			log.Printf("ws: failed to get post %d: %v", id, err)
		} else if body.ParentID != nil {
			room := ws.ThreadRoom(*body.ParentID)
			log.Printf("ws: broadcasting new_reply to %s", room)
			c.Hub.Broadcast(room, ws.Event{Type: "new_reply", Data: post})
		} else {
			room := ws.BoardRoom(boardID)
			log.Printf("ws: broadcasting new_thread to %s", room)
			c.Hub.Broadcast(room, ws.Event{Type: "new_thread", Data: post})
		}

		utils.JSON(w, http.StatusCreated, map[string]int{"id": id})
	}
}
func DeletePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		boardID, err := store.GetPostBoardID(c.DB, r.Context(), postID)
		if err != nil {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		}

		isMod, err := store.IsBoardMod(c.DB, r.Context(), boardID, userID)
		if err != nil || !isMod {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		if err := store.DeletePost(c.DB, r.Context(), postID); err != nil {
			http.Error(w, "Failed to delete post", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func AddModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			http.Error(w, "Invalid board ID", http.StatusBadRequest)
			return
		}
		targetID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		isAdmin, err := store.IsBoardAdmin(c.DB, r.Context(), boardID, userID)
		if err != nil || !isAdmin {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		if err := store.AddModerator(c.DB, r.Context(), boardID, targetID); err != nil {
			http.Error(w, "Failed to add moderator", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func RemoveModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := middleware.GetUserID(c, r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			http.Error(w, "Invalid board ID", http.StatusBadRequest)
			return
		}
		targetID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		isAdmin, err := store.IsBoardAdmin(c.DB, r.Context(), boardID, userID)
		if err != nil || !isAdmin {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		if err := store.RemoveModerator(c.DB, r.Context(), boardID, targetID); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func UpdateBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, _ := strconv.Atoi(chi.URLParam(r, "boardID"))
		var body models.BoardCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		if err := store.UpdateBoard(c.DB, r.Context(), boardID, body); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func DeleteBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, _ := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err := store.DeleteBoard(c.DB, r.Context(), boardID); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func GetBoardModTeamHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, _ := strconv.Atoi(chi.URLParam(r, "boardID"))
		members, err := store.GetBoardTeam(c.DB, r.Context(), boardID)
		if err != nil {
			log.Printf("GetBoardModTeamHandler error: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		utils.JSON(w, http.StatusOK, members)
	}
}
