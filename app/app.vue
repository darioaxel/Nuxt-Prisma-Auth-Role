<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

useHead({
  titleTemplate: title => title ? `${title} | Editor de Contenidos` : 'Editor de Contenidos',
  htmlAttrs: {
    lang: 'es',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
  <Toaster />
</template>
