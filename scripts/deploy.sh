#!/bin/bash
set -e

echo "🚀 Starting Deployment..."

# 1. Pull latest changes (assuming run on server)
# git pull origin main

# 2. Build and Start Containers
echo "🐳 Building and Starting Containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 3. Wait for DB to be healthy (simple sleep for now, pg_isready is better)
echo "⏳ Waiting for Database..."
sleep 5

# 4. Run Migrations
echo "📦 Running Database Migrations..."
docker exec licoreria_backend_prod npx prisma migrate deploy

echo "✅ Deployment Complete!"
