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

CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_moderators (
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (board_id, user_id)
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255),          -- only for thread-opening posts
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES posts(id) ON DELETE CASCADE, -- NULL = thread OP, set = reply
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);


EOSQL

echo "Database: init complete"