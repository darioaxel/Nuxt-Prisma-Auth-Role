<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <li
    data-sidebar="menu-sub-item"
    :class="cn('relative', props.class)"
  >
    <slot />
  </li>
</template>
