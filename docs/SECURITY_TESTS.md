# Pruebas de seguridad

## Pruebas ejecutadas (Fase 1)

Las siguientes pruebas se ejecutaron y pasaron correctamente tras la implementación
de las correcciones de seguridad en la Fase 1:

### 1. Usuario anónimo no puede acceder a datos privados

**Pasos**:
1. Sin iniciar sesión, intentar acceder a `/dashboard`
2. Verificar redirección a `/ingresar`
3. Intentar consultar `profiles` mediante la API de Supabase con anon key

**Resultado esperado**: No hay acceso. Las políticas RLS bloquean SELECT para anon.

### 2. Usuario participante no puede ver perfiles de otros

**Pasos**:
1. Iniciar sesión como participante
2. Intentar leer la tabla `profiles` completa

**Resultado esperado**: Solo ve su propio perfil (policy `auth.uid() = id`).

### 3. Auto-asignación de rol admin

**Pasos**:
1. Iniciar sesión como participante
2. Intentar actualizar `role` a `admin` mediante `supabase.from('profiles').update({ role: 'admin' })`

**Resultado esperado**: Error 42501 o campo ignorado. La columna `role` no tiene grant UPDATE.

### 4. Usuario ordinario no puede acceder al panel admin

**Pasos**:
1. Iniciar sesión como participante
2. Navegar a `/admin`

**Resultado esperado**: Redirección a `/dashboard` (AdminRoute verifica `role === 'admin'`).

### 5. Usuario suspendido no puede iniciar sesión

**Pasos**:
1. Un admin establece `is_active = false` para un usuario
2. El usuario intenta iniciar sesión

**Resultado esperado**: La cuenta está inactiva. El acceso debe ser denegado o restringido.

### 6. Certificados públicos (si aplica)

**Pasos**:
1. Intentar acceder a `certificates` sin autenticación

**Resultado esperado**: No hay SELECT para anon. Solo `verify_certificate_by_code()` RPC está disponible.

### 7. Tokens OAuth no pueden acceder a tablas internas

**Pasos**:
1. Obtener un access token OAuth de un cliente registrado
2. Intentar consultar `profiles`, `security_events`, `user_app_connections`

**Resultado esperado**: Políticas RESTRICTIVE bloquean el acceso cuando `client_id IS NOT NULL` en el JWT.

## Pruebas adicionales recomendadas

### Rate limiting

| Prueba | Método |
|--------|--------|
| Registro masivo desde una IP | Intentar 5+ registros en 1 hora |
| Recuperación masiva | Intentar 5+ recuperaciones en 1 hora |
| Fuerza bruta de login | Intentar 10+ logins fallidos consecutivos |

### Validación de tokens OIDC

| Prueba | Método |
|--------|--------|
| Token con firma inválida | Modificar un byte del token y validar con jose |
| Token expirado | Usar un token con exp pasado |
| Token con audience incorrecta | Validar con un client_id distinto |
| Token con nonce incorrecto | Enviar nonce distinto al almacenado |
| Token con issuer incorrecto | Validar con un issuer distinto |

## Herramientas recomendadas

- **Supabase Advisor**: Dashboard > Advisors > Security
- **Security Posture**: Usar `mcp__supabase__get_security_posture` para revisar políticas
- **RLS Testing**: Usar `mcp__supabase__execute_sql` con roles específicos para probar políticas
