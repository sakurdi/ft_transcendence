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

	mux.Get("/api/password/{pass}", users.GetHash(c))

	mux.Post("/api/login", users.LoginHandler(c))
	mux.Post("/api/register", users.RegisterHandler(c))

	mux.Get("/api/board/{boardName}", boards.GetBoardHandler(c))
	mux.Get("/api/board/{boardName}/threads", boards.GetThreadsHandler(c))
	mux.Get("/api/thread/{postID}/replies", boards.GetRepliesHandler(c))

	mux.Group(func(r chi.Router) {
		r.Use(AppMiddleware.Auth(c))

		r.Post("/api/logout", users.LogoutHandler(c))
		r.Post("/api/board/new", boards.CreateBoardHandler(c))
		r.Post("/api/board/{boardID}/post", boards.CreatePostHandler(c))

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardMod(c))
			r.Delete("/api/board/{boardID}/post/{postID}", boards.DeletePostHandler(c))
		})

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardAdmin(c))
			r.Post("/api/board/{boardID}/mod/{userID}", boards.AddModHandler(c))
			r.Delete("/api/board/{boardID}/mod/{userID}", boards.RemoveModHandler(c))
		})
	})

	return mux
}
