.PHONY: help install dev test lint format clean docker-up docker-down migrate

# Default target
help:
	@echo "Kurobe BI Platform - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install      Install all dependencies"
	@echo "  make dev          Start development environment"
	@echo ""
	@echo "Database:"
	@echo "  make docker-up    Start PostgreSQL and Redis"
	@echo "  make docker-down  Stop all Docker services"
	@echo "  make migrate      Run database migrations"
	@echo ""
	@echo "Testing:"
	@echo "  make test         Run all tests"
	@echo "  make test-backend Run backend tests"
	@echo "  make test-frontend Run frontend tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint         Run linters"
	@echo "  make format       Format code"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        Remove build artifacts"

# Install all dependencies
install: install-sdk install-backend install-frontend

install-sdk:
	cd sdk && pip install -e ".[dev]"

install-backend:
	cd backend && pip install -e ".[dev]"

install-frontend:
	cd frontend && npm install

# Start development environment
dev:
	@echo "Starting development environment..."
	@make docker-up
	@echo "Waiting for services to be ready..."
	@sleep 5
	@make migrate
	@echo ""
	@echo "Services are ready!"
	@echo "Start the backend:  cd backend && uvicorn app.main:app --reload"
	@echo "Start the frontend: cd frontend && npm run dev"

# Docker commands
docker-up:
	docker-compose up -d postgres redis

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Database migrations with Flyway
migrate:
	@echo "Running Flyway migrations..."
	cd backend && flyway -configFiles=flyway.conf migrate

migrate-info:
	@echo "Checking migration status..."
	cd backend && flyway -configFiles=flyway.conf info

migrate-clean:
	@echo "Cleaning database (WARNING: This will drop all objects)..."
	cd backend && flyway -configFiles=flyway.conf clean

migrate-create:
	@echo "To create a new migration:"
	@echo "1. Create a new SQL file in backend/db/migration/"
	@echo "2. Name it V<version>__<description>.sql (e.g., V2__Add_user_table.sql)"
	@echo "3. Run 'make migrate' to apply it"

# Testing
test: test-backend test-frontend test-sdk

test-backend:
	cd backend && pytest -v

test-frontend:
	cd frontend && npm test

test-sdk:
	cd sdk && pytest -v

test-coverage:
	cd backend && pytest --cov=app --cov-report=html
	cd frontend && npm run test:coverage

# Code quality
lint: lint-backend lint-frontend

lint-backend:
	cd backend && ruff check . && mypy app

lint-frontend:
	cd frontend && npm run lint

format: format-backend format-frontend

format-backend:
	cd backend && black . && ruff check --fix .

format-frontend:
	cd frontend && npm run format

# Type checking
typecheck:
	cd backend && mypy app
	cd frontend && npm run typecheck

# Clean build artifacts
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name "dist" -exec rm -rf {} +
	find . -type d -name "build" -exec rm -rf {} +
	cd frontend && rm -rf .next node_modules

# Development database commands
db-reset:
	docker-compose exec postgres psql -U kurobe -c "DROP DATABASE IF EXISTS kurobe;"
	docker-compose exec postgres psql -U kurobe -c "CREATE DATABASE kurobe;"
	make migrate

db-shell:
	docker-compose exec postgres psql -U kurobe -d kurobe

redis-cli:
	docker-compose exec redis redis-cli

# Generate API documentation
docs:
	cd backend && python -m app.docs.generate_openapi
	cd frontend && npm run build-storybook

# Run specific services with profiles
trino-up:
	docker-compose --profile trino up -d

storage-up:
	docker-compose --profile storage up -d
