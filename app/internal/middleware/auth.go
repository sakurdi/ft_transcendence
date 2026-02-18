package middleware

import (
	"ft_transcendence/internal/config"
	"net/http"
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
