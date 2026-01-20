#!/bin/bash

set -e

echo "🚀 Setting up Resource Management SaaS..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env 2>/dev/null || echo "⚠️  .env.example not found, creating basic .env..."
    cat > .env << EOF
APP_NAME="Resource Management SaaS"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=resource_management
DB_USERNAME=postgres
DB_PASSWORD=postgres

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

VITE_API_URL=http://localhost/api/v1
EOF
fi

echo "🐳 Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "📦 Installing Composer dependencies..."
docker-compose exec -T app composer install

echo "📦 Installing NPM dependencies..."
docker-compose exec -T node npm install

echo "🔑 Generating application key..."
docker-compose exec -T app php artisan key:generate --force

echo "🗄️  Running migrations..."
docker-compose exec -T app php artisan migrate --force

echo "🌱 Seeding database..."
docker-compose exec -T app php artisan db:seed --class=PermissionSeeder

echo "✨ Setup complete!"
echo ""
echo "📋 Access the application at:"
echo "   - Frontend: http://localhost"
echo "   - API: http://localhost/api/v1"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: make logs"
echo "   - Stop containers: make down"
echo "   - Restart containers: make restart"
echo "   - Open shell: make shell"
