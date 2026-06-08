<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value
    if (!isSame && value !== undefined) {
      editor.value?.commands.setContent(value, false)
    }
  }
)
</script>

<template>
  <div class="border rounded-md overflow-hidden">
    <div class="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
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
    </div>
    <EditorContent :editor="editor" class="p-4 min-h-[200px] prose dark:prose-invert max-w-none" />
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
