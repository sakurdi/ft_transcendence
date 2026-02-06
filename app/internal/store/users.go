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
