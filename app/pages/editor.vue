<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const { data: enlacesItems } = await useAsyncData('enlaces-list', () =>
  queryCollection('cpifp_enlaces').all(),
)
const { data: campusItems } = await useAsyncData('campus-list', () =>
  queryCollection('campus_virtual').all(),
)
const { data: blogItems } = await useAsyncData('blog-list', () =>
  queryCollection('blog').all(),
)

const allItems = computed(() => [
  ...(enlacesItems.value || []),
  ...(campusItems.value || []),
  ...(blogItems.value || []),
])

const selectedPath = ref('')
const message = ref('')

function loadFile(path: string) {
  selectedPath.value = path
  message.value = ''
}

function onSaved() {
  message.value = '✅ Guardado correctamente'
}

function onCancelled() {
  selectedPath.value = ''
  message.value = ''
}
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">
      Editor de contenido
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Lista de archivos -->
      <div class="border rounded-md p-4 h-[calc(100vh-200px)] overflow-auto">
        <h2 class="font-semibold mb-3">
          Archivos
        </h2>
        <div class="space-y-1">
          <button
            v-for="item in allItems"
            :key="item.path"
            :class="{ 'bg-accent': selectedPath === item.path }"
            class="w-full text-left px-3 py-2 rounded hover:bg-accent/50 transition-colors text-sm"
            @click="loadFile(item.path)"
          >
            <div class="font-medium truncate">
              {{ item.title }}
            </div>
            <div class="text-xs text-muted-foreground truncate">
              {{ item.path }}
            </div>
          </button>
        </div>
      </div>

      <!-- Editor -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-if="selectedPath"
          class="flex items-center justify-between"
        >
          <div class="text-sm text-muted-foreground truncate">
            {{ selectedPath }}
          </div>
          <span
            v-if="message"
            class="text-sm"
          >{{ message }}</span>
        </div>

        <div v-if="selectedPath">
          <TiptapEditor
            :path="selectedPath.slice(1)"
            @saved="onSaved"
            @cancelled="onCancelled"
          />
        </div>

        <div
          v-else
          class="text-muted-foreground text-center py-20"
        >
          Selecciona un archivo de la lista para editarlo
        </div>
      </div>
    </div>
  </div>
</template>
