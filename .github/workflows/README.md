# GitHub Actions Workflows

## Code Quality Checks

Workflow-ul `code-quality.yml` verifică automat calitatea codului la fiecare push sau pull request pe branch-urile `main` și `develop`.

### Ce verifică:

#### Backend (PHP)
- ✅ **Laravel Pint** - Verifică și corectează stilul codului PHP (PSR-12)
- ✅ **PHPUnit** - Rulează toate testele PHP

#### Frontend (TypeScript/React)
- ✅ **TypeScript Type Check** - Verifică erorile de tip
- ✅ **ESLint** - Verifică calitatea codului JavaScript/TypeScript
- ✅ **Vitest** - Rulează testele frontend

#### Build
- ✅ **Build Check** - Verifică dacă aplicația se poate construi cu succes

### Cum funcționează:

1. La fiecare push sau pull request, GitHub Actions pornește automat workflow-ul
2. Fiecare job rulează în paralel pentru viteză maximă
3. Dacă orice verificare eșuează, workflow-ul se oprește și primești o notificare

### Verificare locală:

Poți rula aceleași verificări local înainte de push:

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

### Rezolvarea problemelor:

- **Laravel Pint eșuează**: Rulează `./vendor/bin/pint` pentru a corecta automat stilul
- **ESLint eșuează**: Rulează `npm run lint:fix` pentru a corecta automat problemele
- **Testele eșuează**: Verifică testele local cu `php artisan test` sau `npm run test`
