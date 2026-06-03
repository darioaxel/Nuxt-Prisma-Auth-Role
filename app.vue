<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

// Configuración global de la aplicación
useHead({
  titleTemplate: (title) => title ? `${title} | Editor de Contenidos` : 'Editor de Contenidos',
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
