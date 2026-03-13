// cmd/routes.go (or similar path)
package main

import (
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/handlers/boards"
	"ft_transcendence/internal/handlers/users"
	wshandler "ft_transcendence/internal/handlers/websocket"
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

	mux.Get("/password/{pass}", users.GetHash(c))

	mux.Get("/ws/board/{boardID}", wshandler.BoardSocket(c))
	mux.Get("/ws/thread/{postID}", wshandler.ThreadSocket(c))

	mux.Get("/user/me", users.LoginPingHandler((c)))
	mux.Get("/user/{username}", users.GetUserInfoHandler((c)))
	mux.Get("/users/id/{userID}", users.GetUserByIDHandler(c))

	mux.Get("/board/{boardID}/members", boards.GetBoardModTeamHandler(c))

	mux.Group(func(r chi.Router) {
		r.Use(AppMiddleware.Auth(c))
		r.Use(AppMiddleware.DjangoFreeman(c))

		r.Post("/logout", users.LogoutHandler(c))
		r.Post("/board/new", boards.CreateBoardHandler(c))

		r.Post("/board/{boardID}/post", boards.CreatePostHandler(c))
		r.Put("/post/{postID}", boards.EditPostHandler(c))

		r.Get("/ws/dm/{userID}", wshandler.DMSocket(c))
		
		r.Post("/board/new", boards.CreateBoardHandler(c))
		r.Post("/board/{boardID}/post", boards.CreatePostHandler(c))

		r.Put("/user/{username}", users.UpdateUserHandler(c))

		r.Delete("/users/{userID}", users.DeleteUserHandler(c))

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardAdmin(c))
			r.Put("/board/{boardID}", boards.UpdateBoardHandler(c))
			r.Delete("/board/{boardID}", boards.DeleteBoardHandler(c))
			r.Post("/board/{boardID}/mod/{userID}", boards.AddModHandler(c))
			r.Delete("/board/{boardID}/mod/{userID}", boards.RemoveModHandler(c))
		})

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardMod(c))
			r.Delete("/board/{boardID}/post/{postID}", boards.DeletePostHandler(c))
			r.Put("/board/{boardID}", boards.UpdateBoardHandler(c))

		})

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireSuperAdmin(c))
			r.Get("/users", users.ListUsersHandler(c))
			r.Put("/users/{userID}/role", users.SetRoleHandler(c))
			r.Delete("/users/{userID}", users.DeleteUserHandler(c))
		})
	})

	return mux
}

