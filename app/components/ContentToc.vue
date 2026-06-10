<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

interface Props {
  links: TocLink[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Contenido',
})
</script>

<template>
  <nav class="sticky top-24 border-l pl-4">
    <h4 class="font-semibold mb-3 text-sm">{{ title }}</h4>
    <ul class="space-y-1 text-sm">
      <li v-for="link in links" :key="link.id">
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
</template>
