<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  type?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  minlength?: number | string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [event: Event]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}
</script>

<template>
  <input
    :type="type || 'text'"
    :class="cn('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :minlength="minlength"
    @input="onInput"
  />
</template>
