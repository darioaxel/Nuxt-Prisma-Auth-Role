<script setup lang="ts">
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    class="relative"
  >
    <Icon 
      name="lucide:sun" 
      class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Icon 
      name="lucide:moon" 
      class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Cambiar tema</span>
  </Button>
</template>
