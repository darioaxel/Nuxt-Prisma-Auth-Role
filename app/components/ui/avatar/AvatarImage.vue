<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  src?: string
  alt?: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <img :src="props.src" :alt="props.alt" :class="cn('aspect-square h-full w-full', props.class)" />
</template>
