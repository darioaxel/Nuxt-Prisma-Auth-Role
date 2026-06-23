<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const route = useRoute()
const fullPath = route.path.toLowerCase()
const isEditing = ref(false)

// Buscar contenido exacto
const { data: item } = await useAsyncData(`content-${fullPath}`, () => {
  return queryCollection('ayuda').path(fullPath).first()
})

// Si no hay item, buscar hijos para listar
const { data: children } = await useAsyncData(`children-${fullPath}`, async () => {
  if (item.value) return []
  return queryCollection('ayuda')
    .where('path', 'LIKE', fullPath + '/%')
    .all()
})

// Si ni item ni hijos, 404
if (!item.value && (!children.value || children.value.length === 0)) {
  throw createError({ statusCode: 404, statusMessage: 'Página de ayuda no encontrada' })
}

const segments = fullPath.split('/').filter(Boolean)
const tocLinks = computed(() => item.value?.body?.toc?.links ?? [])

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function onSaved() {
  isEditing.value = false
  reloadNuxtApp()
}

function onCancelled() {
  isEditing.value = false
}

const editorPath = computed(() => {
  return item.value?.path ? item.value.path.slice(1) : ''
})
</script>

<template>
  <div class="container mx-auto py-8">
    <div
      v-if="item"
      class="flex gap-8"
    >
      <div class="flex-1 min-w-0 relative">
        <button
          v-if="!isEditing"
          type="button"
          class="absolute top-0 right-0 p-2 rounded-md border bg-background hover:bg-accent transition-colors shadow-sm z-10"
          title="Editar contenido"
          @click="toggleEdit"
        >
          ✏️ Editar
        </button>

        <article
          v-if="!isEditing"
          class="content-prose max-w-none"
        >
          <h1 class="text-3xl font-bold mb-4">
            {{ item.title }}
          </h1>
          <ContentRenderer
            v-if="item"
            :value="item"
          />
        </article>

        <div v-else>
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-semibold text-muted-foreground">
              ✏️ Modo edición: {{ item.title }}
            </h1>
            <button
              type="button"
              class="text-sm text-muted-foreground hover:text-foreground underline"
              @click="onCancelled"
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

      <aside
        v-if="!isEditing && tocLinks.length"
        class="w-56 shrink-0 hidden lg:block"
      >
        <ContentToc
          :links="tocLinks"
          title="En esta página"
        />
      </aside>
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold mb-6 capitalize">
        {{ segments[segments.length - 1] }}
      </h1>
      <div class="grid gap-4">
        <NuxtLink
          v-for="child in children"
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
