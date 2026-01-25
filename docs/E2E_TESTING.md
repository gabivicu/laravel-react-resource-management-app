# End-to-End (E2E) Testing cu Cypress

Acest document explică cum să folosești testele E2E cu Cypress pentru a testa fluxurile critice ale aplicației.

## 📋 Prezentare Generală

Testele E2E simulează comportamentul unui utilizator real într-un browser, testând aplicația de la cap la coadă. Acest lucru garantează că fluxurile critice funcționează corect.

## 🚀 Instalare

### Pasul 1: Folosește Containerul Cypress (Docker)

Pentru Docker, folosim imaginea oficială `cypress/included`, care include Cypress și toate dependențele. Nu este necesar să instalezi Cypress în containerul `node`.

### Pasul 2: Instalează Dependențele

```bash
# Cu Docker
docker-compose exec node npm install

# Sau local
npm install
```

### Pasul 3: Instalează Browserele Cypress

Cypress va instala automat browserele necesare la prima rulare. Dacă vrei să le instalezi manual:

```bash
# Cu Docker
docker-compose exec node npx cypress install

# Sau local
npx cypress install
```

## 🧪 Rulare Teste

### Mod Interactiv (Recomandat pentru Development)

**⚠️ Notă pentru Docker:** Modul interactiv (`cypress open`) necesită X11 forwarding și nu este suportat în această configurație. Recomandăm rularea locală pentru modul interactiv.

Pentru Docker, folosește modul headless:
```bash
docker-compose run --rm cypress
```

Pentru rulare locală (cu interfață grafică):
```bash
npm run test:e2e:open
```

Aceasta va deschide Cypress Test Runner unde poți:
- Selecta testele de rulat
- Vedea testele rulează în timp real
- Debug testele pas cu pas
- Vedea screenshots și video-uri

### Mod Headless (Pentru CI/CD)

Rulează toate testele în mod headless (fără interfață grafică):

```bash
# Cu Docker (folosește containerul cypress)
docker-compose run --rm cypress

# Sau local
npm run test:e2e
```

### Mod Headed (Cu Browser Vizibil)

Rulează testele cu browser-ul vizibil (util pentru debugging):

```bash
# Cu Docker
docker-compose exec node npm run test:e2e:headed

# Sau local
npm run test:e2e:headed
```

## 📁 Structura Testelor

```
cypress/
├── e2e/                    # Teste E2E
│   └── critical-path.cy.ts # Test pentru fluxul critic
├── fixtures/               # Date mock pentru teste
│   └── example.json
├── support/                # Helpers și comenzi custom
│   ├── commands.ts         # Comenzi Cypress custom
│   └── e2e.ts             # Configurație globală
└── screenshots/            # Screenshots la eșec (generat automat)
└── videos/                 # Video-uri la eșec (generat automat)
```

## 🎯 Teste Disponibile

### Critical Path Test

Testul principal (`critical-path.cy.ts`) verifică fluxul complet:

1. **Login** - Autentificare cu credențiale valide
2. **Create Project** - Creare proiect nou
3. **Create Task** - Creare task în proiect
4. **Verify Task** - Verificare că task-ul apare în listă

### Teste Suplimentare

- **Login cu credențiale invalide** - Verifică mesajele de eroare
- **Navigare între pagini** - Verifică că toate paginile principale sunt accesibile

## 🔧 Configurare

### Variabile de Mediu

Poți configura testele prin variabile de mediu în `.env`:

```env
# URL-ul aplicației pentru teste
CYPRESS_BASE_URL=http://localhost

# Credențiale pentru testare (opțional)
E2E_TEST_EMAIL=admin@demo.com
E2E_TEST_PASSWORD=password
```

### Configurare Cypress

Configurația se află în `cypress.config.ts`:

```typescript
{
    baseUrl: 'http://localhost',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
}
```

## 📝 Scriere Teste Noi

### Exemplu de Test Simplu

```typescript
describe('My Feature', () => {
    it('should do something', () => {
        cy.login(); // Folosește comanda custom
        cy.visit('/my-page');
        cy.get('[data-testid="my-element"]').click();
        cy.contains('Expected text').should('be.visible');
    });
});
```

### Comenzi Custom Disponibile

#### `cy.login(email?, password?)`

Autentifică utilizatorul:

```typescript
cy.login(); // Folosește credențiale default
cy.login('user@example.com', 'password'); // Credențiale custom
```

#### `cy.logout()`

Deconectează utilizatorul curent:

```typescript
cy.logout();
```

#### `cy.isLoggedIn()`

Verifică dacă utilizatorul este autentificat:

```typescript
cy.isLoggedIn().should('be.true');
```

## 🎨 Best Practices

### 1. Folosește Data Attributes

Adaugă `data-testid` în componente pentru selecție mai stabilă:

```tsx
<button data-testid="create-project">Create Project</button>
```

Apoi în teste:

```typescript
cy.get('[data-testid="create-project"]').click();
```

### 2. Așteaptă Elementele

Nu folosi `cy.wait()` cu timpi fixi. Folosește așteptări pe elemente:

```typescript
// ❌ Rău
cy.wait(5000);

// ✅ Bine
cy.get('[data-testid="my-element"]').should('be.visible');
```

### 3. Folosește Fixtures pentru Date

Pentru date mock, folosește fixtures:

```typescript
cy.fixture('example.json').then((data) => {
    cy.get('input[name="email"]').type(data.email);
});
```

### 4. Teste Independente

Fiecare test ar trebui să fie independent:

```typescript
beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
});
```

### 5. Nume Descriptive

Folosește nume descriptive pentru teste:

```typescript
// ❌ Rău
it('test 1', () => { ... });

// ✅ Bine
it('should create a project and verify it appears in the list', () => { ... });
```

## 🐛 Debugging

### Debug în Mod Interactiv

1. Deschide Cypress Test Runner: `npm run test:e2e:open`
2. Selectează testul
3. Click pe linia de cod pentru a adăuga breakpoint
4. Rulează testul pas cu pas

### Debug cu Console

Folosește `cy.debug()` pentru a pausa execuția:

```typescript
cy.get('[data-testid="my-element"]').debug().click();
```

### Screenshots și Video

Cypress capturează automat:
- **Screenshots** la fiecare eșec
- **Video** pentru întregul run de teste

Găsește-le în:
- `cypress/screenshots/`
- `cypress/videos/`

## 🔄 Integrare CI/CD

### GitHub Actions

Exemplu de workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
      - uses: cypress-io/github-action@v5
        with:
          upload-videos: true
          upload-screenshots: true
```

## 📊 Rapoarte

### HTML Report

După rulare, Cypress generează un raport HTML:

```bash
npm run test:e2e
# Raportul se găsește în cypress/reports/
```

### Dashboard Cypress (Opțional)

Pentru tracking avansat, poți folosi Cypress Dashboard:

1. Creează cont pe https://dashboard.cypress.io
2. Adaugă proiectul
3. Configurează `projectId` în `cypress.config.ts`

## 🚨 Troubleshooting

### Testele eșuează intermitent

- Verifică timeouts-urile
- Așteaptă elementele în loc să folosești `cy.wait()` cu timpi fixi
- Verifică dacă aplicația este complet încărcată

### Elemente nu sunt găsite

- Verifică selectorii (folosește DevTools)
- Adaugă `data-testid` pentru selecție mai stabilă
- Verifică dacă elementele sunt în DOM (poate sunt în iframe)

### Aplicația nu pornește

- Verifică că Docker containers rulează: `docker-compose ps`
- Verifică URL-ul în `cypress.config.ts`
- Verifică log-urile: `docker-compose logs app`

## 📚 Resurse

- [Documentația Cypress](https://docs.cypress.io/)
- [Best Practices Cypress](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Examples](https://example.cypress.io/)

## 💡 Tips

1. **Rulează testele local înainte de commit** - Economisește timp
2. **Folosește modul interactiv pentru debugging** - Mult mai ușor
3. **Mentenanță regulată** - Actualizează testele când UI-ul se schimbă
4. **Teste rapide** - Păstrează testele sub 30 de secunde când e posibil
5. **Teste relevante** - Testează doar fluxurile critice, nu totul

## 🎯 Următorii Pași

- [ ] Adaugă teste pentru Kanban Board
- [ ] Adaugă teste pentru Resource Allocations
- [ ] Adaugă teste pentru Analytics Dashboard
- [ ] Integrează în CI/CD pipeline
- [ ] Adaugă visual regression testing
