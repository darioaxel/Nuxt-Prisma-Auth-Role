<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)">
    <slot />
  </div>
</template>

<script lang="ts">
export const AvatarImage = defineComponent({
  props: { src: String, alt: String, class: String },
  setup(props) {
    return () => h('img', { 
      src: props.src, 
      alt: props.alt,
      class: cn('aspect-square h-full w-full', props.class)
    })
  }
})

export const AvatarFallback = defineComponent({
  props: { class: String },
  setup(props, { slots }) {
    return () => h('div', { 
      class: cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.class)
    }, slots.default?.())
  }
})
</script>
