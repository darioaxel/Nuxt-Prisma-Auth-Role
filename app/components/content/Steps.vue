<script setup lang="ts">
interface Props {
  level?: number
}

withDefaults(defineProps<Props>(), {
  level: 2,
})
</script>

<template>
  <div class="ms-4 border-l border-border ps-8 my-5 [counter-reset:step]">
    <div class="[&>h2]:[counter-increment:step] [&>h3]:[counter-increment:step] [&>h4]:[counter-increment:step]">
      <slot />
    </div>
  </div>
</template>
