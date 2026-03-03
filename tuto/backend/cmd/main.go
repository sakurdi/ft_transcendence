
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	// "github.com/go-chi/chi/v5"
	// "github.com/go-chi/chi/v5/middleware"
	// "github.com/go-chi/cors"
	"github.com/jackc/pgx/v5"
	"github.com/gorilla/websocket"
)

type Message struct {
    ID        int       `json:"id"`
    Username  string    `json:"username"`
    Content   string    `json:"content"`
    CreatedAt time.Time `json:"created_at"`
}

var clients	= make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)
var conn *pgx.Conn



func connectToDB() (*pgx.Conn, error) {
	dsn := os.Getenv("DB_URL")
	conn, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		return nil, err
	}
	return conn, nil
}

func queryData(conn *pgx.Conn) {
    rows, err := conn.Query(context.Background(), "SELECT * FROM chat_messages")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    for rows.Next() {
        var id int
        var name string
		var content string
		var createdAt time.Time
        err := rows.Scan(&id, &name, &content, &createdAt)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Printf("Message ID: %d, Name: %s, Content: %s, Created At: %s\n",
								id, name, content, createdAt.Format(time.RFC3339))
    }
}

var upgrader = websocket.Upgrader {
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func getHistoryMessage(w http.ResponseWriter, r *http.Request) {
	rows, err := conn.Query(context.Background(), "SELECT id, username, content FROM chat_messages ORDER BY id ASC LIMIT 50")
	// rows, err := conn.Query(context.Background(), "SELECT * FROM chat_messages LIMIT 50")
	fmt.Printf("testgethistory\n")
	if err != nil {
		http.Error(w, "ERROR READING DB", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	messages := []Message{}

	for rows.Next() {
		var m Message
		err := rows.Scan(&m.ID, &m.Username, &m.Content)
		if err != nil {
			log.Printf("ERROR SCAN: %v", err)
			continue
		}
		messages = append(messages, m)
	}

	w.Header().Set("Content-Type", "application/json")
	
	json.NewEncoder(w).Encode(messages)
	fmt.Printf("testhistory===fin\n")
}


func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to chat room\n")
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("=====test handle connections=====\n")
	ws, err := upgrader.Upgrade(w, r, nil)
	if (err != nil) {
		fmt.Println("Upgrade")
		fmt.Println(err)
		return
	}
	defer ws.Close()

	clients[ws] = true

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		fmt.Printf("testoui\n")
		if err != nil {
			fmt.Println("read:")
			fmt.Println(err)
			delete(clients, ws)
			return
		}
		msg.CreatedAt = time.Now()

		if msg.Username == "" || msg.Content == "" {
			http.Error(w, "USERNAME OR CONTENT EMPTY", http.StatusBadRequest)
			return
		}

		_, err = conn.Exec(context.Background(), "INSERT INTO chat_messages (username, content) VALUES ($1, $2)", msg.Username, msg.Content)
		if err != nil {
			log.Printf("INSERT ERROR : %v", err)
			http.Error(w, "CANT SAVE MESSAGE", http.StatusInternalServerError)
			return
		}
		broadcast <- msg
	}
}

func handleMessages() {
	fmt.Printf("=====test handle message=====\n")
	for {
		msg := <-broadcast

		for client := range clients {
			err := client.WriteJSON(msg)
			fmt.Printf("write handleMessage")
			if err != nil {
				fmt.Println("write:")
				fmt.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        next.ServeHTTP(w, r)
    })
}


func main() {
    fmt.Println("==================HELLO FROM BACKEND!==================")

	conn_, err := connectToDB()
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}
	conn = conn_
	defer conn_.Close(context.Background())

	// http.HandleFunc("/", homePage)
	// http.HandleFunc("/messages", getHistoryMessage)
	// http.HandleFunc("/ws", handleConnections)
	http.Handle("/", corsMiddleware(http.HandlerFunc(homePage)))
    http.Handle("/messages", corsMiddleware(http.HandlerFunc(getHistoryMessage)))
    http.Handle("/ws", corsMiddleware(http.HandlerFunc(handleConnections)))

	go handleMessages()

	fmt.Println("Server started")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("listenandserve:", err)
	}

	// r := chi.NewRouter()
	// r.Use(middleware.Logger)

	// r.Use(cors.Handler(cors.Options{
	// 	AllowedOrigins:   []string{"http://localhost:5173"},
	// 	AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
	// 	AllowedHeaders:   []string{"Accept", "Content-Type"},
	// }))

	// r.Get("/messages", func(w http.ResponseWriter, req *http.Request) {
	// 	rows, err := conn.Query(context.Background(), "SELECT id, username, content FROM chat_messages ORDER BY id DESC LIMIT 50")
	// 	// rows, err := conn.Query(context.Background(), "SELECT * FROM chat_messages LIMIT 50")
	// 	if err != nil {
	// 		http.Error(w, "ERROR READING DB", http.StatusInternalServerError)
	// 		return
	// 	}
	// 	defer rows.Close()

	// 	messages := []Message{}

	// 	for rows.Next() {
	// 		var m Message
	// 		err := rows.Scan(&m.ID, &m.Username, &m.Content)
	// 		if err != nil {
	// 			log.Printf("ERROR SCAN: %v", err)
	// 			continue
	// 		}
	// 		messages = append(messages, m)
	// 	}

	// 	w.Header().Set("Content-Type", "application/json")
		
	// 	json.NewEncoder(w).Encode(messages)
	// })

	// r.Post("/messages", func(w http.ResponseWriter, req *http.Request) {
	// 	var msg Message

	// 	err := json.NewDecoder(req.Body).Decode(&msg)
	// 	if err != nil {
	// 		http.Error(w, "Format JSON invalide", http.StatusBadRequest)
	// 		return
	// 	}

	// 	if msg.Username == "" || msg.Content == "" {
	// 		http.Error(w, "L'utilisateur ou le message est vide", http.StatusBadRequest)
	// 		return
	// 	}

	// 	_, err = conn.Exec(context.Background(), "INSERT INTO chat_messages (username, content) VALUES ($1, $2)", msg.Username, msg.Content)
	// 	if err != nil {
	// 		log.Printf("Erreur d'insertion : %v", err)
	// 		http.Error(w, "Impossible de sauvegarder le message", http.StatusInternalServerError)
	// 		return
	// 	}

	// 	w.WriteHeader(http.StatusCreated)
	// 	json.NewEncoder(w).Encode(map[string]string{"status": "Message enregistré !"})
	// })

	// queryData(conn)

	
}
