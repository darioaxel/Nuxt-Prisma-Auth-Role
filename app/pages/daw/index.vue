<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const centros = [
  {
    id: '50010314-CPIFP_Los_Enlaces',
    nombre: 'CPIFP Los Enlaces',
    path: '/50010314-cpifp_los_enlaces',
  },
  {
    id: '50020125-CampusVirtualFP',
    nombre: 'Campus Virtual FP',
    path: '/50020125-campusvirtualfp',
  },
]
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">
      DAW - Centros
    </h1>
    <div class="grid gap-4">
      <NuxtLink
        v-for="centro in centros"
        :key="centro.id"
        :to="centro.path"
        class="block p-4 rounded-lg border hover:bg-accent transition-colors"
      >
        <h2 class="text-xl font-semibold">{{ centro.nombre }}</h2>
        <p class="text-muted-foreground mt-2">{{ centro.id }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
