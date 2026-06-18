# Seguimiento: Editor Tiptap + Componentes MDC

> Documento de seguimiento de la rama `feature/tiptap-editor`. Resume el proceso, el estado actual y las tareas pendientes tras las últimas iteraciones sobre el editor Tiptap y los componentes MDC.

---

## 1. Contexto

**Rama:** `feature/tiptap-editor`  
**Objetivo general:** Permitir editar contenido markdown directamente desde la interfaz mediante Tiptap, preservando los componentes MDC (Prose Components) de Nuxt Content v3.

La rama parte de `main` e integra progresivamente:

- Editor Tiptap standalone (`/editor`) y modo edición in-place en páginas de contenido.
- Componentes MDC (`app/components/content/Mdc*.vue`) para enriquecer la documentación.
- Flujo de carga/guardado markdown ↔ HTML usando `marked` + `turndown` (evitando `tiptap-markdown`, incompatible con Tiptap v3).

---

## 2. Proceso llevado a cabo

### 2.1 Integración inicial de Tiptap

- Se añadió `TiptapEditor.vue` con extensiones básicas: negrita, cursiva, tachado, headings H1-H3, listas, blockquote, code block, history, tablas e imágenes.
- Se resolvió la incompatibilidad de `@tiptap/extension-table` usando named import (`import { Table } from '...'`).
- Se añadió `BubbleMenu` para operaciones sobre tablas.
- Se implementó la preservación del frontmatter YAML extrayéndolo antes de pasar el body a Tiptap y reinsertándolo al guardar.

### 2.2 Componentes MDC

- Se crearon componentes en `app/components/content/`:
  `MdcAccordion`, `MdcAccordionItem`, `MdcBadge`, `MdcCallout`, `MdcCard`, `MdcCardGroup`, `MdcCollapsible`, `MdcField`, `MdcFieldGroup`, `MdcIcon`, `MdcKbd`, `MdcSteps`, `MdcTabs`.
- Se renombraron con prefijo `Mdc` para evitar colisiones con componentes homónimos de shadcn/vue.
- Se documentaron en `docus/prose-components-mdc.md`.

### 2.3 Menú MDC en Tiptap

**Problema detectado:** el menú "MDC" insertaba templates incorrectos:

- Nombres en PascalCase (`::MdcCard`) en lugar de kebab-case (`::mdc-card`).
- Inline components mal formados (`:MdcBadge`, `:MdcKbd`).
- El bloque completo se insertaba como un único párrafo de texto; al guardar, `turndown` colapsaba los saltos de línea y rompía la sintaxis MDC.

**Solución aplicada:**

1. Templates corregidos a kebab-case y estructura MDC válida:
   - `::mdc-card`, `::mdc-accordion`, `:::mdc-accordion-item`, `::mdc-card-group`, `::mdc-collapsible`, `::mdc-tabs`, `::mdc-steps`, `::mdc-badge`, `::mdc-kbd`, `::mdc-icon`.
   - `CardGroup` ahora anida tarjetas con `:::`.
   - `Tabs` usa prop `tabs` con array YAML (`label` + `content`).
2. `insertMdc` inserta cada línea como nodo independiente; las líneas que empiezan por `#` se insertan como headings reales de Tiptap.
3. `preprocessMdcForEditor` aísla los delimitadores `::` / `:::` en párrafos propios antes de `marked.parse`, evitando que `turndown` los colapse al guardar.
4. Labels del menú renombrados a español: Aviso, Tarjeta, Grupo de tarjetas, Acordeón, Desplegable, Pestañas, Pasos, Insignia, Tecla, Icono.

### 2.4 Corrección de `MdcSteps`

**Problema detectado:** `::mdc-steps` no mostraba los números de paso.

**Causa raíz:**

1. El componente tenía `counter-reset` / `counter-increment` pero faltaba el pseudo-elemento `::before` con `content: counter(step)`.
2. En el contenido de prueba los headings estaban escapados (`\## Paso 1`), por lo que Nuxt Content no los interpretaba como `<h2>`.

**Solución aplicada:**

1. Se reescribió `MdcSteps.vue` con estilos scoped, `:deep()` y `::before` para mostrar el número en un círculo, similar al componente `Steps.vue` del proyecto de referencia.
2. Se hizo funcional el prop `level` para numerar solo el nivel de heading indicado (`h3` por defecto).
3. Se corrigió el contenido de `0613/index.md` eliminando las barras invertidas de los headings y ajustándolos a `h3`.
4. Se actualizó el tutorial de ayuda y la documentación MDC para usar `h3` por defecto.

### 2.5 Reimplementación de `MdcTabs`

### 2.6 Mejora de colores en `MdcCallout`

**Problema detectado:** los callouts (`mdc-callout`) tenían colores de fondo muy transparentes (`/10`) y no resaltaban visualmente.

**Solución aplicada:**

1. Se añadieron variables `--info`, `--success`, `--warning` y sus `-foreground` a `assets/css/tailwind.css` para ambos temas.
2. Se mapearon las variables como colores en `@theme inline`.
3. Se aumentó la opacidad de fondo y borde en `MdcCallout.vue` manteniendo `text-{color}-foreground` para garantizar legibilidad.


**Problema detectado:** la API anterior de `MdcTabs` con slots con nombre era confusa y poco usable.

**Solución aplicada:**

1. Se reescribió `MdcTabs.vue` con API similar al proyecto de referencia: recibe la prop `tabs` como array de `{ label, content }`.
2. El contenido de cada tab se renderiza con `marked.parse()`.
3. Se eliminó el componente `MdcTab.vue` y su registro en `nuxt.config.ts`.
4. Se actualizaron el contenido de prueba, el tutorial y la documentación MDC.

### 2.6 Corrección de contenido de prueba

- `content/50010314-CPIFP_Los_Enlaces/IFC303-DAW/5084-DWES/0613/index.md`: añadidos/aclarados bloques MDC de ejemplo (tabs, steps, accordion) y corregidos headings escapados.
- `content/50020125-CampusVirtualFP/IFC303-DAW/5180-BBDD/0484/index.md`: corregido bloque `mdc-card` que había quedado en una sola línea tras ediciones previas.

---

## 3. Estado actual

| Área | Estado | Notas |
|------|--------|-------|
| Editor Tiptap básico | ✅ Funcional | Bold, italic, headings, listas, blockquote, code, tablas, imágenes. |
| Menú MDC | ✅ Corregido | Inserta sintaxis kebab-case y como nodos independientes. |
| Carga/guardado markdown | ✅ Funcional | Frontmatter preservado; MDC se mantiene tras guardar. |
| `MdcSteps` | ✅ Corregido | Muestra numeración circular tipo timeline, respeta `level` y usa variables CSS del tema. |
| `MdcTabs` | ✅ Reimplementado | Recibe prop `tabs` como array YAML; renderiza contenido markdown por pestaña. |
| `MdcCardGroup` | ✅ Documentado | Requiere `:::` para tarjetas hijas. |
| Componentes restantes | ✅ Funcionales | Card, Accordion, Callout, Collapsible, Badge, Kbd, Icon. |
| Tema semántico (info/success/warning) | ✅ Definido | Variables añadidas a Tailwind para callouts. |
| Vista previa WYSIWYG de MDC | ⚠️ Limitada | Tiptap muestra los componentes MDC como texto plano; se conservan al guardar pero no se renderizan visualmente en el editor. |

---

## 4. Decisiones técnicas clave

1. **No usar `tiptap-markdown`**. Es incompatible con Tiptap v3. El flujo es `marked.parse()` para cargar y `turndown` para guardar.
2. **MDC como texto plano en Tiptap**. Tiptap no entiende MDC; la estrategia es mantener la sintaxis MDC como texto editable y asegurar que al guardar se reconstruya correctamente.
3. **Preprocesar delimitadores MDC al cargar**. Aislar `::` / `:::` en párrafos propios evita que `turndown` colapse los saltos de línea.
4. **Headings MDC como headings reales en Tiptap**. Para `mdc-steps`, las líneas `#` del template se insertan como nodos `heading`, no como texto, garantizando que sean `<h2>` reales en el markdown guardado.

---

## 5. Problemas conocidos / deuda técnica

1. **Tiptap no renderiza MDC visualmente**. El usuario ve `::mdc-card{...}` como texto. La alternativa sería desarrollar extensiones Tiptap custom o placeholders no editables; esto queda fuera del alcance actual.
2. **Markdown guardado con líneas en blanco extra**. Tras editar, los bloques MDC pueden quedar con líneas en blanco adicionales entre sus líneas. Nuxt Content los renderiza correctamente, pero el archivo es menos limpio.
3. **Página `/editor.vue` usa `v-model` incorrectamente**. `TiptapEditor` no expone `v-model`; la página `/editor` probablemente esté rota. Pendiente de revisar si se quiere mantener el editor standalone.
4. **Validación de MDC manual**. No hay validación que impida que el usuario rompa un bloque MDC desde el editor (p. ej., borrar un `::`).
5. **`MdcField` / `MdcFieldGroup`** no se usan actualmente en contenido; podrían eliminarse o completarse con ejemplos.
6. **`MdcTabs` requiere contenido markdown como string**. A diferencia de otros componentes MDC, el contenido de cada tab no se renderiza mediante `<slot>`; se parsea con `marked.parse()`. Esto limita el uso de componentes MDC anidados dentro de las tabs.

---

## 6. Tareas pendientes

### Críticas / bloqueantes

- [ ] Validar que `MdcSteps` renderiza correctamente en el entorno de desarrollo tras la corrección.
- [ ] Revisar y corregir `/editor.vue` si se quiere mantener el editor standalone (actualmente usa `v-model` sobre un componente que no lo soporta).
- [ ] Limpiar contenido de ejemplo en `0613/index.md` si los bloques MDC de prueba no deben quedar en producción.
- [ ] Revisar que la colección `ayuda` se indexe correctamente y que `/ayuda/tutorial-markdown-mdc` sea accesible.

### Mejoras

- [ ] Añadir tooltips o indicadores visuales en el editor para mostrar qué líneas son componentes MDC.
- [ ] Implementar placeholders no editables para bloques MDC (alternativa más robusta al flujo actual).
- [ ] Normalizar el markdown guardado para eliminar líneas en blanco superfluas dentro de bloques MDC sin romperlos.
- [ ] Revisar si `MdcField` / `MdcFieldGroup` se mantienen o se eliminan.

### Documentación

- [x] Actualizar `docus/fallos_soluciones.md` con el problema del menú MDC.
- [x] Actualizar `docus/prose-components-mdc.md` con ejemplos corregidos.
- [x] Crear tutorial de Markdown y MDC accesible desde `/ayuda/tutorial-markdown-mdc`.
- [ ] Actualizar `AGENTS.md` si se estabiliza el flujo de edición Tiptap + MDC.

---

## 7. Archivos modificados en esta iteración

```
app/components/TiptapEditor.vue
app/components/content/MdcCallout.vue
app/components/content/MdcSteps.vue
app/components/content/MdcTabs.vue
app/lib/config.ts
assets/css/tailwind.css
app/pages/ayuda/[...slug].vue
content.config.ts
content/50010314-CPIFP_Los_Enlaces/IFC303-DAW/5084-DWES/0613/index.md
content/50020125-CampusVirtualFP/IFC303-DAW/5180-BBDD/0484/index.md
content/ayuda/index.md
content/ayuda/tutorial-markdown-mdc.md
nuxt.config.ts
docus/fallos_soluciones.md
docus/prose-components-mdc.md
docus/seguimiento-tiptap-mdc.md
```

---

*Última actualización: 2025-06-18*
