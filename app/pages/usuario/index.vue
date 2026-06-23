<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Users, Settings, Shield, UserCircle } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
  title: 'Inicio',
})

const { session } = useAppUserSession()
const user = computed(() => session.value.user)
const userRole = computed(() => session.value.role)

const userName = computed(() => {
  if (!user.value) return 'Usuario'
  return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.email
})

const getRoleLabel = (role?: string | null) => {
  const labels: Record<string, string> = {
    USER: 'Usuario',
    ADMIN: 'Administrador',
    ROOT: 'Superadministrador',
  }
  return labels[role || ''] || role
}

const getRoleColor = (role?: string | null) => {
  const colors: Record<string, string> = {
    USER: 'bg-blue-100 text-blue-800',
    ADMIN: 'bg-amber-100 text-amber-800',
    ROOT: 'bg-red-100 text-red-800',
  }
  return colors[role || ''] || 'bg-gray-100 text-gray-800'
}

// Tarjetas de acceso rápido
const quickLinks = computed(() => {
  const links = [
    {
      title: 'Mi Perfil',
      description: 'Ver y editar tus datos personales',
      icon: UserCircle,
      href: '/usuario/perfil',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  if (userRole.value === 'ADMIN' || userRole.value === 'ROOT') {
    links.push({
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema',
      icon: Users,
      href: '/admin/usuarios',
      color: 'bg-blue-50 text-blue-600',
    })
  }

  if (userRole.value === 'ROOT') {
    links.push({
      title: 'Configuración',
      description: 'Configuración avanzada del sistema',
      icon: Settings,
      href: '/admin/config',
      color: 'bg-purple-50 text-purple-600',
    })
  }

  return links
})

// Estadísticas (simuladas - en producción vendrían de la API)
const stats = [
  { label: 'Mi Rol', value: () => getRoleLabel(userRole.value) },
  { label: 'Estado', value: () => 'Activo' },
  { label: 'Último acceso', value: () => 'Hoy' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header de bienvenida -->
    <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/80 to-primary p-6 text-primary-foreground">
      <div class="relative z-10">
        <h1 class="text-2xl font-bold md:text-3xl">
          ¡Hola, {{ userName }}! 👋
        </h1>
        <p class="mt-2 text-primary-foreground/90">
          Bienvenido a tu panel de control. Aquí puedes gestionar tu cuenta y acceder a las funcionalidades del sistema.
        </p>
        <div class="mt-4 flex items-center gap-2">
          <Badge :class="getRoleColor(userRole)">
            {{ getRoleLabel(userRole) }}
          </Badge>
          <Badge
            variant="outline"
            class="border-white/30 text-white"
          >
            <Shield class="mr-1 h-3 w-3" />
            Activo
          </Badge>
        </div>
      </div>
      <!-- Decoración -->
      <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div class="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card
        v-for="stat in stats"
        :key="stat.label"
      >
        <CardContent class="p-4">
          <p class="text-sm text-muted-foreground">
            {{ stat.label }}
          </p>
          <p class="mt-1 text-lg font-semibold">
            {{ stat.value() }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Accesos rápidos -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">
        Accesos rápidos
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.href"
          :to="link.href"
          class="group"
        >
          <Card class="transition-colors hover:border-primary/50 hover:bg-accent/50">
            <CardContent class="flex items-start gap-4 p-4">
              <div :class="cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', link.color)">
                <component
                  :is="link.icon"
                  class="h-5 w-5"
                />
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

    <!-- Información de la cuenta -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <UserCircle class="h-5 w-5" />
          Información de la cuenta
        </CardTitle>
        <CardDescription>
          Resumen de tu cuenta en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label class="text-muted-foreground">Email</Label>
            <p class="font-medium">
              {{ user?.email }}
            </p>
          </div>
          <div>
            <Label class="text-muted-foreground">Nombre completo</Label>
            <p class="font-medium">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
          </div>
          <div>
            <Label class="text-muted-foreground">Rol</Label>
            <p class="font-medium">
              {{ getRoleLabel(userRole) }}
            </p>
          </div>
          <div>
            <Label class="text-muted-foreground">Estado</Label>
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-green-500" />
              <span class="font-medium">Activo</span>
            </div>
          </div>
        </div>

        <Separator />

        <div class="flex justify-end">
          <Button
            as-child
            variant="outline"
          >
            <NuxtLink to="/usuario/perfil">
              <UserCircle class="mr-2 h-4 w-4" />
              Ver perfil completo
            </NuxtLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
