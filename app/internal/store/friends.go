package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"ft_transcendence/internal/models"
)

func AddFriend(db *pgxpool.Pool, ctx context.Context, userID, friendID int) error {

	_, err := db.Exec(ctx,
		"INSERT INTO friend_list (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
		userID, friendID,
	)
	return err
}

func DeleteFriend(db *pgxpool.Pool, ctx context.Context, userID, friendID int) error {
	_, err := db.Exec(ctx,
        `DELETE FROM friend_list 
         WHERE (user_id=$1 AND friend_id=$2) 
         OR    (user_id=$2 AND friend_id=$1)`,
        userID, friendID,
    )
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx,
		`DELETE FROM friend_requests 
		 WHERE (from_user_id=$1 AND to_user_id=$2) 
		 OR    (from_user_id=$2 AND to_user_id=$1)`,
		userID, friendID,
	)
	return err
}

func GetFriends(db *pgxpool.Pool, ctx context.Context, userID int) ([]models.Friend, error) {
	rows, err := db.Query(ctx,
		`SELECT u.id, u.login
		 FROM users u
		 JOIN friend_list f ON u.id = f.friend_id
		 WHERE f.user_id = $1`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var friends []models.Friend
	for rows.Next() {
		var friend models.Friend
		if err := rows.Scan(&friend.ID, &friend.Username); err != nil {
			return nil, err
		}
		friends = append(friends, friend)
	}
	return friends, rows.Err()
}

func SendFriendRequest(db *pgxpool.Pool, ctx context.Context, fromUserID, toUserID int) error {
	
	var exist bool;
	err := db.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM friend_requests
							WHERE (from_user_id=$1 AND to_user_id=$2) 
			   				OR (from_user_id=$2 AND to_user_id=$1))`, fromUserID, toUserID,
	).Scan(&exist)
	if err != nil {
		return err
	}
	if exist {
		return nil
	}

	var status string;
	err = db.QueryRow(ctx,
		`SELECT status FROM friend_requests 
		 WHERE (from_user_id=$1 AND to_user_id=$2) 
		 OR    (from_user_id=$2 AND to_user_id=$1)`, fromUserID, toUserID,
	).Scan(&status)
	if err == nil && status == "accepted" {
		return AddFriend(db, ctx, fromUserID, toUserID)
	}


	_, err = db.Exec(ctx,
		"INSERT INTO friend_requests (from_user_id, to_user_id, status) VALUES ($1, $2, 'pending') ON CONFLICT DO NOTHING",
		fromUserID, toUserID,
	)
	return err
}

func AcceptFriendRequest(db *pgxpool.Pool, ctx context.Context, userID, friendID int) error {
	var fromUserID, toUserID int
	err := db.QueryRow(ctx,
		"SELECT from_user_id, to_user_id FROM friend_requests WHERE from_user_id=$1 AND to_user_id=$2 AND status='pending'",
		friendID, userID,
	).Scan(&fromUserID, &toUserID)
	if err != nil {
		return err
	}

	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx,
		"UPDATE friend_requests SET status='accepted' WHERE from_user_id=$1 AND to_user_id=$2 AND status='pending'",
		fromUserID, toUserID,
	); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx,
		"INSERT INTO friend_list (user_id, friend_id) VALUES ($1, $2), ($2, $1) ON CONFLICT DO NOTHING",
		fromUserID, toUserID,
	); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func DeclineFriendRequest(db *pgxpool.Pool, ctx context.Context, userID, friendID int) error {
	result, err := db.Exec(ctx,
		"UPDATE friend_requests SET status='rejected' WHERE from_user_id=$1 AND to_user_id=$2 AND status='pending'",
		friendID, userID,
	)
	if err != nil {
		fmt.Println("dodo")
		return err
	}
	if result.RowsAffected() == 0 {
		fmt.Println("1234")
		return fmt.Errorf("no pending request found")
	}
	return nil
}

func GetUsernameFromDB(db *pgxpool.Pool, ctx context.Context, userID int) string {
	var username string
	err := db.QueryRow(ctx, "SELECT login FROM users WHERE id=$1", userID).Scan(&username)
	if err != nil {
		return "Unknown"
	}
	return username
}

func GetPendingFriendRequests(db *pgxpool.Pool, ctx context.Context, userID int) ([]models.FriendRequest, error) {
	rows, err := db.Query(ctx,
		"SELECT id, from_user_id FROM friend_requests WHERE to_user_id=$1 AND status='pending'",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []models.FriendRequest
	for rows.Next() {
		var req models.FriendRequest
		if err := rows.Scan(&req.ID, &req.FromUserID); err != nil {
			return nil, err
		}
		req.ToUserID = userID
		req.Status = "pending"
		req.Username = GetUsernameFromDB(db, ctx, req.FromUserID)
		requests = append(requests, req)
	}
	return requests, rows.Err()
}

func GetUserProfile(db *pgxpool.Pool, ctx context.Context, username string) (models.UserProfile, error) {
	var profile models.UserProfile
	err := db.QueryRow(ctx, "SELECT login, avatar_url FROM users WHERE login=$1", username).Scan(&profile.Username, &profile.AvatarURL)
	if err != nil {
		return models.UserProfile{}, err
	}
	return profile, nil
}

func UpdateAvatar(db *pgxpool.Pool, ctx context.Context, userID int, avatarURL string) error {
	_, err := db.Exec(ctx, "UPDATE users SET avatar_url=$1 WHERE id=$2", avatarURL, userID)
	return err
}

func GetAvatarURL(db *pgxpool.Pool, ctx context.Context, username string) string {
	var avatarURL string
	err := db.QueryRow(ctx, "SELECT avatar_url FROM users WHERE login=$1", username).Scan(&avatarURL)
	if err != nil {
		return "/api/uploads/avatars/default.jpg"
	}
	return avatarURL
}