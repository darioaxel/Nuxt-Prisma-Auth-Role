<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import ListKeymap from '@tiptap/extension-list-keymap'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import History from '@tiptap/extension-history'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
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
  content: '<p></p>',
  editable: true,
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Strike,
    Heading.configure({ levels: [1, 2, 3] }),
    BulletList,
    OrderedList,
    ListItem,
    ListKeymap,
    Blockquote,
    CodeBlock,
    History,
    Dropcursor,
    Gapcursor,
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor-content max-w-none min-h-[300px] p-4 focus:outline-none',
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
/* Estilos del editor Tiptap - equivalente a prose pero sin depender de @tailwindcss/typography */
.tiptap-editor-content {
  color: var(--foreground);
  line-height: 1.75;
}

.tiptap-editor-content :first-child {
  margin-top: 0;
}

.tiptap-editor-content :last-child {
  margin-bottom: 0;
}

/* Headings */
.tiptap-editor-content h1 {
  font-size: 2.25em;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
  color: var(--foreground);
}

.tiptap-editor-content h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
  color: var(--foreground);
}

.tiptap-editor-content h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
  color: var(--foreground);
}

/* Párrafos */
.tiptap-editor-content p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

/* Listas */
.tiptap-editor-content ul {
  list-style-type: disc;
  padding-left: 1.625em;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.tiptap-editor-content ol {
  list-style-type: decimal;
  padding-left: 1.625em;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.tiptap-editor-content li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.tiptap-editor-content ul > li::marker,
.tiptap-editor-content ol > li::marker {
  color: var(--muted-foreground);
}

/* Listas anidadas */
.tiptap-editor-content ul ul,
.tiptap-editor-content ul ol,
.tiptap-editor-content ol ul,
.tiptap-editor-content ol ol {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}

/* Blockquote */
.tiptap-editor-content blockquote {
  font-weight: 500;
  font-style: italic;
  color: var(--foreground);
  border-left-width: 0.25rem;
  border-left-color: var(--border);
  padding-left: 1em;
  margin-top: 1.6em;
  margin-bottom: 1.6em;
}

.tiptap-editor-content blockquote p:first-of-type::before {
  content: open-quote;
}

.tiptap-editor-content blockquote p:last-of-type::after {
  content: close-quote;
}

/* Code inline */
.tiptap-editor-content code {
  color: var(--foreground);
  background-color: var(--muted);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Code block */
.tiptap-editor-content pre {
  color: var(--foreground);
  background-color: var(--muted);
  overflow-x: auto;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding: 0.8571429em 1.1428571em;
}

.tiptap-editor-content pre code {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  font-weight: 400;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}

/* Negrita y cursiva */
.tiptap-editor-content strong {
  font-weight: 700;
  color: var(--foreground);
}

.tiptap-editor-content em {
  font-style: italic;
}

.tiptap-editor-content s {
  text-decoration: line-through;
}

/* Enlaces (si se añaden en el futuro) */
.tiptap-editor-content a {
  color: var(--primary);
  text-decoration: underline;
  font-weight: 500;
}

/* Focus */
.tiptap-editor-content:focus {
  outline: none;
}

/* Placeholder para contenido vacío */
.tiptap-editor-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
