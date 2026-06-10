# 🚀 Nuxt Prisma Auth Role Template

Plantilla base para aplicaciones web con autenticación, roles y gestión de usuarios. Basada en Nuxt 4, Prisma, PostgreSQL y Tailwind CSS.

## ✨ Características

- **Autenticación completa**: Login, registro, cierre de sesión con `nuxt-auth-utils`
- **Sistema de roles**: USER, ADMIN, ROOT con jerarquía de permisos
- **Gestión de usuarios**: CRUD completo con paginación y filtros
- **Perfil de usuario**: Edición de datos personales y cambio de contraseña
- **Menús configurables**: Definidos en `app/lib/config.ts`
- **UI con Tailwind**: Componentes estilo shadcn/vue
- **Contenido Markdown**: Gestión de contenido con `@nuxt/content` y PGlite
- **Editor inline Tiptap**: Edición WYSIWYG de archivos `.md` directamente desde la vista de contenido
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
│   │   ├── TiptapEditor.vue      # Editor WYSIWYG markdown inline
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
│   │   ├── [centro]/[...slug].vue # Contenido dinámico con editor inline
│   │   ├── daw/                  # Índice de centros DAW
│   │   ├── editor.vue            # Página editor standalone (legacy)
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── admin/usuarios/listado.vue
│   │   └── usuario/
│   │       ├── alta-usuario.vue
│   │       └── perfil.vue
│   └── types/
│       └── auth.d.ts             # Tipos de autenticación
├── content/                      # Contenido Markdown
│   ├── blog/                     # Colección blog
│   ├── 50010314-CPIFP_Los_Enlaces/  # Colección cpifp_enlaces
│   └── 50020125-CampusVirtualFP/    # Colección campus_virtual
├── server/                       # Backend (Nitro)
│   ├── api/
│   │   ├── auth/                 # Login, logout, register
│   │   ├── content/              # API de lectura/escritura de .md
│   │   ├── user/                 # Perfil propio
│   │   └── users/                # Gestión de usuarios (admin)
│   └── utils/
│       └── content-path.ts       # Resolución case-insensitive de rutas
├── prisma/
│   └── schema/
│       ├── schema.prisma         # Configuración Prisma
│       ├── user.prisma           # Modelo de usuario
│       └── enums.prisma          # Roles
├── docus/                        # Documentación del proyecto
│   ├── fallos_soluciones.md      # Registro de errores y soluciones
│   └── tiptap-editor.md          # Docs del editor inline
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

## 📝 Editor de Contenido Markdown (Tiptap Inline)

Las páginas de contenido (`/[centro]/[...slug]`) incluyen un botón **✏️ Editar** en la esquina superior derecha. Al pulsarlo, se activa el editor Tiptap inline sobre el mismo contenido.

### Cómo funciona

1. El botón **Editar** solo aparece para usuarios con rol `DAW`, `ADMIN` o `ROOT`
2. En modo edición, se muestra una barra de herramientas completa (negrita, cursiva, headings, listas, quotes, code blocks, undo/redo)
3. Al **guardar**, el archivo `.md` se escribe directamente al disco vía API
4. Nuxt Content detecta el cambio y reindexa automáticamente
5. El **frontmatter YAML** (`--- title: ... ---`) se preserva siempre

### API de archivos

- `GET /api/content/file?path=...` — Lee markdown raw del filesystem
- `PUT /api/content/file` — Escribe markdown raw al filesystem

Más detalles en [`docus/tiptap-editor.md`](docus/tiptap-editor.md).

## 📝 Notas

- Los componentes UI en `app/components/ui/` son simplificados. Para un proyecto real, instala shadcn-vue:
  ```bash
  npx shadcn-vue@latest init
  npx shadcn-vue@latest add button card input
  ```

- La plantilla incluye autenticación por email/contraseña. Para agregar OAuth (Google, GitHub, etc.), configura las variables en `.env` y usa `nuxt-auth-utils`.

- Si encuentras errores conocidos, consulta [`docus/fallos_soluciones.md`](docus/fallos_soluciones.md) antes de intentar soluciones nuevas.

## 📄 Licencia

MIT - Libre para usar en proyectos personales y comerciales.

---

**¿Preguntas o problemas?** Abre un issue en el repositorio.
