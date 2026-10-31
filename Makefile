# ============================================================
# LabShare – Makefile
# ============================================================

.DEFAULT_GOAL := help
.PHONY: help dev demo build test lint typecheck db-migrate db-seed db-reset docker-up docker-down clean

BOLD := \033[1m
RESET := \033[0m
GREEN := \033[32m
YELLOW := \033[33m

help: ## Show this help
	@echo ""
	@echo "$(BOLD)LabShare – Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

install: ## Install all dependencies
	pnpm install

dev: ## Start all services in development mode
	@cp -n .env.example .env 2>/dev/null || true
	pnpm dev

demo: ## Migrate + seed + start with demo accounts (DEMO_MODE=true)
	@cp -n .env.example .env 2>/dev/null || true
	@echo "$(YELLOW)Setting up demo environment...$(RESET)"
	DEMO_MODE=true pnpm db:reset
	DEMO_MODE=true pnpm dev

build: ## Build all packages for production
	pnpm build

test: ## Run all unit + integration tests
	pnpm test

test-e2e: ## Run Playwright E2E tests
	pnpm test:e2e

lint: ## Lint all packages
	pnpm lint

typecheck: ## TypeScript typecheck all packages
	pnpm typecheck

format: ## Format all files with Prettier
	pnpm format

# ── Database ──────────────────────────────────────────────

db-migrate: ## Run pending migrations
	pnpm db:migrate

db-seed: ## Seed demo data
	pnpm db:seed

db-reset: ## Drop, recreate, migrate, and seed
	pnpm db:reset

db-studio: ## Open Prisma Studio (DB browser)
	pnpm --filter @labshare/api exec prisma studio

db-schema: ## Generate ER diagram from Prisma schema
	pnpm --filter @labshare/api run db:diagram

# ── Docker ────────────────────────────────────────────────

docker-up: ## Start all Docker services (postgres, redis, minio)
	docker compose up -d postgres redis minio
	@echo "$(GREEN)✓ Docker services started$(RESET)"
	@echo "  Postgres: localhost:5432"
	@echo "  Redis:    localhost:6379"
	@echo "  MinIO:    localhost:9000 (console: localhost:9001)"

docker-down: ## Stop all Docker services
	docker compose down

docker-full: ## Start ALL services including api + web in Docker
	docker compose up -d

docker-logs: ## Tail Docker logs
	docker compose logs -f

# ── OpenAPI ───────────────────────────────────────────────

openapi: ## Generate OpenAPI spec + typed client
	pnpm openapi:generate

# ── Cleanup ───────────────────────────────────────────────

clean: ## Remove build artifacts and node_modules
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name ".next" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
	find . -name "coverage" -type d -prune -exec rm -rf '{}' +
	@echo "$(GREEN)✓ Cleaned$(RESET)"
