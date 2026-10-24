# Configuración de correo transaccional (SMTP)

## Propósito

Llave GT envía correos transaccionales para:
- Verificación de correo electrónico al registrarse
- Recuperación de contraseña
- Confirmación de cambio de correo

## Configuración en Supabase Dashboard

### 1. Habilitar SMTP personalizado

1. Ir a **Authentication > Email Templates > SMTP Settings**
2. Activar **Custom SMTP**
3. Configurar los siguientes valores:

| Parámetro | Valor |
|-----------|-------|
| Host | `smtp.redciudadana.org.gt` (reemplazar con el servidor SMTP real) |
| Puerto | `587` |
| Username | `no-reply@redciudadana.org.gt` |
| Password | (configurar como secret en Supabase) |
| Sender email | `no-reply@redciudadana.org.gt` |
| Sender name | `Llave GT` |
| Minimum interval | `60s` (previene abuso de envío) |
| Encription | `STARTTLS` |

### 2. Límites contra abuso

Supabase Auth incluye limitación de tasa (rate limiting) nativa para correos transaccionales:

| Acción | Límite | Configuración |
|--------|--------|---------------|
| Registro | 3 por hora por IP | Authentication > Rate Limits |
| Verificación | 3 por hora por email | Cooldown de 60s en frontend |
| Recuperación | 3 por hora por email | Cooldown de 60s en frontend |
| Cambio de correo | 2 por hora por usuario | Rate limit nativo |

Los cooldowns de 60 segundos también se aplican en el frontend (`VerifyEmail.tsx`, `ForgotPassword.tsx`).

### 3. Plantillas de correo en español

Configurar en **Authentication > Email Templates**:

#### Confirmación de registro
```
Asunto: Verifica tu correo en Llave GT

Hola,

Has creado una cuenta en Llave GT, tu identidad digital para acceder a servicios y plataformas de manera sencilla y segura.

Para confirmar tu correo electrónico y activar tu cuenta, haz clic en el siguiente enlace:

{{ .ConfirmationURL }}

Si no creaste esta cuenta, puedes ignorar este correo.

— Llave GT
Un proyecto de Red Ciudadana
```

#### Recuperación de contraseña
```
Asunto: Restablece tu contraseña en Llave GT

Hola,

Has solicitado restablecer tu contraseña de Llave GT.

Haz clic en el siguiente enlace para crear una nueva contraseña:

{{ .ConfirmationURL }}

Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.

— Llave GT
Un proyecto de Red Ciudadana
```

#### Cambio de correo
```
Asunto: Confirma tu nuevo correo en Llave GT

Hola,

Has solicitado cambiar tu correo electrónico en Llave GT.

Para confirmar tu nuevo correo, haz clic en el siguiente enlace:

{{ .ConfirmationURL }}

Si no solicitaste este cambio, puedes ignorar este correo.

— Llave GT
Un proyecto de Red Ciudadana
```

#### Invitación (si se usa)
```
Asunto: Te han invitado a Llave GT

Hola,

Has sido invitado a crear una cuenta en Llave GT.

Haz clic en el siguiente enlace para aceptar la invitación y crear tu cuenta:

{{ .ConfirmationURL }}

— Llave GT
Un proyecto de Red Ciudadana
```
