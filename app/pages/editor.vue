<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role'],
  allowedRoles: ['DAW', 'ADMIN', 'ROOT'],
})

const content = ref('<p>Escribe aquí tu contenido con <strong>Tiptap</strong>...</p>')
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Editor Tiptap</h1>
    <TiptapEditor v-model="content" />
    <div class="mt-6">
      <h2 class="text-lg font-semibold mb-2">HTML generado</h2>
      <pre class="bg-muted p-4 rounded-md text-sm overflow-auto">{{ content }}</pre>
    </div>
  </div>
</template>
