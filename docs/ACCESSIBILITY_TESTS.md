# Pruebas básicas de accesibilidad (WCAG 2.2 AA)

## Verificaciones realizadas

### 1. Contraste de color

| Elemento | Fondo | Texto | Ratio | Cumple AA |
|----------|-------|-------|-------|-----------|
| Texto principal | white (#fff) | slate-900 (#0f172a) | 15.9:1 | Sí |
| Texto secundario | white | slate-500 (#64748b) | 4.6:1 | Sí |
| Texto sobre teal-700 | teal-700 (#0f766e) | white | 5.9:1 | Sí |
| Texto sobre slate-900 | slate-900 (#0f172a) | slate-300 (#cbd5e1) | 11.6:1 | Sí |
| Placeholder | white | slate-400 (#94a3b8) | 2.9:1 | N/A (placeholder) |
| Enlaces | white | teal-700 (#0f766e) | 5.9:1 | Sí |

### 2. Navegación por teclado

| Elemento | Verificación |
|----------|-------------|
| Links de navegación pública | Focusable con Tab, visible focus ring |
| Botones de acción | Focusable, focus ring visible (focus:ring-2 focus:ring-teal-500) |
| Campos de formulario | Focusable, focus ring visible |
| Modal | Se puede cerrar con botón X |
| Menú móvil | Botón de menú focusable |

### 3. Etiquetas y ARIA

| Elemento | Atributo |
|----------|----------|
| Campos Input | `label` asociado con `htmlFor` |
| Botones de icono | `aria-label` descriptivo |
| Header | `aria-label="Navegación pública"` |
| Navegación admin | `aria-label="Navegación de administración"` |
| Botón menú móvil | `aria-expanded` dinámico |
| Imágenes | `alt=""` para decorativas |

### 4. Estructura semántica

| Elemento | Implementación |
|----------|---------------|
| Encabezados | jerarquía h1 > h2 > h3 correcta |
| Landmarks | `<header>`, `<main>`, `<nav>`, `<footer>` |
| Listas | `<ul>` con `role="list"` donde aplica |
| Tablas | `<thead>`, `<tbody>`, `<th>` con scope |

### 5. Formularios

| Verificación | Estado |
|--------------|--------|
| Campos con label visible | Sí |
| Campos requeridos marcados | `*` visible + `required` attr |
| Mensajes de error asociados | Texto bajo el campo |
| Autofocus en primer campo | No (mejora pendiente) |

### 6. Tamaños objetivo táctil

| Elemento | Tamaño mínimo | Cumple |
|----------|--------------|--------|
| Botones principales | 44px+ (py-2.5 + texto) | Sí |
| Links de navegación | 40px+ | Sí |
| Botones de icono | 32px+ (p-2) | Pendiente (revisar) |

## Mejoras pendientes

- [ ] Añadir `skip to main content` link
- [ ] Añadir autofocus en primer campo de formulario
- [ ] Añadir `role="alert"` a mensajes de error dinámicos
- [ ] Añadir `aria-live="polite"` a notificaciones de éxito
- [ ] Verificar navegación con lector de pantalla (NVDA/VoiceOver)
- [ ] Añadir descripciones `aria-label` a tablas de datos

## Herramientas recomendadas

- **axe DevTools**: Extensión de navegador para auditoría automática
- **Lighthouse**: Auditoría de accesibilidad en Chrome DevTools
- **WAVE**: Evaluación web de accesibilidad
- **Keyboard testing**: Navegar solo con Tab/Enter/Esc
