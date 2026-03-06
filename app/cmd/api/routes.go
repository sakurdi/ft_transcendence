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

	// mux.Post("/login", users.LoginHandler(c))
	// mux.Post("/register", users.RegisterHandler(c))
	// mux.Post("/logout", users.LogoutHandler(c))
	// mux.Get("/logout", users.LogoutHandler(c))

	mux.Get("/user/", users.GetUserDataHandler(c))

	mux.Get("/password/{pass}", users.GetHash(c))

	mux.Post("/login", users.LoginHandler(c))
	mux.Post("/register", users.RegisterHandler(c))

	mux.Get("/board/{boardName}", boards.GetBoardHandler(c))
	mux.Get("/board/{boardName}/threads", boards.GetThreadsHandler(c))
	mux.Get("/thread/{postID}/replies", boards.GetRepliesHandler(c))

	mux.Group(func(r chi.Router) {
		r.Use(AppMiddleware.Auth(c))

		r.Post("/logout", users.LogoutHandler(c))
		r.Post("/board/new", boards.CreateBoardHandler(c))
		r.Post("/board/{boardID}/post", boards.CreatePostHandler(c))

		r.Get("/board/{boardName}/ismod", boards.IsModHandler(c))

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardMod(c))
			r.Delete("/board/{boardID}/post/{postID}", boards.DeletePostHandler(c))
		})

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardAdmin(c))
			r.Post("/board/{boardID}/mod/{userID}", boards.AddModHandler(c))
			r.Delete("/board/{boardID}/mod/{userID}", boards.RemoveModHandler(c))
		})
	})

	return mux
}

