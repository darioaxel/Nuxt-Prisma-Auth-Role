<script setup lang="ts">
const slots = useSlots()
const tabLabels = computed(() => {
  return Object.keys(slots).filter(name => name !== 'default')
})

const activeTab = ref(tabLabels.value[0] || '')
</script>

<template>
  <div class="my-5 w-full">
    <div class="flex w-full border-b border-border">
      <button
        v-for="label in tabLabels"
        :key="label"
        type="button"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === label ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'"
        @click="activeTab = label"
      >
        {{ label }}
      </button>
    </div>
    <div class="mt-4">
      <slot v-for="label in tabLabels" :key="label" :name="label" v-if="activeTab === label" />
    </div>
  </div>
</template>
