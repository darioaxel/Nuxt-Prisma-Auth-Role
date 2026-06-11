<script setup lang="ts">
import { Collapsible as UiCollapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Props {
  title?: string
}

const props = defineProps<Props>()
const isOpen = ref(false)
</script>

<template>
  <UiCollapsible v-model:open="isOpen" class="my-5 border border-border rounded-md">
    <CollapsibleTrigger v-if="title" class="flex w-full items-center justify-between p-4 text-sm font-medium hover:bg-accent transition-colors [&[data-state=open]>svg]:rotate-180">
      {{ title }}
      <Icon name="lucide:chevron-down" class="size-4 shrink-0 transition-transform duration-200" />
    </CollapsibleTrigger>
    <CollapsibleContent class="p-4 pt-0 text-sm">
      <slot />
    </CollapsibleContent>
  </UiCollapsible>
</template>
