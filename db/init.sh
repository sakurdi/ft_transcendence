#!/bin/bash
set -e

echo "Database: init script running"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (login, password, email) VALUES
    ('saal-kur', 'fjgCbJasuSfnpEGTR1P4LeWmL7oBWubQu3XzFsM8ral8TtYfd30Ia', 'saal-kur@goat.com'),
    ('gaeudes', 'fjgCbJasuSfnpEGTR1P4LeWmL7oBWubQu3XzFsM8ral8TtYfd30Ia', 'gaeudes@petitgoat.com'),
    ('kevwang', 'fjgCbJasuSfnpEGTR1P4LeWmL7oBWubQu3XzFsM8ral8TtYfd30Ia', 'kevwang@midgoat.com')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_name ON users(login);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    data BYTEA NOT NULL,
    expiry TIMESTAMPTZ NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expiry);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

EOSQL

echo "Database: init complete"