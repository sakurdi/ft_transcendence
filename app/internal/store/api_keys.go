package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"ft_transcendence/internal/models"
)

func CreateAPIKey(db *pgxpool.Pool, ctx context.Context, userID int, name, prefix, hash string) (int, error) {
	var id int
	err := db.QueryRow(ctx,
		"INSERT INTO api_keys (user_id, name, key_prefix, key_hash) VALUES ($1, $2, $3, $4) RETURNING id",
		userID, name, prefix, hash,
	).Scan(&id)
	return id, err
}

func ListAPIKeys(db *pgxpool.Pool, ctx context.Context, userID int) ([]models.APIKey, error) {
	rows, err := db.Query(ctx,
		"SELECT id, user_id, name, key_prefix, created_at, last_used_at, revoked_at FROM api_keys WHERE user_id=$1 AND revoked_at IS NULL ORDER BY created_at DESC",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []models.APIKey
	for rows.Next() {
		var k models.APIKey
		if err := rows.Scan(&k.ID, &k.UserID, &k.Name, &k.KeyPrefix, &k.CreatedAt, &k.LastUsedAt, &k.RevokedAt); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

func RevokeAPIKey(db *pgxpool.Pool, ctx context.Context, userID, keyID int) error {
	_, err := db.Exec(ctx,
		"UPDATE api_keys SET revoked_at = NOW() WHERE id=$1 AND user_id=$2",
		keyID, userID,
	)
	return err
}

func FindUserByAPIKey(db *pgxpool.Pool, ctx context.Context, hash string) (int, error) {
	var userID int
	err := db.QueryRow(ctx,
		"SELECT user_id FROM api_keys WHERE key_hash=$1 AND revoked_at IS NULL",
		hash,
	).Scan(&userID)
	return userID, err
}

func UpdateAPIKeyLastUsed(db *pgxpool.Pool, ctx context.Context, hash string) error {
	_, err := db.Exec(ctx,
		"UPDATE api_keys SET last_used_at = NOW() WHERE key_hash=$1",
		hash,
	)
	return err
}
