package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Event struct {
	Type string `json:"type"`
	Data any    `json:"data"`
	User string `json:"user"`
}

type Conn struct {
	ws   *websocket.Conn
	send chan []byte
	mu   sync.Mutex
}

func (c *Conn) Write(data []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.ws.SetWriteDeadline(time.Now().Add(10 * time.Second))
	if err := c.ws.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Println("ws write:", err)
	}
}

type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*Conn]struct{}
}

func NewHub() *Hub {
	return &Hub{rooms: make(map[string]map[*Conn]struct{})}
}

func (h *Hub) subscribe(room string, c *Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[room] == nil {
		h.rooms[room] = make(map[*Conn]struct{})
	}
	h.rooms[room][c] = struct{}{}
}

func (h *Hub) unsubscribe(room string, c *Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.rooms[room], c)
	if len(h.rooms[room]) == 0 {
		delete(h.rooms, room)
	}
}

func (h *Hub) Broadcast(room string, event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	for c := range h.rooms[room] {
		c.Write(data)
	}
}

func (h *Hub) HasSubscribers(room string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.rooms[room]) > 0
}

func (h *Hub) Serve(
	w http.ResponseWriter,
	r *http.Request,
	room string,
	onConnect func(c *Conn),
	onMessage func(c *Conn, data []byte),
	onDisconnect func(c *Conn),
) {
	raw, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	c := &Conn{ws: raw}
	h.subscribe(room, c)
	defer func() {
		h.unsubscribe(room, c)
		if onDisconnect != nil {
			onDisconnect(c)
		}
		raw.Close()
	}()

	if onConnect != nil {
		onConnect(c)
	}

	raw.SetReadDeadline(time.Now().Add(60 * time.Second))
	raw.SetPongHandler(func(string) error {
		raw.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// ping 30s interval
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	go func() {
		for range ticker.C {
			c.mu.Lock()
			raw.SetWriteDeadline(time.Now().Add(10 * time.Second))
			err := raw.WriteMessage(websocket.PingMessage, nil)
			c.mu.Unlock()
			if err != nil {
				return
			}
		}
	}()

	for {
		_, msg, err := raw.ReadMessage()
		if err != nil {
			break
		}
		if onMessage != nil {
			onMessage(c, msg)
		}
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}
