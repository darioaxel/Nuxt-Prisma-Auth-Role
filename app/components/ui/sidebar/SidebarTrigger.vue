<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <button
    data-sidebar="trigger"
    :class="cn('inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground', props.class)"
    @click="toggleSidebar"
  >
    <slot>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <line x1="9" x2="9" y1="3" y2="21"/>
      </svg>
    </slot>
  </button>
</template>
