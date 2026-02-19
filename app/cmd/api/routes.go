// cmd/api/routes.go (or similar path)
package main

import (
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/handlers/boards"
	"ft_transcendence/internal/handlers/users"
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

	mux.Post("/api/login", users.LoginHandler(c))
	mux.Post("/api/register", users.RegisterHandler(c))

	/* [PUBLIC] BOARDS */
	mux.Get("/api/board/{board_name}", boards.GetBoardHandler(c))

	mux.Group(func(r chi.Router) {
		r.Use(AppMiddleware.Auth(c))
		r.Post("/api/logout", users.LogoutHandler(c))

		/* [PROTECTED] BOARDS */
		r.Post("/api/board/new", boards.CreateBoardHandler(c))

	})

	return mux
}
