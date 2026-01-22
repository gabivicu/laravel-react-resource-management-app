#!/bin/bash

# Script for fixing permissions in Docker container

echo "🔧 Fixing permissions in Docker containers..."

# Fix permissions in app container
docker-compose exec -T app bash -c "
    mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache
    chmod -R 775 storage bootstrap/cache
    echo '✅ Permissions fixed in app container'
"

echo "✅ Done! Restart containers if needed: docker-compose restart app"
