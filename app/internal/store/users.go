package store

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5/pgxpool"

	"ft_transcendence/internal/models"
    "ft_transcendence/internal/auth"
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

func CheckDuplicateCreds(db *pgxpool.Pool, ctx context.Context, user models.UserLogin) (bool, error){

	query := "SELECT EXISTS (SELECT 1 FROM users WHERE login = $1 OR email = $2);"
	var res bool
	err := db.QueryRow(ctx, query, user.Login, user.Mail).Scan(&res)

	return res, err
}

func RegisterUser(db *pgxpool.Pool, ctx context.Context, user models.UserRegistration) error {
	query := "INSERT INTO users (login, email, password) VALUES ($1, $2, $3);"
	passwordHash, err = auth.HashPassword(user.Password)

	if(err != nil){
		return fmt.Errorf("Hashing failed: %w", err)
	}
	_, err := db.Exec(ctx, query, user.Login, user.Mail, passwordHash)
	return err
}