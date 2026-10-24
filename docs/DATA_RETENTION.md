# Política de conservación de información

## Datos de usuarios (tabla `profiles`)

| Tipo de dato | Período de conservación | Acción al expirar |
|--------------|------------------------|-------------------|
| Datos de cuenta (nombre, correo, teléfono, etc.) | Indefinido mientras la cuenta esté activa | Eliminación a solicitud del usuario |
| Eventos de seguridad (`security_events`) | 12 meses | Eliminación automática |
| Conexiones de aplicaciones (`user_app_connections`) | Indefinido mientras el usuario no las revoque | Eliminación al revocar o eliminar cuenta |
| Tokens y sesiones | Gestionado por Supabase Auth | Expiración automática según configuración |

## Eliminación de cuenta

Cuando un usuario solicita la eliminación de su cuenta:

1. Se eliminan los registros en `profiles`, `user_app_connections`, `security_events`
2. Se eliminan las sesiones activas (signOut global)
3. Se elimina el usuario de `auth.users` mediante el panel de Supabase o API admin
4. Plazo máximo: 30 días desde la solicitud

## Logs de auditoría del sistema

Los logs de auditoría del sistema (visibles en Admin > Auditoría) se conservan por 12 meses.
Tras ese período, los eventos se eliminan automáticamente mediante un job programado.

Los registros pueden conservarse de forma anónima (sin identificación del usuario) si
existen requisitos legales que así lo exijan.

## Backups

Los backups de la base de datos se realizan automáticamente por Supabase:
- **Frecuencia**: diario
- **Retención**: 7 días
- **Restauración**: mediante Supabase Dashboard > Database > Backups

Los backups contienen los datos existentes al momento de la copia. Si un usuario
solicitó eliminación antes del backup, sus datos no aparecerán en backups posteriores.
