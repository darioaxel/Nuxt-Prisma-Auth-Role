# Guía: Actualizar Tiptap y Añadir Botones

> Cómo instalar nuevas extensiones de Tiptap y añadir botones a la toolbar del editor.

---

## Estructura del Editor

El editor Tiptap se encuentra en:

```
app/components/TiptapEditor.vue
```

Tiene tres secciones principales:

1. **Imports** — extensiones de `@tiptap/*`
2. **`useEditor({ extensions: [...] })`** — registro de extensiones
3. **Toolbar** — botones HTML que ejecutan comandos del editor
4. **`<style>`** — estilos CSS para el contenido renderizado

---

## Instalar una Nueva Extensión

### Paso 1: Instalar el paquete

```bash
pnpm add @tiptap/extension-nombre
```

Ejemplo real (ya instalado):

```bash
pnpm add @tiptap/extension-table @tiptap/extension-image
```

### Paso 2: Importarla

En la sección `<script setup>` de `TiptapEditor.vue`, añadir el import:

```ts
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Image from '@tiptap/extension-image'
```

### Paso 3: Registrarla en `extensions`

```ts
const editor = useEditor({
  extensions: [
    // ... extensiones existentes
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Image,
  ],
})
```

> Algunas extensiones requieren configuración (`.configure({ ... })`). Consulta la [documentación oficial de Tiptap](https://tiptap.dev/docs/editor/extensions/overview) para ver las opciones disponibles.

### Paso 4: Añadir estilos CSS (si aplica)

Si la extensión renderiza nuevos elementos HTML (tablas, imágenes, videos...), añade sus estilos en dos lugares:

**A. Estilos del editor (`TiptapEditor.vue` `<style>`)**

Para que se vean bien *mientras se editan*:

```css
.tiptap-editor-content table {
  width: 100%;
  border-collapse: collapse;
}
.tiptap-editor-content th,
.tiptap-editor-content td {
  border: 1px solid var(--border);
  padding: 0.5em;
}
```

**B. Estilos de contenido (`assets/css/content-prose.css`)**

Para que se vean bien *en la página de lectura* (renderizado por `<ContentRenderer>`):

```css
.content-prose table {
  width: 100%;
  border-collapse: collapse;
}
.content-prose th,
.content-prose td {
  border: 1px solid var(--border);
  padding: 0.5em;
}
```

---

## Añadir un Botón a la Toolbar

### Paso 1: Añadir el botón en el template

Busca la barra de herramientas en `TiptapEditor.vue` (dentro del `<template>`). Inserta tu botón junto a los demás:

```vue
<button
  type="button"
  @click="miFuncion"
  class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
  title="Descripción del botón"
>
  🔥 Acción
</button>
```

### Paso 2: Crear la función en `<script setup>`

```ts
function miFuncion() {
  editor.value?.chain().focus().miComando().run()
}
```

### Ejemplos reales

**Insertar tabla (3×3 con cabecera):**

```ts
function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
```

**Insertar imagen (con prompt para URL):**

```ts
function insertImage() {
  const url = window.prompt('URL de la imagen:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}
```

**Toggle de una extensión existente (ej: negrita):**

```ts
// En el template:
// @click="editor?.chain().focus().toggleBold().run()"
```

**Botón condicional (solo activable en ciertos contextos):**

```vue
<button
  type="button"
  @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
  :class="{ 'bg-accent': editor?.isActive('heading', { level: 2 }) }"
  :disabled="!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()"
  class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
>
  H2
</button>
```

| Atributo | Propósito |
|----------|-----------|
| `@click` | Ejecuta el comando de Tiptap |
| `:class="{ 'bg-accent': editor?.isActive(...) }"` | Resalta el botón cuando la extensión está activa en el cursor |
| `:disabled="!editor?.can()..."` | Deshabilita el botón si la acción no es posible |

---

## Comandos Útiles de Tiptap

| Comando | Descripción |
|---------|-------------|
| `.toggleBold()` | Negrita |
| `.toggleItalic()` | Cursiva |
| `.toggleStrike()` | Tachado |
| `.toggleHeading({ level: 1\|2\|3 })` | Heading |
| `.toggleBulletList()` | Lista con viñetas |
| `.toggleOrderedList()` | Lista numerada |
| `.toggleBlockquote()` | Cita |
| `.toggleCodeBlock()` | Bloque de código |
| `.insertTable({ rows, cols, withHeaderRow })` | Tabla |
| `.setImage({ src, alt, title })` | Imagen |
| `.undo()` / `.redo()` | Deshacer/Rehacer |
| `.chain().focus(). ... .run()` | Encadenamiento estándar |

> Lista completa: [Tiptap API Reference](https://tiptap.dev/docs/editor/api/commands)

---

## Flujo Completo: Añadir una Extensión Desde Cero

Ejemplo práctico: añadir soporte para videos embebidos.

### 1. Instalar

```bash
pnpm add @tiptap/extension-youtube
```

### 2. Importar

```ts
import Youtube from '@tiptap/extension-youtube'
```

### 3. Registrar

```ts
extensions: [
  // ... existentes
  Youtube.configure({
    width: 640,
    height: 480,
  }),
]
```

### 4. Añadir botón

```vue
<button
  type="button"
  @click="insertVideo"
  class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
>
  ▶️ Video
</button>
```

### 5. Crear función

```ts
function insertVideo() {
  const url = window.prompt('URL de YouTube:')
  if (url) {
    editor.value?.chain().focus().setYoutubeVideo({ src: url }).run()
  }
}
```

### 6. Estilos

```css
.tiptap-editor-content div[data-youtube-video] {
  margin: 1.5em 0;
}
```

---

*Última actualización: 2025-06-10*
