package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/jackc/pgx/v5"
)

func main() {

	conn, err := pgx.Connect(context.Background(), os.Getenv("DB_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(context.Background())

	if err := conn.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/test/{id}", testHandler(conn))

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func testHandler(db *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")

		var login string
		err := db.QueryRow(context.Background(), "SELECT login FROM users WHERE id=$1", idStr).Scan(&login)

		if err != nil {
			log.Printf("SQL request failed: %v\n", err)
			fmt.Fprintf(w, "error: no user with the given ID found")
		} else {
			fmt.Fprintf(w, "login: %v", login)
		}
	}
}
