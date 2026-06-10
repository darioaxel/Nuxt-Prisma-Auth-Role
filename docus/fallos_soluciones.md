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

*Última actualización: 2025-06-10*
