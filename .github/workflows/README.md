# GitHub Actions Workflows

## Code Quality Checks

The `code-quality.yml` workflow automatically checks code quality on every push or pull request to `main` and `develop` branches.

### What it checks:

#### Backend (PHP)
- ✅ **Laravel Pint** - Checks and fixes PHP code style (PSR-12)
- ✅ **PHPUnit** - Runs all PHP tests

#### Frontend (TypeScript/React)
- ✅ **TypeScript Type Check** - Checks for type errors
- ✅ **ESLint** - Checks JavaScript/TypeScript code quality
- ✅ **Vitest** - Runs frontend tests

#### Build
- ✅ **Build Check** - Verifies that the application can be built successfully

### How it works:

1. On every push or pull request, GitHub Actions automatically starts the workflow
2. Each job runs in parallel for maximum speed
3. If any check fails, the workflow stops and you receive a notification

### Local verification:

You can run the same checks locally before pushing:

```bash
# PHP Code Style
./vendor/bin/pint --test

# PHP Tests
php artisan test

# TypeScript Type Check
npm run type-check

# ESLint
npm run lint

# Frontend Tests
npm run test

# Build Check
npm run build
```

### Troubleshooting:

- **Laravel Pint fails**: Run `./vendor/bin/pint` to automatically fix the style
- **ESLint fails**: Run `npm run lint:fix` to automatically fix issues
- **Tests fail**: Check tests locally with `php artisan test` or `npm run test`
