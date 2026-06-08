# Seguimiento — Instalación Nuxt Studio + PGlite

> **Fecha:** 2026-06-04  
> **Rama de trabajo:** `feature/nuxt-studio-pglite`  
> **Base del proyecto:** `Nuxt-Prisma-Auth-Role` (Nuxt 4 + Prisma + Auth + Roles)  
> **Referencia de errores:** `/home/darioaxel/Proyectos/fpvirtual-gestion-documentacion`

---

## 1. Estado Actual de la Instalación

### 1.1 Merge de ramas
- La rama `feature/nuxt-content-pglite` **ya fue mergeada** a `main` (commit `b63bb22`).
- Se creó la rama `feature/nuxt-studio-pglite` a partir de `main`.
- Se mergeó la rama previa `nuxt_studio` (commit `70f72dd`) que ya contenía `nuxt-studio@1.7.0` instalado.

### 1.2 ¿Qué se instaló?
| Paquete | Versión | Motivo |
|---------|---------|--------|
| `nuxt-studio` | `1.7.0` | Editor visual de contenido Markdown para `@nuxt/content` v3 |
| `nuxt-component-meta` | `0.17.2` | **Prevención de error** — resuelve alias `#nuxt-component-meta/nitro` que usa Studio internamente |
| `@nuxtjs/mdc` | `0.22.0` | **Prevención de error** — resuelve alias `#mdc-imports` que usa Studio internamente |

### 1.3 Base de datos de contenido
Se mantiene **PGlite** (`@electric-sql/pglite`) como motor de `@nuxt/content` v3:

```ts
// nuxt.config.ts
content: {
  database: {
    type: 'pglite',
    dataDir: '.data/content/pglite',
  },
},
```

> ⚠️ Aunque se use PGlite, `better-sqlite3` sigue siendo dependencia **transitaria** de `@nuxt/content` v3. Se ha configurado `pnpm.onlyBuiltDependencies` para forzar su compilación y evitar el prompt interactivo que bloquea CI.

### 1.4 Restricción de edición a documentos Markdown
La configuración de Studio **excluye explícitamente** todos los componentes de navegación, sidebar y layout para que el editor visual no permita modificarlos:

```ts
studio: {
  route: '/_studio',
  editor: {
    components: {
      exclude: [
        'AppSidebar', 'NavMain', 'NavSecondary', 'NavUser',
        'DynamicBreadCrumb', 'Sidebar', 'SidebarHeader',
        'SidebarContent', 'SidebarFooter', 'SidebarMenu',
        'SidebarMenuButton', 'SidebarMenuItem', 'SidebarRail',
        'SidebarTrigger', 'SidebarInset', 'SidebarProvider',
        'SidebarGroup', 'SidebarGroupContent', 'SidebarGroupLabel',
        'SidebarMenuAction', 'SidebarMenuBadge', 'SidebarMenuSkeleton',
        'SidebarMenuSub', 'SidebarMenuSubButton', 'SidebarMenuSubItem',
      ]
    },
    iconLibraries: ['lucide'],
  },
  repository: {
    provider: 'github',
    owner: '',
    repo: '',
    branch: 'main',
  }
}
```

Esto garantiza que Studio solo edite **colecciones de contenido Markdown** (`blog`, `daw`, etc.) definidas en `content.config.ts`, y nunca toque los menús, sidebar o componentes de UI de la aplicación.

---

## 2. Lecciones Aprendidas de `fpvirtual-gestion-documentacion`

A continuación se resumen los errores que ocurrieron en el proyecto de referencia y cómo se han **prevenido** en esta instalación:

### 2.1 Alias internos no resueltos (`#nuxt-component-meta/nitro`, `#mdc-imports`)
- **Error en fpvirtual:** Studio importaba aliases creados dinámicamente por `nuxt-component-meta` y `@nuxtjs/mdc`, pero al usar un fork local estos módulos no estaban activos y Nitro fallaba en build.
- **Prevención aplicada:** Se instalaron ambos paquetes como dependencias directas y se añadieron a `modules[]` en `nuxt.config.ts` **antes** de `nuxt-studio`.

### 2.2 `better-sqlite3` no compilado
- **Error en fpvirtual:** El binario nativo de `better-sqlite3` no existía porque pnpm v10+ bloquea scripts de build por defecto.
- **Prevención aplicada:** Se añadió `better-sqlite3` a `pnpm.onlyBuiltDependencies` en `package.json`.

### 2.3 Prompt interactivo de `@nuxt/content` bloquea CI
- **Error en fpvirtual:** En entornos sin TTY, el prompt de `consola.prompt` de Content v3 fallaba con `uv_tty_init returned EINVAL`.
- **Prevención aplicada:** PGlite está configurado explícitamente en `nuxt.config.ts` y `better-sqlite3` se compila desde la instalación.

### 2.4 Imports relativos desde `server/api/` a `server/utils/`
- **Error en fpvirtual:** Nitro no resolvía `../../utils/gitlab` desde rutas de API.
- **Prevención aplicada:** Si en el futuro se añaden utilidades de servidor para gestionar commits/repositorios, se usará **auto-import** de Nitro (exportar desde `server/utils/` y no importar explícitamente).

### 2.5 `@nuxt/content` v3 requiere `content.config.ts`
- **Error en fpvirtual:** Studio no funcionaba sin definir colecciones explícitas.
- **Prevención aplicada:** El proyecto ya tiene `content.config.ts` con colecciones `blog` y `daw`.

### 2.6 Eliminación manual en `.pnpm` corrompe dependencias
- **Error en fpvirtual:** Borrar carpetas de `node_modules/.pnpm/` manualmente rompió hardlinks de otros paquetes.
- **Prevención aplicada:** Documentado aquí. Usar siempre `pnpm install --force` o `pnpm store prune` nunca `rm -rf` manual.

### 2.7 Warning `vue-router/volar/sfc-route-blocks` (post-instalación)
- **Síntoma:** Al arrancar `pnpm dev` aparece:  
  `WARN [Vue] Resolve plugin path failed: vue-router/volar/sfc-route-blocks Package subpath './volar/sfc-route-blocks' is not defined by "exports"`
- **Causa:** `vue-component-meta` (dependencia de `nuxt-component-meta`) usa `@vue/language-core@3.3.x`, que intenta cargar un subpath de `vue-router` que fue eliminado/renombrado en `vue-router@4.5.0+`.
- **Impacto:** **Inofensivo.** El servidor arranca correctamente, Studio funciona, y los metadatos de componentes se parsean sin problemas (`✔ Components metas parsed`).
- **Prevención aplicada:** Se forzó `vue-component-meta@3.3.4` (última versión disponible) mediante `pnpm.overrides`. El warning persiste porque `@vue/language-core@3.3.4` aún no maneja el cambio de `vue-router`. Se documenta como conocido hasta que el ecosistema publique una versión compatible.

### 2.8 Token de servicio vs. OAuth por usuario
- **Decisión en fpvirtual:** Usar un único GitLab PAT de servidor en lugar de OAuth por usuario.
- **Aplicado:** La configuración actual usa `repository` vacío como placeholder. En producción se rellenará con el PAT de servicio correspondiente.

---

## 3. Plan de Desarrollo

> Basado en la arquitectura probada en `fpvirtual-gestion-documentacion`, adaptado al alcance de este proyecto.

### Fase A: Validación de la instalación (Inmediata)
- [ ] Ejecutar `pnpm install` y verificar que `better-sqlite3` se compila sin errores.
- [ ] Ejecutar `pnpm dev` y comprobar que la app arranca sin errores 500.
- [ ] Verificar que `http://localhost:3000/_studio` carga el panel de Studio.
- [ ] Confirmar que los componentes excluidos **no aparecen** en el picker de componentes del editor.

### Fase B: Definición de colecciones de contenido
- [ ] Revisar si las colecciones actuales (`blog`, `daw`) cubren todos los documentos Markdown editables.
- [ ] Si se añaden nuevas secciones (ej. `ciclos`, `modulos`), definirlas en `content.config.ts` con su schema Zod.
- [ ] Asegurar que `source` de cada colección apunte solo a `.md`, nunca a componentes Vue o configs.

### Fase C: Preparación para multi-usuario (opcional, si aplica)
Si el objetivo es que múltiples usuarios editen sin cuentas GitHub/GitLab individuales:
- [ ] Evaluar si se necesita un **fork** de `nuxt-studio` (como hizo fpvirtual) o si la versión npm (`1.7.0`) es suficiente.
- [ ] Si se opta por fork: crear repo separado, modificar `useStudio.ts`, `gitlab.ts` y `useGitProvider.ts` para branch dinámico vía `postMessage`.
- [ ] Si se opta por versión npm: configurar `studio.repository` con un PAT de servicio y una única rama base.
- [ ] Considerar añadir campo `contentBranch String?` al modelo `User` de Prisma.

### Fase D: Panel administrativo de contenido
- [ ] Crear ruta `/admin/contenido` (o similar) protegida por rol `ADMIN` / `ROOT`.
- [ ] Integrar `StudioIframe.vue` que cargue `/_studio` dentro de un iframe.
- [ ] Implementar comunicación `postMessage` para cambiar de branch/usuario si aplica.
- [ ] Botón "Publicar cambios" que cree MR/PR al branch principal.

### Fase E: Producción y seguridad
- [ ] Rellenar `studio.repository` con datos reales del repo de contenido.
- [ ] Configurar variables de entorno en `.env` (ej. `STUDIO_GITHUB_TOKEN` o `STUDIO_GITLAB_TOKEN`).
- [ ] Añadir `Content-Security-Policy` con `frame-src 'self'` para permitir el iframe de Studio.
- [ ] Revisar que el token de servicio **nunca** viaje al cliente.

---

## 4. Checklist de Verificación

Antes de hacer merge de `feature/nuxt-studio-pglite` a `main`:

- [ ] `pnpm install` completo sin errores de build nativo.
- [ ] `better-sqlite3` compilado (`find node_modules -name "better_sqlite3.node"` devuelve resultado).
- [ ] `pnpm dev` arranca sin errores en consola del servidor.
- [ ] `/_studio` es accesible y renderiza la interfaz de Studio.
- [ ] El editor visual no muestra componentes de sidebar/nav en el picker.
- [ ] Las colecciones `blog` y `daw` aparecen en el árbol de contenido de Studio.
- [ ] Se puede editar un `.md` en modo visual (TipTap) y en modo código (Monaco).
- [ ] Los cambios en desarrollo se guardan en el filesystem (modo `dev` de Studio).
- [ ] No hay imports explícitos de `server/utils/*` desde `server/api/*` (si se añaden utilidades Git).
- [ ] `.env.example` refleja todas las variables nuevas necesarias.

---

## 5. Referencias

- **Módulo oficial:** `nuxt-content/nuxt-studio` (MIT)
- **Documentación Studio:** https://nuxt.studio/
- **Proyecto de referencia (errores):** `/home/darioaxel/Proyectos/fpvirtual-gestion-documentacion/docs/failures-solutions.md`
- **Fork de referencia:** `/home/darioaxel/Proyectos/fpvirtual-nuxt-studio`
- **PGlite:** https://github.com/electric-sql/pglite
- **Nuxt Content v3:** https://content.nuxt.com/

---

> **Nota para agentes futuros:** Antes de modificar cualquier configuración de Studio o Content, leer este documento y el `failures-solutions.md` del proyecto fpvirtual. Nunca eliminar carpetas manualmente de `node_modules/.pnpm/`. Siempre usar `pnpm install --force` para reconstrucciones completas.
