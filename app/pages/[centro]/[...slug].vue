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

const segments = fullPath.split('/').filter(Boolean)

// Links del índice de contenidos (TOC)
const tocLinks = computed(() => item.value?.body?.toc?.links ?? [])

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
    <!-- Contenido con botón de edición -->
    <div v-if="item" class="flex gap-8">
      <!-- Contenido principal -->
      <div class="flex-1 min-w-0 relative">
        <!-- Botón Editar flotante (esquina superior derecha) -->
        <button
          v-if="!isEditing"
          type="button"
          @click="toggleEdit"
          class="absolute top-0 right-0 p-2 rounded-md border bg-background hover:bg-accent transition-colors shadow-sm z-10"
          title="Editar contenido"
        >
          ✏️ Editar
        </button>

        <!-- Modo Vista -->
        <article v-if="!isEditing" class="content-prose max-w-none">
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

      <!-- Índice de contenidos (TOC) -->
      <aside
        v-if="!isEditing && tocLinks.length"
        class="w-56 shrink-0 hidden lg:block"
      >
        <nav class="sticky top-24 border-l pl-4">
          <h4 class="font-semibold mb-3 text-sm">Contenido</h4>
          <ul class="space-y-1 text-sm">
            <li v-for="link in tocLinks" :key="link.id">
              <a
                :href="`#${link.id}`"
                class="block py-1 text-muted-foreground hover:text-foreground transition-colors"
                :class="{ 'font-medium': link.depth === 2 }"
              >
                {{ link.text }}
              </a>
              <ul v-if="link.children?.length" class="ml-3 mt-1 space-y-1">
                <li v-for="child in link.children" :key="child.id">
                  <a
                    :href="`#${child.id}`"
                    class="block py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {{ child.text }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
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


