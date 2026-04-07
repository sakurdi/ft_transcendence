FROM hashicorp/vault:1.21

RUN apk add --no-cache openssl

COPY init.sh /vault/init.sh
RUN chmod +x /vault/init.sh

CMD ["sh", "-c", "vault server -dev & sleep 2 && sh /vault/init.sh && wait"]