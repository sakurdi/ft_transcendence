package boards

import (
	"encoding/json"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/ws"
	"log"
	"fmt"
	"ft_transcendence/internal/utils"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func CreateBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)

		var body models.BoardCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			utils.WriteNewResponse(w, false, "Invalid Request")
			return
		} else if  body.Name == "" {
			utils.WriteNewResponse(w, false, "Board name cannot be empty")
			return
		} // else if () Check for [A-Za-z0-9_]{1,}

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
				IsMod bool `json:"ismod"`}{IsMod: isMod})
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

func CreatePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetUserID(c, r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}

		var body models.PostCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Content == "" {
			utils.WriteNewResponse(w, false, "Invalid request")
			return
		}
		
		if body.ParentID == nil && (body.Title == nil || *body.Title == "") {
			utils.WriteNewResponse(w, false, "Title must not be empty")
			return
		}

		id, err := store.CreatePost(c.DB, r.Context(), body, boardID, userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal Server Error")
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
		utils.WriteNewResponse(w, true, "Post created", id)
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
		
		isMod, err := store.IsBoardMod(c.DB, r.Context(), boardID, userID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Internal server error")
			return
		} else if !isMod{
			utils.WriteNewResponse(w, false, "You dont have the rights to delete this post")
			return
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
		userID := middleware.GetUserID(c, r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		targetID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		fmt.Printf("AddMod: UserId: %v BoardUd: %v\n", userID, boardID)
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		
		isAdmin, err := store.IsBoardAdmin(c.DB, r.Context(), boardID, userID)
		if err != nil || !isAdmin {
			utils.WriteNewResponse(w, false, "Forbiden")
			return
		}
		
		if err := store.AddModerator(c.DB, r.Context(), boardID, targetID); err != nil {
			utils.WriteNewResponse(w, false, "Failed to add moderator")
			return
		}
		utils.WriteNewResponse(w, true, "Moderator added")
		w.WriteHeader(http.StatusNoContent)
	}
}

func RemoveModHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := middleware.GetUserID(c, r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid board ID")
			return
		}
		targetID, err := strconv.Atoi(chi.URLParam(r, "userID"))
		if err != nil {
			utils.WriteNewResponse(w, false, "Invalid user ID")
			return
		}
		
		isAdmin, err := store.IsBoardAdmin(c.DB, r.Context(), boardID, userID)
		if err != nil || !isAdmin {
			utils.WriteNewResponse(w, false, "Forbidden")
			return
		}
		if err := store.RemoveModerator(c.DB, r.Context(), boardID, targetID); err != nil {
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
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
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
		if err := store.UpdatePost(c.DB, r.Context(), postID, body.Content); err != nil {
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
