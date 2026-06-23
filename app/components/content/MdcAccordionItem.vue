<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Props {
  label: string
  icon?: string
}

defineProps<Props>()
const isOpen = ref(false)
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    class="group"
  >
    <CollapsibleTrigger class="flex w-full items-center gap-2 p-4 text-sm font-medium hover:bg-accent transition-colors text-left [&[data-state=open]>svg]:rotate-180">
      <Icon
        v-if="icon"
        :name="icon"
        class="size-4 shrink-0 text-muted-foreground"
      />
      <span class="flex-1">{{ label }}</span>
      <Icon
        name="lucide:chevron-down"
        class="size-4 shrink-0 transition-transform duration-200"
      />
    </CollapsibleTrigger>
    <CollapsibleContent class="px-4 pb-4 text-sm text-muted-foreground">
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
