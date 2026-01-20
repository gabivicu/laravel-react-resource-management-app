#!/bin/sh

# Don't exit on error - we want PHP-FPM to start even if setup fails
set +e

echo "Waiting for PostgreSQL to be ready..."
# Wait for PostgreSQL to be available (with timeout)
timeout=30
counter=0
until nc -z postgres 5432 || [ $counter -eq $timeout ]; do
    echo "Waiting for PostgreSQL... ($counter/$timeout)"
    sleep 1
    counter=$((counter + 1))
done

if [ $counter -eq $timeout ]; then
    echo "Warning: PostgreSQL not ready after $timeout seconds, continuing anyway..."
else
    echo "PostgreSQL is ready!"
fi

# Create storage directories if they don't exist
echo "Creating storage directories..."
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache 2>/dev/null

# Fix permissions (don't fail if chown fails)
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Install dependencies if vendor directory doesn't exist (run in background to not block)
if [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist &
fi

# Generate application key if not set (non-blocking)
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force 2>/dev/null || true
fi

# Run migrations in background (non-blocking)
echo "Running migrations..."
php artisan migrate --force 2>/dev/null || echo "Migrations may have already run or encountered an error"

# Start PHP-FPM in foreground (this is the main process)
exec "$@"
