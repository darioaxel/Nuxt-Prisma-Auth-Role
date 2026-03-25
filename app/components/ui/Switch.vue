<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  checked?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

const toggle = () => {
  if (!props.disabled) {
    emit('update:checked', !props.checked)
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    :disabled="disabled"
    :class="cn('peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input', props.class)"
    @click="toggle"
  >
    <span
      :data-state="checked ? 'checked' : 'unchecked'"
      :class="cn('pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0')"
    />
  </button>
</template>
