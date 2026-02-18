package store

import (
	"context"
	"ft_transcendence/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateBoard(db *pgxpool.Pool, ctx context.Context, board models.BoardCreate, ownerID int) (int, error) {
	var id int
	err := db.QueryRow(ctx,
		"INSERT INTO boards (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id",
		board.Name, board.Description, ownerID,
	).Scan(&id)
	return id, err
}

func GetBoard(db *pgxpool.Pool, ctx context.Context, name string) (models.Board, error) {
	var b models.Board
	err := db.QueryRow(ctx,
		"SELECT id, name, description, owner_id, created_at FROM boards WHERE name=$1",
		name,
	).Scan(&b.ID, &b.Name, &b.Description, &b.OwnerID, &b.CreatedAt)
	return b, err
}
