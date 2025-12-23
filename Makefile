# Makefile for Moramor Backend

.PHONY: help install dev build start test clean docker-up docker-down migrate seed

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## نمایش راهنما
	@echo "$(CYAN)Moramor Backend - Available Commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## نصب dependencies
	@echo "$(CYAN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## اجرای برنامه در حالت development
	@echo "$(CYAN)Starting development server...$(NC)"
	npm run start:dev

build: ## Build برای production
	@echo "$(CYAN)Building for production...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build completed$(NC)"

start: ## اجرای build شده
	@echo "$(CYAN)Starting production server...$(NC)"
	npm run start:prod

test: ## اجرای تست‌ها
	@echo "$(CYAN)Running tests...$(NC)"
	npm test

test-watch: ## اجرای تست‌ها با watch mode
	npm run test:watch

test-cov: ## اجرای تست‌ها با coverage
	npm run test:cov

test-e2e: ## اجرای تست‌های E2E
	npm run test:e2e

lint: ## بررسی کد
	@echo "$(CYAN)Running linter...$(NC)"
	npm run lint

format: ## فرمت کردن کد
	@echo "$(CYAN)Formatting code...$(NC)"
	npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

docker-up: ## راه‌اندازی Docker services
	@echo "$(CYAN)Starting Docker services...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Docker services started$(NC)"
	@echo "$(YELLOW)PostgreSQL:$(NC) localhost:5432"
	@echo "$(YELLOW)Redis:$(NC)      localhost:6379"
	@echo "$(YELLOW)MinIO:$(NC)      localhost:9000 (console: 9001)"

docker-down: ## توقف Docker services
	@echo "$(CYAN)Stopping Docker services...$(NC)"
	docker-compose -f docker-compose.dev.yml down
	@echo "$(GREEN)✓ Docker services stopped$(NC)"

docker-logs: ## نمایش logs Docker
	docker-compose -f docker-compose.dev.yml logs -f

docker-build: ## Build Docker image
	@echo "$(CYAN)Building Docker image...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Docker image built$(NC)"

docker-prod-up: ## راه‌اندازی production با Docker
	@echo "$(CYAN)Starting production environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Production environment started$(NC)"

migrate: ## اجرای database migrations
	@echo "$(CYAN)Running migrations...$(NC)"
	npx prisma migrate dev
	@echo "$(GREEN)✓ Migrations completed$(NC)"

migrate-deploy: ## اجرای migrations در production
	@echo "$(CYAN)Deploying migrations...$(NC)"
	npx prisma migrate deploy
	@echo "$(GREEN)✓ Migrations deployed$(NC)"

migrate-reset: ## Reset کردن دیتابیس (خطرناک!)
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		npx prisma migrate reset; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

seed: ## Seed کردن دیتابیس
	@echo "$(CYAN)Seeding database...$(NC)"
	npm run prisma:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

generate: ## تولید Prisma Client
	@echo "$(CYAN)Generating Prisma Client...$(NC)"
	npx prisma generate
	@echo "$(GREEN)✓ Prisma Client generated$(NC)"

clean: ## پاک کردن فایل‌های build و node_modules
	@echo "$(CYAN)Cleaning...$(NC)"
	rm -rf dist node_modules coverage
	@echo "$(GREEN)✓ Cleaned$(NC)"

setup: install generate migrate seed ## نصب و راه‌اندازی کامل پروژه
	@echo "$(GREEN)✓ Setup completed successfully!$(NC)"
	@echo ""
	@echo "$(CYAN)Next steps:$(NC)"
	@echo "  1. Copy env.template to .env and configure"
	@echo "  2. Run: $(GREEN)make docker-up$(NC)"
	@echo "  3. Run: $(GREEN)make dev$(NC)"

logs: ## نمایش application logs (اگر با PM2 اجرا شده باشد)
	pm2 logs moramor-api

status: ## بررسی وضعیت سرویس‌ها
	@echo "$(CYAN)Checking service status...$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker services:$(NC)"
	@docker-compose -f docker-compose.dev.yml ps || echo "Docker Compose not running"
	@echo ""
	@echo "$(YELLOW)Application:$(NC)"
	@curl -s http://localhost:3000/health | jq '.' || echo "Application not responding"

backup-db: ## بکاپ دیتابیس
	@echo "$(CYAN)Creating database backup...$(NC)"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U moramor moramor_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/ directory$(NC)"

restore-db: ## Restore دیتابیس از بکاپ (مثال: make restore-db FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(CYAN)Restoring database from $(FILE)...$(NC)"
	cat $(FILE) | docker-compose exec -T postgres psql -U moramor moramor_db
	@echo "$(GREEN)✓ Database restored$(NC)"

.DEFAULT_GOAL := help

