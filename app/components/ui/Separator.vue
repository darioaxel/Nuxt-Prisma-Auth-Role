<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <div
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      props.class
    )"
    :data-orientation="orientation"
    role="separator"
  />
</template>
