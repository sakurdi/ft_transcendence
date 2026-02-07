package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetUserLogin(db *pgxpool.Pool, ctx context.Context, id string) (string, error) {
	var login string
	query := "SELECT login FROM users WHERE id=$1"
	err := db.QueryRow(ctx, query, id).Scan(&login)
	return login, err
}

func GetUserPassword(db *pgxpool.Pool, ctx context.Context, login string) (string, error) {
	var password string
	query := "SELECT password FROM users WHERE login=$1"
	err := db.QueryRow(ctx, query, login).Scan(&password)
	return password, err

}

func GetUserId(db *pgxpool.Pool, ctx context.Context, login string) (string, error) {
	var id string
	query := "SELECT id FROM users WHERE login=$1"
	err := db.QueryRow(ctx, query, login).Scan(&id)
	return id, err
}
