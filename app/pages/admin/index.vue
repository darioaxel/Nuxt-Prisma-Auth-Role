<script setup lang="ts">
import { Users, Settings, BarChart3, Shield } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'dashboard',
  title: 'Panel de Administración',
  roles: ['ADMIN', 'ROOT']
})

const { session } = useAppUserSession()
const user = computed(() => session.value.user)

const userName = computed(() => {
  if (!user.value) return 'Administrador'
  return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.email
})

// Estadísticas (en producción vendrían de la API)
const stats = [
  { label: 'Total Usuarios', value: '6', change: '+2 este mes', icon: Users },
  { label: 'Administradores', value: '2', change: 'Activos', icon: Shield },
  { label: 'Usuarios', value: '4', change: 'Activos', icon: Users },
]

const adminLinks = [
  {
    title: 'Gestionar Usuarios',
    description: 'Ver, crear, editar y desactivar usuarios del sistema',
    icon: Users,
    href: '/admin/usuarios',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Configuración',
    description: 'Configuración general del sistema',
    icon: Settings,
    href: '/admin/config',
    color: 'bg-purple-50 text-purple-600',
  },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/80 to-amber-600 p-6 text-white">
      <div class="relative z-10">
        <h1 class="text-2xl font-bold md:text-3xl">
          Panel de Administración
        </h1>
        <p class="mt-2 text-white/90">
          Bienvenido, {{ userName }}. Desde aquí puedes gestionar usuarios y configurar el sistema.
        </p>
      </div>
      <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div class="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <CardContent class="flex items-center gap-4 p-4">
          <div :class="cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary')">
            <component :is="stat.icon" class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
            <p class="text-xs text-muted-foreground">{{ stat.change }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Accesos rápidos -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">Gestión del sistema</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="link in adminLinks"
          :key="link.href"
          :to="link.href"
          class="group"
        >
          <Card class="transition-colors hover:border-primary/50 hover:bg-accent/50">
            <CardContent class="flex items-start gap-4 p-4">
              <div :class="cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', link.color)">
                <component :is="link.icon" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-medium group-hover:text-primary">{{ link.title }}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{{ link.description }}</p>
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
