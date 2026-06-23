<script setup lang="ts">
interface Props {
  type?: 'info' | 'tip' | 'warning' | 'caution'
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
})

const config = computed(() => {
  switch (props.type) {
    case 'tip':
      return {
        icon: props.icon || 'lucide:lightbulb',
        class: 'border-success/50 bg-success/15 text-success-foreground [&_a]:text-success',
        iconClass: 'text-success',
      }
    case 'warning':
      return {
        icon: props.icon || 'lucide:alert-triangle',
        class: 'border-warning/60 bg-warning/20 text-warning-foreground [&_a]:text-warning',
        iconClass: 'text-warning',
      }
    case 'caution':
      return {
        icon: props.icon || 'lucide:octagon-x',
        class: 'border-destructive/50 bg-destructive/15 text-destructive-foreground [&_a]:text-destructive',
        iconClass: 'text-destructive',
      }
    default:
      return {
        icon: props.icon || 'lucide:info',
        class: 'border-info/50 bg-info/15 text-info-foreground [&_a]:text-info',
        iconClass: 'text-info',
      }
  }
})
</script>

<template>
  <div
    class="my-5 relative block px-4 py-3 rounded-md text-sm/6 last:mb-0 [&_code]:text-xs/5 [&_code]:bg-background [&_pre]:bg-background [&>div]:my-2.5 [&_ul]:my-2.5 [&_ol]:my-2.5 [&>*]:last:!mb-0 [&_ul]:ps-4.5 [&_ol]:ps-4.5 [&_li]:my-0 transition-colors border w-full"
    :class="config.class"
  >
    <Icon
      :name="config.icon"
      class="size-4 shrink-0 align-sub me-1.5 inline-block"
      :class="config.iconClass"
    />
    <slot />
  </div>
</template>
