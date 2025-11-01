.PHONY: help build up down restart logs clean rebuild test shell

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker compose build

up: ## Start the application in detached mode
	docker compose up -d
	@echo "Application is running at http://localhost:3002"

down: ## Stop the application
	docker compose down

restart: ## Restart the application
	docker compose restart

logs: ## Show application logs
	docker compose logs -f

clean: ## Stop and remove containers, networks, and volumes
	docker compose down -v
	rm -f data/*.db

rebuild: ## Rebuild and restart the application
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "Application rebuilt and running at http://localhost:3002"

test: ## Run tests locally (not in Docker)
	npm test

shell: ## Open a shell in the running container
	docker compose exec sport-calendar-api sh

dev: ## Run in development mode with logs
	docker compose up
