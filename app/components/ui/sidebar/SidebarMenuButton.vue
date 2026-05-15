<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  as?: string
  isActive?: boolean
  tooltip?: string
  class?: HTMLAttributes["class"]
  size?: "default" | "sm" | "lg"
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  size: "default",
})
</script>

<template>
  <component
    :is="props.as"
    data-sidebar="menu-button"
    data-size="props.size"
    :data-active="props.isActive"
    :class="cn(
      'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-medium data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
      props.size === 'sm' && 'h-7 text-xs',
      props.size === 'default' && 'h-8 text-sm',
      props.size === 'lg' && 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      props.class,
    )"
  >
    <slot />
  </component>
</template>
