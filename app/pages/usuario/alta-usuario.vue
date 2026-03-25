<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
  title: 'Alta de Usuario'
})

import { toast } from 'vue-sonner'
import { Loader2, UserPlus } from 'lucide-vue-next'

// Estado del formulario
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dni: '',
  birthDate: '',
  addressLine: '',
  floorDoor: '',
  postalCode: '',
  locality: '',
  province: '',
})

const isSubmitting = ref(false)

// Enviar formulario
const handleSubmit = async () => {
  if (!form.email || !form.firstName || !form.lastName) {
    toast.error('Por favor completa los campos obligatorios')
    return
  }

  isSubmitting.value = true
  
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: form
    })
    
    toast.success('Usuario creado correctamente', {
      description: 'Se ha enviado un email con las credenciales de acceso.'
    })
    
    // Limpiar formulario
    Object.keys(form).forEach(key => {
      (form as any)[key] = ''
    })
    
  } catch (error: any) {
    toast.error('Error al crear usuario', {
      description: error.data?.message || 'Inténtalo de nuevo más tarde'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <div class="p-3 bg-primary/10 rounded-lg">
        <UserPlus class="w-8 h-8 text-primary" />
      </div>
      <div>
        <h1 class="text-3xl font-bold">Alta de Usuario</h1>
        <p class="text-muted-foreground">
          Crea una nueva cuenta de usuario en el sistema
        </p>
      </div>
    </div>

    <!-- Formulario -->
    <Card>
      <CardHeader>
        <CardTitle>Datos del nuevo usuario</CardTitle>
        <CardDescription>
          Completa la información requerida. Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Datos personales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">
                Nombre <span class="text-destructive">*</span>
              </Label>
              <Input 
                id="firstName"
                v-model="form.firstName" 
                placeholder="Nombre del usuario"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="lastName">
                Apellidos <span class="text-destructive">*</span>
              </Label>
              <Input 
                id="lastName"
                v-model="form.lastName" 
                placeholder="Apellidos del usuario"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <Label for="email">
              Email <span class="text-destructive">*</span>
            </Label>
            <Input 
              id="email"
              v-model="form.email" 
              type="email"
              placeholder="usuario@ejemplo.com"
              required
            />
            <p class="text-sm text-muted-foreground">
              Se usará este email para el inicio de sesión
            </p>
          </div>

          <!-- Documentación -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="dni">DNI/NIE</Label>
              <Input 
                id="dni"
                v-model="form.dni" 
                placeholder="12345678A"
              />
            </div>

            <div class="space-y-2">
              <Label for="phone">Teléfono</Label>
              <Input 
                id="phone"
                v-model="form.phone" 
                type="tel"
                placeholder="612345678"
              />
            </div>

            <div class="space-y-2">
              <Label for="birthDate">Fecha de nacimiento</Label>
              <Input 
                id="birthDate"
                v-model="form.birthDate" 
                type="date"
              />
            </div>
          </div>

          <!-- Dirección -->
          <div class="border rounded-lg p-4">
            <h3 class="text-lg font-medium mb-4">Dirección</h3>
            
            <div class="space-y-2">
              <Label for="addressLine">Dirección</Label>
              <Input 
                id="addressLine"
                v-model="form.addressLine" 
                placeholder="Calle Mayor 123"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="space-y-2">
                <Label for="floorDoor">Piso/Puerta</Label>
                <Input 
                  id="floorDoor"
                  v-model="form.floorDoor" 
                  placeholder="2º B"
                />
              </div>

              <div class="space-y-2">
                <Label for="postalCode">Código postal</Label>
                <Input 
                  id="postalCode"
                  v-model="form.postalCode" 
                  placeholder="28001"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="space-y-2">
                <Label for="locality">Localidad</Label>
                <Input 
                  id="locality"
                  v-model="form.locality" 
                  placeholder="Madrid"
                />
              </div>

              <div class="space-y-2">
                <Label for="province">Provincia</Label>
                <Input 
                  id="province"
                  v-model="form.province" 
                  placeholder="Madrid"
                />
              </div>             
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-4">
            <Button 
              type="button"
              variant="outline" 
              @click="$router.back()"
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit"
              :disabled="isSubmitting"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              <UserPlus v-else class="w-4 h-4 mr-2" />
              {{ isSubmitting ? 'Creando...' : 'Crear usuario' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
