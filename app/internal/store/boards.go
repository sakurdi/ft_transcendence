package store

import (
	"context"
	"ft_transcendence/internal/models"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"

	"net/url"
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

func UpdateBoard(db *pgxpool.Pool, ctx context.Context, boardID int, board models.BoardCreate) error {
	_, err := db.Exec(ctx,
		"UPDATE boards SET name=$1, description=$2 WHERE id=$3",
		board.Name, board.Description, boardID,
	)
	return err
}

func DeleteBoard(db *pgxpool.Pool, ctx context.Context, boardID int) error {
	_, err := db.Exec(ctx, "DELETE FROM boards WHERE id=$1", boardID)
	return err
}

func GetBoardTeam(db *pgxpool.Pool, ctx context.Context, boardID int) ([]models.BoardRole, error) {
	rows, err := db.Query(ctx, `
		SELECT u.login,
			CASE
				WHEN b.owner_id = u.id THEN 'admin'
				ELSE 'moderator'
			END as role
		FROM boards b
		JOIN users u ON u.id = b.owner_id
		WHERE b.id = $1

		UNION

		SELECT u.login, 'moderator' as role
		FROM board_moderators bm
		JOIN users u ON u.id = bm.user_id
		WHERE bm.board_id = $1

		ORDER BY role ASC`,
		boardID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := []models.BoardRole{}
	for rows.Next() {
		var m models.BoardRole
		if err := rows.Scan(&m.Username, &m.Role); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, rows.Err()
}


func GetBoardList(db *pgxpool.Pool, ctx context.Context, query url.Values) (models.BoardData, error) {
	page := 1
	if p := query.Get("page"); p != "" {
		parsedPage, err := strconv.Atoi(p)
		if err == nil && parsedPage > 0 {
			page = parsedPage
		}
	}

	limit := 10
	if l := query.Get("limit"); l != "" {
		parsedLimit, err := strconv.Atoi(l)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}
	if limit > 100 {
		limit = 100
	}

	sortField := "created_at"
	sort := query.Get("sort")
	if sort == "name" || sort == "id" || sort == "created_at" {
		sortField = sort
	}

	order := "asc"
	if query.Get("order") == "desc" {
		order = "desc"
	}

	name := query.Get("name")
	offset := (page - 1) * limit

	totalResult := 0
	err := db.QueryRow(ctx,
		"SELECT COUNT(*) FROM boards WHERE name ILIKE '%' || $1 || '%'",
		name,
	).Scan(&totalResult)
	if err != nil {
		return models.BoardData{}, err
	}

	sql := `SELECT id, name, description, owner_id, created_at
		FROM boards
		WHERE name ILIKE '%' || $1 || '%'
		ORDER BY
			CASE WHEN $4 = 'id' AND $5 = 'asc' THEN id END ASC,
			CASE WHEN $4 = 'id' AND $5 = 'desc' THEN id END DESC,
			CASE WHEN $4 = 'name' AND $5 = 'asc' THEN name END ASC,
			CASE WHEN $4 = 'name' AND $5 = 'desc' THEN name END DESC,
			CASE WHEN $4 = 'created_at' AND $5 = 'asc' THEN created_at END ASC,
			CASE WHEN $4 = 'created_at' AND $5 = 'desc' THEN created_at END DESC
		LIMIT $2 OFFSET $3`
	rows, err := db.Query(ctx, sql, name, limit, offset, sortField, order)
	if err != nil {
		return models.BoardData{}, err
	}
	defer rows.Close()

	boardsList := []models.Board{}
	for rows.Next() {
		var board models.Board
		if err := rows.Scan(&board.ID, &board.Name, &board.Description, &board.OwnerID, &board.CreatedAt); err != nil {
			return models.BoardData{}, err
		}
		boardsList = append(boardsList, board)
	}

	boardData := models.BoardData{
		BoardList:   boardsList,
		TotalResult: totalResult,
	}

	// return boardsList, rows.Err()
	return boardData, rows.Err()
}