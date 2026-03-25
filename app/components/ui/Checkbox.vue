<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  checked?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

const toggle = () => {
  emit('update:checked', !props.checked)
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    :class="cn('peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground flex items-center justify-center', props.class)"
    @click="toggle"
  >
    <Icon v-if="checked" name="lucide:check" class="h-3 w-3 text-primary-foreground" />
  </button>
</template>
