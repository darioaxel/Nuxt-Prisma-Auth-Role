<script setup lang="ts">
import { marked } from 'marked'

interface Tab {
  label: string
  content: string
}

const props = defineProps<{
  tabs: Tab[]
}>()

const activeIndex = ref(0)

const activeContent = computed(() => {
  const content = props.tabs[activeIndex.value]?.content || ''
  return marked.parse(content)
})
</script>

<template>
  <div class="mdc-tabs my-6 w-full">
    <div class="flex w-full border-b border-border">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.label"
        type="button"
        class="relative px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        :class="activeIndex === index
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'"
        @click="activeIndex = index"
      >
        {{ tab.label }}
        <span
          v-if="activeIndex === index"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />
      </button>
    </div>
    <div class="content-prose mt-4">
      <div v-html="activeContent" />
    </div>
  </div>
</template>
