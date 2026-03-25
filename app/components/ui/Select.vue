<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  modelValue?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <select
    :class="cn('flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    :value="modelValue"
    @change="onChange"
  >
    <slot />
  </select>
</template>

<script lang="ts">
export const SelectTrigger = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('div', { class: cn('flex items-center justify-between', props.class) }, slots.default?.())
  }
})

export const SelectValue = defineComponent({
  props: { placeholder: String },
  setup(props, { slots }) {
    return () => h('span', { class: 'text-muted-foreground' }, slots.default?.() || props.placeholder)
  }
})

export const SelectContent = defineComponent({
  setup(props: { class?: string }, { slots }) {
    return () => h('Fragment', null, slots.default?.())
  }
})

export const SelectItem = defineComponent({
  props: { value: String, class: String },
  setup(props, { slots }) {
    return () => h('option', { 
      value: props.value,
      class: cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground', props.class)
    }, slots.default?.())
  }
})
</script>
