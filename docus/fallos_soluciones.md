# Fallos Encontrados y Soluciones

> Registro de errores y problemas encontrados durante el desarrollo para evitar repetirlos en el futuro.

---

## Índice

1. [Tiptap Markdown incompatible con Tiptap v3](#1-tiptap-markdown-incompatible-con-tiptap-v3)
2. [Case-sensitivity en rutas de contenido](#2-case-sensitivity-en-rutas-de-contenido)
3. [resolveContentPath no encuentra archivos .md directos](#3-resolvecontentpath-no-encuentra-archivos-md-directos)
4. [Múltiples instancias de nuxt dev](#4-multiples-instancias-de-nuxt-dev)
5. [Colecciones de Nuxt Content no mapean carpetas reales](#5-colecciones-de-nuxt-content-no-mapean-carpetas-reales)
6. [Timeouts al arrancar nuxt dev](#6-timeouts-al-arrancar-nuxt-dev)
7. [@tailwindcss/typography no instalado](#7-tailwindcsstypography-no-instalado)
8. [Frontmatter: preservación al editar](#frontmatter-preservación-al-editar)
9. [Componentes MDC con nombres que colisionan con shadcn/vue](#8-componentes-mdc-con-nombres-que-colisionan-con-shadcnvue)
10. [Recursión infinita en componente Icon.vue](#9-recursión-infinita-en-componente-iconvue)
11. [Acumulación de procesos en background](#10-acumulación-de-procesos-en-background)
12. [Caché de Nuxt Content no se limpia con .nuxt](#11-caché-de-nuxt-content-no-se-limpia-con-nuxt)
13. [Menú MDC de Tiptap genera sintaxis inválida](#12-menú-mdc-de-tiptap-genera-sintaxis-inválida)

---

## 1. Tiptap Markdown incompatible con Tiptap v3

**Síntoma:**
```
Error: Cannot find module '@tiptap/core'
Require stack: .../tiptap-markdown/dist/tiptap-markdown.umd.js
```

**Causa:** `tiptap-markdown` v0.9.0 fue diseñado para Tiptap v2. En Tiptap v3, `@tiptap/core` ya no existe como paquete separado en CJS; las extensiones se reorganizaron.

**Solución:** No usar `tiptap-markdown`. En su lugar, usar conversión explícita:
- **Carga:** `marked.parse()` convierte markdown body → HTML para Tiptap
- **Guardado:** `turndownService.turndown()` convierte HTML del editor → markdown

**Archivos afectados:** `app/components/TiptapEditor.vue`

**Dependencias:**
```bash
pnpm add marked turndown
pnpm add -D @types/turndown
```

---

## 2. Case-sensitivity en rutas de contenido

**Síntoma:** Las URLs en minúsculas (`/50020125-campusvirtualfp/...`) no coinciden con las carpetas reales que usan PascalCase (`50020125-CampusVirtualFP`). `queryCollection().path()` devuelve `null`.

**Causa:** `route.params.centro` llega en minúsculas por la URL, pero `collectionMap` tenía las claves en formato original.

**Solución:** Normalizar siempre a minúsculas tanto las claves del mapa como los parámetros de ruta:

```ts
const collectionMap: Record<string, string> = {
  '50010314-cpifp_los_enlaces': 'cpifp_enlaces',
  '50020125-campusvirtualfp': 'campus_virtual',
}
const normalizedCentro = (route.params.centro as string).toLowerCase()
const collection = collectionMap[normalizedCentro]
const fullPath = route.path.toLowerCase()
```

**Archivos afectados:** `app/pages/[centro]/[...slug].vue`

---

## 3. resolveContentPath no encuentra archivos .md directos

**Síntoma:** `GET /api/content/file?path=blog/bienvenida` devuelve 404 aunque `content/blog/bienvenida.md` existe.

**Causa:** El algoritmo busca cada segmento de la ruta como entry del directorio. El último segmento es `bienvenida`, pero el entry en disco es `bienvenida.md` (con extensión), por lo que `bienvenida === bienvenida.md` da `false`.

**Solución:** En el último segmento, si no hay match exacto, intentar match con `.md`:

```ts
const isLast = i === segments.length - 1
let match = entries.find(e => e.toLowerCase() === segment.toLowerCase())
if (!match && isLast) {
  match = entries.find(e => e.toLowerCase() === (segment + '.md').toLowerCase())
}
```

**Archivos afectados:** `server/utils/content-path.ts`

---

## 4. Múltiples instancias de nuxt dev

**Síntoma:**
```
[nitro] ERROR Error: ENOENT: no such file or directory, mkdir '.nuxt/dev'
```
O también conflictos de puerto (`EADDRINUSE`).

**Causa:** Al lanzar `nuxt dev` varias veces (por ejemplo, desde diferentes shells o procesos en background), múltiples instancias compiten por el mismo directorio `.nuxt/dev` y los mismos puertos.

**Solución:**
1. Matar todos los procesos existentes:
   ```bash
   pkill -f "nuxt dev"
   ```
2. Limpiar el directorio corrupto:
   ```bash
   rm -rf .nuxt/dev
   ```
3. Reiniciar **una única instancia**:
   ```bash
   npx nuxt dev
   ```

**Prevención:** Antes de lanzar un nuevo `nuxt dev`, verificar que no haya instancias previas con `ps aux | grep "nuxt dev"`.

---

## 5. Colecciones de Nuxt Content no mapean carpetas reales

**Síntoma:** Carpetas como `50010314-CPIFP_Los_Enlaces/` y `50020125-CampusVirtualFP/` no aparecen en Nuxt Content; solo funcionaba `blog/`.

**Causa:** `content.config.ts` solo definía colecciones para `blog` y `daw`, ignorando las carpetas reales del proyecto.

**Solución:** Crear colecciones explícitas para cada carpeta de contenido real:

```ts
export default defineContentConfig({
  collections: {
    blog: defineCollection({ type: 'page', source: 'blog/**/*.md', ... }),
    cpifp_enlaces: defineCollection({ type: 'page', source: '50010314-CPIFP_Los_Enlaces/**/*.md', ... }),
    campus_virtual: defineCollection({ type: 'page', source: '50020125-CampusVirtualFP/**/*.md', ... }),
  },
})
```

**Archivos afectados:** `content.config.ts`

---

## 6. Timeouts al arrancar nuxt dev

**Síntoma:** `npx nuxt dev` se cuelga o es terminado por timeout (>90s) durante la fase de generación de tipos o build de Vite.

**Causas posibles:**
- Puerto 3000 ocupado → `get-port` tiene que buscar alternativo
- Component meta parsing pesado (~6-15s reportado)
- Generación de tipos de Nuxt Content con muchas colecciones

**Soluciones:**
1. Especificar puerto libre explícito:
   ```bash
   npx nuxt dev --port 3002
   ```
2. Ejecutar `nuxt prepare` primero para cachear tipos:
   ```bash
   npx nuxt prepare && npx nuxt dev
   ```
3. Si el timeout es del shell, usar background tasks:
   ```bash
   npx nuxt dev > nuxt.log 2>&1 &
   ```

## 7. @tailwindcss/typography no instalado / incompatible con Tailwind v4

**Síntoma:** Los botones de Tiptap (H1, H2, listas) parecen "no hacer nada". El HTML subyacente sí cambia, pero visualmente no se ve diferencia.

**Causa:** El componente usaba las clases `prose` y `prose-invert` de Tailwind, pero `@tailwindcss/typography` no estaba instalado. Además, la versión 0.5.20 del plugin es para Tailwind v3, no compatible con v4.

**Solución:** En vez de depender del plugin, usar CSS manual en el componente para estilizar headings, listas, blockquotes, code blocks, etc.:

```css
.tiptap-editor-content h1 { font-size: 2.25em; font-weight: 800; ... }
.tiptap-editor-content ul { list-style-type: disc; padding-left: 1.625em; ... }
.tiptap-editor-content ol { list-style-type: decimal; padding-left: 1.625em; ... }
/* etc */
```

**Archivos afectados:** `app/components/TiptapEditor.vue`

---

## Frontmatter: preservación al editar

**Síntoma:** Al guardar contenido editado con Tiptap, el frontmatter YAML (`--- title: ... ---`) se pierde o se muestra como texto plano en el editor.

**Causa:** Tiptap no entiende frontmatter nativamente; lo renderiza como texto o lo descarta.

**Solución:** Extraer el frontmatter con regex antes de pasar el body al editor, y reinsertarlo al guardar:

```ts
function extractFrontmatter(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (match) {
    return {
      frontmatter: `---\n${match[1]}\n---\n`,
      body: raw.slice(match[0].length),
    }
  }
  return { frontmatter: '', body: raw }
}
```

**Archivos afectados:** `app/components/TiptapEditor.vue`

---

---

## 8. Componentes MDC con nombres que colisionan con shadcn/vue

**Síntoma:** La aplicación deja de funcionar correctamente. Los componentes UI de shadcn (Badge, Card, Collapsible, Tabs) no renderizan o renderizan contenido inesperado. El servidor muestra warnings como:

```
WARN  Overriding Badge component. You can specify a priority option when calling addComponent to avoid this warning.
WARN  Overriding Card component. You can specify a priority option when calling addComponent to avoid this warning.
```

**Causa:** Nuxt Content v3 registra automáticamente como componentes globales todo lo que esté en `app/components/content/`. Si un componente MDC se llama `Badge.vue`, `Card.vue`, `Collapsible.vue` o `Tabs.vue`, sobrescribe los componentes homónimos de shadcn/vue (`app/components/ui/badge/Badge.vue`, etc.).

**Solución:** Usar siempre un prefijo para los componentes MDC que pudieran colisionar:

```
Badge.vue      → MdcBadge.vue      (tag MDC: ::mdc-badge)
Card.vue       → MdcCard.vue       (tag MDC: ::mdc-card)
CardGroup.vue  → MdcCardGroup.vue  (tag MDC: ::mdc-card-group)
Collapsible.vue→ MdcCollapsible.vue(tag MDC: ::mdc-collapsible)
Tabs.vue       → MdcTabs.vue       (tag MDC: ::mdc-tabs)
Icon.vue       → MdcIcon.vue       (tag MDC: ::mdc-icon)
```

**Archivos afectados:** `app/components/content/*.vue`

---

## 9. Recursión infinita en componente Icon.vue

**Síntoma:** Error `Maximum call stack size exceeded` al cargar cualquier página que renderice contenido markdown:

```
ERROR  [unhandledRejection] Maximum call stack size exceeded
    at initProps (node_modules/@vue/runtime-core/...)
    at _sfc_ssrRender (app/components/content/Icon.vue:26:53)
```

**Causa:** El componente `app/components/content/Icon.vue` usaba `<Icon>` en su propio template. Como el archivo se llama `Icon.vue`, Vue resolvía esa etiqueta como el componente local (él mismo) en lugar del componente global `<Icon>` de `@nuxt/icon`, creando recursión infinita.

**Solución:** Renombrar el archivo para que no coincida con el nombre del componente global que usa internamente:

```bash
mv app/components/content/Icon.vue app/components/content/MdcIcon.vue
```

**Archivos afectados:** `app/components/content/Icon.vue`

---

## 10. Acumulación de procesos en background

**Síntoma:** Múltiples errores de `EADDRINUSE`, rendimiento degradado, logs confusos con múltiples outputs superpuestos.

**Causa:** Lanzar `pnpm dev` repetidamente en background (`&`) sin matar las instancias anteriores.

**Solución:** Verificar y matar todos los procesos antes de reiniciar:

```bash
# Ver cuántos hay
ps aux | grep "nuxt dev" | grep -v grep | wc -l

# Matar todos
ps aux | grep "nuxt dev" | grep -v grep | awk '{print $2}' | xargs -r kill -9

# Verificar que no queda ninguno
ps aux | grep "nuxt dev" | grep -v grep | wc -l
```

**Prevención:** No usar background tasks (`&`) para `nuxt dev` a menos que sea estrictamente necesario. Preferir ejecutar en primer plano en una terminal dedicada.

---

## 11. Caché de Nuxt Content no se limpia con `.nuxt`

**Síntoma:** Después de borrar `.nuxt/` y `.data/content/pglite/`, Nuxt Content sigue mostrando:

```
[@nuxt/content] ✔ Processed 4 collections and 5 files in ...ms (5 cached, 0 parsed)
```

Los cambios en contenido markdown no se reflejan y las colecciones parecen "atascadas".

**Causa:** Nuxt Content v3 (con configuración `database: { type: 'pglite' }`) almacena la base de datos indexada en `.data/content/contents.sqlite`, no en `.data/content/pglite/`. Borrar solo `.nuxt/` o `.data/content/pglite/` no fuerza la reindexación.

**Solución:** Borrar el archivo SQLite completo:

```bash
rm -rf .data/content/
# o específicamente:
rm .data/content/contents.sqlite
```

Tras esto, el mensaje debería cambiar a:

```
[@nuxt/content] ✔ Processed 4 collections and 5 files in ...ms (0 cached, 5 parsed)
```

**Archivos afectados:** `.data/content/contents.sqlite`

---

---

## #12 `import Table from '@tiptap/extension-table'` rompe el build

**Síntoma:** Tras añadir extensiones de tabla a Tiptap, el servidor no arranca o las rutas de Nuxt Content devuelven 404/302. En consola:

```
RollupError: "default" is not exported by "@tiptap/extension-table"
```

**Causa:** `@tiptap/extension-table` (a diferencia de la mayoría de extensiones Tiptap) **no exporta default**. Exporta solo named exports.

**Solución:** Usar named import:

```ts
// ❌ Mal
import Table from '@tiptap/extension-table'

// ✅ Correcto
import { Table } from '@tiptap/extension-table'
```

Las demás extensiones de tabla (`table-cell`, `table-header`, `table-row`) SÍ exportan default y funcionan con `import X from '...'`.

**Archivos afectados:** `app/components/TiptapEditor.vue`

---

---

## #13 Middleware `role` redirige a `/usuario` en hard refresh aunque el usuario tenga rol válido

**Síntoma:** Usuario logueado con rol `DAW` (o superior). Al acceder directamente a una URL protegida (ej. `/50010314-cpifp_los_enlaces/...`) o hacer F5, el middleware `role` lo redirige a `/usuario`. Si navega por SPA (clic en links internos), funciona.

**Causa:** El middleware usa `useAppUserSession().session.value.role`, pero ese composable carga el usuario con `useFetch('/api/user', { server: false })`, por lo que en SSR el rol es `null`. El middleware ejecuta en SSR durante un hard refresh y rechaza al usuario.

**Solución:** Usar `useUserSession()` (de `nuxt-auth-utils`) que lee el rol directamente de la cookie de sesión, disponible tanto en SSR como en cliente:

```ts
// ❌ Antes (falla en SSR)
const { session } = useAppUserSession()
const userRole = session.value.role

// ✅ Ahora (funciona en SSR y cliente)
const { user } = useUserSession()
const userRole = user.value?.role as Role | undefined
```

**Archivos afectados:** `app/middleware/role.ts`, `app/middleware/role.global.ts`

---

## #12 Menú MDC de Tiptap genera sintaxis inválida

**Síntoma:**
Al insertar un componente MDC desde el menú "MDC" del editor Tiptap, el componente no renderiza después de guardar. El markdown generado muestra nombres en PascalCase (`::MdcCard`), inline components mal formados (`:MdcBadge`) o todo el bloque en una sola línea.

**Causa:**
1. El menú insertaba templates con el nombre del componente en PascalCase (`MdcCard`, `MdcAccordion`) en lugar del tag MDC kebab-case (`mdc-card`, `mdc-accordion`) que espera Nuxt Content.
2. Los templates inline (`MdcBadge`, `MdcKbd`) usaban una sintaxis incorrecta.
3. Tiptap insertaba el MDC como un único bloque de texto. Al guardar, `turndown` colapsaba los saltos de línea dentro del párrafo, dejando los delimitadores `::` en medio de la línea y rompiendo el MDC.

**Solución:**
- Usar siempre kebab-case en los templates del menú (`mdc-card`, `mdc-accordion`, `mdc-accordion-item`, etc.).
- Insertar cada línea del template MDC como un párrafo independiente en Tiptap.
- Al cargar contenido, preprocesar el markdown para aislar las líneas de delimitación `::` / `:::` en párrafos propios antes de `marked.parse()`.

**Ejemplo de bloque MDC que se conserva tras editar:**

```md
::mdc-card{title="Título" icon="lucide:star"}
Descripción de la tarjeta.
::
```

**Archivos afectados:** `app/components/TiptapEditor.vue`, `docus/prose-components-mdc.md`

---

*Última actualización: 2025-06-12*
