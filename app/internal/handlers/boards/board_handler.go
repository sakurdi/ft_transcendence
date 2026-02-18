package boards

import (
	"encoding/json"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	store "ft_transcendence/internal/store/boards"
	"net/http"

	"github.com/go-chi/chi/v5"
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

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int{"id": id})
	}
}

func GetBoardHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardName := chi.URLParam(r, "board_name")

		board, err := store.GetBoard(c.DB, r.Context(), boardName)
		if err != nil {
			http.Error(w, "Board not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(board)
	}
}
