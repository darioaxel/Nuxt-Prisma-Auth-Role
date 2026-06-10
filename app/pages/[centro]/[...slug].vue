<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const route = useRoute()
const centro = route.params.centro as string
const slug = (route.params.slug as string[]) || []

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
const isEditing = ref(false)

// Buscar contenido exacto
const { data: item, refresh: refreshItem } = await useAsyncData(`content-${fullPath}`, () => {
  return queryCollection(collection).path(fullPath).first()
})

// Si no hay item, buscar hijos para listar
const { data: children } = await useAsyncData(`children-${fullPath}`, async () => {
  if (item.value) return []
  return queryCollection(collection)
    .where('path', 'LIKE', fullPath + '/%')
    .all()
})

// Si ni item ni hijos, 404
if (!item.value && (!children.value || children.value.length === 0)) {
  throw createError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}

// Calcular breadcrumb
const segments = fullPath.split('/').filter(Boolean)
const breadcrumbs = segments.map((segment, index) => {
  const path = '/' + segments.slice(0, index + 1).join('/')
  return { label: segment, path }
})

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function onSaved() {
  isEditing.value = false
  // Refrescar el contenido para mostrar los cambios
  refreshItem()
}

function onCancelled() {
  isEditing.value = false
}

// Ruta relativa para el editor (sin barra inicial)
const editorPath = computed(() => {
  return item.value?.path ? item.value.path.slice(1) : ''
})
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- Breadcrumb -->
    <nav class="text-sm text-muted-foreground mb-4">
      <NuxtLink to="/daw" class="hover:underline">DAW</NuxtLink>
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
        <span class="mx-2">/</span>
        <NuxtLink
          v-if="i < breadcrumbs.length - 1"
          :to="crumb.path"
          class="hover:underline"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span v-else>{{ crumb.label }}</span>
      </template>
    </nav>

    <!-- Contenido con botón de edición -->
    <div v-if="item" class="relative">
      <!-- Botón Editar flotante (esquina superior derecha) -->
      <button
        v-if="!isEditing"
        type="button"
        @click="toggleEdit"
        class="absolute top-0 right-0 p-2 rounded-md border bg-background hover:bg-accent transition-colors shadow-sm"
        title="Editar contenido"
      >
        ✏️ Editar
      </button>

      <!-- Modo Vista -->
      <article v-if="!isEditing" class="prose dark:prose-invert max-w-none">
        <h1 class="text-3xl font-bold mb-4">{{ item.title }}</h1>
        <ContentRenderer v-if="item" :value="item" />
      </article>

      <!-- Modo Edición -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-semibold text-muted-foreground">
            ✏️ Modo edición: {{ item.title }}
          </h1>
          <button
            type="button"
            @click="onCancelled"
            class="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Salir sin guardar
          </button>
        </div>
        <TiptapEditor
          v-if="editorPath"
          :path="editorPath"
          @saved="onSaved"
          @cancelled="onCancelled"
        />
      </div>
    </div>

    <!-- Listado de hijos -->
    <div v-else>
      <h1 class="text-3xl font-bold mb-6 capitalize">{{ segments[segments.length - 1] }}</h1>
      <div class="grid gap-4">
        <NuxtLink
          v-for="child in children"
          :key="child.path"
          :to="child.path"
          class="block p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <h2 class="text-xl font-semibold">{{ child.title }}</h2>
          <p v-if="child.description" class="text-muted-foreground mt-2">
            {{ child.description }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
