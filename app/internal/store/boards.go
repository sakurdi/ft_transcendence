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

func IsBoardAdmin(db *pgxpool.Pool, ctx context.Context, boardID, userID int) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM boards WHERE id=$1 AND owner_id=$2)",
		boardID, userID,
	).Scan(&exists)
	return exists, err
}

func IsBoardMod(db *pgxpool.Pool, ctx context.Context, boardID, userID int) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM boards WHERE id=$1 AND owner_id=$2
			UNION
			SELECT 1 FROM board_moderators WHERE board_id=$1 AND user_id=$2
		)`, boardID, userID,
	).Scan(&exists)
	return exists, err
}

func AddModerator(db *pgxpool.Pool, ctx context.Context, boardID, userID int) error {
	_, err := db.Exec(ctx,
		"INSERT INTO board_moderators (board_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
		boardID, userID,
	)
	return err
}

func RemoveModerator(db *pgxpool.Pool, ctx context.Context, boardID, userID int) error {
	_, err := db.Exec(ctx,
		"DELETE FROM board_moderators WHERE board_id=$1 AND user_id=$2",
		boardID, userID,
	)
	return err
}
