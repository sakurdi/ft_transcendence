package middleware

import (
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/store"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func GetUserID(c *config.Config, r *http.Request) int {
	return c.Session.GetInt(r.Context(), "user_id")
}

func Auth(c *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := c.Session.Get(r.Context(), "user_id")

			if userID == nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func RequireBoardMod(c *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := GetUserID(c, r)
			boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
			if err != nil {
				http.Error(w, "Invalid board ID", http.StatusBadRequest)
				return
			}
			role, err := store.GetUserRole(c.DB, r.Context(), userID)
			if err == nil && role == "superadmin" {
				next.ServeHTTP(w, r)
			}
			isMod, err := store.IsBoardMod(c.DB, r.Context(), boardID, userID)
			if err != nil || !isMod {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func RequireBoardAdmin(c *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := GetUserID(c, r)
			boardID, err := strconv.Atoi(chi.URLParam(r, "boardID"))
			if err != nil {
				http.Error(w, "Invalid board ID", http.StatusBadRequest)
				return
			}
			role, err := store.GetUserRole(c.DB, r.Context(), userID)
			if err == nil && role == "superadmin" {
				next.ServeHTTP(w, r)
			}
			isAdmin, err := store.IsBoardAdmin(c.DB, r.Context(), boardID, userID)
			if err != nil || !isAdmin {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func RequireSuperAdmin(c *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, err := store.GetUserRole(c.DB, r.Context(), GetUserID(c, r))
			if err != nil || role != "superadmin" {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func DjangoFreeman(c *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, err := store.GetUserRole(c.DB, r.Context(), GetUserID(c, r))
			if err != nil || role == "banned" {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
