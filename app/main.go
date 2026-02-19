package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

type User struct {
	ID    int    `json:"id"`
	Login string `json:"login"`
}

func main() {
	db, err := sql.Open("postgres", os.Getenv("DB_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		
		w.Header().Set("Content-Type", "application/json")

		rows, err := db.Query("SELECT id, login FROM users")
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		users := []User{}

		for rows.Next() {
			var u User
			if err := rows.Scan(&u.ID, &u.Login); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			users = append(users, u)
		}

		json.NewEncoder(w).Encode(users)
		log.Println("Got request from:", r.RemoteAddr)
	})

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
