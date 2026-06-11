<script setup lang="ts">
interface Props {
  label: string
}
defineProps<Props>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>
