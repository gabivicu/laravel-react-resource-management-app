.PHONY: help build up down restart logs shell composer npm migrate seed test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker-compose build

up: ## Start all containers
	docker-compose up -d

down: ## Stop all containers
	docker-compose down

restart: ## Restart all containers
	docker-compose restart

logs: ## Show logs from all containers
	docker-compose logs -f

shell: ## Open shell in app container
	docker-compose exec app bash

shell-node: ## Open shell in node container
	docker-compose exec node sh

composer: ## Run composer install
	docker-compose exec app composer install

npm: ## Run npm install
	docker-compose exec node npm install

migrate: ## Run database migrations
	docker-compose exec app php artisan migrate

migrate-fresh: ## Run fresh migrations with seeding
	docker-compose exec app php artisan migrate:fresh --seed

seed: ## Run database seeders
	docker-compose exec app php artisan db:seed

test: ## Run tests (creates test database if needed)
	@echo "Ensuring PostgreSQL is ready and test database exists..."
	@docker-compose exec -T postgres sh -c 'until pg_isready -U postgres; do sleep 1; done' 2>/dev/null || true
	@docker-compose exec -T postgres sh -c 'PGPASSWORD=postgres psql -h localhost -U postgres -d template1 -tc "SELECT 1 FROM pg_database WHERE datname = '\''resource_management_test'\''" 2>/dev/null | grep -q 1 || PGPASSWORD=postgres psql -h localhost -U postgres -d template1 -c "CREATE DATABASE resource_management_test;" 2>/dev/null' || true
	@echo "Running tests..."
	docker-compose exec -e DB_CONNECTION=pgsql -e DB_HOST=postgres -e DB_PORT=5432 -e DB_DATABASE=resource_management_test -e DB_USERNAME=postgres -e DB_PASSWORD=postgres app php artisan test

queue: ## Run queue worker
	docker-compose exec queue php artisan queue:work

cache-clear: ## Clear application cache
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

setup: build up composer npm migrate seed ## Complete setup (build, start, install deps, migrate)

prod-build: ## Build for production
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production containers
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production containers
	docker-compose -f docker-compose.prod.yml down
