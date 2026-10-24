# Llave GT

**Tu identidad digital para acceder a servicios y plataformas de manera sencilla y segura.**

Un proyecto de Red Ciudadana para Guatemala.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new)

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos y seguridad](#base-de-datos-y-seguridad)
- [Servidor OAuth 2.1 / OIDC](#servidor-oauth-21--oidc)
- [Pruebas](#pruebas)
- [Documentación operativa](#documentación-operativa)
- [Dominio propuesto](#dominio-propuesto)
- [Limitaciones conocidas](#limitaciones-conocidas)

---

## Descripción

Llave GT es una plataforma de identidad digital que permite a las personas crear una cuenta
verificada con su correo electrónico y usar esa identidad para acceder a múltiples plataformas
y servicios dentro del ecosistema de Red Ciudadana, mediante el protocolo OAuth 2.1 / OpenID Connect.

### Características principales

- **Registro y autenticación**: cuenta con correo electrónico, verificación, recuperación de contraseña
- **Perfil personal**: datos personales editables, cambio de correo con confirmación
- **Seguridad**: cambio de contraseña con reautenticación, gestión de sesiones, registro de actividad
- **Aplicaciones conectadas**: autorizar y revocar aplicaciones que usan tu identidad
- **Proveedor OAuth 2.1 / OIDC**: otras aplicaciones pueden mostrar "Ingresar con Llave GT"
- **Panel de administración**: gestión de usuarios, aplicaciones, auditoría y configuración
- **Aplicación demo**: cliente OIDC independiente que demuestra la integración end-to-end

### Lo que Llave GT NO es

- No es un documento de identidad nacional
- No reemplaza el DPI o CUI
- No recopila información biométrica ni documentos de identidad

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  Aplicación Llave GT                  │
│                    (React + Vite)                     │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Públicas │  │   Auth   │  │  Autenticadas    │  │
│  │           │  │          │  │                  │  │
│  │ Landing   │  │ Login    │  │ Mi identidad     │  │
│  │ ¿Qué es?  │  │ Registro │  │ Datos personales │  │
│  │ Cómo func.│  │ Verificar│  │ Seguridad        │  │
│  │ Privacidad│  │ Recuperar│  │ Aplicaciones     │  │
│  │ Desarroll.│  │ Reset    │  │ Actividad        │  │
│  │ Aviso     │  │          │  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                       │
│  ┌────────────────┐  ┌─────────────────────────┐    │
│  │     Admin       │  │   OAuth / Demo Client   │    │
│  │                 │  │                         │    │
│  │ Resumen cuentas │  │ /oauth/consent          │    │
│  │ Usuarios        │  │ /demo (cliente OIDC)    │    │
│  │ Aplicaciones    │  │ /demo/callback          │    │
│  │ Auditoría       │  │                         │    │
│  │ Configuración   │  │                         │    │
│  └────────────────┘  └─────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Supabase                           │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Auth    │  │ Database │  │   OAuth Server    │  │
│  │           │  │ PostgreSQL│  │   (OIDC)          │  │
│  │ Email/pw  │  │          │  │                   │  │
│  │ Sesiones  │  │  RLS     │  │  Authorization    │  │
│  │ JWT RS256 │  │  Policies│  │  Code + PKCE      │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Iconos | Lucide React |
| Routing | React Router DOM v7 |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| Validación JWT | jose (biblioteca estándar JOSE) |
| Auth SDK | @supabase/supabase-js v2.118.0 |

---

## Instalación

```bash
# Clonar o descargar el proyecto
cd llave-gt

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Verificar tipos
npm run typecheck

# Lint
npm run lint
```

---

## Configuración

### Variables de entorno

El archivo `.env` contiene las variables de Supabase, preconfiguradas en Bolt:

```env
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Ver [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) para la documentación completa de variables.

### Configuración en Supabase Dashboard

1. **Authentication > URL Configuration**: Site URL = `https://llave.redciudadana.org.gt`
2. **Authentication > Email Templates**: Configurar plantillas en español (ver [`docs/SMTP_CONFIG.md`](docs/SMTP_CONFIG.md))
3. **Authentication > SMTP Settings**: Configurar SMTP personalizado
4. **Authentication > JWT Keys**: Migrar a RS256 o ES256
5. **Authentication > OAuth Server**: Habilitar, Authorization Path = `/oauth/consent`
6. **Authentication > OAuth Apps**: Registrar clientes OAuth

---

## Estructura del proyecto

```
src/
├── App.tsx                     # Router principal con todas las rutas
├── main.tsx                    # Punto de entrada
├── index.css                   # Estilos globales (Tailwind)
├── contexts/
│   └── AuthContext.tsx         # Contexto de autenticación (signUp, signIn, etc.)
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   ├── types.ts                # Tipos TypeScript (Database, Profile, etc.)
│   └── utils.ts                # Utilidades (formatDate es-GT, clsx, etc.)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx  # Rutas protegidas (user + admin)
│   ├── layout/
│   │   ├── PublicLayout.tsx    # Layout público con header y footer
│   │   ├── PublicHeader.tsx    # Header con navegación pública
│   │   ├── DashboardLayout.tsx # Layout para usuarios autenticados
│   │   ├── AdminLayout.tsx     # Layout para admin
│   │   └── AdminSidebar.tsx    # Sidebar de admin
│   └── ui/
│       ├── Button.tsx          # Botón reutilizable
│       ├── Input.tsx           # Input, Textarea, Select
│       ├── Modal.tsx           # Modal
│       ├── Alert.tsx           # Alertas
│       ├── Badge.tsx           # Badges de estado
│       ├── Spinner.tsx         # Spinners
│       └── EmptyState.tsx      # Estado vacío
├── pages/
│   ├── public/                 # Páginas públicas
│   │   ├── Landing.tsx         # Inicio
│   │   ├── WhatIs.tsx          # ¿Qué es Llave GT?
│   │   ├── HowItWorks.tsx      # Cómo funciona
│   │   ├── Privacy.tsx         # Privacidad y seguridad
│   │   ├── PrivacyNotice.tsx   # Aviso de privacidad (legal)
│   │   └── Developers.tsx      # Guía para desarrolladores
│   ├── auth/                   # Páginas de autenticación
│   │   ├── Login.tsx           # Inicio de sesión
│   │   ├── Register.tsx        # Registro
│   │   ├── VerifyEmail.tsx     # Verificación de correo
│   │   ├── ForgotPassword.tsx  # Solicitar recuperación
│   │   └── ResetPassword.tsx   # Nueva contraseña
│   ├── oauth/
│   │   └── Consent.tsx         # Pantalla de consentimiento OAuth
│   ├── participant/            # Páginas de usuario
│   │   ├── Dashboard.tsx       # Mi identidad
│   │   ├── Profile.tsx         # Datos personales
│   │   ├── Security.tsx        # Seguridad
│   │   ├── ConnectedApps.tsx   # Aplicaciones conectadas
│   │   └── SecurityActivity.tsx # Actividad de seguridad
│   └── admin/                  # Páginas de admin
│       ├── AdminDashboard.tsx  # Resumen de cuentas
│       ├── AdminUsers.tsx      # Gestión de usuarios
│       ├── AdminApps.tsx       # Aplicaciones autorizadas
│       ├── AdminAudit.tsx      # Auditoría
│       └── AdminConfig.tsx     # Configuración
└── demo/                       # Aplicación cliente demo (OIDC)
    ├── config.ts               # Configuración OAuth del cliente
    ├── tokens.ts               # Validación de tokens con jose
    └── pages/
        ├── DemoWelcome.tsx     # Pantalla inicial con botón
        ├── DemoCallback.tsx    # Manejo del callback OAuth
        └── AuthenticatedView.tsx # Pantalla autenticada

docs/                           # Documentación operativa
├── SMTP_CONFIG.md              # Configuración de correo y plantillas
├── DATA_RETENTION.md           # Política de conservación
├── BACKUP_RESTORE.md           # Respaldo y restauración
├── DEPLOYMENT.md               # Procedimiento de despliegue
├── ENVIRONMENT.md              # Variables de entorno
├── SECURITY_TESTS.md           # Pruebas de seguridad
├── FUNCTIONAL_TESTS.md         # Pruebas funcionales
├── ACCESSIBILITY_TESTS.md      # Pruebas de accesibilidad
└── INTEGRATION_GUIDE.md        # Guía para conectar apps externas
```

---

## Base de datos y seguridad

### Tablas

| Tabla | Propósito |
|-------|-----------|
| `profiles` | Datos de identidad de usuarios |
| `connected_apps` | Catálogo de aplicaciones OAuth |
| `user_app_connections` | Vínculos usuario-aplicación |
| `security_events` | Registro de eventos de seguridad |

### Arquitectura de seguridad

- **RLS (Row Level Security)** habilitada en todas las tablas
- **Políticas por verbo** (SELECT, INSERT, UPDATE, DELETE) separadas
- **Column-level grants**: `role` e `is_active` no son escribibles vía API
- **SECURITY DEFINER functions**: `set_user_role()`, `set_user_active()`, `has_admin_role()`, `has_staff_role()`
- **Políticas RESTRICTIVE**: tokens OAuth (`client_id IS NOT NULL`) no pueden acceder a tablas internas
- **`is_oauth_client_token()`**: función helper que detecta tokens de clientes OAuth

### Migraciones aplicadas

| Archivo | Descripción |
|---------|-------------|
| `20260423031409_create_llavered_ciudadana_schema.sql` | Esquema original |
| `20260423031450_seed_sample_data.sql` | Datos de ejemplo |
| `20261024040000_p1_security_rls_fix.sql` | Correcciones de seguridad (RLS, RPCs) |
| `20261024042000_p1b_lock_backup_tables.sql` | Bloqueo de tablas de respaldo |
| `20261101030000_p3_identity_apps_security_tables.sql` | Tablas de apps y eventos |
| `20261101040000_p4_oauth_rls_protection.sql` | Protección RLS contra tokens OAuth |

---

## Servidor OAuth 2.1 / OIDC

Llave GT utiliza el servidor OAuth 2.1 nativo de Supabase Auth.

### Flujo soportado

Authorization Code Flow con PKCE S256 (OAuth 2.1)

### Scopes

`openid`, `email`, `profile`

### Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization | `https://[PROJECT_REF].supabase.co/auth/v1/authorize` |
| Token | `https://[PROJECT_REF].supabase.co/auth/v1/oauth/token` |
| JWKS | `https://[PROJECT_REF].supabase.co/auth/v1/.well-known/jwks.json` |
| OIDC Discovery | `https://[PROJECT_REF].supabase.co/auth/v1/.well-known/openid-configuration` |

### Validación de tokens

- Firma: RS256/ES256 validada mediante JWKS remoto
- Claims: `iss`, `aud`, `exp`, `nonce` verificados
- Biblioteca: `jose` v6

### Aplicación demo

El cliente demo en `/demo` implementa el flujo completo y sirve como referencia:
- `src/demo/config.ts`: configuración OAuth, PKCE, state, nonce
- `src/demo/tokens.ts`: intercambio de código, validación de ID token, UserInfo
- `src/demo/pages/`: pantallas de bienvenida, callback y autenticada

---

## Pruebas

### Pruebas de seguridad

Ver [`docs/SECURITY_TESTS.md`](docs/SECURITY_TESTS.md) — 7 escenarios probados:
aceso anónimo, perfiles ajenos, auto-asignación de rol, acceso admin, usuario suspendido,
certificados públicos, y restricción de tokens OAuth.

### Pruebas funcionales

Ver [`docs/FUNCTIONAL_TESTS.md`](docs/FUNCTIONAL_TESTS.md) — cubre autenticación,
perfil, seguridad, aplicaciones conectadas, administración y OAuth/OIDC.

### Pruebas de accesibilidad

Ver [`docs/ACCESSIBILITY_TESTS.md`](docs/ACCESSIBILITY_TESTS.md) — verifica WCAG 2.2 AA:
contraste, navegación por teclado, etiquetas ARIA, estructura semántica, formularios.

### Verificación de build

```bash
npm run build    # Debe pasar sin errores
npm run typecheck # Verificación de tipos (puede tener errores preexistentes de supabase-js)
```

---

## Documentación operativa

| Documento | Descripción |
|-----------|-------------|
| [SMTP_CONFIG.md](docs/SMTP_CONFIG.md) | Configuración de correo transaccional y plantillas en español |
| [DATA_RETENTION.md](docs/DATA_RETENTION.md) | Política de conservación de información |
| [BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) | Procedimiento de respaldo y restauración |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Procedimiento de despliegue con checklist |
| [ENVIRONMENT.md](docs/ENVIRONMENT.md) | Variables de entorno documentadas |
| [SECURITY_TESTS.md](docs/SECURITY_TESTS.md) | Pruebas de seguridad |
| [FUNCTIONAL_TESTS.md](docs/FUNCTIONAL_TESTS.md) | Pruebas funcionales |
| [ACCESSIBILITY_TESTS.md](docs/ACCESSIBILITY_TESTS.md) | Pruebas de accesibilidad WCAG 2.2 AA |
| [INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md) | Guía para conectar aplicaciones externas |

---

## Dominio propuesto

**`https://llave.redciudadana.org.gt`**

> No se modifican DNS ni dominios automáticamente.
> La configuración del dominio debe realizarse manualmente por el equipo de infraestructura.
> Ver [DEPLOYMENT.md](docs/DEPLOYMENT.md) para instrucciones.

---

## Limitaciones conocidas

1. **Email confirmation**: Controlado por Supabase Dashboard, no por código. El frontend
   maneja ambos estados (verificación requerida / no requerida) correctamente.

2. **OAuth Server**: Requiere habilitación manual en Supabase Dashboard
   (Authentication > OAuth Server). La interfaz de consentimiento está lista pero
   no funcionará hasta que el servidor OAuth esté activo.

3. **Claves JWT**: Deben migrarse de HS256 a RS256/ES256 manualmente para que los
   ID tokens OIDC se emitan correctamente.

4. **Registro de eventos de seguridad**: Los eventos se registran en la tabla
   `security_events` cuando se invocan las funciones correspondientes. El login
   nativo de Supabase no registra automáticamente en esta tabla; se requiere
   invocar `log_security_event()` desde el frontend tras eventos importantes.

5. **MFA (TOTP)**: La autenticación multifactor está preparada como UI placeholder
   pero no implementada funcionalmente. Depende de la función nativa de Supabase Auth.

6. **Cliente demo**: El `client_id` `demo-integracion-llave-gt` debe registrarse
   manualmente en Supabase Dashboard > OAuth Apps para que el flujo funcione.

7. **Separación educativa**: Las tablas educativas (courses, enrollments, certificates)
   aún existen en la base de datos. La separación a una base de datos independiente
   para Escuela Conecta Futuro requiere un proyecto Supabase separado.

---

## Licencia

Proyecto de Red Ciudadana para Guatemala.

## Contacto

- **Institución**: Red Ciudadana
- **Correo**: datos@redciudadana.org.gt
- **Aviso de privacidad**: [/aviso-privacidad](/aviso-privacidad)
