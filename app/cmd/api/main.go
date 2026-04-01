package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"ft_transcendence/internal/config"
	"ft_transcendence/internal/vault"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {

	secrets, err := vault.LoadSecrets()
	if err != nil {
		log.Fatalf("failed to load secrets: %v", err)
	}
	log.Printf("vault: db_password length=%d", len(secrets.DBPassword))

	connStr := fmt.Sprintf(
		"postgres://user:%s@db:5432/appdb?sslmode=disable",
		secrets.DBPassword,
	)

	conn, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}
	if err := conn.Ping(context.Background()); err != nil {
		log.Fatalf("failed to ping db: %v", err)
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
