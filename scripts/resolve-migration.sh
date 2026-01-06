#!/bin/bash
# Script to resolve Prisma migration issues when schema already exists
# Usage: ./scripts/resolve-migration.sh <migration_name>

set -e

MIGRATION_NAME=${1:-"20250101000000_init"}

echo "Resolving migration: $MIGRATION_NAME"

# Check if we're in a Docker container
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    echo "Running inside Docker container"
    npx prisma migrate resolve --applied "$MIGRATION_NAME"
else
    echo "Running locally"
    # If running via docker compose
    if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
        echo "Using docker compose to resolve migration"
        docker compose exec -T core npx prisma migrate resolve --applied "$MIGRATION_NAME" || \
        docker-compose exec -T core npx prisma migrate resolve --applied "$MIGRATION_NAME"
    else
        npx prisma migrate resolve --applied "$MIGRATION_NAME"
    fi
fi

echo "Migration $MIGRATION_NAME marked as applied"



