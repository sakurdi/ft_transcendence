// cmd/api/routes.go (or similar path)
package main

import (
	"ft_transcendence/internal/config"
	UserHandler "ft_transcendence/internal/handlers"
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

	return mux
}
