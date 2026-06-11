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
| `Accordion.vue` | `::accordion` | — | Contenedor de paneles plegables |
| `AccordionItem.vue` | `:::accordion-item` | `label`, `icon` | Panel plegable individual |
| `Badge.vue` | `:badge` | — | Etiqueta de estado (pill) |
| `Callout.vue` | `::callout` | `type`, `icon` | Caja destacada (info/tip/warning/caution) |
| `Card.vue` | `::card` | `title`, `to`, `icon` | Tarjeta con título, icono y link |
| `CardGroup.vue` | `::card-group` | — | Grid de tarjetas |
| `Collapsible.vue` | `::collapsible` | `title` | Sección colapsable |
| `Field.vue` | `::field` | `name`, `type` | Campo de formulario de ejemplo |
| `FieldGroup.vue` | `::field-group` | — | Grupo de campos |
| `Icon.vue` | `::icon` | `name` | Icono de `@nuxt/icon` |
| `Kbd.vue` | `:kbd` | — | Tecla de teclado estilizada |
| `Tabs.vue` + `Tab.vue` | `::tabs` / `:::tab` | `label` | Pestañas con contenido |
| `Steps.vue` | `::steps` | `level` | Guía paso a paso numerada |

---

## Ejemplos de Uso

### Accordion

```md
::accordion
:::accordion-item{label="Pregunta 1" icon="lucide:help-circle"}
Respuesta a la pregunta 1.
:::
:::accordion-item{label="Pregunta 2" icon="lucide:help-circle"}
Respuesta a la pregunta 2.
:::
::
```

### Callout

```md
::callout{type="info"}
Información importante para el lector.
::

::callout{type="tip"}
Un consejo útil.
::

::callout{type="warning"}
Advertencia: ten cuidado con esto.
::

::callout{type="caution"}
Precaución: esto puede romper algo.
::
```

Tipos disponibles: `info`, `tip`, `warning`, `caution`. Cada uno tiene un color e icono por defecto.

### Card

```md
::card{title="Guía de inicio" to="/daw" icon="lucide:book-open"}
Aprende los conceptos básicos del ciclo DAW.
::
```

Si `to` es una URL externa (empieza con `http`), se abre en nueva pestaña.

### CardGroup

```md
::card-group
::card{title="Card 1" icon="lucide:star"}
Descripción 1
::
::card{title="Card 2" icon="lucide:heart"}
Descripción 2
::
::
```

### Collapsible

```md
::collapsible{title="Ver detalles técnicos"}
Contenido oculto por defecto.
::
```

### Icon

```md
Consulta la documentación ::icon{name="lucide:book-open"} para más información.
```

### Kbd

```md
Presiona :kbd Ctrl + C :kbd para copiar.
```

### Tabs

```md
::tabs
:::tab{label="Preview"}
Contenido de la pestaña Preview.
:::
:::tab{label="Code"}
Contenido de la pestaña Code.
:::
::
```

> Los tabs se definen mediante slots con nombre (`:::tab{label="Nombre"}`). El primer tab es el activo por defecto.

### Steps

```md
::steps
## Paso 1: Instalación
Ejecuta `pnpm install`.

## Paso 2: Configuración
Edita el archivo `nuxt.config.ts`.

## Paso 3: Despliegue
Ejecuta `pnpm build`.
::
```

> Steps numera automáticamente los headings (h2, h3, h4) con círculos. El prop `level` controla qué nivel de heading se numera.

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
::accordion
:::accordion-item{label="Item 1"}
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

Ejemplo de archivo `.md` que mezcla ambos:

```md
---
title: Guía completa
---

# Introducción

Este párrafo fue escrito con **Tiptap**.

## Requisitos

::callout{type="tip"}
Asegúrate de tener Node.js 20+ instalado.
::

## Pasos

::steps
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

::card-group
::card{title="Documentación" to="https://nuxt.com" icon="lucide:external-link"}
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
