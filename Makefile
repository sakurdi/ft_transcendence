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
	@echo "HTTP:  http://localhost"
	@echo "HTTPS: https://localhost"

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

clean:
	docker compose down -v
	rm -rf data/
	@echo "Postgres data wiped"

rebuild: clean build up
