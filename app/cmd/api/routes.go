// cmd/routes.go (or similar path)
package main

import (
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/handlers/boards"
	"ft_transcendence/internal/handlers/publicapi"
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

	mux.Route("/public/v1", func(r chi.Router) {
		r.Use(AppMiddleware.APIKeyAuth(c))
		r.Use(AppMiddleware.RateLimit)

		r.Get("/boards", publicapi.ListBoardsHandler(c))
		r.Get("/boards/{boardName}", publicapi.GetBoardHandler(c))
		r.Get("/boards/{boardName}/threads", publicapi.GetThreadsHandler(c))
		r.Get("/threads/{postID}/replies", publicapi.GetRepliesHandler(c))

		r.Post("/boards/{boardID}/posts", publicapi.CreatePostHandler(c))
		r.Put("/posts/{postID}", publicapi.UpdatePostHandler(c))
		r.Delete("/posts/{postID}", publicapi.DeletePostHandler(c))
	})

	mux.Post("/login", users.LoginHandler(c))
	mux.Post("/register", users.RegisterHandler(c))

	mux.Get("/board/{boardName}", boards.GetBoardHandler(c))
	mux.Get("/board/{boardName}/threads", boards.GetThreadsHandler(c))

	mux.Get("/board/{boardName}/newthreads", boards.GetScrollThreadsHandler(c))

	mux.Get("/post/{postID}", boards.GetPostHandler(c))
	mux.Get("/post/{postID}/replies", boards.GetRepliesHandler(c))
	mux.Get("/post/{postID}/newreplies", boards.GetScrollRepliesHandler(c))
	mux.Get("/app/uploads/database/{fileName}", boards.ServeUpload(c))

	mux.Get("/uploads/avatars/{fileName}", users.ServeAvatar(c))

	mux.Get("/ws/board/{boardID}", wshandler.BoardSocket(c))
	mux.Get("/ws/thread/{postID}", wshandler.ThreadSocket(c))

	mux.Get("/user/me", users.MeHandler((c)))
	mux.Get("/user/{username}", users.GetUserInfoHandler((c)))
	mux.Get("/user/id/{userID}", users.GetUserByIDHandler(c))

	mux.Get("/board/{boardID}/members", boards.GetBoardModTeamHandler(c))

	mux.Get("/board", boards.GetBoard(c))

	mux.Group(func(r chi.Router) {
		r.Use(AppMiddleware.Auth(c))
		r.Use(AppMiddleware.DjangoFreeman(c))

		r.Post("/logout", users.LogoutHandler(c))
		r.Post("/board/new", boards.CreateBoardHandler(c))

		r.Post("/board/{boardID}/post", boards.CreatePostHandler(c))
		r.Post("/post/{postID}/reply", boards.ReplyHandler(c))
		r.Put("/post/{postID}", boards.EditPostHandler(c))

		// r.Put("/post/{postID}", boards.EditPostHandler(c))

		r.Get("/ws/dm/{username}", wshandler.DMSocket(c))

		r.Post("/friends/{friendUsername}", users.FriendHandler(c))
		r.Delete("/friends/{friendUsername}", users.UnfriendHandler(c))
		r.Get("/friends", users.GetFriendsHandler(c))

		r.Post("/friends/request/{friendUsername}", users.SendFriendRequestHandler(c))
		r.Post("/friends/request/{friendUsername}/accept", users.AcceptFriendRequestHandler(c))
		r.Post("/friends/request/{friendUsername}/decline", users.DeclineFriendRequestHandler(c))
		r.Get("/friends/requests", users.GetFriendRequestHandler(c))

		r.Get("/users/{username}", users.GetUserProfileHandler(c))

		r.Post("/uploads/avatar/{fileName}", users.UploadAvatarHandler(c))

		r.Get("/ws/presence", wshandler.CheckPresence(c))

		r.Put("/user/id/{userID}", users.UpdateUserHandler(c))
		r.Delete("/user/id/{userID}", users.DeleteUserHandler(c))

		r.Get("/api-keys", users.ListAPIKeysHandler(c))
		r.Post("/api-keys", users.CreateAPIKeyHandler(c))
		r.Delete("/api-keys/{keyID}", users.RevokeAPIKeyHandler(c))

		r.Get("/board/{boardName}/ismod", boards.IsModHandler(c))

		r.Put("/user/{username}/password", users.ChangePasswordHandler(c))

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardAdmin(c))
			r.Delete("/board/{boardID}", boards.DeleteBoardHandler(c))
			r.Post("/board/{boardID}/mod/{username}", boards.AddModHandler(c))
			r.Delete("/board/{boardID}/mod/{username}", boards.RemoveModHandler(c))
		})

		r.Group(func(r chi.Router) {
			r.Use(AppMiddleware.RequireBoardMod(c))
			r.Put("/board/{boardID}", boards.UpdateBoardHandler(c))
			r.Delete("/board/{boardID}/post/{postID}", boards.DeletePostHandler(c))
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
