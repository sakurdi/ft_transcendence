#!/bin/bash
set -e

# Cette commande s'exécute à l'intérieur du conteneur Postgres au démarrage
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO chat_messages (username, content) VALUES
	('Système', 'Bienvenue sur le chat ft_transcendence'),
	('gaeudes', 'archigoat'),
	('saal-kur', 'goat'),
	('kevwang', 'chevre')
	ON CONFLICT DO NOTHING;
EOSQL