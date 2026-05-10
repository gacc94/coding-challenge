.PHONY: help up up-prod down build test-go test-node test-frontend test-all clean logs logs-go logs-node logs-frontend

# ─── HELP ──────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ─── DOCKER COMPOSE ────────────────────────────────
up: ## Start all services (dev mode)
	JWT_SECRET=supersecret123 docker-compose up -d --build

up-prod: ## Start all services (production mode · requires JWT_SECRET)
	docker-compose up -d --build

down: ## Stop and remove all services
	docker-compose down

build: ## Build all Docker images
	docker-compose build

logs: ## Follow all service logs
	docker-compose logs -f

logs-go: ## Follow Go API logs
	docker-compose logs -f go-api

logs-node: ## Follow Node API logs
	docker-compose logs -f node-api

logs-frontend: ## Follow Frontend logs
	docker-compose logs -f frontend

restart: ## Restart all services
	docker-compose restart

ps: ## Show container status
	docker-compose ps

# ─── GO API ────────────────────────────────────────
install-go: ## Install Go dependencies
	cd apps/go-api && go mod download

test-go: ## Run Go API tests
	cd apps/go-api && go test -coverpkg=./internal/...,./pkg/... ./... -v -cover

build-go: ## Build Go API binary
	cd apps/go-api && go build -ldflags="-s -w" -o api ./cmd/api

run-go: ## Run Go API locally
	cd apps/go-api && JWT_SECRET=supersecret123 go run ./cmd/api

# ─── NODE API ──────────────────────────────────────
install-node: ## Install Node API dependencies
	cd apps/node-api && npm ci

test-node: ## Run Node API tests
	cd apps/node-api && npm run test

test-node-coverage: ## Run Node API tests with coverage
	cd apps/node-api && npm run test:coverage

build-node: ## Build Node API (TypeScript)
	cd apps/node-api && npm run build

run-node: ## Run Node API locally
	cd apps/node-api && npm run dev

lint-node: ## Lint Node API (typecheck)
	cd apps/node-api && npm run lint

# ─── FRONTEND ──────────────────────────────────────
install-frontend: ## Install Frontend dependencies
	cd apps/frontend && npm ci

test-frontend: ## Run Frontend tests
	cd apps/frontend && npx ng test

build-frontend: ## Build Frontend (production)
	cd apps/frontend && npx ng build

run-frontend: ## Run Frontend locally
	cd apps/frontend && npx ng serve

# ─── ALL TESTS ─────────────────────────────────────
test-all: test-go test-node test-frontend ## Run all tests

# ─── CLEAN ─────────────────────────────────────────
clean: ## Clean all build artifacts and Docker resources
	cd apps/go-api && rm -f api coverage.out
	cd apps/node-api && rm -rf dist coverage
	cd apps/frontend && rm -rf dist .angular coverage
	docker-compose down -v --remove-orphans 2>/dev/null || true
	docker system prune -f 2>/dev/null || true
