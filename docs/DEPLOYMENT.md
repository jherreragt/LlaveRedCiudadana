# Procedimiento de despliegue

## Dominio propuesto

**Dominio futuro**: `https://llave.redciudadana.org.gt`

> No modificar DNS ni dominios reales automáticamente.
> La configuración del dominio debe realizarse manualmente por el equipo de infraestructura.

## Entorno de desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (se ejecuta automáticamente en Bolt)
npm run dev

# Verificar compilación
npm run build

# Verificar tipos
npm run typecheck

# Lint
npm run lint
```

## Despliegue en producción

### Opción A: Despliegue en Bolt

1. Hacer clic en **Publish** en Bolt
2. Bolt despliega automáticamente en su infraestructura
3. Conectar el dominio personalizado desde **Settings > Domains**
4. Configurar los registros DNS según las instrucciones de Bolt

### Opción B: Despliegue manual (VPS / hosting propio)

1. Compilar el proyecto:
   ```bash
   npm run build
   ```
2. Los archivos estáticos se generan en `dist/`
3. Servir `dist/` con cualquier servidor web (nginx, Apache, Caddy, etc.)
4. Configurar HTTPS con un certificado válido (Let's Encrypt recomendado)

#### Configuración nginx de ejemplo

```nginx
server {
    listen 80;
    server_name llave.redciudadana.org.gt;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name llave.redciudadana.org.gt;

    ssl_certificate /etc/letsencrypt/live/llave.redciudadana.org.gt/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/llave.redciudadana.org.gt/privkey.pem;

    root /var/www/llave-gt/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

## Checklist de despliegue

- [ ] `npm run build` pasa sin errores
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Supabase URL y anon key correctas
- [ ] Site URL configurada en Supabase Dashboard > Authentication > URL Configuration
- [ ] Redirect URLs configuradas en Supabase Dashboard
- [ ] OAuth Server habilitado (Authentication > OAuth Server)
- [ ] Authorization Path = `/oauth/consent`
- [ ] Claves JWT migradas a RS256 (Authentication > JWT Keys)
- [ ] Clientes OAuth registrados (Authentication > OAuth Apps)
- [ ] SMTP configurado (Authentication > Email Templates > SMTP Settings)
- [ ] Plantillas de correo en español configuradas
- [ ] HTTPS habilitado en el dominio de producción
- [ ] Headers de seguridad configurados
- [ ] Dominio apuntando al servidor correcto
