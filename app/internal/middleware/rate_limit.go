package middleware

import (
	"net/http"
	"sync"

	"golang.org/x/time/rate"
)

var (
	mu      sync.Mutex
	clients = make(map[string]*rate.Limiter)
)

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("X-API-Key")
		if key == "" {
			key = r.RemoteAddr
		}

		mu.Lock()
		limiter, ok := clients[key]
		if !ok {
			// 60 requests per minute (1 per second) with burst of 20
			limiter = rate.NewLimiter(1, 20)
			clients[key] = limiter
		}
		mu.Unlock()

		if !limiter.Allow() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
