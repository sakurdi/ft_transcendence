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
    ('saal-kur', '$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'saal-kur@goat.com'),
    ('gaeudes', '$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'gaeudes@petitgoat.com'),
    ('kevwang', '$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'kevwang@midgoat.com')
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
    title VARCHAR(255),          
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);


INSERT INTO boards (name, description, owner_id) VALUES
    ('42', 'horrible ecole', 1),
    ('League', 'Ligue des legendes', 1)
ON CONFLICT (name) DO NOTHING;

INSERT INTO posts (board_id, author_id, title, content) VALUES
    ((SELECT id FROM boards WHERE name = '42'), 1, 'ecole de merde', 'daube'),
    ((SELECT id FROM boards WHERE name = 'League'), 1, 'poppy', 'poppy')
ON CONFLICT DO NOTHING;

INSERT INTO posts (board_id, author_id, content, parent_id) VALUES
    (
        (SELECT id FROM boards WHERE name = '42'), 
        2, 
        'Je suis d''accord, c''est dur', 
        (SELECT id FROM posts WHERE title = 'ecole de merde' LIMIT 1)
    ),
    (
        (SELECT id FROM boards WHERE name = 'League'), 
        3, 
        'Poppy', 
        (SELECT id FROM posts WHERE title = 'poppy' LIMIT 1)
    );

EOSQL

echo "Database: init complete"