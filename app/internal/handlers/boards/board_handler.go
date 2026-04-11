package boards

import (
	"encoding/json"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"io"
	"os"
	"fmt"
	"path/filepath"
)

const upload_database_path string = "/app/uploads/database"

const maxUploadSize = 5 << 20 // 5 MB

func CreateBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)

		var body models.BoardCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			utils.WriteNewResponse(w, false, "Invalid Request")
			return
		} else if body.Name == "" {
			utils.WriteNewResponse(w, false, "Board name cannot be empty")
			return
		} else if !utils.IsLegalName(body.Name) {
			utils.WriteNewResponse(w, false, "Only [a-zA-Z0-9+_@\".<>()[]{}-] characters are allowed")
			return
		}

		id, err := store.CreateBoard(c.DB, r.Context(), body, userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to create board")
			return
		}
		utils.WriteNewResponse(w, true, "Board created", id)
	}
}

func GetBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			utils.WriteNewResponse(w, false, "Board not found")
			return
		}
		utils.WriteNewResponse(w, true, "Board found", board)
	}
}

func IsModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			utils.WriteNewResponse(w, false, "Board not found")
			return
		}

		isMod, err := store.IsBoardMod(c.DB, r.Context(), board.ID, userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal server error")
			return
		} else {
			utils.WriteNewResponse(w, true, "Success", struct {
				IsMod bool `json:"ismod"`
			}{IsMod: isMod})
		}
	}
}

func GetThreadsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			utils.WriteNewResponse(w, false, "Board not found")
			return
		}

		threads, err := store.GetThreads(c.DB, r.Context(), board.ID, 25, 0)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to fetch threads")
			return
		}
		utils.WriteNewResponse(w, true, "Success", threads)
	}
}

func GetScrollThreadsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			utils.WriteNewResponse(w, false, "Board not found")
			return
		}

		limitStr := r.URL.Query().Get("limit")
		cursorStr := r.URL.Query().Get("cursor")

		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 25
		}
		cursor, err := strconv.Atoi(cursorStr)
		if err != nil || cursor < 0 {
			cursor = 0
		}
		
		threads, err := store.GetScrollThreads(c.DB, r.Context(), board.ID, limit, cursor)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to fetch threads")
			return
		}
		utils.WriteNewResponse(w, true, "Success", threads)
	}
}

func GetScrollRepliesHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var parentID, limit, cursor int;
		var err error;

		if parentID, err = strconv.Atoi(chi.URLParam(r, "postID")); err != nil {
			utils.WriteNewResponse(w, false, "Invalid post ID")
			return
		}

		if cursor, err = strconv.Atoi(r.URL.Query().Get("cursor")); err != nil || cursor < 0 {
			cursor = 0
		}
		if limit, err = strconv.Atoi(r.URL.Query().Get("limit")); err != nil || limit <= 0 {
			limit = 25
		}
		log.Printf("ParentId %d | Cursor: %d | Limit : %d\n", parentID, cursor, limit)
		replies, err := store.GetScrollReplies(c.DB, r.Context(), parentID, limit, cursor)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to fetch replies")
			return
		}
		utils.WriteNewResponse(w, true, "Success", replies)
	}
}

func GetRepliesHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid post ID")
			return
		}
		replies, err := store.GetReplies(c.DB, r.Context(), postID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Failed to fetch replies")
			return
		}
		utils.WriteNewResponse(w, true, "Success", replies)
	}
}

func ServeUpload(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileName := chi.URLParam(r, "fileName")
		filePath := filepath.Join("/app/uploads/database", fileName)

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			utils.WriteNewResponse(w, false, "File not found")
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
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}

		err2 := r.ParseMultipartForm(maxUploadSize)
		if (err2 != nil) {
			utils.WriteNewResponse(w, false, "Error parsing form data")
			return
		}

		title_value := r.FormValue("title")

		parent_id := r.FormValue("parent_id")
		parent_id_int, err := strconv.Atoi(parent_id)
		if (err != nil) {
			utils.WriteNewResponse(w, false, "Invalid parent ID")
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
			utils.WriteNewResponse(w, false, "Threads need a title")
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
				utils.WriteNewResponse(w, false, "File type not allowed")
				return
			}

			newFilename := utils.GenerateFilename()

			fileName := fmt.Sprintf("user_%d_%s%s", userID, newFilename, ext)
			savePath := filepath.Join(upload_database_path, fileName)

			if err := os.MkdirAll(upload_database_path, 0755); err != nil {
				utils.WriteNewResponse(w, false, "Error creating upload directory")
				return
			}
			dst, err := os.Create((savePath))
			if err != nil {
				utils.WriteNewResponse(w, false, "Error saving file")
				return
			}
			defer dst.Close()
			io.Copy(dst, file)

			body.UploadPath = savePath
		}

		id, err := store.CreatePost(c.DB, r.Context(), body, boardID, userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		/*post, err := store.GetPost(c.DB, r.Context(), id)
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
		}*/
		utils.WriteNewResponse(w, true, "Post created", id)
	}
}

func ReplyHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := middleware.GetUserID(c, r)
		parentID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid post ID")
			return
		}
		parent, err := store.GetPost(c.DB, r.Context(), parentID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Post not found")
			return
		}
		var body models.PostCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Content == "" {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}

		body.ParentID = &parentID
		body.Title = nil
		id, err := store.CreatePost(c.DB, r.Context(), body, parent.BoardID, userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		/*
			post, err := store.GetPost(c.DB, r.Context(), id)
			if err != nil {
				log.Printf("ws: failed to get post %d: %v", id, err)
			} else {
				room := ws.ThreadRoom(parentID)
				log.Printf("ws: broadcasting new_reply to %s", room)
				c.Hub.Broadcast(room, ws.Event{Type: "new_reply", Data: post})
			}*/
		utils.WriteNewResponse(w, true, "Reply created", id)
	}
}

func DeletePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid post ID")
			return
		}

		boardID, err := store.GetPostBoardID(c.DB, r.Context(), postID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Post does not exist")
			return
		}

		role, _ := store.GetUserRole(c.DB, r.Context(), userID)
		if role != "superadmin" {
			isMod, err := store.IsBoardMod(c.DB, r.Context(), boardID, userID)
			if err != nil {
				utils.WriteNewResponse(w, false, "Internal server error")
				return
			} else if !isMod {
				utils.WriteNewResponse(w, false, "You don't have the rights to delete this post")
				return
			}
		}

		if err := store.DeletePost(c.DB, r.Context(), postID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to delete post")
			return
		}
		utils.WriteNewResponse(w, true, "Post deleted")
	}
}

func AddModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		if _, err := store.GetBoardByID(c.DB, r.Context(), boardID); err != nil {
			utils.WriteNewResponse(w, false, "Board not found")
			return
		}

		username := chi.URLParam(r, "username")
		userID, err := store.GetUserID(c.DB, r.Context(), username)
		if err != nil {
			utils.WriteNewResponse(w, false, "User not found")
			return
		}
		if err := store.AddModerator(c.DB, r.Context(), boardID, userID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to add moderator")
			return
		}
		utils.WriteNewResponse(w, true, "Moderator added")
	}
}

func RemoveModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		if _, err := store.GetBoardByID(c.DB, r.Context(), boardID); err != nil {
			utils.WriteNewResponse(w, false, "Board not found")
			return
		}

		username := chi.URLParam(r, "username")
		userID, err := store.GetUserID(c.DB, r.Context(), username)
		if err != nil {
			utils.WriteNewResponse(w, false, "User not found")
			return
		}
		if err := store.RemoveModerator(c.DB, r.Context(), boardID, userID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to remove moderator")
			return
		}
		utils.WriteNewResponse(w, true, "Moderator removed")
	}
}

func UpdateBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, errBoardID := strconv.Atoi(chi.URLParam(r, "boardID"))
		if errBoardID != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		var body models.BoardCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		if err := store.UpdateBoard(c.DB, r.Context(), boardID, body); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		utils.WriteNewResponse(w, true, "Board updated")
	}
}

func DeleteBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, errBoardID := strconv.Atoi(chi.URLParam(r, "boardID"))
		if errBoardID != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		if err := store.DeleteBoard(c.DB, r.Context(), boardID); err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		utils.WriteNewResponse(w, true, "Board deleted")
	}
}

func GetBoardModTeamHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		boardID, errBoardID := strconv.Atoi(chi.URLParam(r, "boardID"))
		if errBoardID != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		members, err := store.GetBoardTeam(c.DB, r.Context(), boardID)
		if err != nil {
			log.Printf("GetBoardModTeamHandler error: %v", err)
			utils.WriteNewResponse(w, false, "Internal Server Error")
			return
		}
		utils.WriteNewResponse(w, true, "Success", members)
	}
}

func EditPostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionUserID := middleware.GetUserID(c, r)
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid post ID")
			return
		}
		authorID, err := store.GetPostAuthorID(c.DB, r.Context(), postID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Post not found")
			return
		}
		if sessionUserID != authorID {
			utils.WriteNewResponse(w, false, "Forbiden")
			return
		}
		var body models.PostEdit
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Content == "" {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		if err := store.UpdatePost(c.DB, r.Context(), postID, body); err != nil {
			utils.WriteNewResponse(w, false, "Internal server error")
			return
		}
		utils.WriteNewResponse(w, true, "Post updated")
	}
}

func GetPostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid post ID")
			return
		}
		post, err := store.GetPost(c.DB, r.Context(), postID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal server error")
		} else {
			utils.WriteNewResponse(w, true, "Success", post)
		}
	}
}

func GetBoard(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		board, err := store.GetBoardList(c.DB, r.Context(), query)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal server error")
		} else {
			utils.WriteNewResponse(w, true, "Success", board)
		}
	}
}