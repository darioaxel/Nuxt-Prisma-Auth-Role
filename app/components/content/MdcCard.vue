<script setup lang="ts">
interface Props {
  title?: string
  to?: string
  icon?: string
  color?: string
}

const props = defineProps<Props>()

const isExternal = computed(() => props.to?.startsWith('http'))
</script>

<template>
  <component
    :is="to ? 'a' : 'div'"
    :href="to"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    class="group relative block p-4 sm:p-6 border border-border rounded-md bg-card text-card-foreground transition-colors hover:bg-accent hover:border-primary/50"
  >
    <span
      v-if="to"
      class="absolute inset-0"
      aria-hidden="true"
    />
    <div class="flex items-start gap-3">
      <Icon
        v-if="icon"
        :name="icon"
        class="size-6 shrink-0 text-primary"
      />
      <div>
        <h3
          v-if="title"
          class="font-semibold group-hover:text-primary transition-colors"
        >
          {{ title }}
        </h3>
        <div class="text-sm text-muted-foreground mt-1">
          <slot />
        </div>
      </div>
    </div>
  </component>
</template>
