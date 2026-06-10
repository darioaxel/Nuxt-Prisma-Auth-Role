# Editor Tiptap Inline

> Documentación del sistema de edición markdown in-place integrado con Tiptap.

---

## Arquitectura

El editor permite editar archivos `.md` directamente desde la página de contenido, sin navegar a una pantalla separada.

```
┌─────────────────────────────────────────┐
│  Página [centro]/[...slug].vue          │
│  ┌─────────────────────────────────┐    │
│  │ Modo Vista                      │    │
│  │  • ContentRenderer              │    │
│  │  • Botón ✏️ Editar (esquina)    │    │
│  └─────────────────────────────────┘    │
│              ↓ toggleEdit()             │
│  ┌─────────────────────────────────┐    │
│  │ Modo Edición                    │    │
│  │  • TiptapEditor (inline)        │    │
│  │  • Barra de herramientas        │    │
│  │  • Botones Guardar / Cancelar   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
              ↓ PUT /api/content/file
┌─────────────────────────────────────────┐
│  API server/api/content/file.put.ts     │
│  • Recibe { path, content }             │
│  • Escribe a disco con resolveContentPath│
│  • Nuxt Content reindexa automáticamente │
└─────────────────────────────────────────┘
```

---

## Flujo de datos

### 1. Carga (modo edición)

1. Usuario pulsa **✏️ Editar**
2. `TiptapEditor` monta y llama `loadContent()`
3. `GET /api/content/file?path=<ruta>` devuelve el markdown **raw** (con frontmatter)
4. Se extrae el frontmatter vía regex
5. El **body** se convierte de markdown → HTML con `marked.parse()`
6. Tiptap recibe el HTML y renderiza el editor

### 2. Guardado

1. Usuario pulsa **Guardar**
2. `saveContent()` obtiene el HTML del editor
3. `turndownService.turndown(html)` convierte HTML → markdown
4. Se recombina: `frontmatter + markdownBody`
5. `PUT /api/content/file` con `{ path, content }`
6. Archivo se escribe a disco
7. Nuxt Content detecta el cambio y reindexa
8. Página vuelve a modo vista y hace `refreshItem()`

---

## Componentes

### `app/components/TiptapEditor.vue`

Editor autónomo. Props:

| Prop | Tipo | Descripción |
|------|------|-------------|
| `path` | `string` | Ruta relativa del contenido (ej: `blog/bienvenida` o `50020125-campusvirtualfp/ifc303-daw/5084-dwes/0613`) |

Eventos:

| Evento | Descripción |
|--------|-------------|
| `@saved` | Se emitió tras guardar exitosamente |
| `@cancelled` | Se emitió al pulsar Cancelar |

### `app/pages/[centro]/[...slug].vue`

Página de contenido con toggle de edición.

Estado:
- `isEditing: ref(false)` — controla vista vs edición

La propiedad `item.path` del contenido (en minúsculas) se pasa al editor como `editorPath = item.path.slice(1)`.

---

## API Endpoints

### `GET /api/content/file?path={path}`

Lee un archivo markdown del filesystem.

**Query params:**
- `path`: ruta relativa desde `content/` (sin `.md`)

**Respuesta:**
```json
{
  "content": "---\ntitle: ...\n---\n\n# Contenido...",
  "path": "/abs/path/to/content/.../index.md"
}
```

### `PUT /api/content/file`

Escribe un archivo markdown al filesystem.

**Body:**
```json
{
  "path": "blog/bienvenida",
  "content": "---\ntitle: ...\n---\n\n# Nuevo contenido..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "path": "/abs/path/to/content/blog/bienvenida.md"
}
```

---

## Utilidades del servidor

### `server/utils/content-path.ts`

`resolveContentPath(urlPath: string): string | null`

Resuelve la ruta real del filesystem a partir de un path de URL. Características:
- **Case-insensitive:** Busca cada segmento sin importar mayúsculas/minúsculas
- **Soporta directorios con `index.md`**
- **Soporta archivos `.md` directos**

Ejemplos:
```ts
resolveContentPath('blog/bienvenida')
// → content/blog/bienvenida.md

resolveContentPath('50020125-campusvirtualfp/ifc303-daw/5084-dwes/0613')
// → content/50020125-CampusVirtualFP/IFC303-DAW/5084-DWES/0613/index.md
```

---

## Dependencias

```json
{
  "@tiptap/vue-3": "^3.26.0",
  "@tiptap/pm": "^3.26.0",
  "@tiptap/starter-kit": "^3.26.0",
  "marked": "^18.0.5",
  "turndown": "^7.2.4"
}
```

> **Nota:** No usar `tiptap-markdown`. Es incompatible con Tiptap v3.

---

## Seguridad

- Las páginas de contenido protegen el botón de edición con middleware `auth + role` (roles: `DAW`, `ADMIN`, `ROOT`)
- `resolveContentPath` no permite directory traversal (siempre parte desde `content/`)
- Los endpoints de file no tienen middleware adicional; asumen que las páginas que los llaman ya están protegidas

---

## Mejoras futuras posibles

- [ ] Edición de frontmatter desde campos de formulario separados (title, description)
- [ ] Previsualización lado a lado (split view)
- [ ] Indicador de "cambios sin guardar" antes de salir
- [ ] Autosave con debounce
- [ ] Soporte para imágenes drag & drop
- [ ] Historial de versiones (git-based)
