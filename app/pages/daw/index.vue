<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const { data: items } = await useAsyncData('daw-items', () => {
  return queryCollection('daw').all()
})
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">DAW</h1>
    <div class="grid gap-4">
      <NuxtLink
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="block p-4 rounded-lg border hover:bg-accent transition-colors"
      >
        <h2 class="text-xl font-semibold">{{ item.title }}</h2>
        <p v-if="item.description" class="text-muted-foreground mt-2">
          {{ item.description }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
