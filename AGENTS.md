# AGENTS.md

> Instrucciones para agentes de código que trabajen en este proyecto.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Nuxt | 4.4.2 |
| Servidor | Nitro | 2.13.2 |
| Vue | Vue | 3.5.31 |
| Estilos | Tailwind CSS | v4 |
| Componentes UI | shadcn/vue | — |
| Base de datos | PostgreSQL (local) / PGlite (Nuxt Content) | — |
| ORM | Prisma | 7.5.0 |
| Auth | `nuxt-auth-utils` | — |
| Contenido | `@nuxt/content` | v3 |
| Editor WYSIWYG | Tiptap | v3 |
| Conversión MD | `marked` (md→HTML), `turndown` (HTML→md) | — |
| Iconos | `@nuxt/icon` (colección `lucide`) | — |
| Formularios | `vee-validate` + `zod` | — |
| Toast | `vue-sonner` | — |
| Package manager | pnpm | 10.12.1 |

---

## Arquitectura General

```
┌─────────────────────────────────────────┐
│  Layout: dashboard                      │
│  ├─ Sidebar (AppSidebar)                │
│  │  ├─ NavMain (secciones por rol)      │
│  │  ├─ NavSecondary (enlaces fijos)    │
│  │  └─ NavUser (dropdown perfil/logout) │
│  ├─ Header                              │
│  │  ├─ SidebarTrigger                   │
│  │  ├─ DynamicBreadCrumb                │
│  │  └─ ThemeToggle                      │
│  └─ Main (slot de la página)            │
└─────────────────────────────────────────┘
```

### Flujo de una página de contenido markdown

```
URL: /50010314-cpifp_los_enlaces/ifc303-daw/5084-dwes/0613

1. Middleware auth.ts      → verifica sesión
2. Middleware role.ts      → verifica allowedRoles
3. Página [...slug].vue    → resuelve colección + consulta contenido
4. ContentRenderer         → renderiza HTML con headings con id
5. TOC (aside derecho)     → navegación por anchors #id
```

---

## Sistema de Autenticación y Autorización

### Jerarquía de roles

```
USER  <  BLOG  <  DAW  <  ADMIN  <  ROOT
```

| Rol | Descripción |
|-----|-------------|
| `USER` | Usuario básico, solo perfil |
| `BLOG` | Acceso al blog |
| `DAW` | Acceso al contenido DAW |
| `ADMIN` | Gestión de usuarios + todo lo anterior |
| `ROOT` | Acceso total |

### Protección de páginas

```ts
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})
```

> **Nota:** Existen DOS sistemas de protección por roles:
> - `middleware: ['auth', 'role']` + `allowedRoles` → middleware explícito
> - `roles` (sin middleware) → `role.global.ts` (middleware global, legacy)

### Composables de auth

```ts
// Sesión extendida (recomendado)
const { session, logout, refresh } = useAppUserSession()
// session.value = { user, loggedIn, loading, role }

// Verificación de roles
const { hasRole, hasRoleOrHigher, hasAnyRole, isAdmin, isRoot } = useRole()
```

### Event bus de auth

```ts
import { authBus } from '~/composables/useAppUserSession'
authBus.emit('logout')
authBus.emit('login')
```

---

## Sistema de Contenido (Nuxt Content v3)

### Colecciones definidas (`content.config.ts`)

```ts
blog:            source: 'blog/**/*.md'
cpifp_enlaces:   source: '50010314-CPIFP_Los_Enlaces/**/*.md'
campus_virtual:  source: '50020125-CampusVirtualFP/**/*.md'
```

### Mapeo URL → Colección (`[centro]/[...slug].vue`)

```ts
const collectionMap: Record<string, string> = {
  '50010314-cpifp_los_enlaces': 'cpifp_enlaces',
  '50020125-campusvirtualfp': 'campus_virtual',
}
```

> **CRÍTICO:** Las URLs llegan en minúsculas. Las carpetas reales usan PascalCase. **Siempre normalizar a minúsculas** antes de buscar.

### Consultar contenido

```ts
// Contenido exacto
const { data: item } = await useAsyncData(`content-${path}`, () =>
  queryCollection('cpifp_enlaces').path('/50010314-cpifp_los_enlaces/ifc303-daw/5084-dwes/0613').first()
)

// Listar posts de blog
const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog').all()
)

// Buscar hijos
const { data: children } = await useAsyncData(`children-${path}`, () =>
  queryCollection('cpifp_enlaces')
    .where('path', 'LIKE', path + '/%')
    .all()
)
```

### Estructura del item devuelto

```ts
item = {
  path: '/blog/bienvenida',
  title: 'Bienvenida',
  description: '...',
  body: {
    // HTML renderizado (usado por ContentRenderer)
    type: 'root',
    children: [...],
    // Índice de contenidos (automático)
    toc: {
      title: 'Table of Contents',
      depth: 2,
      searchDepth: 2,
      links: [
        { id: 'introduccion', text: 'Introducción', depth: 2, children: [...] }
      ]
    }
  }
}
```

### Renderizar contenido

```vue
<template>
  <article class="content-prose max-w-none">
    <h1>{{ item.title }}</h1>
    <ContentRenderer :value="item" />
  </article>
</template>
```

> `<ContentRenderer>` renderiza headings con `id` automáticos, permitiendo navegación por anchor (`#id`).

### TOC (Índice de contenidos)

@nuxt/content v3 genera `body.toc.links` automáticamente. Existe un componente reutilizable:

```vue
<script setup lang="ts">
const tocLinks = computed(() => item.value?.body?.toc?.links ?? [])
</script>

<template>
  <div class="flex gap-8">
    <article class="content-prose flex-1 min-w-0">
      <ContentRenderer :value="item" />
    </article>
    <aside v-if="tocLinks.length" class="w-56 shrink-0 hidden lg:block">
      <ContentToc :links="tocLinks" title="Contenido" />
    </aside>
  </div>
</template>
```

Cada link tiene: `id`, `text`, `depth`, `children?`.

> **Patrón:** El componente `ContentToc` es puro presentacional. La página extrae los links del `body.toc` y se los pasa como prop. Esto permite reutilizarlo en cualquier página que renderice contenido markdown.

---

## API de Archivos de Contenido (raw markdown)

Para editar contenido markdown directamente (sin pasar por Nuxt Content):

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/content/file?path={ruta}` | Lee archivo raw |
| PUT | `/api/content/file` | Guarda archivo raw |

```ts
// Leer
const result = await $fetch('/api/content/file', {
  query: { path: 'blog/bienvenida' }  // sin barra inicial, sin .md
})
// result = { content: '---\ntitle:...\n---\n# ...', path: '...' }

// Guardar
await $fetch('/api/content/file', {
  method: 'PUT',
  body: { path: 'blog/bienvenida', content: '...markdown...' }
})
```

> `resolveContentPath()` resuelve rutas case-insensitive y soporta `index.md` y archivos `.md` directos.

---

## Editor Tiptap

### Reglas importantes

- **NO usar `tiptap-markdown`** — incompatible con Tiptap v3.
- Usar `marked.parse()` para cargar markdown → HTML
- Usar `turndownService.turndown()` para guardar HTML → markdown
- Preservar frontmatter YAML: extraer con regex antes, reinsertar después

### Extensiones configuradas

```ts
Heading.configure({ levels: [1, 2, 3] }),
Bold, Italic, Strike,
BulletList, OrderedList, ListItem, ListKeymap,
Blockquote, CodeBlock,
History, Dropcursor, Gapcursor
```

---

## Layouts

### `dashboard` (layout por defecto de páginas protegidas)

```
SidebarProvider
├─ AppSidebar (colapsable)
│  ├─ Header: logo + navegación
│  ├─ NavMain: secciones filtradas por rol
│  ├─ NavSecondary: enlaces fijos
│  └─ NavUser: avatar + dropdown perfil/logout
└─ SidebarInset
   ├─ Header: SidebarTrigger | Breadcrumb | ThemeToggle
   └─ Main: <slot />
```

### Páginas públicas (sin layout definido)

Usan layout por defecto (sin sidebar): login, register, etc.

---

## Componentes UI Disponibles (shadcn/vue)

Todos bajo `@/components/ui/{nombre}/`:

- **Layout:** `sidebar` (SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarMenu...), `separator`, `sheet`
- **Navegación:** `breadcrumb` (Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator)
- **Formularios:** `input`, `label`, `select`, `checkbox`, `switch`
- **Feedback:** `badge`, `sonner` (Toaster), `skeleton`, `tooltip`
- **Data:** `table`, `card` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Overlays:** `dropdown-menu`, `collapsible`, `avatar` (Avatar, AvatarImage, AvatarFallback)
- **Acción:** `button`
- **Contenido:** `ContentToc` (índice de contenidos para markdown)
- **MDC:** `Accordion`, `AccordionItem`, `Badge`, `Callout`, `Card`, `CardGroup`, `Collapsible`, `Field`, `FieldGroup`, `MdcIcon`, `Kbd`, `Tabs`, `Steps` (componentes markdown Docus v3)

### Iconos

```vue
<Icon name="lucide:icon-name" class="size-4" />
```

Colección disponible: `lucide` (más de 1000 iconos).

---

## Páginas y Rutas Existentes

| Ruta | Descripción | Middleware | Layout |
|------|-------------|------------|--------|
| `/` | Landing | — | default |
| `/login` | Login | auth (redirect si logueado) | default |
| `/register` | Registro | auth (redirect si logueado) | default |
| `/usuario` | Dashboard usuario | `auth` | dashboard |
| `/usuario/perfil` | Perfil | `auth` | dashboard |
| `/usuario/alta-usuario` | Alta usuario | `auth`, `role` | dashboard |
| `/daw` | Listado de centros DAW | `auth`, `role` (DAW+) | dashboard |
| `/blog` | Listado de posts | `auth`, `role` (BLOG+) | dashboard |
| `/blog/[slug]` | Post individual | `auth`, `role` (BLOG+) | dashboard |
| `/[centro]/[...slug]` | **Contenido markdown dinámico** | `auth`, `role` (DAW+) | dashboard |
| `/admin` | Panel admin | `auth`, `role` (ADMIN+) | dashboard |
| `/admin/usuarios/listado` | Listado usuarios | `auth`, `role` (ADMIN+) | dashboard |
| `/editor` | Editor Tiptap standalone | — | default |

### Patrón de página de contenido markdown

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const route = useRoute()
const fullPath = route.path.toLowerCase()

const { data: item } = await useAsyncData(`content-${fullPath}`, () =>
  queryCollection('cpifp_enlaces').path(fullPath).first()
)
</script>

<template>
  <div class="container mx-auto py-8">
    <article class="content-prose max-w-none">
      <h1 class="text-3xl font-bold mb-4">{{ item?.title }}</h1>
      <ContentRenderer v-if="item" :value="item" />
    </article>
  </div>
</template>
```

---

## API del Servidor (Nitro)

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con email/password |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/logout` | Cierre de sesión |

### Usuario actual

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/user` | Datos completos del usuario logueado |
| GET | `/api/user/profile` | Perfil editable |
| PUT | `/api/user/profile` | Actualizar perfil |
| POST | `/api/user/change-password` | Cambiar contraseña |

### Gestión de usuarios (admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listado de usuarios |
| POST | `/api/users` | Crear usuario |
| PATCH | `/api/users/:id` | Actualizar usuario |
| PATCH | `/api/users/bulk` | Actualización masiva |

### Contenido

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/content/file` | Leer archivo markdown raw |
| PUT | `/api/content/file` | Guardar archivo markdown raw |

### Utilidades del servidor

| Utilidad | Ubicación | Descripción |
|----------|-----------|-------------|
| `resolveContentPath` | `server/utils/content-path.ts` | Resuelve paths case-insensitive en `content/` |
| Prisma Client | `server/utils/prisma.ts` | Instancia singleton de PrismaClient |

---

## Estilos

### Tailwind CSS v4

Configuración en `assets/css/tailwind.css` con `@theme inline` y variables CSS.

### Clases de contenido

| Clase | Uso |
|-------|-----|
| `content-prose` | Estilos para HTML renderizado de markdown |
| `tiptap-editor-content` | Estilos idénticos a content-prose pero para el editor |

Ambas están definidas en `assets/css/content-prose.css`.

### Variables CSS del tema

```css
var(--background)
var(--foreground)
var(--primary)
var(--muted-foreground)
var(--border)
var(--accent)
/* etc. Ver tailwind.css para lista completa */
```

Soporta modo claro/oscuro vía clase `.dark` en `<html>`.

---

## Patrones de Código Comunes

### Botón flotante de edición

```vue
<button
  type="button"
  @click="toggleEdit"
  class="absolute top-0 right-0 p-2 rounded-md border bg-background hover:bg-accent transition-colors shadow-sm z-10"
>
  ✏️ Editar
</button>
```

### Toggle entre vista y edición

```ts
const isEditing = ref(false)
function toggleEdit() { isEditing.value = !isEditing.value }
function onSaved() { isEditing.value = false; refreshItem() }
function onCancelled() { isEditing.value = false }
```

### Card de navegación

```vue
<NuxtLink
  :to="href"
  class="block p-4 rounded-lg border hover:bg-accent transition-colors"
>
  <h2 class="text-xl font-semibold">{{ title }}</h2>
  <p class="text-muted-foreground mt-2">{{ description }}</p>
</NuxtLink>
```

### Breadcrumb del dashboard

```vue
<DynamicBreadCrumb :url="$route.path" />
```

Genera breadcrumbs automáticamente a partir de los segmentos de la URL.

---

## Cómo Crear Nuevos Elementos

### Nueva colección de contenido

1. Crear carpeta bajo `content/`
2. Añadir colección en `content.config.ts`:

```ts
nueva_coleccion: defineCollection({
  type: 'page',
  source: 'MiCarpeta/**/*.md',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
})
```

3. Añadir mapeo en la página que la consuma (ej: `[centro]/[...slug].vue`)

### Nueva página protegida

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- contenido -->
  </div>
</template>
```

### Nueva sección en el sidebar

Editar `app/lib/config.ts`:

```ts
export const navSections: NavSection[] = [
  {
    title: 'Mi Sección',
    roles: ['DAW', 'ADMIN', 'ROOT'],
    items: [
      { title: 'Página', url: '/ruta', icon: 'lucide:icon-name' }
    ]
  }
]
```

### Nuevo endpoint de API

Crear archivo en `server/api/ruta/metodo.ts`:

```ts
export default defineEventHandler(async (event) => {
  // GET, POST, PUT, PATCH, DELETE...
  const body = await readBody(event)  // para POST/PUT
  const query = getQuery(event)        // para GET
  return { success: true, data: ... }
})
```

### Nuevo componente UI

Usar `shadcn-nuxt` (si está disponible) o crear manualmente en `app/components/ui/{nombre}/`.

### Nuevo componente MDC (Markdown Component)

Crear en `app/components/content/{Nombre}.vue`. Nuxt Content v3 lo detecta automáticamente y lo mapea al tag MDC `::{nombre-kebab}`.

Ejemplo:
```vue
<!-- app/components/content/MyComponent.vue -->
<script setup lang="ts">
interface Props { title?: string }
defineProps<Props>()
</script>
<template>
  <div class="my-component">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
  </div>
</template>
```

Uso en markdown:
```md
::my-component{title="Hola"}
Contenido aquí
::
```

---

## Estructura de Archivos Clave

```
app/
├── components/
│   ├── ui/                    # Componentes shadcn/vue
│   ├── AppSidebar.vue         # Sidebar principal
│   ├── DynamicBreadCrumb.vue  # Breadcrumb automático
│   ├── NavMain.vue            # Navegación principal del sidebar
│   ├── NavUser.vue            # Dropdown de usuario
│   └── TiptapEditor.vue       # Editor WYSIWYG
├── composables/
│   ├── useAppUserSession.ts   # Sesión extendida
│   └── useRole.ts             # Utilidades de roles
├── layouts/
│   └── dashboard.vue          # Layout con sidebar
├── middleware/
│   ├── auth.ts                # Protección de rutas
│   ├── role.ts                # Autorización por roles
│   └── role.global.ts         # Autorización global (legacy)
├── pages/
│   ├── [centro]/[...slug].vue # Página de contenido dinámico
│   ├── daw/index.vue          # Landing DAW
│   ├── blog/                  # Blog
│   ├── usuario/               # Perfil y dashboard
│   └── admin/                 # Gestión de usuarios
├── types/
│   └── auth.d.ts              # Tipos de autenticación
└── lib/
    ├── config.ts              # Configuración de navegación
    └── utils.ts               # Utilidades (cn, etc.)

content/                       # Markdown (Nuxt Content v3)
├── blog/
├── 50010314-CPIFP_Los_Enlaces/
└── 50020125-CampusVirtualFP/

server/
├── api/
│   ├── auth/                  # Login, register, logout
│   ├── content/               # Lectura/escritura de archivos markdown
│   ├── user/                  # Perfil y contraseña
│   └── users/                 # Gestión de usuarios (admin)
└── utils/
    ├── content-path.ts        # Resolución case-insensitive
    └── prisma.ts              # Cliente Prisma

prisma/
├── schema/
│   ├── schema.prisma          # Configuración DB
│   ├── enums.prisma           # Enum Role
│   └── user.prisma            # Modelos User, Address
└── seed/                      # Datos iniciales
```

---

## Comandos Esenciales

```bash
# Desarrollo
pkill -f "nuxt dev"   # matar instancias previas
pnpm dev

# Si hay errores de .nuxt/dev corrupto
rm -rf .nuxt/dev && pnpm dev

# Base de datos
pnpm prisma:migrate   # migraciones
pnpm prisma:seed      # datos iniciales
pnpm prisma:studio    # GUI de Prisma

# Verificar tipos
pnpx nuxt typecheck
```

---

## Errores Conocidos

Ver `docus/fallos_soluciones.md` para lista detallada. Resumen:

| Error | Solución rápida |
|-------|-----------------|
| `tiptap-markdown` incompatible | Usar `marked` + `turndown` |
| Case-sensitivity en rutas | Normalizar `.toLowerCase()` |
| `.md` directos no encontrados | `resolveContentPath` maneja extensión |
| Múltiples `nuxt dev` | `pkill -f "nuxt dev"` + `rm -rf .nuxt/dev` |
| Timeouts al arrancar | Usar puerto libre o `nuxt prepare` primero |
| `@tailwindcss/typography` no disponible | Usar CSS manual en `content-prose.css` |

---

*Actualizado: 2025-06-10*
