package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	db, err := sql.Open("postgres", os.Getenv("DB_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT login FROM users")
		if err != nil {
			http.Error(w, "Database error", 500)
			return
		}
		defer rows.Close()

		fmt.Fprintf(w, "<html><body><h1>Users</h1><ul>")
		for rows.Next() {
    		var login string
    		if err := rows.Scan(&login); err != nil {
        		http.Error(w, err.Error(), 500)
        		return
    		}
    	fmt.Fprintf(w, "<li>%s</li>", login)
}

		fmt.Fprintf(w, "</ul></body></html>")
	})

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
