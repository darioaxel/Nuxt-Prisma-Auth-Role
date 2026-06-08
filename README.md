# 🚀 Nuxt Prisma Auth Role Template

Plantilla base para aplicaciones web con autenticación, roles y gestión de usuarios. Basada en Nuxt 4, Prisma, PostgreSQL y Tailwind CSS.

## 📑 Índice de Contenidos

- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
  - [Con Docker (Recomendado)](#con-docker-recomendado)
  - [Desarrollo Local](#desarrollo-local)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Roles](#-sistema-de-roles)
- [Configuración de Menús](#-configuración-de-menús)
- [Nuxt Studio](#-nuxt-studio)
  - [Configuración de OAuth en GitHub](#configuración-de-oauth-en-github)
  - [Configuración de OAuth en GitLab](#configuración-de-oauth-en-gitlab)
  - [Configuración en el Proyecto](#configuración-en-el-proyecto)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Comandos Útiles](#️-comandos-útiles)
- [Personalización](#-personalización)
- [Notas](#-notas)
- [Licencia](#-licencia)

## ✨ Características

- **Autenticación completa**: Login, registro, cierre de sesión con `nuxt-auth-utils`
- **Sistema de roles**: USER, ADMIN, ROOT con jerarquía de permisos
- **Gestión de usuarios**: CRUD completo con paginación y filtros
- **Perfil de usuario**: Edición de datos personales y cambio de contraseña
- **Menús configurables**: Definidos en `app/lib/config.ts`
- **UI con Tailwind**: Componentes estilo shadcn/vue
- **Docker listo**: Dockerfile y docker-compose incluidos
- **TypeScript**: Tipado completo en frontend y backend

## 🚀 Inicio Rápido

### Con Docker (Recomendado)

```bash
# 1. Clonar y entrar al proyecto
cd Nuxt-Prisma-Auth-Role

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar con Docker Compose
docker-compose up -d

# 4. Ejecutar migraciones y seed
docker-compose exec app pnpm prisma:migrate
docker-compose exec app pnpm prisma:seed
```

La aplicación estará disponible en `http://localhost:3000`

Credenciales por defecto:
- **ROOT**: `root@example.com` / `Admin123!`
- **ADMIN**: `admin@example.com` / `Admin123!`
- **USER**: `user@example.com` / `User123!`

### Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar PostgreSQL local y crear .env

# 3. Ejecutar migraciones
pnpm prisma:migrate

# 4. Iniciar servidor de desarrollo
pnpm dev
```

## 📁 Estructura del Proyecto

```
.
├── app/                          # Frontend Nuxt
│   ├── components/               # Componentes Vue
│   │   ├── ui/                   # Componentes UI (button, card, etc.)
│   │   ├── AppSidebar.vue        # Sidebar de navegación
│   │   ├── LoginForm.vue         # Formulario de login
│   │   ├── NavMain.vue           # Menú principal
│   │   ├── NavUser.vue           # Menú de usuario
│   │   └── ThemeToggle.vue       # Botón de tema oscuro/claro
│   ├── composables/              # Composables de Vue
│   │   ├── useAppUserSession.ts  # Gestión de sesión extendida
│   │   └── useRole.ts            # Verificación de roles
│   ├── layouts/                  # Layouts
│   │   ├── default.vue           # Layout público (login)
│   │   └── dashboard.vue         # Layout con sidebar
│   ├── lib/
│   │   ├── config.ts             # Configuración de menús
│   │   └── utils.ts              # Utilidades (cn para Tailwind)
│   ├── middleware/               # Middleware de rutas
│   │   ├── auth.ts               # Protección de rutas
│   │   └── role.global.ts        # Validación de roles
│   ├── pages/                    # Páginas (rutas auto-generadas)
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── admin/usuarios/listado.vue
│   │   └── usuario/
│   │       ├── alta-usuario.vue
│   │       └── perfil.vue
│   └── types/
│       └── auth.d.ts             # Tipos de autenticación
├── server/                       # Backend (Nitro)
│   └── api/
│       ├── auth/                 # Login, logout, register
│       ├── user/                 # Perfil propio
│       └── users/                # Gestión de usuarios (admin)
├── prisma/
│   └── schema/
│       ├── schema.prisma         # Configuración Prisma
│       ├── user.prisma           # Modelo de usuario
│       └── enums.prisma          # Roles
├── docker-compose.yml            # PostgreSQL + App
├── Dockerfile                    # Build de producción
└── package.json
```

## 🔐 Sistema de Roles

### Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `USER` | Usuario básico | Ver/editar su perfil |
| `ADMIN` | Administrador | + Listado y gestión de usuarios |
| `ROOT` | Superadmin | + Crear otros admins, modificar ROOTs |

### Uso del Middleware de Roles

```vue
<!-- Página solo para admins -->
<script setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
  roles: ['ADMIN', 'ROOT']  // Solo admins y root
})
</script>
```

### Verificación de Roles en Componentes

```vue
<script setup>
const { isAdmin, hasRoleOrHigher } = useRole()

// En template
// <div v-if="isAdmin">Contenido solo admin</div>
</script>
```

## 📋 Configuración de Menús

Edita `app/lib/config.ts` para personalizar la navegación:

```typescript
export const navSections: NavSection[] = [
  {
    title: 'Mi Cuenta',
    roles: ['USER', 'ADMIN', 'ROOT'],  // Quién puede ver
    items: [
      {
        title: 'Mi Perfil',
        url: '/usuario/perfil',
        icon: 'lucide:user',
      },
      // Más items...
    ]
  },
  {
    title: 'Administración',
    roles: ['ADMIN', 'ROOT'],  // Solo admins
    items: [
      {
        title: 'Gestión de Usuarios',
        url: '/admin/usuarios',
        icon: 'lucide:users',
        items: [  // Submenús
          { title: 'Listado', url: '/admin/usuarios/listado' },
        ]
      }
    ]
  }
]
```

## 🎨 Nuxt Studio

El proyecto incluye [Nuxt Studio](https://nuxt.studio/) (`nuxt-studio@1.7.0`) para la edición visual de contenido Markdown. Studio permite a usuarios autorizados editar documentos directamente desde el navegador con un editor WYSIWYG (TipTap), editor de código (Monaco) o formularios generados automáticamente.

### Requisitos Previos

Para usar Studio en **modo producción** (commits al repositorio remoto), es necesario configurar un **OAuth App** en GitHub o GitLab. En modo desarrollo (`pnpm dev`), Studio funciona localmente escribiendo directamente al filesystem sin necesidad de OAuth.

> **Nota:** El editor visual está restringido exclusivamente a documentos Markdown. Los componentes de navegación, sidebar y UI (`AppSidebar`, `NavMain`, `NavUser`, etc.) están excluidos del editor para evitar modificaciones accidentales en la estructura de la aplicación.

### Configuración de OAuth en GitHub

1. **Crear una OAuth App en GitHub:**
   - Ve a **Settings → Developer settings → OAuth Apps → New OAuth App** en tu cuenta de GitHub.
   - Completa los campos:
     - **Application name**: `Nuxt Studio - [Nombre del Proyecto]`
     - **Homepage URL**: `https://tu-dominio.com`
     - **Authorization callback URL**: `https://tu-dominio.com/__nuxt_studio/auth/github`
   - En desarrollo local, usa `http://localhost:3000` como dominio base.
   - **IMPORTANTE:** Nuxt Studio usa la ruta interna `/__nuxt_studio/auth/{provider}` (doble guión bajo) para OAuth. No es `/api/_studio`.

2. **Obtener credenciales:**
   - Tras crear la app, anota el **Client ID**.
   - Genera un **Client Secret** (Generate a new client secret) y guárdalo en un lugar seguro.

3. **Configurar variables de entorno:**
   ```env
   STUDIO_GITHUB_CLIENT_ID=tu_client_id_de_github
   STUDIO_GITHUB_CLIENT_SECRET=tu_client_secret_de_github
   ```

4. **Configurar `nuxt.config.ts`:**
   ```ts
   studio: {
     route: '/_studio',
     repository: {
       provider: 'github',
       owner: 'tu-usuario-o-organizacion',
       repo: 'nombre-del-repo-de-contenido',
       branch: 'main',
     },
     auth: {
       github: {
         clientId: process.env.STUDIO_GITHUB_CLIENT_ID,
         clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET,
       }
     }
   }
   ```

### Configuración de OAuth en GitLab

1. **Crear una Aplicación en GitLab:**
   - Ve a tu instancia de GitLab (self-hosted o gitlab.com).
   - Accede a **User Settings → Applications → Add new application**.
   - Completa los campos:
     - **Name**: `Nuxt Studio - [Nombre del Proyecto]`
     - **Redirect URI**: `https://tu-dominio.com/__nuxt_studio/auth/gitlab`
     - **Scopes**: marca `read_user`, `api` y `openid`.
   - En desarrollo local, añade también: `http://localhost:3000/__nuxt_studio/auth/gitlab`.

2. **Obtener credenciales:**
   - Tras guardar la aplicación, anota el **Application ID** y el **Secret**.

3. **Configurar variables de entorno:**
   ```env
   STUDIO_GITLAB_CLIENT_ID=tu_application_id_de_gitlab
   STUDIO_GITLAB_CLIENT_SECRET=tu_secret_de_gitlab
   ```

4. **Configurar `nuxt.config.ts` (GitLab self-hosted):**
   ```ts
   studio: {
     route: '/_studio',
     repository: {
       provider: 'gitlab',
       owner: 'tu-grupo-o-usuario',
       repo: 'nombre-del-repo-de-contenido',
       branch: 'main',
       instanceUrl: 'https://gitlab.com', // O tu URL de GitLab self-hosted
     },
     auth: {
       gitlab: {
         clientId: process.env.STUDIO_GITLAB_CLIENT_ID,
         clientSecret: process.env.STUDIO_GITLAB_CLIENT_SECRET,
       }
     }
   }
   ```

### Configuración en el Proyecto

El archivo `.env.example` ya incluye las variables placeholder para GitHub:

```env
# ---------------------------------------------------------------------------
# Nuxt Studio (solo necesarias para modo producción / publicación)
# ---------------------------------------------------------------------------
# STUDIO_GITHUB_CLIENT_ID=
# STUDIO_GITHUB_CLIENT_SECRET=
```

Para GitLab, añade las equivalentes en tu `.env`:

```env
STUDIO_GITLAB_CLIENT_ID=
STUDIO_GITLAB_CLIENT_SECRET=
```

### Modo Desarrollo vs. Modo Producción

| Modo | Requiere OAuth | Persistencia | Uso |
|------|---------------|--------------|-----|
| **Desarrollo** (`pnpm dev`) | No | Filesystem local (`content/`) | Edición local sin commits |
| **Producción** | Sí | Commits al repo Git (GitHub/GitLab) | Edición con persistencia en repositorio |

### Solución de Problemas Comunes

- **`better-sqlite3` no compilado**: Asegúrate de que `pnpm install` se ejecutó correctamente. El proyecto usa PGlite para el contenido, pero `better-sqlite3` es una dependencia transitaria que debe compilarse.
- **Studio no carga (`/_studio` 404)**: Verifica que `nuxt-studio` está incluido en `modules[]` de `nuxt.config.ts` y que no hay errores en la consola del servidor.
- **Alias no resueltos (`#nuxt-component-meta/nitro`)**: El proyecto ya incluye `nuxt-component-meta` y `@nuxtjs/mdc` como dependencias directas para prevenir este error.

## 🐳 Despliegue con Docker

### Producción

```bash
# 1. Configurar .env con valores de producción

# 2. Construir e iniciar
docker-compose -f docker-compose.yml up -d --build

# 3. Ejecutar migraciones
docker-compose exec app pnpm prisma:migrate
```

### Variables de Entorno Importantes

```env
# Base de datos
DB_USER=app_user
DB_PASSWORD=password_seguro
DB_NAME=app_database

# Seguridad - Cambiar en producción!
NUXT_SESSION_PASSWORD=minimo-32-caracteres-de-seguridad
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor
pnpm build            # Build de producción
pnpm preview          # Vista previa del build

# Base de datos
pnpm prisma:migrate   # Crear/aplicar migraciones
pnpm prisma:generate  # Generar cliente Prisma
pnpm prisma:seed      # Ejecutar seeders
pnpm prisma:studio    # Abrir Prisma Studio

# Testing
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
```

## 🔧 Personalización

### Agregar un nuevo rol

1. Editar `prisma/schema/enums.prisma`:
```prisma
enum Role {
  USER
  MODERATOR   // Nuevo rol
  ADMIN
  ROOT
}
```

2. Ejecutar migración:
```bash
pnpm prisma:migrate
```

3. Actualizar jerarquía en `app/composables/useRole.ts`

### Agregar una nueva página protegida

1. Crear archivo en `app/pages/mi-pagina.vue`:
```vue
<script setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
  title: 'Mi Página'
})
</script>

<template>
  <div>
    <h1>Mi Página</h1>
  </div>
</template>
```

2. Agregar al menú en `app/lib/config.ts`

## 📝 Notas

- Los componentes UI en `app/components/ui/` son simplificados. Para un proyecto real, instala shadcn-vue:
  ```bash
  npx shadcn-vue@latest init
  npx shadcn-vue@latest add button card input
  ```

- La plantilla incluye autenticación por email/contraseña. Para agregar OAuth (Google, GitHub, etc.), configura las variables en `.env` y usa `nuxt-auth-utils`.

## 📄 Licencia

MIT - Libre para usar en proyectos personales y comerciales.

---

**¿Preguntas o problemas?** Abre un issue en el repositorio.
