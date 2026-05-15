<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  as?: string
  isActive?: boolean
  class?: HTMLAttributes["class"]
  size?: "default" | "sm" | "md"
}

const props = withDefaults(defineProps<Props>(), {
  as: "a",
  size: "md",
})
</script>

<template>
  <component
    :is="props.as"
    data-sidebar="menu-sub-button"
    :data-active="props.isActive"
    :class="cn(
      'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
      props.size === 'sm' && 'text-xs',
      props.size === 'md' && 'text-sm',
      props.isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
      props.class,
    )"
  >
    <slot />
  </component>
</template>
