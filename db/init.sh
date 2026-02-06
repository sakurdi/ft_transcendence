#!/bin/bash
set -e

echo "Database: init script running"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (login) VALUES
    ('saal-kur'),
    ('gaeudes'),
    ('kevwang')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_name ON users(login);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    data BYTEA NOT NULL,
    expiry TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expiry);

EOSQL

echo "Database: init complete"
