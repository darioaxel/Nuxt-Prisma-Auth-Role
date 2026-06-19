# Estado anterior de la configuración de `vue-sonner` y ubicación de `app.vue`

> Fecha: 2026-06-12  
> Motivo: los toasts no se muestran. Se prueba la estructura que funciona en `CampusDigitalFP_Intranet`.

## Configuración inicial (antes de cualquier cambio)

### `nuxt.config.ts`

El módulo `vue-sonner/nuxt` estaba registrado en `modules`:

```ts
modules: [
  '@pinia/nuxt',
  'nuxt-auth-utils',
  '@nuxt/icon',
  '@vee-validate/nuxt',
  '@nuxtjs/color-mode',
  'shadcn-nuxt',
  '@nuxt/content',
  'vue-sonner/nuxt', // <-- registrado
],
```

### `app.vue` (en la raíz del proyecto)

Importaba el CSS directamente y renderizaba `<Toaster>` sin importar el componente local:

```vue
<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

useHead({
  titleTemplate: (title) => title ? `${title} | Editor de Contenidos` : 'Editor de Contenidos',
  htmlAttrs: { lang: 'es' },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-center" />
</template>
```

> Nota: aunque importaba `@/components/ui/sonner`, Nuxt daba prioridad al componente `Toaster` registrado globalmente por el módulo `vue-sonner/nuxt`, generando el warning:
> `Duplicated imports "Toaster", the one from "app/components/ui/sonner/index.ts" has been ignored...`

### Componente local `app/components/ui/sonner/Sonner.vue` (antes)

Usaba `reactiveOmit` y `toast-options` con clases Tailwind:

```vue
<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-vue-next"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, "toastOptions")
</script>

<template>
  <Sonner
    class="toaster group"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
    }"
    v-bind="delegatedProps"
  >
    ...
  </Sonner>
</template>
```

## Diferencias clave con el proyecto funcional `CampusDigitalFP_Intranet`

| Aspecto | Proyecto funcional | Nuestro estado anterior |
|---------|--------------------|-------------------------|
| Módulo `vue-sonner/nuxt` | No registrado | Registrado |
| `Toaster` usado | Componente local `@/components/ui/sonner` | El global del módulo (warning de duplicado) |
| CSS de sonner | `import 'vue-sonner/style.css'` en `app.vue` | Igual |
| `Sonner.vue` | Usa `cn('toaster group', props.class)` y variables CSS | Usaba `reactiveOmit` y `toast-options` |
| Ubicación de `app.vue` | `app/app.vue` | Raíz del proyecto (`./app.vue`) |

## Cambios aplicados

1. **Eliminar `'vue-sonner/nuxt'`** de `modules` en `nuxt.config.ts`.
2. **En `app.vue`**, importar el componente local `Toaster` desde `@/components/ui/sonner`.
3. **Alinear `app/components/ui/sonner/Sonner.vue`** con el del proyecto funcional.
4. **Mover `app.vue` de la raíz a `app/app.vue`**, porque con `future.compatibilityVersion: 4` Nuxt 4 espera el componente raíz dentro de `app/`. Esto explicaba que `app.vue` no se cargara en absoluto (ni siquiera un `<div>` de prueba se renderizaba).
5. **Reiniciar el servidor** con `rm -rf .nuxt/dev && pnpm dev`.

## Cómo volver al estado anterior

Si fuera necesario revertir:

1. Restaurar `nuxt.config.ts` añadiendo `'vue-sonner/nuxt'` al array de `modules`.
2. Mover `app/app.vue` de vuelta a la raíz como `app.vue`.
3. Restaurar el contenido original de `app.vue`, `app/components/ui/sonner/Sonner.vue` y `nuxt.config.ts` desde este documento o desde git (`git checkout -- app.vue app/components/ui/sonner/Sonner.vue nuxt.config.ts`).

---

# Guardado diferido de usuarios — fix del binding del Switch

> Fecha: 2026-06-12

## Problema

En `app/pages/admin/usuarios/listado.vue`, el switch de estado no activaba el guardado diferido:

- Al cambiar el switch no se habilitaba el botón **Guardar cambios**.
- No aparecía el diálogo de cambios sin guardar al salir.

## Causa

El componente `Switch` de `reka-ui` (usado por shadcn-vue) no expone una prop `checked`. Su estado se controla mediante `modelValue`. Al usar `:checked`, el componente no recibía el valor y no emitía `update:modelValue` al interactuar.

## Código anterior (fallido)

```vue
<Switch 
  :checked="getDisplayedStatus(user.id)"
  @update:modelValue="updateUserStatus(user.id, $event)"
  :disabled="isSaving"
/>
```

## Código corregido

```vue
<Switch 
  :model-value="getDisplayedStatus(user.id)"
  @update:modelValue="updateUserStatus(user.id, $event as boolean)"
  :disabled="isSaving"
/>
```

## Resultado

- El switch refleja el estado pendiente o el original.
- Los cambios se acumulan en `pendingChanges`.
- El botón **Guardar cambios** se habilita y muestra el contador.
- El diálogo de confirmación al salir funciona correctamente.
- El endpoint `/api/users/bulk` ya soportaba ambos formatos (cambios individuales y en lote), por lo que no requirió modificación.
