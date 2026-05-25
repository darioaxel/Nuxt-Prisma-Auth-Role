<script setup lang="ts">
const { data: posts } = await useAsyncData('blog-posts', () => {
  return queryCollection('content').all()
})
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Blog</h1>
    <div class="grid gap-4">
      <NuxtLink
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        class="block p-4 rounded-lg border hover:bg-accent transition-colors"
      >
        <h2 class="text-xl font-semibold">{{ post.title }}</h2>
        <p v-if="post.description" class="text-muted-foreground mt-2">
          {{ post.description }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
