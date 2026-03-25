<script setup lang="ts">
// Página de inicio - redirige según autenticación
const { loggedIn } = useUserSession()

onMounted(() => {
  if (loggedIn.value) {
    navigateTo('/usuario/perfil')
  } else {
    navigateTo('/login')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse text-muted-foreground">
      Cargando...
    </div>
  </div>
</template>
