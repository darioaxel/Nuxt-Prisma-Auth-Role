<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['BLOG', 'ADMIN', 'ROOT'],
})

const route = useRoute()
const { data: post } = await useAsyncData(`blog-${route.params.slug}`, () => {
  return queryCollection('blog').path(`/blog/${route.params.slug}`).first()
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const tocLinks = computed(() => post.value?.body?.toc?.links ?? [])
</script>

<template>
  <div class="container mx-auto py-8">
    <NuxtLink to="/blog" class="text-sm text-muted-foreground hover:underline mb-4 block">
      ← Volver al blog
    </NuxtLink>
    <div class="flex gap-8">
      <article class="content-prose max-w-none flex-1 min-w-0">
        <h1 class="text-3xl font-bold mb-4">{{ post?.title }}</h1>
        <ContentRenderer v-if="post" :value="post" />
      </article>

      <aside
        v-if="tocLinks.length"
        class="w-56 shrink-0 hidden lg:block"
      >
        <ContentToc :links="tocLinks" />
      </aside>
    </div>
  </div>
</template>
