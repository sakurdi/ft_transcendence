// cmd/api/routes.go (or similar path)
package main

import (
	"ft_transcendence/internal/config"
	UserHandler "ft_transcendence/internal/handlers"
	AppMiddleware "ft_transcendence/internal/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func routes(c *config.Config) http.Handler {
	mux := chi.NewRouter()

	mux.Use(middleware.Logger)
	mux.Use(middleware.Recoverer)
	mux.Use(c.Session.LoadAndSave)

	mux.Get("/test/{id}", UserHandler.GetUserById(c))
	mux.Get("/session_new", UserHandler.SessionNewHandler(c))
	mux.Get("/session_get", UserHandler.SessionGetHandler(c))

	mux.Post("/login", UserHandler.LoginHandler(c))
	mux.Post("/register", UserHandler.RegisterHandler(c))

	mux.Group(func(r chi.Router) {
		r.Use(AppMiddleware.Auth(c))

		r.Get("/secret", UserHandler.SecretHandler(c))
	})

	return mux
}
