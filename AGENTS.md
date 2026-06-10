# AGENTS.md

> Instrucciones para agentes de código que trabajen en este proyecto.

---

## Stack Tecnológico

- **Framework:** Nuxt 4.4.2 con Nitro 2.13.2, Vue 3.5.31
- **Estilos:** Tailwind CSS v4, componentes estilo shadcn/vue
- **Base de datos:** PostgreSQL (local) / PGlite (Nuxt Content)
- **ORM:** Prisma 7.5.0
- **Auth:** `nuxt-auth-utils` con sesiones basadas en cookies
- **Contenido:** `@nuxt/content` v3 con colecciones y pglite
- **Editor:** Tiptap v3 (`@tiptap/vue-3`, `@tiptap/starter-kit`)
- **Conversión MD:** `marked` (md→HTML), `turndown` (HTML→md)
- **Package manager:** pnpm 10.12.1

---

## Convenciones Importantes

### Rutas de contenido (case-insensitive)

Las URLs siempre llegan en minúsculas. Las carpetas reales en `content/` usan PascalCase. **Siempre normalizar a minúsculas** antes de buscar colecciones o resolver paths:

```ts
const normalized = route.params.centro.toLowerCase()
```

### Colecciones de Nuxt Content

Cada carpeta bajo `content/` debe tener su colección en `content.config.ts`:

```ts
cpifp_enlaces: defineCollection({
  type: 'page',
  source: '50010314-CPIFP_Los_Enlaces/**/*.md',
})
```

### Editor Tiptap

- **NO usar `tiptap-markdown`**. Es incompatible con Tiptap v3.
- Usar `marked.parse()` para cargar markdown en el editor
- Usar `turndownService.turndown()` para guardar desde el editor
- Siempre preservar el frontmatter YAML (extraer con regex antes, reinsertar después)

### API de archivos de contenido

- `server/utils/content-path.ts` resuelve rutas case-insensitive
- Soporta directorios con `index.md` y archivos `.md` directos
- Los endpoints están en `server/api/content/file.get.ts` y `file.put.ts`

---

## Comandos Esenciales

```bash
# Desarrollo (verificar que no haya instancias previas)
pkill -f "nuxt dev"   # matar instancias viejas si las hay
pnpm dev

# Si hay errores de .nuxt/dev corrupto
rm -rf .nuxt/dev && pnpm dev

# Base de datos
pnpm prisma:migrate   # migraciones
pnpm prisma:seed      # datos iniciales
pnpm prisma:studio    # GUI de Prisma

# Verificar tipos (puede fallar por vue-router peer deps, es normal)
pnpx nuxt typecheck
```

---

## Errores Conocidos (ver `docus/fallos_soluciones.md`)

Antes de intentar solucionar un error, revisar si está documentado en `docus/fallos_soluciones.md`:

- `tiptap-markdown` incompatible con Tiptap v3
- Case-sensitivity en rutas de contenido
- `resolveContentPath` y archivos `.md` directos
- Múltiples instancias de `nuxt dev`
- Timeouts al arrancar el servidor

---

## Estructura de Contenido

```
content/
├── blog/
│   └── bienvenida.md
├── 50010314-CPIFP_Los_Enlaces/
│   └── IFC303-DAW/
│       ├── 5084-DWES/
│       │   └── 0613/
│       │       └── index.md
│       └── 5180-BBDD/
│           └── 0484/
│               └── index.md
└── 50020125-CampusVirtualFP/
    └── IFC303-DAW/
        ├── 5084-DWES/
        │   └── 0613/
        │       └── index.md
        └── 5180-BBDD/
            └── 0484/
                └── index.md
```

Las rutas resultantes son:
- `/50010314-cpifp_los_enlaces/ifc303-daw/5084-dwes/0613`
- `/50020125-campusvirtualfp/ifc303-daw/5084-dwes/0613`

---

## Middleware y Roles

Las páginas protegidas usan:

```ts
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})
```

Jerarquía de roles: `USER` < `DAW` < `ADMIN` < `ROOT`

---

## Docker

El proyecto incluye `docker-compose.yml` con PostgreSQL. No usar Docker para Nuxt Content (usa PGlite embebido, no requiere servicio separado).

---

*Actualizado: 2025-06-10*
