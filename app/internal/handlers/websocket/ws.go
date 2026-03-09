package wshandler

import (
	"encoding/json"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/middleware"
	"ft_transcendence/internal/models"
	// "ft_transcendence/internal/handlers"
	store "ft_transcendence/internal/store"
	"ft_transcendence/internal/ws"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func BoardSocket(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardID, _ := strconv.Atoi(chi.URLParam(r, "boardID"))
		c.Hub.Serve(w, r, ws.BoardRoom(boardID), nil, nil, nil)
	}
}

func ThreadSocket(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		postID, _ := strconv.Atoi(chi.URLParam(r, "postID"))
		c.Hub.Serve(w, r, ws.ThreadRoom(postID), nil, nil, nil)
	}
}

func CheckPresence(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		senderID := middleware.GetUserID(c, r)
		senderUsername, _ := store.GetUserLogin(c.DB, r.Context(), senderID)
		// recipientUsername := chi.URLParam(r, "username")
		// recipientID, _ := store.GetUserID(c.DB, r.Context(), recipientUsername)
		// log.Printf("dm: senderID=%d recipientID=%d", senderID, recipientID)
		// room := ws.DMRoom(senderID, recipientID)
		room := "global"

		onConnect := func(conn *ws.Conn) {
			c.Hub.Broadcast(room, ws.Event{Type: "connection", Data: "isonline", User: senderUsername})
		}

		onDisconnect := func(conn *ws.Conn) {
			c.Hub.Broadcast(room, ws.Event{Type: "connection", Data: "isoffline", User: senderUsername})
		}

		c.Hub.Serve(w, r, room, onConnect, nil, onDisconnect)
	}
}

func DMSocket(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		senderID := middleware.GetUserID(c, r)
		recipientUsername := chi.URLParam(r, "username")
		recipientID, _ := store.GetUserID(c.DB, r.Context(), recipientUsername)
		log.Printf("dm: senderID=%d recipientID=%d", senderID, recipientID)
		room := ws.DMRoom(senderID, recipientID)

		onConnect := func(conn *ws.Conn) {
			history, err := store.GetMessages(c.DB, r.Context(), senderID, recipientID, 50)
			if err != nil {
				log.Printf("dm: history error: %v", err)
				return
			}
			data, _ := json.Marshal(ws.Event{Type: "history", Data: history})
			conn.Write(data)
		}

		onMessage := func(conn *ws.Conn, data []byte) {
			var incoming struct {
				Type    string `json:"type"`
				Content string `json:"content"`
			}
			if err := json.Unmarshal(data, &incoming); err != nil {
				return
			}

			if incoming.Type == "typing" {
				c.Hub.Broadcast(room, ws.Event{Type: "typing", Data: "is typing..."})
				return
			}

			msg, err := store.SaveMessage(c.DB, r.Context(), models.DMMessage{
				SenderID:    senderID,
				RecipientID: recipientID,
				Content:     incoming.Content,
			})
			if err != nil {
				return
			}

			c.Hub.Broadcast(room, ws.Event{Type: "new_message", Data: msg})
		}

		c.Hub.Serve(w, r, room, onConnect, onMessage, nil)
	}
}
