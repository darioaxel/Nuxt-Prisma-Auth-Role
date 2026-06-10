<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { marked } from 'marked'
import TurndownService from 'turndown'

const props = defineProps<{
  path: string
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancelled'): void
}>()

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const frontmatter = ref('')

// Configurar Turndown para output limpio
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

const editor = useEditor({
  content: '',
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: 'prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
    },
  },
})

/**
 * Extrae el frontmatter YAML (--- ... ---) del contenido raw.
 * Devuelve { frontmatter: string, body: string }
 */
function extractFrontmatter(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (match) {
    return {
      frontmatter: `---\n${match[1]}\n---\n`,
      body: raw.slice(match[0].length),
    }
  }
  return { frontmatter: '', body: raw }
}

// Cargar contenido markdown raw al montar
async function loadContent() {
  isLoading.value = true
  error.value = ''
  try {
    const result = await $fetch<{ content: string; path: string }>('/api/content/file', {
      query: { path: props.path },
    })
    const extracted = extractFrontmatter(result.content)
    frontmatter.value = extracted.frontmatter
    // Convertir markdown body a HTML para Tiptap
    const html = await marked.parse(extracted.body)
    editor.value?.commands.setContent(html, false)
  } catch (err: any) {
    error.value = err?.statusMessage || err?.message || 'Error cargando contenido'
  } finally {
    isLoading.value = false
  }
}

// Guardar cambios
async function saveContent() {
  if (!editor.value) return
  isSaving.value = true
  error.value = ''
  try {
    // Obtener HTML del editor y convertir a markdown
    const html = editor.value.getHTML()
    const markdownBody = turndownService.turndown(html)
    const fullContent = frontmatter.value + markdownBody
    await $fetch('/api/content/file', {
      method: 'PUT',
      body: { path: props.path, content: fullContent },
    })
    emit('saved')
  } catch (err: any) {
    error.value = err?.statusMessage || err?.message || 'Error guardando contenido'
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  emit('cancelled')
}

onMounted(() => {
  loadContent()
})
</script>

<template>
  <div class="border rounded-md overflow-hidden bg-background">
    <!-- Barra de herramientas -->
    <div class="flex flex-wrap gap-1 p-2 border-b bg-muted/50 items-center">
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-accent': editor?.isActive('bold') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-accent': editor?.isActive('italic') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleStrike().run()"
        :class="{ 'bg-accent': editor?.isActive('strike') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        <s>S</s>
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-accent': editor?.isActive('heading', { level: 1 }) }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        H1
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-accent': editor?.isActive('heading', { level: 2 }) }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        H2
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-accent': editor?.isActive('heading', { level: 3 }) }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        H3
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-accent': editor?.isActive('bulletList') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        • List
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-accent': editor?.isActive('orderedList') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        1. List
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        type="button"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="{ 'bg-accent': editor?.isActive('blockquote') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
      >
        " Quote
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
        :class="{ 'bg-accent': editor?.isActive('codeBlock') }"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors font-mono"
      >
        &lt;/&gt;
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        type="button"
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().chain().focus().undo().run()"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
      >
        ↩ Undo
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().chain().focus().redo().run()"
        class="px-2 py-1 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
      >
        ↪ Redo
      </button>
      <div class="flex-1" />
      <button
        type="button"
        @click="cancelEdit"
        class="px-3 py-1 text-sm rounded border hover:bg-accent transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="saveContent"
        :disabled="isSaving"
        class="px-3 py-1 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {{ isSaving ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>

    <!-- Estado de carga / error -->
    <div v-if="isLoading" class="p-8 text-center text-muted-foreground">
      Cargando editor...
    </div>
    <div v-else-if="error" class="p-4 text-destructive bg-destructive/10 border-b">
      {{ error }}
    </div>

    <!-- Área de edición -->
    <EditorContent
      v-show="!isLoading"
      :editor="editor"
      class="min-h-[300px]"
    />
  </div>
</template>

<style>
.tiptap:focus {
  outline: none;
}
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
