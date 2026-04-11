help:
	@echo "make build"
	@echo "make up"
	@echo "make down"
	@echo "make restart"
	@echo "make logs"
	@echo "make clean"
	@echo "make rebuild"

build:
	docker compose build

up:
	docker compose up -d
	@echo "HTTPS: https://localhost:1043"

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

clean:
	docker compose down -v
	rm -rf data/
	@echo "Postgres data wiped"

app-rebuild:
	docker compose build app
	docker compose up -d app

rebuild: down clean build up

