# Tutorial de Markdown y MDC

> Guía básica con ejemplos de todos los elementos de markdown y componentes MDC disponibles en esta documentación.

---

## 1. Markdown básico

### Párrafos y énfasis

Esto es un párrafo normal. Puedes escribir texto **en negrita**, *en cursiva* o ~~tachado~~.

También puedes combinarlos: ***negrita y cursiva***.

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Listas

#### Lista desordenada

- Primer elemento
- Segundo elemento
  - Elemento anidado
  - Otro elemento anidado
- Tercer elemento

#### Lista ordenada

1. Primer paso
2. Segundo paso
   1. Subpaso
   2. Otro subpaso
3. Tercer paso

### Enlaces

Enlace interno: [Ir al inicio](/)

Enlace externo: [Documentación de Nuxt](https://nuxt.com){target="_blank"}

### Imágenes

![Texto alternativo de la imagen](https://placehold.co/600x300?text=Ejemplo+de+imagen)

### Citas

> Esto es una cita en bloque.
>
> Puedes añadir varios párrafos dentro de la misma cita.

### Código

Código inline: `const saludo = "Hola mundo"`.

Bloque de código:

```ts
function saludar(nombre: string) {
  return `Hola, ${nombre}`
}

console.log(saludar('DAW'))
```

### Tablas

| Nombre | Edad | Rol |
|--------|------|-----|
| Ana    | 22   | ADMIN |
| Luis   | 24   | DAW |
| Marta  | 21   | BLOG |

### Línea horizontal

---

## 2. Componentes MDC

Los componentes MDC permiten enriquecer el contenido markdown con elementos interactivos. Se escriben con la sintaxis `::nombre-componente{prop="valor"}`.

### Tarjeta

::mdc-card{title="Tarjeta de ejemplo" to="/daw" icon="lucide:book-open"}
Esta es una tarjeta con título, icono y enlace interno.
::

### Grupo de tarjetas

::mdc-card-group
:::mdc-card{title="Tarjeta 1" icon="lucide:star"}
Descripción de la primera tarjeta.
:::
:::mdc-card{title="Tarjeta 2" icon="lucide:heart"}
Descripción de la segunda tarjeta.
:::
::

### Aviso (Callout)

::mdc-callout{type="info"}
Información general para el lector.
::

::mdc-callout{type="tip"}
Un consejo útil para resolver el ejercicio.
::

::mdc-callout{type="warning"}
Advertencia: presta atención a este paso.
::

::mdc-callout{type="caution"}
Precaución: esto puede romper la configuración actual.
::

### Acordeón

::mdc-accordion
:::mdc-accordion-item{label="¿Qué es Nuxt Content?" icon="lucide:help-circle"}
Nuxt Content es un módulo de Nuxt para gestionar y renderizar contenido markdown y JSON.
:::
:::mdc-accordion-item{label="¿Qué es MDC?" icon="lucide:help-circle"}
MDC (Markdown Components) permite usar componentes Vue dentro de archivos markdown.
:::
::

### Desplegable

::mdc-collapsible{title="Ver detalles adicionales"}
Este contenido está oculto por defecto y se muestra al hacer clic en el título.
::

### Pestañas

::mdc-tabs
:::Preview
Contenido de la pestaña Preview.
:::
:::Code
```ts
const mensaje = 'Hola mundo'
```
:::
::

### Pasos numerados

Por defecto se numeran los headings `h3`. Puedes cambiarlo con la prop `level` (`2`, `3` o `4`).

::mdc-steps
### Paso 1: Instalación
Ejecuta el comando de instalación del proyecto.

### Paso 2: Configuración
Edita los archivos de configuración necesarios.

### Paso 3: Despliegue
Publica la aplicación en el servidor.
::

### Insignia

::mdc-badge
Nuevo
::

### Tecla

::mdc-kbd
Ctrl + C
::

### Icono

Consulta la documentación ::mdc-icon{name="lucide:book-open"} para más información.

---

## 3. Consejos de uso

- Usa markdown estándar para párrafos, listas, tablas e imágenes.
- Usa componentes MDC para elementos interactivos que markdown no puede hacer: tarjetas, acordeones, pestañas, pasos numerados...
- Los componentes MDC deben escribirse en **kebab-case**: `mdc-card`, `mdc-accordion`, etc.
- Los componentes anidados usan `:::` (tres dos puntos).
- Recuerda cerrar siempre los bloques con `::`.
