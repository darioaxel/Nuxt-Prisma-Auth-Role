<script setup lang="ts">
interface Props {
  level?: 2 | 3 | 4
}

withDefaults(defineProps<Props>(), {
  level: 3,
})
</script>

<template>
  <div class="mdc-steps" :class="`level-${level}`">
    <slot />
  </div>
</template>

<style scoped>
.mdc-steps {
  margin-left: 1rem;
  border-left: 1px solid var(--border);
  padding-left: 2rem;
  counter-reset: step;
}

.mdc-steps :deep(h2),
.mdc-steps :deep(h3),
.mdc-steps :deep(h4) {
  position: relative;
}

.mdc-steps.level-2 :deep(h2),
.mdc-steps.level-3 :deep(h3),
.mdc-steps.level-4 :deep(h4) {
  counter-increment: step;
}

.mdc-steps.level-2 :deep(h2)::before,
.mdc-steps.level-3 :deep(h3)::before,
.mdc-steps.level-4 :deep(h4)::before {
  content: counter(step);
  position: absolute;
  left: -3rem;
  top: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--muted);
  color: var(--foreground);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 0 0 4px var(--background);
}
</style>
