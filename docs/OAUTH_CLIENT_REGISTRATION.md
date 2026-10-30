# Registro de Clientes OAuth — Guía para Administradores

Este documento describe cómo registrar las aplicaciones de Red Ciudadana como clientes OAuth del proveedor de identidad Llave GT, usando el servidor OAuth nativo de Supabase.

## Requisitos previos

1. Acceso al Dashboard de Supabase del proyecto `letjzluumsacjagsgdtn`
2. Permisos de administrador del proyecto
3. Las URLs de retorno (callback) confirmadas para cada aplicación

## Pasos generales para registrar un cliente

Para cada aplicación cliente, sigue estos pasos en el Dashboard de Supabase:

1. Inicia sesión en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona el proyecto **Llave GT** (`letjzluumsacjagsgdtn`)
3. Navega a **Authentication** > **OAuth Server** > **Clients**
4. Haz clic en **Add client**
5. Completa los campos:
   - **Client name**: Nombre visible de la aplicación (aparece en la pantalla de consentimiento)
   - **Client ID**: Identificador único del cliente (ver tabla abajo)
   - **Redirect URIs**: URLs exactas donde Supabase redirige tras la autorización
   - **Scopes**: `openid profile email` (mínimo recomendado)
6. Guarda el cliente
7. Copia el **Client Secret** generado y guárdalo de forma segura

## Clientes a registrar

### 1. Escuela Conecta Futuro

| Campo | Valor |
|-------|-------|
| Client name | Escuela Conecta Futuro |
| Client ID | `escuela-conecta-futuro` |
| Redirect URI | `https://escuela.redciudadana.org/auth/callback` |
| Scopes | `openid profile email` |
| Logo URI | (por definir — URL del logo de Escuela) |
| Client URI | `https://escuela.redciudadana.org/` |

### 2. Certificados

| Campo | Valor |
|-------|-------|
| Client name | Certificados |
| Client ID | `certificados-red-ciudadana` |
| Redirect URI | `https://certificados.redciudadana.org/auth/callback` |
| Scopes | `openid profile email` |
| Logo URI | (por definir — URL del logo de Certificados) |
| Client URI | `https://certificados.redciudadana.org/` |

### 3. Demo de Integración (ya registrado)

| Campo | Valor |
|-------|-------|
| Client name | Demo de Integración |
| Client ID | `demo-integracion-llave-gt` |
| Redirect URI | `http://localhost:5173/demo/callback` (desarrollo) |
| Scopes | `openid profile email` |

## URLs del proveedor OIDC

Los endpoints del proveedor de identidad están disponibles en:

- **Issuer**: `https://letjzluumsacjagsgdtn.supabase.co/auth`
- **Authorization endpoint**: `https://letjzluumsacjagsgdtn.supabase.co/auth/authorize`
- **Token endpoint**: `https://letjzluumsacjagsgdtn.supabase.co/auth/token`
- **UserInfo endpoint**: `https://letjzluumsacjagsgdtn.supabase.co/auth/userinfo`
- **JWKS endpoint**: `https://letjzluumsacjagsgdtn.supabase.co/auth/jwks`
- **Discovery document**: `https://letjzluumsacjagsgdtn.supabase.co/.well-known/openid-configuration`

## Flujo de autorización recomendado

1. La aplicación cliente redirige al usuario a la URL de autorización con:
   - `client_id`
   - `redirect_uri`
   - `response_type=code`
   - `scope=openid profile email`
   - `state` (token anti-CSRF aleatorio)
   - `code_challenge` (PKCE S256)
   - `code_challenge_method=S256`
   - `nonce` (token anti-replay para ID token)

2. Llave GT muestra la pantalla de consentimiento (`/oauth/consent`)
3. El usuario aprueba o rechaza el acceso
4. Supabase redirige a la `redirect_uri` con el código de autorización
5. La aplicación intercambia el código por tokens (access_token, id_token)
6. La aplicación valida el ID token usando el JWKS endpoint
7. La aplicación usa el access_token para consultar UserInfo

## Configuración en las aplicaciones cliente

Cada aplicación cliente (Escuela, Certificados) debe configurar:

```
OIDC_ISSUER=https://letjzluumsacjagsgdtn.supabase.co/auth
OIDC_CLIENT_ID=<client_id>
OIDC_CLIENT_SECRET=<client_secret>
OIDC_REDIRECT_URI=https://<dominio>/auth/callback
OIDC_SCOPES=openid profile email
```

## Identificadores estables

Llave GT usa el UUID interno de Supabase (`auth.users.id`) como identificador estable del usuario. Este UUID:

- No cambia cuando el usuario actualiza su correo o perfil
- No expone información personal (no es CUI/DPI)
- Es único globalmente
- Se entrega en el `sub` claim del ID token

Las aplicaciones cliente deben usar este `sub` como clave foránea para vincular al usuario, nunca el correo electrónico (que puede cambiar) ni datos personales.

## Roles de administrador independientes

Cada plataforma tiene sus propios roles de administrador, controlados por `admin_scope` en la tabla `profiles`:

- `admin_scope = 'llave_gt'`: Admin solo de Llave GT
- `admin_scope = 'escuela'`: Admin solo de Escuela
- `admin_scope = NULL`: Admin con acceso a ambas plataformas

Un administrador con scope `escuela` no puede:
- Modificar roles de administradores de Llave GT
- Desactivar cuentas de administradores de Llave GT
- Asignar el scope `llave_gt` a ningún usuario

## Verificación post-registro

Después de registrar cada cliente, verifica:

1. El flujo de autorización completo funciona (autorizar → callback → tokens → userinfo)
2. El ID token se valida correctamente contra el JWKS endpoint
3. Los scopes solicitados coinciden con los devueltos
4. La pantalla de consentimiento muestra el nombre correcto de la aplicación
5. El usuario puede revocar el acceso desde su panel de aplicaciones conectadas en Llave GT
