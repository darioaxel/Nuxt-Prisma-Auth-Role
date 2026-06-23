<script setup lang="ts">
interface Props {
  name: string
}
defineProps<Props>()
</script>

<template>
  <Icon
    :name="name"
    class="inline-block size-4 shrink-0 align-text-bottom"
  />
</template>
