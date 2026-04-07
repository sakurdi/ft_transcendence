#!/bin/sh

export VAULT_ADDR="http://vault:8200"

exists=$(vault kv get -field=db_password secret/ft_transcendence 2>/dev/null)
if [ -n "$exists" ]; then
    exit 0
fi

DB_PASSWORD=$(openssl rand -hex 32)

vault kv put secret/ft_transcendence \
    db_password="$DB_PASSWORD"

echo "$DB_PASSWORD" > /vault/secrets/db_password

echo "Le coffre est coffré"