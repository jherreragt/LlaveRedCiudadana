# Procedimiento de respaldo y restauración

## Respaldos automáticos

Supabase realiza respaldos automáticos diarios de la base de datos PostgreSQL.

| Parámetro | Valor |
|-----------|-------|
| Frecuencia | Diario |
| Retención | 7 días |
| Tipo | Snapshot completo de la base de datos |

### Verificar el último respaldo

1. Ir a **Supabase Dashboard > Database > Backups**
2. Verificar la fecha del último backup exitoso
3. El status debe mostrar "Completed"

## Respaldo manual (export SQL)

Para un respaldo puntual de la estructura y datos:

```bash
# Usar pg_dump con la conexión de Supabase
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --no-owner --no-privileges \
  -f backup_$(date +%Y%m%d).sql
```

> **Nota**: No usar el Supabase CLI en este entorno. Usar pg_dump directamente o
> la función de export del Dashboard.

## Restauración

### Desde un respaldo automático de Supabase

1. Ir a **Supabase Dashboard > Database > Backups**
2. Seleccionar el backup a restaurar
3. Hacer clic en **Restore**
4. Confirmar la restauración
5. La base de datos estará disponible en unos minutos

### Desde un respaldo SQL manual

```bash
# Conectar a la base de datos y ejecutar el script SQL
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f backup_YYYYMMDD.sql
```

> **Advertencia**: La restauración desde SQL sobrescribe los datos existentes.
> Realizar solo cuando sea necesario y coordinar con el equipo.

## Qué incluir en un respaldo antes de cambios mayores

Antes de aplicar migraciones de base de datos o cambios estructurales:

1. Verificar que el último respaldo automático sea reciente (menos de 24 horas)
2. Realizar un respaldo SQL manual adicional
3. Documentar el cambio a aplicar
4. Aplicar el cambio en horario de bajo tráfico
5. Verificar la integridad de los datos tras el cambio

## Tablas críticas a respaldar

| Tabla | Importancia | Contiene |
|-------|------------|----------|
| `profiles` | Crítica | Datos de identidad de usuarios |
| `connected_apps` | Alta | Catálogo de aplicaciones OAuth |
| `user_app_connections` | Alta | Vínculos usuario-aplicación |
| `security_events` | Media | Registro de eventos (regenerable) |
| `auth.users` | Crítica | Credenciales y sesiones (gestionada por Supabase) |
