# Variables de entorno documentadas

## Archivo `.env`

El proyecto utiliza las siguientes variables de entorno. Estas ya están preconfiguradas
en el entorno de Bolt y no requieren configuración manual.

| Variable | Descripción | ¿Dónde se configura? |
|----------|-------------|---------------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Preconfigurada en Bolt |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase (pública) | Preconfigurada en Bolt |

## Variables de servidor (Supabase Dashboard)

Estas variables se configuran en el panel de Supabase, no en el archivo `.env`:

| Variable | Descripción | Ubicación en Dashboard |
|----------|-------------|----------------------|
| Service Role Key | Clave privilegiada para operaciones admin | Project Settings > API |
| SMTP Host | Servidor de correo saliente | Authentication > SMTP Settings |
| SMTP Username | Usuario del servidor SMTP | Authentication > SMTP Settings |
| SMTP Password | Contraseña del servidor SMTP | Authentication > SMTP Settings |
| Site URL | URL principal del sitio | Authentication > URL Configuration |
| Redirect URLs | URLs permitidas para redirección | Authentication > URL Configuration |

## Secrets para Edge Functions

Si se despliegan Edge Functions que requieren secrets:

| Secret | Descripción |
|--------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Para operaciones privilegiadas desde Edge Functions |

> **Importante**: Nunca colocar la Service Role Key ni secretos en el código frontend.
> Los secrets de Edge Functions se configuran en Supabase Dashboard > Edge Functions > Secrets.

## Configuración OAuth (Supabase Dashboard)

| Parámetro | Valor |
|-----------|-------|
| Authorization Path | `/oauth/consent` |
| JWT Signing Algorithm | RS256 o ES256 |
| Client IDs | Registrar en Authentication > OAuth Apps |

## Configuración del cliente demo (frontend)

El cliente demo (`/demo`) usa un `client_id` hardcodeado en `src/demo/config.ts`:

```typescript
clientId: 'demo-integracion-llave-gt'
```

Este valor debe coincidir con el client_id registrado en Supabase Dashboard > OAuth Apps.
El `redirect_uri` se calcula automáticamente como `${window.location.origin}/demo/callback`.
