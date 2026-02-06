package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"ft_transcendence/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	conn, err := pgxpool.New(context.Background(), os.Getenv("DB_URL"))
	if err != nil {
		log.Fatalf("Cannot connect to database: %v", err)
	}
	defer conn.Close()

	appConfig := config.InitConfig(conn)
	mux := routes(appConfig)

	log.Println("Server running on :8080")
	srv := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
