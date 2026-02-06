package UserHandler

import (
	"fmt"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/store"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func GetUserById(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")

		login, err := store.GetUserLogin(c.DB, r.Context(), idStr)

		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		fmt.Fprintf(w, "login: %s", login)
	}
}
