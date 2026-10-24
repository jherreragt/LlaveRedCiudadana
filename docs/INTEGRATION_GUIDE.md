# Guía para conectar aplicaciones externas a Llave GT

## Resumen

Llave GT funciona como un proveedor de identidad OAuth 2.1 / OpenID Connect.
Las aplicaciones externas pueden permitir a sus usuarios "Ingresar con Llave GT"
sin necesidad de crear cuentas separadas ni compartir contraseñas.

## Requisitos previos

1. El servidor OAuth de Llave GT debe estar habilitado en Supabase Dashboard
2. Las claves JWT deben estar migradas a RS256 o ES256
3. La aplicación externa debe tener un endpoint HTTPS para recibir el callback

## Paso 1: Registrar tu aplicación

Contacta al equipo de Red Ciudadana para registrar tu aplicación como cliente OAuth.
Debes proporcionar:

| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre de tu aplicación |
| Redirect URIs | URLs exactas donde el usuario será redirigido tras autorizar |
| Tipo de cliente | **Public** (SPA/móvil, sin secret) o **Confidential** (servidor, con secret) |
| Scopes solicitados | `openid email profile` (mínimo recomendado) |

Recibirás un **Client ID** único. Si eres cliente confidencial, también recibirás un **Client Secret**.

## Paso 2: Implementar el flujo OAuth

### Authorization Code Flow con PKCE S256

Este es el único flujo soportado y el más seguro para aplicaciones web y móviles.

#### 2.1. Generar PKCE

```javascript
// Generar code_verifier (aleatorio, 43-128 caracteres)
const codeVerifier = generateRandomString(64);

// Generar code_challenge (S256 del verifier)
const encoder = new TextEncoder();
const hash = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier));
const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
```

#### 2.2. Construir URL de autorización

```
https://[PROJECT_REF].supabase.co/auth/v1/authorize
  ?client_id=TU_CLIENT_ID
  &redirect_uri=https://tu-app.com/callback
  &response_type=code
  &scope=openid email profile
  &state=VALOR_ALEATORIO
  &nonce=VALOR_ALEATORIO
  &code_challenge=CODE_CHALLENGE
  &code_challenge_method=S256
```

#### 2.3. Manejar el callback

El usuario será redirigido a tu `redirect_uri` con:
- `code`: el código de autorización (éxito)
- `state`: debe validar que coincida con el enviado
- `error`: si el usuario rechazó o hubo un error

#### 2.4. Intercambiar código por tokens

```http
POST https://[PROJECT_REF].supabase.co/auth/v1/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=TU_CLIENT_ID
&client_secret=TU_CLIENT_SECRET  (solo clientes confidenciales)
&code=AUTHORIZATION_CODE
&redirect_uri=https://tu-app.com/callback
&code_verifier=CODE_VERIFIER_ORIGINAL
```

Respuesta:
```json
{
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

#### 2.5. Validar el ID token

Usa una biblioteca confiable como `jose` (Node.js/navegador) o `pyjwt` (Python):

```javascript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://[PROJECT_REF].supabase.co/auth/v1/.well-known/jwks.json'));

const { payload } = await jwtVerify(idToken, JWKS, {
  issuer: 'https://[PROJECT_REF].supabase.co/auth/v1',
  audience: 'TU_CLIENT_ID',
  algorithms: ['RS256', 'ES256'],
});

// Verificar nonce
if (payload.nonce !== expectedNonce) throw new Error('Nonce mismatch');

// payload.sub = identificador único del usuario
// payload.email = correo verificado
// payload.name = nombre completo
```

#### 2.6. Obtener datos del usuario (opcional)

```http
GET https://[PROJECT_REF].supabase.co/auth/v1/userinfo
Authorization: Bearer ACCESS_TOKEN
```

## Scopes disponibles

| Scope | Información proporcionada |
|-------|--------------------------|
| `openid` | ID token con `sub` (identificador único) |
| `email` | Correo electrónico verificado en ID token y UserInfo |
| `profile` | Nombre completo y datos básicos en ID token y UserInfo |

## Endpoints OAuth / OIDC

| Endpoint | URL |
|----------|-----|
| Authorization | `https://[PROJECT_REF].supabase.co/auth/v1/authorize` |
| Token | `https://[PROJECT_REF].supabase.co/auth/v1/oauth/token` |
| JWKS | `https://[PROJECT_REF].supabase.co/auth/v1/.well-known/jwks.json` |
| OIDC Discovery | `https://[PROJECT_REF].supabase.co/auth/v1/.well-known/openid-configuration` |
| UserInfo | `https://[PROJECT_REF].supabase.co/auth/v1/userinfo` |

## Seguridad

### Obligatorio

- **PKCE S256**: Genera `code_verifier` y `code_challenge` en cada solicitud
- **State**: Genera un valor aleatorio y validalo al recibir el callback
- **Nonce**: Genera un valor aleatorio y validalo en el ID token
- **HTTPS**: Todas las redirect URIs deben ser HTTPS en producción
- **Validación de token**: Verifica firma (JWKS), `iss`, `aud`, `exp` y `nonce`

### Prohibido

- No almacenar la contraseña del usuario
- No usar el access token como sustituto de la validación de identidad
- No poner el client_secret en código frontend (solo clientes confidenciales en servidor)
- No usar el token de acceso para consultar tablas internas de Llave GT (bloqueado por RLS)

## Aplicación de demostración

Llave GT incluye una aplicación demo en `/demo` que implementa el flujo completo.
Puedes ver el código en `src/demo/` como referencia.

## Soporte

Para asistencia técnica o registro de aplicaciones:
- Correo: datos@redciudadana.org.gt
- Documentación técnica: `/desarrolladores`
