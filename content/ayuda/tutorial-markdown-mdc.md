# Tutorial de Markdown y MDC

> Guía interactiva con ejemplos de todos los elementos de markdown y componentes MDC disponibles. Los elementos markdown básicos incluyen pestañas con **Diseño** y **Código**; los componentes MDC se muestran renderizados seguidos de su código.

---

## 1. Markdown básico

### 1.1. Párrafos y énfasis

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      Esto es un párrafo normal. Puedes escribir texto **en negrita**, *en cursiva* o ~~tachado~~. También puedes combinarlos: ***negrita y cursiva***.
  - label: Código
    content: |
      ```md
      Esto es un párrafo normal. Puedes escribir texto **en negrita**, *en cursiva* o ~~tachado~~.

      También puedes combinarlos: ***negrita y cursiva***.
      ```
---
::

### 1.2. Headings

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      # Heading 1
      ## Heading 2
      ### Heading 3
      #### Heading 4
      ##### Heading 5
      ###### Heading 6
  - label: Código
    content: |
      ```md
      # Heading 1
      ## Heading 2
      ### Heading 3
      #### Heading 4
      ##### Heading 5
      ###### Heading 6
      ```
---
::

### 1.3. Listas desordenadas

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      - Primer elemento
      - Segundo elemento
        - Elemento anidado
        - Otro elemento anidado
      - Tercer elemento
  - label: Código
    content: |
      ```md
      - Primer elemento
      - Segundo elemento
        - Elemento anidado
        - Otro elemento anidado
      - Tercer elemento
      ```
---
::

### 1.4. Listas ordenadas

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      1. Primer paso
      2. Segundo paso
         1. Subpaso
         2. Otro subpaso
      3. Tercer paso
  - label: Código
    content: |
      ```md
      1. Primer paso
      2. Segundo paso
         1. Subpaso
         2. Otro subpaso
      3. Tercer paso
      ```
---
::

### 1.5. Enlaces

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      Enlace interno: [Ir al inicio](/)

      Enlace externo: [Documentación de Nuxt](https://nuxt.com){target="_blank"}
  - label: Código
    content: |
      ```md
      Enlace interno: [Ir al inicio](/)

      Enlace externo: [Documentación de Nuxt](https://nuxt.com){target="_blank"}
      ```
---
::

### 1.6. Imágenes

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      ![Texto alternativo de la imagen](https://placehold.co/600x300?text=Ejemplo+de+imagen)
  - label: Código
    content: |
      ```md
      ![Texto alternativo de la imagen](https://placehold.co/600x300?text=Ejemplo+de+imagen)
      ```
---
::

### 1.7. Citas

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      > Esto es una cita en bloque.
      >
      > Puedes añadir varios párrafos dentro de la misma cita.
  - label: Código
    content: |
      ```md
      > Esto es una cita en bloque.
      >
      > Puedes añadir varios párrafos dentro de la misma cita.
      ```
---
::

### 1.8. Código inline y bloques

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      Código inline: `const saludo = "Hola mundo"`.

      ```ts
      function saludar(nombre: string) {
        return `Hola, ${nombre}`
      }

      console.log(saludar('DAW'))
      ```
  - label: Código
    content: |
      ````md
      Código inline: `const saludo = "Hola mundo"`.

      ```ts
      function saludar(nombre: string) {
        return `Hola, ${nombre}`
      }

      console.log(saludar('DAW'))
      ```
      ````
---
::

### 1.9. Tablas

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      | Nombre | Edad | Rol |
      |--------|------|-----|
      | Ana    | 22   | ADMIN |
      | Luis   | 24   | DAW |
      | Marta  | 21   | BLOG |
  - label: Código
    content: |
      ```md
      | Nombre | Edad | Rol |
      |--------|------|-----|
      | Ana    | 22   | ADMIN |
      | Luis   | 24   | DAW |
      | Marta  | 21   | BLOG |
      ```
---
::

### 1.10. Línea horizontal

::mdc-tabs
---
tabs:
  - label: Diseño
    content: |
      Texto antes de la línea.

      ---

      Texto después de la línea.
  - label: Código
    content: |
      ```md
      Texto antes de la línea.

      ---

      Texto después de la línea.
      ```
---
::

---

## 2. Componentes MDC

Los componentes MDC permiten enriquecer el contenido markdown con elementos interactivos. Se escriben con la sintaxis `::nombre-componente{prop="valor"}`.

> **Nota:** los componentes MDC anidados dentro de las pestañas no se renderizan visualmente porque el contenido de cada pestaña se parsea como markdown estándar. A continuación se muestran renderizados directamente, seguidos de su código.

### 2.1 Tarjeta

::mdc-card{title="Tarjeta de ejemplo" to="/daw" icon="lucide:book-open"}
Esta es una tarjeta con título, icono y enlace interno.
::

```md
::mdc-card{title="Tarjeta de ejemplo" to="/daw" icon="lucide:book-open"}
Esta es una tarjeta con título, icono y enlace interno.
::
```

### 2.2. Grupo de tarjetas

::mdc-card-group
:::mdc-card{title="Tarjeta 1" icon="lucide:star"}
Descripción de la primera tarjeta.
:::
:::mdc-card{title="Tarjeta 2" icon="lucide:heart"}
Descripción de la segunda tarjeta.
:::
::

````md
::mdc-card-group
:::mdc-card{title="Tarjeta 1" icon="lucide:star"}
Descripción de la primera tarjeta.
:::
:::mdc-card{title="Tarjeta 2" icon="lucide:heart"}
Descripción de la segunda tarjeta.
:::
::
````

### 2.3. Aviso (Callout)

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

````md
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
````

### 2.4 Acordeón

::mdc-accordion
:::mdc-accordion-item{label="¿Qué es Nuxt Content?" icon="lucide:help-circle"}
Nuxt Content es un módulo de Nuxt para gestionar y renderizar contenido markdown y JSON.
:::
:::mdc-accordion-item{label="¿Qué es MDC?" icon="lucide:help-circle"}
MDC (Markdown Components) permite usar componentes Vue dentro de archivos markdown.
:::
::

````md
::mdc-accordion
:::mdc-accordion-item{label="¿Qué es Nuxt Content?" icon="lucide:help-circle"}
Nuxt Content es un módulo de Nuxt para gestionar y renderizar contenido markdown y JSON.
:::
:::mdc-accordion-item{label="¿Qué es MDC?" icon="lucide:help-circle"}
MDC (Markdown Components) permite usar componentes Vue dentro de archivos markdown.
:::
::
````

### 2.5. Desplegable

::mdc-collapsible{title="Ver detalles adicionales"}
Este contenido está oculto por defecto y se muestra al hacer clic en el título.
::

```md
::mdc-collapsible{title="Ver detalles adicionales"}
Este contenido está oculto por defecto y se muestra al hacer clic en el título.
::
```

### 2.6. Pestañas

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

````md
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
````

### 2.7. Pasos numerados

::mdc-steps
### Paso 1: Instalación
Ejecuta el comando de instalación del proyecto.

### Paso 2: Configuración
Edita los archivos de configuración necesarios.

### Paso 3: Despliegue
Publica la aplicación en el servidor.
::

````md
::mdc-steps
### Paso 1: Instalación
Ejecuta el comando de instalación del proyecto.

### Paso 2: Configuración
Edita los archivos de configuración necesarios.

### Paso 3: Despliegue
Publica la aplicación en el servidor.
::
````

### 2.8. Insignia

::mdc-badge
Nuevo
::

```md
::mdc-badge
Nuevo
::
```

### 2.9. Tecla

::mdc-kbd
Ctrl + C
::

```md
::mdc-kbd
Ctrl + C
::
```

### 2.10. Icono

Consulta la documentación ::mdc-icon{name="lucide:book-open"} para más información.

```md
Consulta la documentación ::mdc-icon{name="lucide:book-open"} para más información.
```

---

## 3. Consejos de uso

- Usa markdown estándar para párrafos, listas, tablas e imágenes.
- Usa componentes MDC para elementos interactivos que markdown no puede hacer: tarjetas, acordeones, pestañas, pasos numerados...
- Los componentes MDC deben escribirse en **kebab-case**: `mdc-card`, `mdc-accordion`, etc.
- Los componentes anidados usan `:::` (tres dos puntos).
- Recuerda cerrar siempre los bloques con `::`.
