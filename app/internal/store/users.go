package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"ft_transcendence/internal/auth"
	"ft_transcendence/internal/models"
)

func GetUserLogin(db *pgxpool.Pool, ctx context.Context, id int) (string, error) {
	var login string
	err := db.QueryRow(ctx, "SELECT login FROM users WHERE id=$1", id).Scan(&login)
	return login, err
}

func GetUserPassword(db *pgxpool.Pool, ctx context.Context, login string) (string, error) {
	var password string
	err := db.QueryRow(ctx, "SELECT password FROM users WHERE login=$1", login).Scan(&password)
	return password, err
}

func GetUserID(db *pgxpool.Pool, ctx context.Context, login string) (int, error) {
	var id int
	err := db.QueryRow(ctx, "SELECT id FROM users WHERE login=$1", login).Scan(&id)
	return id, err
}

func CheckDuplicateCreds(db *pgxpool.Pool, ctx context.Context, user models.UserRegistration) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx,
		"SELECT EXISTS (SELECT 1 FROM users WHERE login=$1 OR email=$2)",
		user.Login, user.Mail,
	).Scan(&exists)
	return exists, err
}

func RegisterUser(db *pgxpool.Pool, ctx context.Context, user models.UserRegistration) error {
	passwordHash, err := auth.HashPassword(user.Password)
	if err != nil {
		return fmt.Errorf("hashing failed: %w", err)
	}
	_, err = db.Exec(ctx,
		"INSERT INTO users (login, email, password) VALUES ($1, $2, $3)",
		user.Login, user.Mail, passwordHash,
	)
	return err
}

func GetUserInfo(db *pgxpool.Pool, ctx context.Context, login string) (models.UserInfo, error) {
	
	var userInfo models.UserInfo
	err := db.QueryRow(ctx, "SELECT login, created_at FROM users WHERE login=$1", login).Scan(&userInfo.Login, &userInfo.Creation_date)
	return userInfo, err
}