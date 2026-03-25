<script setup lang="ts">
import { toast } from 'vue-sonner'

const isLoading = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.error('Por favor completa todos los campos')
    return
  }

  isLoading.value = true

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (response.success) {
      toast.success('Bienvenido', {
        description: `Hola ${response.user.firstName || response.user.email}`
      })
      await navigateTo('/usuario/perfil')
    }
  } catch (error: any) {
    toast.error('Error de inicio de sesión', {
      description: error.data?.statusMessage || 'Credenciales inválidas'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader class="space-y-1">
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 bg-primary/10 rounded-full">
          <Icon name="lucide:user" class="h-8 w-8 text-primary" />
        </div>
      </div>
      <CardTitle class="text-2xl text-center">Iniciar sesión</CardTitle>
      <CardDescription class="text-center">
        Introduce tus credenciales para acceder
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="space-y-2">
          <Label for="password">Contraseña</Label>
          <div class="relative">
            <Input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              :disabled="isLoading"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="absolute right-0 top-0 h-full px-3"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading">
          <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="flex flex-col space-y-2">
      <div class="text-sm text-center text-muted-foreground">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="text-primary hover:underline">
          Regístrate
        </NuxtLink>
      </div>
    </CardFooter>
  </Card>
</template>
