package middleware

import (
	"context"
	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/store"
	"net/http"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func APIKeyAuth(c *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := r.Header.Get("X-API-Key")
			if key == "" {
				http.Error(w, "Unauthorized: Missing API Key", http.StatusUnauthorized)
				return
			}

			hash := auth.HashAPIKey(key)
			userID, err := store.FindUserByAPIKey(c.DB, r.Context(), hash)
			if err != nil {
				http.Error(w, "Unauthorized: Invalid API Key", http.StatusUnauthorized)
				return
			}

			// Update last used at in background
			go func() {
				_ = store.UpdateAPIKeyLastUsed(c.DB, context.Background(), hash)
			}()

			// Add userID to context
			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetPublicUserID retrieves the user ID from context for public API requests
func GetPublicUserID(r *http.Request) int {
	val := r.Context().Value(UserIDKey)
	if val == nil {
		return 0
	}
	return val.(int)
}
