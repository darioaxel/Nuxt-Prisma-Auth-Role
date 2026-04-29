<script setup lang="ts">
import { Toaster } from 'vue-sonner'

// Configuración global de la aplicación
useHead({
  titleTemplate: (title) => title ? `${title} | Mi App` : 'Mi App',
  htmlAttrs: {
    lang: 'es',
  },
})
</script>

<template>
  <div>
    <NuxtPage />
    <Toaster position="top-center" />
  </div>
</template>
