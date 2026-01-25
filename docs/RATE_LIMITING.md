# Rate Limiting și API Security Avansat

## Prezentare Generală

Aplicația implementează un sistem avansat de rate limiting pentru a proteja API-ul împotriva atacurilor de tip flood, brute force și abuzuri. Sistemul folosește o combinație între middleware-ul nativ `ThrottleRequests` din Laravel 12 și un middleware personalizat pentru rate limiting avansat.

> **Notă**: Această implementare este optimizată pentru **Laravel 12**.

## Arhitectură

### Componente

1. **Rate Limiters Configurați** (`app/Providers/AppServiceProvider.php`)
   - Rate limiters predefinite pentru diferite tipuri de operații
   - Configurare bazată pe IP sau utilizator autentificat

2. **AdvancedRateLimitingMiddleware** (`app/Core/Middleware/AdvancedRateLimitingMiddleware.php`)
   - Middleware personalizat cu funcționalități avansate
   - Tracking de violări și blocare automată
   - Logging detaliat pentru monitorizare securitate

3. **Aplicare pe Rute** (`routes/api.php`)
   - Rate limiting diferențiat pe tipuri de operații
   - Protecție strictă pe rutele sensibile

## Configurare Rate Limiters

### Rate Limiters Disponibile

#### 1. `auth` - Autentificare (Strict)
- **Limită**: 5 încercări per 15 minute
- **Aplicare**: Login, Register
- **Scop**: Previne atacuri brute force

```php
$rateLimiter->for('auth', function ($request) {
    return RateLimiter::perMinute(5)->by($request->ip());
});
```

#### 2. `api-write` - Operații de Scriere
- **Limită**: 60 operații per minut
- **Aplicare**: POST, PUT, PATCH, DELETE
- **Scop**: Protejează împotriva flood-ului la operațiile de modificare

```php
$rateLimiter->for('api-write', function ($request) {
    $key = $request->user() 
        ? 'user:' . $request->user()->id 
        : 'ip:' . $request->ip();
    return RateLimiter::perMinute(60)->by($key);
});
```

#### 3. `api-read` - Operații de Citire
- **Limită**: 300 operații per minut
- **Aplicare**: GET
- **Scop**: Permite mai multe cereri de citire, dar previne abuzuri

```php
$rateLimiter->for('api-read', function ($request) {
    $key = $request->user() 
        ? 'user:' . $request->user()->id 
        : 'ip:' . $request->ip();
    return RateLimiter::perMinute(300)->by($key);
});
```

#### 4. `api` - General API
- **Limită**: 120 cereri per minut
- **Aplicare**: Rute generale API
- **Scop**: Limită generală pentru toate rutele API

## Advanced Rate Limiting Middleware

### Funcționalități

1. **Identificare Inteligentă**
   - Folosește ID-ul utilizatorului pentru utilizatori autentificați
   - Folosește IP-ul pentru utilizatori neautentificați
   - Permite rate limiting mai precis pentru utilizatori autentificați

2. **Tipuri de Limitări**
   - `auth`: 5 încercări / 15 minute
   - `write`: 60 operații / minut
   - `read`: 300 operații / minut
   - `strict`: 10 cereri / minut
   - `default`: 120 cereri / minut

3. **Blocare Automată**
   - Trackează violările de rate limit
   - Blochează automat IP-urile/Utilizatorii după 10 violări într-o oră
   - Blocare pentru 24 de ore
   - Logging pentru monitorizare

4. **Headers de Răspuns**
   - `X-RateLimit-Limit`: Limita maximă
   - `X-RateLimit-Remaining`: Cereri rămase
   - `X-RateLimit-Reset`: Timestamp când limita se resetează
   - `Retry-After`: Secunde până la resetare (când limita este depășită)

### Utilizare

```php
// Pe o rută specifică
Route::post('/sensitive-endpoint', [Controller::class, 'method'])
    ->middleware(['throttle:api-write', 'rate.limit.advanced:write']);

// Pe un grup de rute
Route::middleware(['throttle:api-write', 'rate.limit.advanced:write'])->group(function () {
    // Rute protejate
});
```

## Aplicare pe Rute API

### Rute de Autentificare

```php
// Rate limiting strict pentru login/register
Route::post('/register', [AuthController::class, 'register'])
    ->middleware(['throttle:auth', 'rate.limit.advanced:auth']);
Route::post('/login', [AuthController::class, 'login'])
    ->middleware(['throttle:auth', 'rate.limit.advanced:auth']);
```

### Rute Protejate - Citire

```php
Route::middleware('throttle:api-read')->group(function () {
    Route::get('projects', [ProjectController::class, 'index']);
    Route::get('tasks', [TaskController::class, 'index']);
    // ... alte rute GET
});
```

### Rute Protejate - Scriere

```php
Route::middleware(['throttle:api-write', 'rate.limit.advanced:write'])->group(function () {
    Route::post('projects', [ProjectController::class, 'store']);
    Route::put('projects/{project}', [ProjectController::class, 'update']);
    Route::delete('projects/{project}', [ProjectController::class, 'destroy']);
    // ... alte rute POST/PUT/DELETE
});
```

## Răspunsuri la Rate Limit Exceeded

### Răspuns JSON

```json
{
    "message": "Too many requests. Please try again later.",
    "error": "rate_limit_exceeded",
    "retry_after": 60
}
```

### Status Code
- **429 Too Many Requests**: Când limita este depășită
- **Headers**: Include informații despre limită și resetare

### Răspuns pentru IP Blocat

```json
{
    "message": "Your IP has been temporarily blocked due to excessive requests.",
    "error": "rate_limit_exceeded"
}
```

## Logging și Monitorizare

### Evenimente Loggate

1. **Rate Limit Exceeded**
   ```php
   Log::warning('Rate limit exceeded', [
       'identifier' => $identifier,
       'path' => $request->path(),
       'method' => $request->method(),
       'attempts' => $attempts,
       'limit' => $maxAttempts,
       'user_agent' => $request->userAgent(),
   ]);
   ```

2. **IP Blocat**
   ```php
   Log::critical('IP/User automatically blocked', [
       'identifier' => $identifier,
       'blocked_until' => now()->addHours(24)->toIso8601String(),
   ]);
   ```

3. **Cerere de la IP Blocat**
   ```php
   Log::warning('Blocked request from IP', [
       'ip' => $identifier,
       'path' => $request->path(),
       'user_agent' => $request->userAgent(),
   ]);
   ```

### Monitorizare

- Verifică `storage/logs/laravel.log` pentru evenimente de rate limiting
- Căută după "Rate limit exceeded" pentru violări
- Căută după "automatically blocked" pentru blocări automate

## Configurare Cache

Rate limiting folosește cache-ul Laravel (Redis recomandat pentru producție):

```env
CACHE_DRIVER=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Chei Cache Utilizate

- `rate_limit:{type}:{identifier}:{path_hash}` - Contor cereri
- `rate_limit_violations:{identifier}` - Contor violări
- `rate_limit_blocked:{identifier}` - Status blocare

## Personalizare

### Modificare Limite

Editează `app/Providers/AppServiceProvider.php` în metoda `configureRateLimiting()` pentru a modifica limitele:

```php
RateLimiter::for('api-write', function (Request $request) {
    $key = $request->user() 
        ? 'user:' . $request->user()->id 
        : 'ip:' . $request->ip();
    return Limit::perMinute(100)->by($key); // Modifică aici
});
```

### Modificare Configurare Middleware Avansat

Editează metoda `getLimits()` din `AdvancedRateLimitingMiddleware`:

```php
protected function getLimits(string $limitType): array
{
    return match ($limitType) {
        'auth' => [
            'max_attempts' => 5,      // Modifică aici
            'decay_minutes' => 15,    // Modifică aici
        ],
        // ... alte tipuri
    };
}
```

### Modificare Prag Blocare

Editează metoda `trackViolation()` pentru a schimba pragul de blocare:

```php
protected function trackViolation(string $identifier): void
{
    // Blochează după 10 violări (modifică aici)
    if ($violations >= 10) {
        $this->blockIdentifier($identifier);
    }
}
```

## Testare

### Testare Manuală cu cURL

```bash
# Testează limita de autentificare
for i in {1..10}; do
  curl -X POST http://localhost/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### Testare Automată cu Cypress

Testele E2E pentru rate limiting sunt disponibile în `cypress/e2e/rate-limiting.cy.ts`:

```bash
# Rulează toate testele E2E (inclusiv rate limiting)
npm run test:e2e

# Rulează doar testele de rate limiting
npx cypress run --spec "cypress/e2e/rate-limiting.cy.ts"
```

**Teste Cypress disponibile:**
- `should rate limit login attempts after 5 requests` - Verifică limita de 5 încercări pentru login
- `should rate limit register attempts after 5 requests` - Verifică limita pentru register
- `should include rate limit headers in responses` - Verifică headers-urile de rate limiting
- `should rate limit write operations after 60 requests per minute` - Verifică limita pentru operații de scriere
- `should rate limit PUT/DELETE operations` - Verifică limita pentru operații PUT/DELETE
- `should allow more read operations than write operations` - Verifică că operațiile de citire au limită mai mare
- `should include rate limit headers in successful responses` - Verifică headers în răspunsuri reușite
- `should include Retry-After header when rate limited` - Verifică header-ul Retry-After
- `should block IP after 10 rate limit violations` - Verifică blocarea automată

**Configurare pentru teste:**
- Setează `API_BASE_URL` în `cypress.config.cjs` sau variabile de mediu
- Testele folosesc endpoint-uri API directe pentru a testa rate limiting-ul
- Pentru testele care necesită autentificare, se folosește token-ul obținut prin login

**⚠️ Notă importantă despre testele de rate limiting:**
- Rate limiting-ul folosește cache-ul Laravel, care persistă între teste
- Testele se pot influența reciproc dacă rulează consecutiv
- Pentru rezultate consistente, recomandăm:
  1. Să rulezi testele individual (`--spec`) pentru fiecare test separat
  2. Să resetezi cache-ul între rulări: `php artisan cache:clear`
  3. Să folosești email-uri/IP-uri unice în fiecare test (testele fac asta automat)
  4. Să aștepți resetarea rate limiting-ului între teste (15 minute pentru auth, 1 minut pentru API)

**Exemplu de rulare izolată:**
```bash
# Resetează cache-ul înainte de teste
# Opțiunea 1: Dacă rulezi în Docker
docker-compose exec app php artisan cache:clear

# Opțiunea 2: Dacă rulezi local și cache-ul folosește baza de date
# Schimbă temporar CACHE_STORE în .env la 'file' sau 'array'
# Apoi rulează:
php artisan cache:clear

# Opțiunea 3: Dacă folosești Redis local
CACHE_STORE=redis php artisan cache:clear

# Rulează un singur test
npx cypress run --spec "cypress/e2e/rate-limiting.cy.ts" --grep "should rate limit login attempts"
```

**Notă despre cache driver:**
- Pentru testare locală, recomandăm să folosești `CACHE_STORE=file` sau `CACHE_STORE=array` în `.env`
- `array` este cel mai rapid pentru testare (cache în memorie, se resetează la fiecare request)
- `file` persistă între request-uri dar nu necesită baza de date sau Redis

### Verificare Status

```bash
# Verifică rutele cu rate limiting
php artisan route:list | grep throttle

# Verifică cache-ul de rate limiting (în tinker)
php artisan tinker
Cache::get('rate_limit:auth:ip:127.0.0.1:*');
```

## Best Practices

1. **Producție**
   - Folosește Redis pentru cache (performanță mai bună)
   - Monitorizează logurile pentru pattern-uri suspecte
   - Ajustează limitele în funcție de traficul real

2. **Dezvoltare**
   - Limite mai permissive pentru mediu de dezvoltare
   - Logging detaliat pentru debugging

3. **Securitate**
   - Nu expune informații sensibile în răspunsuri
   - Loggează toate violările pentru analiză
   - Revizuiește periodic IP-urile blocate

## Troubleshooting

### Problema: Rate limiting prea strict

**Soluție**: Mărește limitele în `app/Providers/AppServiceProvider.php` sau `AdvancedRateLimitingMiddleware`

### Problema: IP blocat accidental

**Soluție**: Șterge cheia din cache:
```bash
php artisan tinker
Cache::forget('rate_limit_blocked:ip:YOUR_IP');
```

### Problema: Rate limiting nu funcționează

**Soluție**: 
1. Verifică că cache-ul funcționează: `php artisan cache:clear`
2. Verifică că middleware-ul este înregistrat în `bootstrap/app.php`
3. Verifică logurile pentru erori

## Referințe

- [Laravel 12 Rate Limiting Documentation](https://laravel.com/docs/12.x/routing#rate-limiting)
- [Laravel 12 Cache Documentation](https://laravel.com/docs/12.x/cache)
- [Laravel 12 Middleware Documentation](https://laravel.com/docs/12.x/middleware)

## Compatibilitate

- **Laravel Version**: 12.x
- **PHP Version**: 8.2+
- **Cache Driver**: Redis (recomandat pentru producție), File/Array (pentru dezvoltare)
