<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('w-full overflow-auto', props.class)">
    <table class="w-full caption-bottom text-sm">
      <slot />
    </table>
  </div>
</template>

<script lang="ts">
export const TableHeader = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('thead', { class: cn('[&_tr]:border-b', props.class) }, slots.default?.())
  }
})

export const TableBody = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('tbody', { class: cn('[&_tr:last-child]:border-0', props.class) }, slots.default?.())
  }
})

export const TableRow = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('tr', { class: cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.class) }, slots.default?.())
  }
})

export const TableHead = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('th', { class: cn('h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', props.class) }, slots.default?.())
  }
})

export const TableCell = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('td', { class: cn('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', props.class) }, slots.default?.())
  }
})
</script>
