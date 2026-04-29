<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useSidebar } from '@/composables/useSidebar'

interface Props {
  class?: string
  variant?: 'sidebar' | 'floating' | 'inset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'sidebar',
})

const { isOpen } = useSidebar()
</script>

<template>
  <aside
    :class="cn(
      'fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-all duration-300 ease-in-out lg:translate-x-0',
      !isOpen && '-translate-x-full lg:w-[60px] lg:overflow-hidden',
      isOpen && 'translate-x-0',
      props.class
    )"
  >
    <slot />
  </aside>
</template>

<script lang="ts">
export const SidebarProvider = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: cn('flex min-h-screen', props.class) }, slots.default?.())
  }
})

export const SidebarInset = defineComponent({
  setup(props: { class?: string }, { slots }) {
    const { isOpen } = useSidebar()
    return () => h('main', { 
      class: cn('flex-1 transition-all duration-300 ease-in-out', 
        isOpen.value ? 'lg:ml-64' : 'lg:ml-[60px]',
        props.class) 
    }, slots.default?.())
  }
})

export const SidebarTrigger = defineComponent({
  setup() {
    const { toggle } = useSidebar()
    return () => h('button', { 
      class: 'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
      onClick: toggle,
      type: 'button',
      ariaLabel: 'Toggle sidebar'
    }, h('span', { class: 'text-lg' }, '☰'))
  }
})

export const SidebarContent = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: cn('flex-1 overflow-auto py-2', props.class) }, slots.default?.())
  }
})

export const SidebarHeader = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: cn('px-4 py-4', props.class) }, slots.default?.())
  }
})

export const SidebarFooter = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: cn('mt-auto border-t px-4 py-4', props.class) }, slots.default?.())
  }
})

export const SidebarGroup = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: cn('px-3 py-2', props.class) }, slots.default?.())
  }
})

export const SidebarGroupLabel = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('h3', { class: cn('mb-2 px-2 text-xs font-semibold text-muted-foreground', props.class) }, slots.default?.())
  }
})

export const SidebarGroupContent = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: props.class }, slots.default?.())
  }
})

export const SidebarMenu = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('ul', { class: cn('space-y-1', props.class) }, slots.default?.())
  }
})

export const SidebarMenuItem = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('li', { class: props.class }, slots.default?.())
  }
})

export const SidebarMenuButton = defineComponent({
  props: { size: String, tooltip: String, asChild: Boolean, class: String },
  setup(props, { slots }) {
    const sizeClasses = {
      sm: 'h-8 text-xs',
      default: 'h-9',
      lg: 'h-12 text-sm',
    }
    return () => h('button', { 
      class: cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground', 
        sizeClasses[props.size as keyof typeof sizeClasses] || sizeClasses.default,
        props.class)
    }, slots.default?.())
  }
})

export const SidebarMenuSub = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('ul', { class: cn('ml-4 mt-1 space-y-1', props.class) }, slots.default?.())
  }
})

export const SidebarMenuSubItem = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('li', { class: props.class }, slots.default?.())
  }
})

export const SidebarMenuSubButton = defineComponent({
  props: { asChild: Boolean, class: String },
  setup(props, { slots }) {
    return () => h('button', { 
      class: cn('flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground', props.class)
    }, slots.default?.())
  }
})
</script>
