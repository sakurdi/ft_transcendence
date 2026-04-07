#!/bin/bash
set -e

echo "Database: init script running"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'EOSQL'

-- CITEXT extension
CREATE EXTENSION IF NOT EXISTS citext;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('superadmin', 'user', 'banned')),
	avatar_url VARCHAR(255) DEFAULT '/api/uploads/avatars/default.jpg',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (login, password, email, role) VALUES
    ('saal-kur','$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'saal-kur@goat.com', 'superadmin'),
    ('gaeudes', '$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'gaeudes@petitgoat.com', 'superadmin'),
    ('kevwang', '$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'kevwang@midgoat.com', 'superadmin'),
    ('peon', '$2a$12$i9shXAGfRac6qgTuKXkpnuRJk7WLcjSb6CG5ove1Ze8dSCst.av9K', 'bonjour@bonjour.com', 'user')

ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_name ON users(login);

-- =========================
-- SESSIONS
-- =========================
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    data BYTEA NOT NULL,
    expiry TIMESTAMPTZ NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expiry);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

-- =========================
-- BOARDS
-- =========================
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name CITEXT UNIQUE NOT NULL CHECK (char_length(name) <= 50),
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_moderators (
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_board_moderators_board ON board_moderators(board_id);
CREATE INDEX IF NOT EXISTS idx_board_moderators_user ON board_moderators(user_id);

INSERT INTO boards (name, description, owner_id) VALUES
    ('42', 'horrible ecole', (SELECT id FROM users WHERE login = 'saal-kur')),
    ('League', 'Ligue des legendes', (SELECT id FROM users WHERE login = 'saal-kur'))

ON CONFLICT (name) DO NOTHING;

INSERT INTO boards (name, description, owner_id)
SELECT
    format('BOARD_TEST_%s', i),
    format('Board_testing_%s', i),
    u.id
FROM generate_series(1, 100) AS i
JOIN users u ON u.login = 'kevwang'
ON CONFLICT (name) DO NOTHING;


-- =========================
-- POSTS
-- =========================
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

CREATE TABLE dm_messages (
    id           SERIAL PRIMARY KEY,
    sender_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content      TEXT NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dm_conversation ON dm_messages (
    LEAST(sender_id, recipient_id),
    GREATEST(sender_id, recipient_id),
    created_at DESC
);

CREATE TABLE IF NOT EXISTS friend_list (
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	PRIMARY KEY(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_list ON friend_list(user_id);

INSERT INTO friend_list (user_id, friend_id) VALUES
	(1, 2)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS friend_requests (
	id SERIAL PRIMARY KEY,
	from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
	created_at TIMESTAMP DEFAULT NOW(),
	UNIQUE(from_user_id, to_user_id)
);

INSERT INTO posts (board_id, author_id, title, content)
SELECT 
    b.id,
    u.id,
    'nouveau cursus?',
    'daube'
FROM boards b
JOIN users u ON u.login = 'saal-kur'
WHERE b.name = '42'
ON CONFLICT DO NOTHING;

INSERT INTO posts (board_id, author_id, title, content)
SELECT 
    b.id,
    u.id,
    'poppy',
    'poppy'
FROM boards b
JOIN users u ON u.login = 'saal-kur'
WHERE b.name = 'League'
ON CONFLICT DO NOTHING;

INSERT INTO posts (board_id, author_id, content, parent_id)
SELECT
    b.id,
    u.id,
    'Je suis d''accord, c''est dur',
    p.id
FROM boards b
JOIN users u ON u.login = 'gaeudes'
JOIN posts p ON p.title = 'ecole de merde'
WHERE b.name = '42'
ON CONFLICT DO NOTHING;

INSERT INTO posts (board_id, author_id, content, parent_id)
SELECT
    b.id,
    u.id,
    'Poppy',
    p.id
FROM boards b
JOIN users u ON u.login = 'gaeudes'
JOIN posts p ON p.title = 'poppy'
WHERE b.name = 'League'
ON CONFLICT DO NOTHING;

INSERT INTO posts (board_id, author_id, title, content)
SELECT
        b.id,
        u.id,
        'POST_TEMP_TEST',
        format('Temp post test for %s', b.name)
FROM boards b
JOIN users u ON u.login = 'kevwang'
WHERE b.name LIKE 'BOARD_TEST_%'
    AND NOT EXISTS (
            SELECT 1
            FROM posts p
            WHERE p.board_id = b.id
                AND p.title = 'POST_TEMP_TEST'
    );

INSERT INTO posts (board_id, author_id, content, parent_id)
SELECT
        b.id,
        r.id,
        format('Temp rep test for %s', b.name),
        p.id
FROM boards b
JOIN users r ON r.login = 'gaeudes'
JOIN posts p ON p.board_id = b.id
WHERE b.name LIKE 'BOARD_TEST_%'
    AND p.title = 'POST_TEMP_TEST'
    AND NOT EXISTS (
            SELECT 1
            FROM posts rp
            WHERE rp.parent_id = p.id
    );




EOSQL

echo "Database: init complete"
