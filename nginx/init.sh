#!/bin/sh

echo "Nginx: Checking for existing certificates"

CERT_FILE="/etc/nginx/certs/server.crt"
KEY_FILE="/etc/nginx/certs/server.key"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "Nginx: Generating certificate"
    
    apk add --no-cache openssl
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=US/ST=State/L=City/O=Org/CN=localhost"
    
    echo "Nginx: Certificate created"
else
    echo "Nginx: Certificate already exists"
fi