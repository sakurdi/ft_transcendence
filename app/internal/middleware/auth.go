package middleware

import (
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/utils"
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
				utils.WriteNewResponse(w, false, "Unauthorized")
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
				utils.WriteNewResponse(w, false, "Invalid board ID")
				return
			}
			role, err := store.GetUserRole(c.DB, r.Context(), userID)
			if err == nil && role == "superadmin" {
				next.ServeHTTP(w, r)
				return
			}
			isMod, err := store.IsBoardMod(c.DB, r.Context(), boardID, userID)
			if err != nil || !isMod {
				utils.WriteNewResponse(w, false, "Forbidden")
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
				utils.WriteNewResponse(w, false, "Invalid board ID")
				return
			}
			role, err := store.GetUserRole(c.DB, r.Context(), userID)
			if err == nil && role == "superadmin" {
				next.ServeHTTP(w, r)
				return
			}
			isAdmin, err := store.IsBoardAdmin(c.DB, r.Context(), boardID, userID)
			if err != nil || !isAdmin {
				utils.WriteNewResponse(w, false, "Forbidden")
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
				utils.WriteNewResponse(w, false, "Forbidden")
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
				utils.WriteNewResponse(w, false, "Forbidden")
				c.Session.Destroy(r.Context())
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
