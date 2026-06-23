<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const route = useRoute()
const centro = route.params.centro as string

const collectionMap: Record<string, string> = {
  '50010314-cpifp_los_enlaces': 'cpifp_enlaces',
  '50020125-campusvirtualfp': 'campus_virtual',
}

const normalizedCentro = centro.toLowerCase()
const collection = collectionMap[normalizedCentro]
if (!collection) {
  throw createError({ statusCode: 404, statusMessage: 'Centro no encontrado' })
}

const fullPath = route.path.toLowerCase()

// Buscar contenido exacto (por si hay un index.md en la raíz del centro)
const { data: item } = await useAsyncData(`content-${fullPath}`, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return queryCollection(collection as any).path(fullPath).first()
})

// Si no hay item, buscar hijos para listar
const { data: children } = await useAsyncData(`children-${fullPath}`, async () => {
  if (item.value) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return queryCollection(collection as any)
    .where('path', 'LIKE', fullPath + '/%')
    .all()
})

// Si ni item ni hijos, 404
if (!item.value && (!children.value || children.value.length === 0)) {
  throw createError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}

// Filtrar hijos directos (solo un nivel)
const directChildren = computed(() => {
  if (!children.value) return []
  const prefix = fullPath + '/'
  return children.value.filter((child) => {
    const relative = child.path.slice(prefix.length)
    return relative && !relative.includes('/')
  })
})

const tocLinks = computed(() => item.value?.body?.toc?.links ?? [])
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- Contenido -->
    <div
      v-if="item"
      class="flex gap-8"
    >
      <article class="content-prose max-w-none flex-1 min-w-0">
        <h1 class="text-3xl font-bold mb-4">
          {{ item.title }}
        </h1>
        <ContentRenderer
          v-if="item"
          :value="item"
        />
      </article>
      <aside
        v-if="tocLinks.length"
        class="w-56 shrink-0 hidden lg:block"
      >
        <ContentToc :links="tocLinks" />
      </aside>
    </div>

    <!-- Listado de hijos -->
    <div v-else>
      <h1 class="text-3xl font-bold mb-6 capitalize">
        {{ normalizedCentro.replace(/-/g, ' ') }}
      </h1>
      <div class="grid gap-4">
        <NuxtLink
          v-for="child in directChildren"
          :key="child.path"
          :to="child.path"
          class="block p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <h2 class="text-xl font-semibold">{{ child.title }}</h2>
          <p
            v-if="child.description"
            class="text-muted-foreground mt-2"
          >
            {{ child.description }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
