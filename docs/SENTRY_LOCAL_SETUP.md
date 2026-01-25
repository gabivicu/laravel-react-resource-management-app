# Configurare Sentry Local - Ghid Rapid

## 📋 Pași de Configurare

### Pasul 1: Obține DSN-ul (Client Keys) din Sentry

#### Metoda 1: Din Settings (Recomandat)

1. **Intră pe https://sentry.io** și autentifică-te
2. **Selectează proiectul** din sidebar-ul stâng (ex: "php-laravel")
3. **Click pe "Settings"** (iconița de roată din sidebar sau din header)
4. **În meniul stâng**, sub secțiunea proiectului, click pe **"Client Keys (DSN)"**
5. **Copiază DSN-ul** complet - va arăta astfel:
   ```
   https://abc123def456@o123456.ingest.sentry.io/789012
   ```
   ⚠️ **IMPORTANT**: Copiază DSN-ul COMPLET, nu doar URL-ul de bază!

#### Metoda 2: URL Direct

Dacă știi numele organizației și proiectului, poți accesa direct:
```
https://sentry.io/settings/[organization]/projects/[project-name]/keys/
```

Exemplu:
```
https://sentry.io/settings/no-company/projects/php-laravel/keys/
```

#### Format DSN Corect

✅ **Corect:**
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

❌ **Incorect:**
```
https://no-company-2s3.sentry.io
https://sentry.io
```

DSN-ul trebuie să conțină:
- Protocol: `https://`
- Key: un string alfanumeric (ex: `abc123def456`)
- Simbol `@`
- Host: (ex: `o123456.ingest.sentry.io`)
- Project ID: un număr la final (ex: `/789012`)

### Pasul 2: Configurează Backend (Laravel)

Adaugă în fișierul `.env`:

```env
# Sentry Configuration - Backend
SENTRY_DSN=https://your-dsn-here@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=local
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=0.0
SENTRY_SEND_DEFAULT_PII=false
```

**Explicație:**
- `SENTRY_DSN` - DSN-ul copiat din Sentry
- `SENTRY_ENVIRONMENT=local` - Pentru dezvoltare locală
- `SENTRY_TRACES_SAMPLE_RATE=1.0` - 100% pentru development (în producție folosește 0.1)
- `SENTRY_SEND_DEFAULT_PII=false` - Nu trimite date personale (GDPR)

### Pasul 3: Configurează Frontend (React)

Adaugă în același fișier `.env`:

```env
# Sentry Configuration - Frontend
VITE_SENTRY_DSN=https://your-dsn-here@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=local
```

**Notă:** Poți folosi același DSN pentru backend și frontend, sau poți crea proiecte separate.

### Pasul 4: Instalează Dependențele (dacă nu sunt instalate)

```bash
# Backend (în Docker)
docker-compose exec app composer install

# Frontend (în Docker)
docker-compose exec node npm install
```

### Pasul 5: Șterge Cache-ul

```bash
# Șterge cache-ul Laravel
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
```

### Pasul 6: Repornește Aplicația

```bash
# Repornește containerele
docker-compose restart app node
```

## 🧪 Testare

### Test Backend

Creează o rută de test temporară:

```bash
# Adaugă în routes/api.php sau routes/web.php
Route::get('/test-sentry', function () {
    throw new \Exception('Test Sentry error - Backend');
});
```

Apoi accesează: `http://localhost/api/test-sentry` sau `http://localhost/test-sentry`

Verifică în Sentry dashboard - eroarea ar trebui să apară în câteva secunde.

### Test Frontend

Deschide consola browserului (F12) și rulează:

```javascript
// Test error
throw new Error('Test Sentry error - Frontend');

// Test unhandled promise rejection
Promise.reject(new Error('Test unhandled rejection'));
```

Verifică în Sentry dashboard - erorile ar trebui să apară.

## ✅ Verificare Configurare

### Verifică dacă Sentry este configurat corect:

```bash
# Verifică configurația Laravel
docker-compose exec app php artisan tinker
>>> config('sentry.dsn')
# Ar trebui să returneze DSN-ul tău
```

### Verifică în Browser Console:

Deschide Developer Tools (F12) și verifică dacă Sentry este inițializat:
- Nu ar trebui să vezi erori legate de Sentry
- Dacă ai setat `VITE_SENTRY_DSN`, Sentry ar trebui să fie activ

## 🔧 Configurare Avansată (Opțional)

### Release Tracking

Pentru a urmări versiunile codului:

```env
# Adaugă în .env
SENTRY_RELEASE=$(git rev-parse HEAD)
```

Sau manual:
```env
SENTRY_RELEASE=v1.0.0
```

### Sample Rates pentru Producție

Când ești gata pentru producție, ajustează sample rates:

```env
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% din tranzacții
SENTRY_PROFILES_SAMPLE_RATE=0.0  # 0% pentru profiling
```

## 🐛 Troubleshooting

### Eroarea nu apare în Sentry

1. **Verifică DSN-ul** - asigură-te că este corect în `.env`
2. **Verifică conexiunea** - asigură-te că serverul poate accesa internetul
3. **Verifică log-urile**:
   ```bash
   docker-compose logs app | grep -i sentry
   ```
4. **Verifică cache-ul** - șterge cache-ul Laravel:
   ```bash
   docker-compose exec app php artisan config:clear
   ```

### Frontend nu trimite erori

1. **Verifică variabilele VITE** - asigură-te că încep cu `VITE_`
2. **Repornește Vite** - variabilele VITE trebuie să fie disponibile la build:
   ```bash
   docker-compose restart node
   # sau
   npm run dev
   ```
3. **Verifică în browser console** - caută erori legate de Sentry

## 📚 Resurse

- [Documentația Sentry Laravel](https://docs.sentry.io/platforms/php/guides/laravel/)
- [Documentația Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Ghidul complet de setup](./SENTRY_SETUP.md)

## 💡 Tips

- **Development**: Folosește `SENTRY_TRACES_SAMPLE_RATE=1.0` pentru a captura toate erorile
- **Production**: Folosește `SENTRY_TRACES_SAMPLE_RATE=0.1` pentru a reduce overhead-ul
- **Privacy**: Păstrează `SENTRY_SEND_DEFAULT_PII=false` pentru conformitate GDPR
- **Environment**: Folosește environment-uri diferite (`local`, `staging`, `production`) pentru a filtra erorile
