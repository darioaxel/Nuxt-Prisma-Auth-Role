<script setup lang="ts">
const route = useRoute()
const { data: item } = await useAsyncData(`daw-${route.params.id}`, () => {
  return queryCollection('daw').path(`/daw/${route.params.id}`).first()
})

if (!item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}
</script>

<template>
  <div class="container mx-auto py-8">
    <NuxtLink to="/daw" class="text-sm text-muted-foreground hover:underline mb-4 block">
      ← Volver a DAW
    </NuxtLink>
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-3xl font-bold mb-4">{{ item?.title }}</h1>
      <ContentRenderer v-if="item" :value="item" />
    </article>
  </div>
</template>
