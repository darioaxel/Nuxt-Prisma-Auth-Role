<script setup lang="ts">
import { toast } from 'vue-sonner'

const isLoading = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const showPassword = ref(false)

const handleRegister = async () => {
  if (!form.email || !form.password) {
    toast.error('Por favor completa todos los campos obligatorios')
    return
  }

  if (form.password.length < 8) {
    toast.error('La contraseña debe tener al menos 8 caracteres')
    return
  }

  if (form.password !== form.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }

  isLoading.value = true

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      }
    })

    if (response.success) {
      toast.success('Cuenta creada', {
        description: 'Tu cuenta ha sido creada exitosamente'
      })
      await navigateTo('/usuario/perfil')
    }
  } catch (error: any) {
    toast.error('Error al registrarse', {
      description: error.data?.statusMessage || 'Inténtalo de nuevo más tarde'
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
          <Icon name="lucide:user-plus" class="h-8 w-8 text-primary" />
        </div>
      </div>
      <CardTitle class="text-2xl text-center">Crear cuenta</CardTitle>
      <CardDescription class="text-center">
        Completa el formulario para registrarte
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="firstName">Nombre</Label>
            <Input
              id="firstName"
              v-model="form.firstName"
              placeholder="Juan"
              :disabled="isLoading"
            />
          </div>
          <div class="space-y-2">
            <Label for="lastName">Apellidos</Label>
            <Input
              id="lastName"
              v-model="form.lastName"
              placeholder="García"
              :disabled="isLoading"
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
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
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
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
        <div class="space-y-2">
          <Label for="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            required
            :disabled="isLoading"
          />
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading">
          <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter>
      <div class="text-sm text-center text-muted-foreground w-full">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="text-primary hover:underline">
          Inicia sesión
        </NuxtLink>
      </div>
    </CardFooter>
  </Card>
</template>
