package publicapi

import (
	"encoding/json"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func ListBoardsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boards, err := store.ListBoards(c.DB, r.Context())
		if err != nil {
			utils.WritePublicResponse(w, http.StatusInternalServerError, false, "Failed to fetch boards")
			return
		}
		utils.WritePublicResponse(w, http.StatusOK, true, "Success", boards)
	}
}

func GetBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")
		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusNotFound, false, "Board not found")
			return
		}
		utils.WritePublicResponse(w, http.StatusOK, true, "Success", board)
	}
}

func GetThreadsHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "boardName")
		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusNotFound, false, "Board not found")
			return
		}

		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		if limit <= 0 {
			limit = 25
		}
		offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

		threads, err := store.GetThreads(c.DB, r.Context(), board.ID, limit, offset)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusInternalServerError, false, "Failed to fetch threads")
			return
		}
		utils.WritePublicResponse(w, http.StatusOK, true, "Success", threads)
	}
}

func GetRepliesHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Invalid post ID")
			return
		}
		replies, err := store.GetReplies(c.DB, r.Context(), postID)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusInternalServerError, false, "Failed to fetch replies")
			return
		}
		utils.WritePublicResponse(w, http.StatusOK, true, "Success", replies)
	}
}

func CreatePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetPublicUserID(r)
		boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
		if err != nil {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Invalid board ID")
			return
		}

		// Ensure board exists
		if _, err := store.GetBoardByID(c.DB, r.Context(), boardID); err != nil {
			utils.WritePublicResponse(w, http.StatusNotFound, false, "Board not found")
			return
		}

		var body models.PostCreate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Content == "" {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Invalid request")
			return
		}
		if body.Title == nil || *body.Title == "" {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Title must not be empty")
			return
		}

		id, err := store.CreatePost(c.DB, r.Context(), body, boardID, userID)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusInternalServerError, false, "Internal Server Error")
			return
		}
		utils.WritePublicResponse(w, http.StatusCreated, true, "Post created", id)
	}
}

func UpdatePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetPublicUserID(r)
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Invalid post ID")
			return
		}

		authorID, err := store.GetPostAuthorID(c.DB, r.Context(), postID)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusNotFound, false, "Post not found")
			return
		}
		if userID != authorID {
			utils.WritePublicResponse(w, http.StatusForbidden, false, "Forbidden")
			return
		}

		var body models.PostEdit
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Content == "" {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Invalid request")
			return
		}

		if err := store.UpdatePost(c.DB, r.Context(), postID, body); err != nil {
			utils.WritePublicResponse(w, http.StatusInternalServerError, false, "Internal server error")
			return
		}
		utils.WritePublicResponse(w, http.StatusOK, true, "Post updated")
	}
}

func DeletePostHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := middleware.GetPublicUserID(r)
		postID, err := strconv.Atoi(chi.URLParam(r, "postID"))
		if err != nil {
			utils.WritePublicResponse(w, http.StatusBadRequest, false, "Invalid post ID")
			return
		}

		boardID, err := store.GetPostBoardID(c.DB, r.Context(), postID)
		if err != nil {
			utils.WritePublicResponse(w, http.StatusNotFound, false, "Post does not exist")
			return
		}

		authorID, err := store.GetPostAuthorID(c.DB, r.Context(), postID)
		isAuthor := (err == nil && userID == authorID)
		isMod, _ := store.IsBoardMod(c.DB, r.Context(), boardID, userID)

		if !isAuthor && !isMod {
			utils.WritePublicResponse(w, http.StatusForbidden, false, "Forbidden")
			return
		}

		if err := store.DeletePost(c.DB, r.Context(), postID); err != nil {
			utils.WritePublicResponse(w, http.StatusInternalServerError, false, "Failed to delete post")
			return
		}
		utils.WritePublicResponse(w, http.StatusOK, true, "Post deleted")
	}
}
