# Pruebas funcionales

## Autenticación

### Registro de cuenta

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Navegar a `/registro`, llenar nombre, correo, contraseña, aceptar términos | Cuenta creada |
| 2 | Si email confirmation está activado | Redirección a pantalla de verificación |
| 3 | Si email confirmation está desactivado | Sesión iniciada, redirección a `/dashboard` |
| 4 | Intentar registrar correo ya existente | Error: "Este correo ya está registrado" |
| 5 | Contraseña menor a 8 caracteres | Error de validación |
| 6 | No aceptar términos y condiciones | Botón de registro deshabilitado |

### Verificación de correo

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Desde pantalla de verificación, hacer clic en "Reenviar" | Correo enviado, cooldown de 60s |
| 2 | Intentar reenviar antes de 60s | Botón deshabilitado con contador |
| 3 | Hacer clic en enlace del correo | Correo verificado, redirección a `/dashboard` |
| 4 | Usuario ya verificado navega a `/verificar-correo` | Redirección automática a `/dashboard` |

### Inicio de sesión

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Credenciales correctas | Sesión iniciada, redirección a `/dashboard` |
| 2 | Contraseña incorrecta | Error: "Correo o contraseña incorrectos" |
| 3 | Correo no verificado | Redirección a pantalla de verificación |
| 4 | Múltiples intentos fallidos | Rate limit: "Demasiados intentos" |
| 5 | Login con redirect OAuth | Preserva authorization_id, regresa a `/oauth/consent` |

### Recuperación de contraseña

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Navegar a `/recuperar-contrasena`, ingresar correo | Enlace enviado, cooldown 60s |
| 2 | Hacer clic en enlace del correo | Redirección a `/nueva-contrasena` |
| 3 | Ingresar nueva contraseña válida | Contraseña actualizada, redirección a login |
| 4 | Contraseñas no coinciden | Error de validación |

## Perfil y datos personales

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Editar nombre y guardar | Perfil actualizado, mensaje de éxito |
| 2 | Cambiar correo electrónico | Modal de confirmación, enlace enviado |
| 3 | Copiar UUID | UUID copiado al portapapeles |
| 4 | Dejar nombre vacío y guardar | Error: "El nombre completo es obligatorio" |

## Seguridad

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Cambiar contraseña con credenciales correctas | Contraseña actualizada |
| 2 | Contraseña actual incorrecta | Error: "Tu contraseña actual es incorrecta" |
| 3 | Contraseñas nuevas no coinciden | Error de validación |
| 4 | Cerrar sesión actual | Redirección a landing |
| 5 | Cerrar todas las sesiones | Todas las sesiones revocadas |

## Aplicaciones conectadas

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Ver aplicaciones disponibles | Lista de apps activas |
| 2 | Conectar una aplicación | Aparece como autorizada |
| 3 | Revocar una aplicación | Pasa a revocada, acceso removido |
| 4 | Sin aplicaciones conectadas | Estado vacío mostrado |

## Administración

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Admin ve Resumen de cuentas | Estadísticas correctas |
| 2 | Admin busca usuarios | Filtros funcionan |
| 3 | Admin cambia rol de usuario | Rol actualizado vía RPC |
| 4 | Admin intenta cambiar su propio rol | Error: "No puedes cambiar tu propio rol" |
| 5 | Participante intenta acceder a /admin | Redirección a /dashboard |
| 6 | Admin gestiona aplicaciones conectadas | CRUD funcional |
| 7 | Admin ve auditoría | Eventos mostrados con filtros |

## OAuth / OIDC

| # | Pasos | Resultado esperado |
|---|-------|-------------------|
| 1 | Navegar a /oauth/consent sin authorization_id | Error: falta parámetro |
| 2 | Navegar a /oauth/consent sin sesión | Redirección a login preservando redirect |
| 3 | Consent: aprobar | Redirección al cliente con código |
| 4 | Consent: rechazar | Redirección al cliente con error |
| 5 | Usuario ya consintió previamente | Redirección automática al cliente |
| 6 | Demo: iniciar sesión con Llave GT | Token validado, sesión creada |
| 7 | Demo: usuario con sesión activa | Consent directo sin re-login |
| 8 | Demo: cerrar sesión | Sesión local eliminada |
