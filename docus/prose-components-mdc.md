# Guía: Prose Components (MDC) para Nuxt Content

> Cómo crear y usar componentes Vue dentro de archivos Markdown mediante la sintaxis MDC de Nuxt Content v3.

---

## ¿Qué son los Prose Components?

Los **Prose Components** (también llamados **MDC Components**) son componentes Vue que puedes usar directamente dentro de archivos `.md`. Nuxt Content v3 los detecta automáticamente en `app/components/content/` y los hace disponibles mediante la sintaxis MDC:

```md
::mi-componente{prop="valor"}
Contenido interno (slot)
::
```

Esto permite crear documentación interactiva y rica sin salir del formato Markdown.

---

## Componentes Disponibles

Todos se encuentran en `app/components/content/`:

| Componente | Tag MDC | Props | Descripción |
|-----------|---------|-------|-------------|
| `MdcAccordion.vue` | `::mdc-accordion` | — | Contenedor de paneles plegables |
| `MdcAccordionItem.vue` | `:::mdc-accordion-item` | `label`, `icon` | Panel plegable individual |
| `MdcBadge.vue` | `:mdc-badge` | — | Etiqueta de estado (pill) |
| `MdcCallout.vue` | `::mdc-callout` | `type`, `icon` | Caja destacada (info/tip/warning/caution) |
| `MdcCard.vue` | `::mdc-card` | `title`, `to`, `icon` | Tarjeta con título, icono y link |
| `MdcCardGroup.vue` | `::mdc-card-group` | — | Grid de tarjetas |
| `MdcCollapsible.vue` | `::mdc-collapsible` | `title` | Sección colapsable |
| `MdcField.vue` | `::mdc-field` | `name`, `type` | Campo de formulario de ejemplo |
| `MdcFieldGroup.vue` | `::mdc-field-group` | — | Grupo de campos |
| `MdcIcon.vue` | `::mdc-icon` | `name` | Icono de `@nuxt/icon` |
| `MdcKbd.vue` | `:mdc-kbd` | — | Tecla de teclado estilizada |
| `MdcTabs.vue` | `::mdc-tabs` | `tabs` | Pestañas con contenido markdown |
| `MdcSteps.vue` | `::mdc-steps` | `level` | Guía paso a paso numerada |

---

## Ejemplos de Uso

### Accordion

```md
::mdc-accordion
:::mdc-accordion-item{label="Pregunta 1" icon="lucide:help-circle"}
Respuesta a la pregunta 1.
:::
:::mdc-accordion-item{label="Pregunta 2" icon="lucide:help-circle"}
Respuesta a la pregunta 2.
:::
::
```

### Callout

```md
::mdc-callout{type="info"}
Información importante para el lector.
::

::mdc-callout{type="tip"}
Un consejo útil.
::

::mdc-callout{type="warning"}
Advertencia: ten cuidado con esto.
::

::mdc-callout{type="caution"}
Precaución: esto puede romper algo.
::
```

Tipos disponibles: `info`, `tip`, `warning`, `caution`. Cada uno tiene un color e icono por defecto.

### Card

```md
::mdc-card{title="Guía de inicio" to="/daw" icon="lucide:book-open"}
Aprende los conceptos básicos del ciclo DAW.
::
```

Si `to` es una URL externa (empieza con `http`), se abre en nueva pestaña.

### CardGroup

```md
::mdc-card-group
:::mdc-card{title="Card 1" icon="lucide:star"}
Descripción 1
:::
:::mdc-card{title="Card 2" icon="lucide:heart"}
Descripción 2
:::
::
```

### Collapsible

```md
::mdc-collapsible{title="Ver detalles técnicos"}
Contenido oculto por defecto.
::
```

### Icon

```md
Consulta la documentación ::mdc-icon{name="lucide:book-open"} para más información.
```

### Kbd

```md
::mdc-kbd
Ctrl + C
::
```

### Tabs

```md
::mdc-tabs
---
tabs:
  - label: Vista previa
    content: |
      Contenido de la pestaña Vista previa.
  - label: Código
    content: |
      ```ts
      const mensaje = 'Hola mundo'
      ```
---
::
```

> Los tabs se definen mediante la prop `tabs` como array YAML. Cada tab tiene `label` (texto de la pestaña) y `content` (contenido markdown). El primer tab es el activo por defecto.

### Steps

```md
::mdc-steps
### Paso 1: Instalación
Ejecuta `pnpm install`.

### Paso 2: Configuración
Edita el archivo `nuxt.config.ts`.

### Paso 3: Despliegue
Ejecuta `pnpm build`.
::
```

> Steps numera automáticamente los headings con círculos. Por defecto numera `h3`; usa la prop `level` (`2`, `3` o `4`) para cambiar el nivel.

---

## Crear un Nuevo Prose Component

### Paso 1: Crear el archivo

Crea un componente Vue en `app/components/content/`:

```bash
touch app/components/content/MiComponente.vue
```

### Paso 2: Escribir el componente

```vue
<script setup lang="ts">
interface Props {
  titulo?: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
})
</script>

<template>
  <div class="my-5 p-4 border rounded-md" :class="`border-${color} bg-${color}/10`">
    <h4 v-if="titulo" class="font-semibold mb-2">{{ titulo }}</h4>
    <slot />
  </div>
</template>
```

### Paso 3: Usarlo en markdown

Nuxt Content convierte automáticamente el nombre del componente a **kebab-case**:

```md
::mi-componente{titulo="Hola" color="success"}
Contenido del componente con **markdown**.
::
```

Reglas de conversión:
- `MiComponente` → `mi-componente`
- `CardGroup` → `card-group`
- `AccordionItem` → `accordion-item`

### Props y slots

| En Vue | En Markdown |
|--------|-------------|
| `defineProps<{ titulo: string }>()` | `::mi-componente{titulo="Hola"}` |
| `<slot />` | Contenido entre `::mi-componente` y `::` |
| `<slot name="extra" />` | `:::extra` ... `:::` |

---

## Anidamiento de Componentes

Los componentes MDC se pueden anidar usando `:::` (tres dos puntos) para los hijos:

```md
::mdc-accordion
:::mdc-accordion-item{label="Item 1"}
Contenido del item 1.
:::
::
```

| Símbolo | Nivel | Uso |
|---------|-------|-----|
| `::` | Padre | Componente raíz |
| `:::` | Hijo | Slot con nombre o componente anidado |
| `::::` | Nieto | Anidamiento profundo |

---

## Integración con Tiptap

El editor Tiptap **no entiende MDC nativamente**. El flujo de trabajo recomendado es:

1. **Escribir MDC** directamente en el archivo `.md` con un editor de texto
2. **Usar Tiptap** para editar el contenido prose estándar (headings, listas, tablas, imágenes, etc.)
3. **Combinar ambos**: el contenido generado por Tiptap coexiste con los componentes MDC en el mismo archivo
4. **Usar el menú "MDC" del editor**: inserta los componentes con la sintaxis kebab-case correcta y como párrafos independientes para que no se rompan al guardar

Ejemplo de archivo `.md` que mezcla ambos:

```md
---
title: Guía completa
---

# Introducción

Este párrafo fue escrito con **Tiptap**.

## Requisitos

::mdc-callout{type="tip"}
Asegúrate de tener Node.js 20+ instalado.
::

## Pasos

::mdc-steps
### Configuración inicial
Edita `nuxt.config.ts`.

### Instalación
Ejecuta el comando correspondiente.
::

## Tabla comparativa

| Característica | Tiptap | MDC |
| --------------- | ------ | --- |
| Edición WYSIWYG | ✅ | ❌ |
| Componentes rich | ❌ | ✅ |

## Recursos

::mdc-card-group
::mdc-card{title="Documentación" to="https://nuxt.com" icon="lucide:external-link"}
Consulta la documentación oficial.
::
::
```

---

## Buenas Prácticas

1. **Usa componentes MDC para lo que Tiptap no puede hacer**: tabs, acordeones, callouts, cards...
2. **Usa Tiptap para contenido prose estándar**: párrafos, listas, tablas, imágenes, headings...
3. **Mantén los componentes puros**: reciben props y renderizan HTML. La lógica de datos va en las páginas.
4. **Documenta los props**: cada componente debe tener su interfaz de props tipada con TypeScript.
5. **Estilos en `content-prose.css`**: si un componente necesita estilos específicos en modo lectura, añádelos al CSS global.

---

## Referencias

- [Nuxt Content MDC Syntax](https://content.nuxt.com/docs/mdc)
- [Tiptap Extensions](https://tiptap.dev/docs/editor/extensions/overview)
- [Docus v3 Prose Components](https://v3.docs-template-3erl.pages.dev/essentials/prose-components)

---

*Última actualización: 2025-06-10*
