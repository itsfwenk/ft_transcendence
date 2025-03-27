all: up

up: build
	docker compose -f docker-compose.yml up

down:
	docker compose -f docker-compose.yml down

stop:
	docker compose -f docker-compose.yml stop

start:
	docker compose -f docker-compose.yml start

build:
	docker compose -f docker-compose.yml build

install-deps:
	@echo "Installation des dépendances pour user..."
	cd backend/services/user && npm install
	@echo "Installation des dépendances pour game..."
	cd backend/services/game && npm install
	@echo "Installation des dépendances pour matchmaking..."
	cd backend/services/matchmaking && npm install
	@echo "Installation des dépendances pour gateway..."
	cd backend/gateway && npm install
	@echo "Installation des dépendances pour frontend..."
	cd frontend && npm install

clean:
	@docker stop $$(docker ps -qa) || true
	@docker rm $$(docker ps -qa) || true
	@docker rmi -f $$(docker images -qa) || true
	@docker network prune -f || true
	@docker system prune -a --volumes -f

re: clean rm-db up

rm-db:
	rm ./backend/db/games.db ./backend/db/users.db ./backend/db/matchmaking.db

prune: clean rm-db
	@docker system prune -a --volumes -f