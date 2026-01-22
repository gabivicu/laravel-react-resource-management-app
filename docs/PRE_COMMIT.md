# Pre-Commit Hooks

This project includes pre-commit hooks to ensure code quality before commits.

## What Gets Checked

The pre-commit hook automatically runs the following checks:

1. **Laravel Pint** - PHP code style (PSR-12)
2. **TypeScript Type Check** - Type safety verification
3. **ESLint** - JavaScript/TypeScript code quality

**Note:** The hook does **NOT** run tests by default, as tests can be slow. Tests are run in CI/CD pipeline (GitHub Actions).

## How It Works

When you run `git commit`, the pre-commit hook automatically:
- Checks only staged PHP and TypeScript/JavaScript files
- Runs code quality checks
- Blocks the commit if any checks fail
- Shows helpful error messages with fix commands

## Usage

### Automatic (Recommended)

The hook is automatically installed and runs on every commit:

```bash
git commit -m "Your commit message"
```

If checks fail, you'll see error messages and the commit will be blocked.

### Manual Run

You can run the checks manually before committing:

```bash
# Using the script
./scripts/pre-commit.sh

# Or using Docker
docker-compose exec app ./vendor/bin/pint --test
docker-compose exec node npm run type-check
docker-compose exec node npm run lint
```

### Skip Hook (Not Recommended)

If you need to skip the hook (e.g., for WIP commits):

```bash
git commit --no-verify -m "WIP: work in progress"
```

⚠️ **Warning:** Only skip hooks when absolutely necessary. It's better to fix the issues.

## Why Tests Aren't Run

Tests are **not** run in the pre-commit hook because:
- Tests can be slow (especially with database setup)
- Pre-commit hooks should be fast to not interrupt workflow
- Tests are already run in CI/CD pipeline (GitHub Actions)
- You can run tests manually: `docker-compose exec app php artisan test`

If you want to run tests before committing, you can:
```bash
# Run tests manually
docker-compose exec app php artisan test

# Or add to your workflow
./scripts/pre-commit.sh && docker-compose exec app php artisan test
```

## Fixing Common Issues

### PHP Code Style Issues

```bash
# Auto-fix with Laravel Pint
docker-compose exec app ./vendor/bin/pint

# Or locally
./vendor/bin/pint
```

### TypeScript Type Errors

```bash
# Check errors
docker-compose exec node npm run type-check

# Or locally
npm run type-check
```

### ESLint Issues

```bash
# Auto-fix ESLint issues
docker-compose exec node npm run lint:fix

# Or locally
npm run lint:fix
```

## Installation

The pre-commit hook is automatically installed when you clone the repository. If you need to reinstall it:

```bash
# Make sure the hook is executable
chmod +x .git/hooks/pre-commit

# Or use the installation script
./scripts/install-pre-commit.sh
```

## Configuration

The hook automatically detects:
- **Docker environment** - Uses `docker-compose exec` commands
- **Local environment** - Uses local commands directly

No configuration needed! The hook adapts to your environment.

## Troubleshooting

### Hook Not Running

1. Check if the hook file exists and is executable:
   ```bash
   ls -la .git/hooks/pre-commit
   ```

2. Make it executable:
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

### Docker Commands Failing

If Docker commands fail, make sure:
- Docker containers are running: `docker-compose ps`
- You're in the project root directory
- Docker Compose is installed: `docker-compose --version`

### Local Commands Not Found

If local commands fail:
- Install dependencies: `composer install` and `npm install`
- Check PHP version: `php --version` (needs PHP 8.2+)
- Check Node.js version: `node --version` (needs Node.js 18+)

### Tests Failing in CI/CD

If tests pass locally but fail in CI/CD:
1. Make sure all test files are committed: `git add tests/`
2. Check if database migrations are up to date
3. Verify environment variables in GitHub Actions
4. Run tests locally: `docker-compose exec app php artisan test`

## Alternative: Pre-Commit Framework

If you prefer using the [pre-commit framework](https://pre-commit.com/):

```bash
# Install pre-commit framework
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

The project includes a `.pre-commit-config.yaml` file for this purpose.

## Best Practices

1. **Fix issues immediately** - Don't skip hooks, fix the problems
2. **Run checks before committing** - Use `./scripts/pre-commit.sh` to check early
3. **Run tests before pushing** - Use `docker-compose exec app php artisan test`
4. **Keep dependencies updated** - Run `composer update` and `npm update` regularly
5. **Commit often** - Small commits are easier to fix if checks fail

## CI/CD Integration

These same checks run in GitHub Actions (see `.github/workflows/code-quality.yml`). The pre-commit hook ensures you catch issues locally before pushing. Tests are run in CI/CD to catch integration issues.
