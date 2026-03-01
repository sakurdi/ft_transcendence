package config

import (
	"ft_transcendence/internal/ws"
	"net/http"
	"time"

	"github.com/alexedwards/scs/pgxstore"
	"github.com/alexedwards/scs/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	DB      *pgxpool.Pool
	Session *scs.SessionManager
	Hub     *ws.Hub
}

func InitConfig(db *pgxpool.Pool) *Config {

	sessionManager := scs.New()
	sessionManager.Store = pgxstore.New(db)
	sessionManager.Lifetime = 24 * time.Hour
	sessionManager.Cookie.Persist = true
	sessionManager.Cookie.SameSite = http.SameSiteLaxMode
	sessionManager.Cookie.Secure = true

	return &Config{
		DB:      db,
		Session: sessionManager,
		Hub:     ws.NewHub(),
	}
}
