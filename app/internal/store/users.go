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
	err := db.QueryRow(ctx,
		"SELECT id, login, email, role, created_at FROM users WHERE login=$1",
		login,
	).Scan(&userInfo.ID, &userInfo.Login, &userInfo.Email, &userInfo.Role, &userInfo.Creation_date)
	return userInfo, err
}

func EditUserInfo(db *pgxpool.Pool, ctx context.Context, userID int, input models.UserEdit) error {
	_, err := db.Exec(ctx, `
        UPDATE users SET
            login    = COALESCE(NULLIF($1, ''), login),
            email    = COALESCE(NULLIF($2, ''), email),
            password = COALESCE(NULLIF($3, ''), password)
        WHERE id=$4`,
		input.Login, input.Email, input.Password, userID,
	)
	return err
}

func GetUserRole(db *pgxpool.Pool, ctx context.Context, userID int) (string, error) {
	var role string
	err := db.QueryRow(ctx,
		"SELECT role FROM users WHERE id=$1",
		userID,
	).Scan(&role)
	return role, err
}

func GetUserByID(db *pgxpool.Pool, ctx context.Context, userID int) (models.UserProfile, error) {
	var u models.UserProfile
	err := db.QueryRow(ctx,
		"SELECT id, login, role, created_at FROM users WHERE id=$1",
		userID,
	).Scan(&u.ID, &u.Login, &u.Role, &u.Creation_date)
	return u, err
}

func DeleteUser(db *pgxpool.Pool, ctx context.Context, userID int) error {
	_, err := db.Exec(ctx, "DELETE FROM users WHERE id=$1", userID)
	return err
}

func GetAllUsers(db *pgxpool.Pool, ctx context.Context) ([]models.UserProfile, error) {
	rows, err := db.Query(ctx, "SELECT id, login, role, created_at FROM users ORDER BY created_at ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []models.UserProfile{}
	for rows.Next() {
		var u models.UserProfile
		if err := rows.Scan(&u.ID, &u.Login, &u.Role, &u.Creation_date); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func SetUserRole(db *pgxpool.Pool, ctx context.Context, userID int, role string) error {
	_, err := db.Exec(ctx, "UPDATE users SET role=$1 WHERE id=$2", role, userID)
	return err
}

func UpdatePassword(db *pgxpool.Pool, ctx context.Context, userID int, new string) error {
	_, err := db.Exec(ctx, "UPDATE users SET password=$1 WHERE id=$2", new, userID)
	return err
}
