<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { loggedIn } = useUserSession()

// Redirigir si ya está logueado
if (loggedIn.value) {
  await navigateTo('/usuario/perfil')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <LoginForm />
  </div>
</template>
