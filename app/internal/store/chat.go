// internal/store/chat/chat.go
package store

import (
	"context"
	"ft_transcendence/internal/models"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SaveMessage(db *pgxpool.Pool, ctx context.Context, msg models.DMMessage) (models.DMMessage, error) {
	err := db.QueryRow(ctx, `
		INSERT INTO dm_messages (sender_id, recipient_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, sender_id, recipient_id, content, created_at`,
		msg.SenderID, msg.RecipientID, msg.Content,
	).Scan(&msg.ID, &msg.SenderID, &msg.RecipientID, &msg.Content, &msg.CreatedAt)
	return msg, err
}

func GetMessages(db *pgxpool.Pool, ctx context.Context, userA, userB, limit int) ([]models.DMMessage, error) {
	log.Printf("GetMessages: userA=%d userB=%d limit=%d", userA, userB, limit)

	msgs := []models.DMMessage{}
	rows, err := db.Query(ctx, `
        SELECT id, sender_id, recipient_id, content, created_at
        FROM dm_messages
        WHERE (sender_id=$1 AND recipient_id=$2)
           OR (sender_id=$2 AND recipient_id=$1)
        ORDER BY created_at ASC
        LIMIT $3`,
		userA, userB, limit,
	)
	if err != nil {
		log.Printf("GetMessages: query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var m models.DMMessage
		if err := rows.Scan(&m.ID, &m.SenderID, &m.RecipientID, &m.Content, &m.CreatedAt); err != nil {
			return nil, err
		}
		msgs = append(msgs, m)
	}
	log.Printf("GetMessages: found %d messages", len(msgs))
	return msgs, rows.Err()
}
