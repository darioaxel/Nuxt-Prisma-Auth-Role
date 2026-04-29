<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('relative', props.class)">
    <slot />
  </div>
</template>

<script lang="ts">
export const DropdownMenuTrigger = defineComponent({
  props: { asChild: Boolean },
  setup(props, { slots }) {
    return () => h('div', { class: 'cursor-pointer' }, slots.default?.())
  }
})

export const DropdownMenuContent = defineComponent({
  props: { align: String, class: String },
  setup(props, { slots }) {
    return () => h('div', { 
      class: cn('absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', 
        props.align === 'end' ? 'right-0' : 'left-0',
        'top-full mt-1',
        props.class)
    }, slots.default?.())
  }
})

export const DropdownMenuLabel = defineComponent({
  props: { class: String },
  setup(props, { slots }) {
    return () => h('div', { class: cn('px-2 py-1.5 text-sm font-semibold', props.class) }, slots.default?.())
  }
})

export const DropdownMenuSeparator = defineComponent({
  setup() {
    return () => h('div', { class: '-mx-1 my-1 h-px bg-muted' })
  }
})

export const DropdownMenuGroup = defineComponent({
  props: { class: String },
  setup(props, { slots }) {
    return () => h('div', { class: cn('p-1', props.class) }, slots.default?.())
  }
})

export const DropdownMenuItem = defineComponent({
  props: { class: String, disabled: Boolean },
  setup(props, { slots, emit }) {
    return () => h('div', { 
      class: cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent', props.class),
      onClick: () => !props.disabled && emit('click')
    }, slots.default?.())
  }
})
</script>
