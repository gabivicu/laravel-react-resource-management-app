# Resource Management SaaS

A comprehensive SaaS application for Project Management and Resource Allocation, built with Laravel 12 and React + TypeScript.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
  - [Docker Setup (Recommended)](#option-1-docker-setup-recommended-)
  - [Local Setup](#option-2-local-setup)
- [Running the Application](#-running-the-application)
- [Database Seeding](#-database-seeding)
- [Testing](#-testing)
  - [Backend Tests](#backend-tests)
  - [Frontend Tests](#frontend-tests)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)

## 🏗️ Architecture

### Backend (Laravel 12)
- **Modular architecture** based on simplified Domain-Driven Design
- **Multi-tenancy** with strict data isolation through tenant scopes
- **Advanced RBAC** with granular roles and permissions
- **Repository Pattern** for data access abstraction
- **Service Layer** for complex business logic
- **Form Requests** for validation
- **API-first** design with Laravel Sanctum authentication

### Frontend (React + TypeScript + Vite)
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Router** for routing
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Optimistic UI** updates for better UX

## 📋 Prerequisites

### For Docker Setup
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git**
- **8GB+ RAM** recommended

### For Local Setup
- **PHP** 8.4+
- **Composer** 2.0+
- **Node.js** 18+ and **npm** 9+
- **PostgreSQL** 14+
- **Redis** 7+ (optional, for caching)

## 🚀 Quick Start

### Docker (Fastest Way)

```bash
# Clone the repository
git clone <repository-url>
cd laravel-react-app

# Complete setup (builds, installs dependencies, runs migrations and seeds)
make setup

# Access the application
# Frontend: http://localhost
# API: http://localhost/api/v1
```

**Demo Credentials:**
- Email: `admin@demo.com`
- Password: `password`

## 📦 Installation

### Option 1: Docker Setup (Recommended) 🐳

Docker setup is the easiest way to get started as it handles all dependencies automatically.

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd laravel-react-app
```

#### Step 2: Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

The default Docker configuration should work out of the box. Key variables:

```env
# Database (for Docker)
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=resource_management
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Application
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Vite
VITE_API_URL=http://localhost/api/v1
```

#### Step 3: Build and Start Containers

```bash
# Build Docker images
make build
# or
docker-compose build

# Start all containers
make up
# or
docker-compose up -d
```

#### Step 4: Install Dependencies

```bash
# Install PHP dependencies
make composer
# or
docker-compose exec app composer install

# Install Node.js dependencies
make npm
# or
docker-compose exec node npm install
```

#### Step 5: Configure Laravel

```bash
# Generate application key
docker-compose exec app php artisan key:generate

# Run migrations
make migrate
# or
docker-compose exec app php artisan migrate

# Seed database (creates demo data)
make seed
# or
docker-compose exec app php artisan db:seed
```

#### Step 6: Access the Application

- **Frontend**: http://localhost
- **API**: http://localhost/api/v1
- **Vite Dev Server**: http://localhost:5173 (if running `npm run dev`)

#### Docker Services

The application runs the following services:
- **app**: Laravel PHP-FPM application
- **nginx**: Web server (port 80)
- **node**: Node.js container for Vite
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **queue**: Laravel queue worker
- **scheduler**: Laravel task scheduler

#### Useful Docker Commands

```bash
# View all available commands
make help

# View logs
make logs
# or for specific service
docker-compose logs -f app

# Open shell in container
make shell          # Laravel app container
make shell-node     # Node.js container

# Restart services
make restart

# Stop containers
make down

# Clear all caches
make cache-clear

# Run tests
make test
```

### Option 2: Local Setup

#### Step 1: Clone and Install PHP Dependencies

```bash
git clone <repository-url>
cd laravel-react-app
composer install
```

#### Step 2: Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

#### Step 3: Configure Database

Edit `.env` file:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=resource_management
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Create the database:

```bash
# PostgreSQL
createdb resource_management
# or via psql
psql -U postgres -c "CREATE DATABASE resource_management;"
```

#### Step 4: Run Migrations and Seed

```bash
# Run migrations
php artisan migrate

# Seed database (creates permissions, roles, and demo data)
php artisan db:seed
```

#### Step 5: Install Frontend Dependencies

```bash
npm install
```

#### Step 6: Start Development Servers

**Terminal 1 - Laravel Server:**
```bash
php artisan serve
```

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```

Access the application at http://localhost:8000

## 🏃 Running the Application

### Development Mode

#### With Docker

```bash
# Start all services
make up

# The application is available at http://localhost
# Vite dev server runs automatically in the node container
```

#### Local Setup

You need **two terminals**:

**Terminal 1 - Laravel:**
```bash
php artisan serve
```

**Terminal 2 - Vite:**
```bash
npm run dev
```

The application will be available at http://localhost:8000

### Production Build

#### Docker

```bash
# Build production images
make prod-build

# Start production containers
make prod-up
```

#### Local

```bash
# Build frontend assets
npm run build

# Serve with production server (Nginx/Apache)
# Configure your web server to point to public/ directory
```

## 🌱 Database Seeding

The application includes comprehensive seeders for development and testing:

### Available Seeders

1. **PermissionSeeder** - Creates system permissions and roles
2. **UserSeeder** - Creates demo users and organizations
3. **ProjectSeeder** - Creates sample projects
4. **TaskSeeder** - Creates sample tasks
5. **ResourceAllocationSeeder** - Creates sample resource allocations

### Running Seeders

```bash
# Seed everything (recommended)
php artisan db:seed
# or with Docker
docker-compose exec app php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=UserSeeder

# Fresh migration with seeding
php artisan migrate:fresh --seed
# or with Docker
make migrate-fresh
```

### Demo Credentials

After seeding, you can login with:

- **Email**: `admin@demo.com`
- **Password**: `password`

Additional demo users are created by `UserSeeder` - check the seeder file for details.

## 🧪 Testing

### Backend Tests

Backend tests use **PHPUnit** and are located in `tests/` directory:

- **Unit Tests** (`tests/Unit/`): Test services, repositories, and business logic
- **Feature Tests** (`tests/Feature/`): Test API endpoints and integration

#### Running Backend Tests

**Important**: When running tests in Docker, they use PostgreSQL. The test database (`resource_management_test`) is automatically created if it doesn't exist.

```bash
# Run all tests (Docker - recommended)
make test

# Run all tests (Local)
php artisan test

# Run specific test file
php artisan test tests/Unit/AuthServiceTest.php
# or with Docker
docker-compose exec -e DB_CONNECTION=pgsql -e DB_HOST=postgres -e DB_PORT=5432 -e DB_DATABASE=resource_management_test -e DB_USERNAME=postgres -e DB_PASSWORD=postgres app php artisan test tests/Unit/AuthServiceTest.php

# Run specific test file
php artisan test tests/Unit/AuthServiceTest.php

# Run tests with coverage
php artisan test --coverage

# Run tests in parallel (faster)
php artisan test --parallel

# Run specific test method
php artisan test --filter it_can_register_a_new_user
```

#### Writing Backend Tests

Example unit test:

```php
<?php

namespace Tests\Unit;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ExampleServiceTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_perform_action()
    {
        // Test implementation
    }
}
```

### Frontend Tests

Frontend tests use **Vitest** and **React Testing Library**:

- **Service Tests** (`tests/unit/services/`): Test API service functions
- **Component Tests** (`tests/unit/components/`): Test React components

#### Running Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test tests/unit/services/projectService.test.ts
```

#### Writing Frontend Tests

Example component test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from '@/components/Component';

describe('Component', () => {
    it('should render correctly', () => {
        render(<Component />);
        expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
});
```

### Test Coverage Goals

- **Backend**: Aim for >80% code coverage
- **Frontend**: Aim for >70% code coverage

## 🔧 Configuration

### Multi-Tenancy

The application uses tenant scopes for data isolation. Configuration is handled automatically through:

- **TenantScopeMiddleware**: Resolves tenant from request headers, session, or authenticated user
- **HasTenantScope Trait**: Automatically filters queries by organization

### RBAC (Role-Based Access Control)

Permissions and roles are managed through:

- **Permissions**: Granular actions (e.g., `projects.create`, `tasks.delete`)
- **Roles**: Collections of permissions (e.g., Admin, Project Manager)
- **Organization-specific**: Roles can be global or organization-specific

Default roles are created by `PermissionSeeder`.

### CORS Configuration

CORS is configured in `config/cors.php`. For development, the default configuration allows:
- Localhost origins
- Credentials support
- Common HTTP methods

### API Authentication

The application uses **Laravel Sanctum** for API authentication:

- Token-based authentication
- CSRF protection for web routes
- Session-based authentication support

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues

**Containers won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Port already in use:**
```bash
# Change ports in docker-compose.yml or .env
# Default ports: 80 (nginx), 5432 (postgres), 6379 (redis)
```

**Permission denied errors:**
```bash
# Fix file permissions
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 775 storage bootstrap/cache
```

#### Database Issues

**Migration errors:**
```bash
# Reset database
php artisan migrate:fresh
# or with Docker
docker-compose exec app php artisan migrate:fresh

# Clear cache
php artisan config:clear
php artisan cache:clear
```

**Connection refused:**
- Check database credentials in `.env`
- Ensure database service is running
- For Docker: Check `docker-compose ps` to verify postgres is up

#### Frontend Issues

**Vite dev server not working:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**Build errors:**
```bash
# Check TypeScript errors
npm run type-check

# Clear build cache
rm -rf public/build
npm run build
```

**CORS errors:**
- Ensure `VITE_API_URL` in `.env` matches your backend URL
- Check `config/cors.php` configuration
- Clear Laravel config cache: `php artisan config:clear`

#### Testing Issues

**Tests failing:**
```bash
# For Docker: Ensure test database exists and run migrations
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE resource_management_test;" 2>/dev/null || true
docker-compose exec -e DB_CONNECTION=pgsql -e DB_HOST=postgres -e DB_DATABASE=resource_management_test -e DB_USERNAME=postgres -e DB_PASSWORD=postgres app php artisan migrate --env=testing

# Clear test database and re-run migrations
docker-compose exec -e DB_CONNECTION=pgsql -e DB_HOST=postgres -e DB_DATABASE=resource_management_test -e DB_USERNAME=postgres -e DB_PASSWORD=postgres app php artisan migrate:fresh --env=testing

# Clear caches
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear

# Run tests with verbose output
make test
```

**Database connection errors in tests:**
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check that test database exists: `docker-compose exec postgres psql -U postgres -d template1 -l | grep resource_management_test`
- Create test database manually: `docker-compose exec postgres psql -U postgres -d template1 -c "CREATE DATABASE resource_management_test;"`
- If `template1` doesn't work, try using the main database: `docker-compose exec postgres psql -U postgres -d resource_management -c "CREATE DATABASE resource_management_test;"`

**Frontend tests failing:**
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Run tests with debug
npm test -- --reporter=verbose
```

### Getting Help

1. Check the logs: `docker-compose logs -f` or `storage/logs/laravel.log`
2. Verify environment configuration: `php artisan config:show`
3. Check routes: `php artisan route:list`
4. Verify database connection: `php artisan tinker` then `DB::connection()->getPdo()`

## 📁 Project Structure

```
laravel-react-app/
├── app/
│   ├── Core/                    # Shared infrastructure
│   │   ├── Contracts/           # Interfaces
│   │   ├── Traits/              # Reusable traits
│   │   ├── Middleware/          # Custom middleware
│   │   └── Exceptions/          # Custom exceptions
│   │
│   ├── Domains/                 # Domain modules
│   │   ├── Organization/        # Multi-tenancy
│   │   ├── Project/             # Projects management
│   │   ├── Task/                # Task management (Kanban)
│   │   ├── Resource/            # Resource allocation
│   │   ├── User/                # User management
│   │   ├── Auth/                # Authentication
│   │   └── Permission/          # RBAC
│   │
│   └── Http/
│       ├── Controllers/
│       │   └── Api/V1/         # API versioning
│       └── Requests/            # Form requests
│
├── database/
│   ├── migrations/              # Database migrations
│   ├── seeders/                 # Database seeders
│   └── factories/              # Model factories
│
├── resources/
│   ├── js/
│   │   ├── components/         # React components
│   │   ├── services/            # API services
│   │   ├── store/               # Zustand stores
│   │   └── types/               # TypeScript types
│   └── views/
│       └── welcome.blade.php    # Main entry point
│
├── tests/
│   ├── Unit/                    # Backend unit tests
│   ├── Feature/                 # Backend feature tests
│   └── unit/                    # Frontend tests
│       ├── services/            # Service tests
│       └── components/          # Component tests
│
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # PHP container image
├── Makefile                     # Convenience commands
└── vite.config.js               # Vite configuration
```

## 📦 Technology Stack

- **Backend**: Laravel 12, PostgreSQL, Redis
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Zustand
- **Real-time**: Laravel Reverb (configured)
- **Testing**: PHPUnit (backend), Vitest + RTL (frontend)
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Docker) or PHP built-in server (local)

## 📝 Usage Examples

### Creating a Project

```php
// Via API
POST /api/v1/projects
{
    "name": "New Project",
    "description": "Project description",
    "status": "planning",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
}
```

### Creating a Task

```php
// Via API
POST /api/v1/tasks
{
    "project_id": 1,
    "title": "New Task",
    "status": "todo",
    "priority": "high",
    "assignee_ids": [1, 2]
}
```

### Checking Permissions

```php
if ($user->hasPermissionInOrganization('projects.create', $organizationId)) {
    // User has permission
}
```

## 📄 License

MIT

## 🤝 Contributing

This is a portfolio project. If you'd like to contribute or have suggestions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

For code style, follow PSR-12 for PHP and ESLint configuration for TypeScript/JavaScript.

## 🔒 Pre-Commit Hooks

This project includes pre-commit hooks to ensure code quality before commits.

### Installation

The pre-commit hook is automatically installed. If you need to reinstall it:

```bash
./scripts/install-pre-commit.sh
```

### What Gets Checked

- **Laravel Pint** - PHP code style (PSR-12)
- **TypeScript Type Check** - Type safety verification
- **ESLint** - JavaScript/TypeScript code quality

### Usage

The hook runs automatically on every commit. To test manually:

```bash
./scripts/pre-commit.sh
```

To skip the hook (not recommended):

```bash
git commit --no-verify
```

See [docs/PRE_COMMIT.md](docs/PRE_COMMIT.md) for detailed documentation.

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
