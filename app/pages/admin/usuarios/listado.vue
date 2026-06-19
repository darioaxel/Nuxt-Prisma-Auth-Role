<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Gestión de Usuarios</h1>
        <p class="text-muted-foreground">
          Total: {{ pagination.total }} usuarios registrados
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="saveChanges"
          :disabled="!hasChanges || isSaving"
          :variant="hasChanges ? 'default' : 'outline'"
        >
          <Icon v-if="isSaving" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          <Icon v-else name="lucide:save" class="mr-2 h-4 w-4" />
          Guardar cambios
          <Badge v-if="pendingCount > 0" variant="secondary" class="ml-2">{{ pendingCount }}</Badge>
        </Button>
        <Button @click="$router.push('/usuario/alta-usuario')">
          <Icon name="lucide:user-plus" class="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>
    </div>

    <!-- Acciones en lote -->
    <Card v-if="selectedRows.length > 0" class="border-primary/50 bg-primary/5">
      <CardContent class="py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">
              {{ selectedRows.length }} usuario(s) seleccionado(s)
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="bulkActionRole">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="Cambiar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in availableRoles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              @click="applyBulkRole"
              :disabled="!bulkActionRole || isApplyingBulk || isSaving"
            >
              <Icon v-if="isApplyingBulk" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              Aplicar Rol
            </Button>
            <Separator orientation="vertical" class="h-6" />
            <Button
              variant="outline"
              size="sm"
              @click="bulkActivate(true)"
              :disabled="isApplyingBulk || isSaving"
            >
              <Icon name="lucide:check-circle" class="mr-2 h-4 w-4" />
              Activar
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="bulkActivate(false)"
              :disabled="isApplyingBulk || isSaving"
            >
              <Icon name="lucide:x-circle" class="mr-2 h-4 w-4" />
              Desactivar
            </Button>
            <Button variant="ghost" size="sm" @click="clearSelection" :disabled="isSaving">
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabla de Usuarios -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Listado de Usuarios</CardTitle>
            <CardDescription>
              Gestiona los usuarios del sistema
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <!-- Filtro de búsqueda -->
            <Input
              placeholder="Buscar usuario..."
              class="w-64"
              v-model="searchQuery"
              @input="handleSearch"
              :disabled="isSaving"
            />

            <!-- Filtro por rol -->
            <Select v-model="roleFilter" @update:model-value="handleRoleFilter" :disabled="isSaving">
              <SelectTrigger class="w-[140px]">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los roles</SelectItem>
                <SelectItem v-for="role in availableRoles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Botón refrescar -->
            <Button variant="outline" size="icon" @click="refreshUsers" :disabled="isLoading || isSaving">
              <Icon :name="isLoading ? 'lucide:loader-2' : 'lucide:refresh-cw'"
                    :class="{ 'animate-spin': isLoading }"
                    class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <!-- Loading -->
        <div v-if="isLoading && !users.length" class="flex items-center justify-center py-12">
          <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>

        <!-- Tabla -->
        <div v-else class="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <Checkbox 
                    :checked="isAllSelected"
                    @update:checked="toggleAllSelection"
                    :disabled="isSaving"
                  />
                </TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead class="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in users" :key="user.id" :class="pendingChanges[user.id] ? 'bg-primary/5' : ''">
                <TableCell>
                  <Checkbox 
                    :checked="selectedRows.includes(user.id)"
                    @update:checked="toggleSelection(user.id)"
                    :disabled="isSaving"
                  />
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <Avatar class="h-8 w-8">
                      <AvatarFallback>{{ getInitials(user.firstName, user.lastName) }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="text-sm text-muted-foreground">{{ user.dni || 'Sin DNI' }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{{ user.email }}</TableCell>
                <TableCell>
                  <Badge :variant="getRoleBadgeVariant(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Switch 
                      :model-value="getDisplayedStatus(user.id)"
                      @update:modelValue="updateUserStatus(user.id, $event as boolean)"
                      :disabled="isSaving"
                    />
                    <span :class="getDisplayedStatus(user.id) ? 'text-green-600' : 'text-gray-400'">
                      {{ getDisplayedStatus(user.id) ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {{ formatDate(user.lastLoginAt) }}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" :disabled="isSaving">
                        <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="editUser(user.id)">
                        <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        @click="updateUserStatus(user.id, !getDisplayedStatus(user.id))"
                      >
                        <Icon :name="getDisplayedStatus(user.id) ? 'lucide:user-x' : 'lucide:user-check'" class="mr-2 h-4 w-4" />
                        {{ getDisplayedStatus(user.id) ? 'Desactivar' : 'Activar' }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Paginación -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-4">
          <div class="text-sm text-muted-foreground">
            Mostrando {{ users.length }} de {{ pagination.total }} usuarios
            <span>(Página {{ pagination.page }} de {{ pagination.totalPages }})</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page <= 1 || isLoading || isSaving"
              @click="goToPage(pagination.page - 1)"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div class="flex items-center gap-1">
              <Button
                v-for="pageNum in visiblePages"
                :key="pageNum"
                variant="outline"
                size="sm"
                :class="{ 'bg-primary text-primary-foreground': pageNum === pagination.page }"
                @click="goToPage(pageNum)"
                :disabled="isSaving"
              >
                {{ pageNum }}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page >= pagination.totalPages || isLoading || isSaving"
              @click="goToPage(pagination.page + 1)"
            >
              Siguiente
              <Icon name="lucide:chevron-right" class="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Dialog cambios sin guardar -->
    <Dialog :open="showUnsavedDialog" @update:open="showUnsavedDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambios sin guardar</DialogTitle>
          <DialogDescription>
            Tienes {{ pendingCount }} cambio(s) pendiente(s). ¿Quieres guardarlos antes de salir?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="discardAndNavigate" :disabled="isSaving">
            Descartar
          </Button>
          <Button variant="secondary" @click="cancelNavigation" :disabled="isSaving">
            Cancelar
          </Button>
          <Button @click="saveAndNavigate" :disabled="isSaving">
            <Icon v-if="isSaving" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            Guardar y salir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { onBeforeRouteLeave } from 'vue-router'
import type { Role } from '~/types/auth'

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
  roles: ['ADMIN', 'ROOT'],
  title: 'Listado de Usuarios'
})

// Tipos
interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  dni: string | null
  role: Role
  isActive: boolean
  lastLoginAt: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const availableRoles = [
  { value: 'USER', label: 'Usuario' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ROOT', label: 'Superadmin' },
]

// Estados
const users = ref<User[]>([])
const isLoading = ref(false)
const isApplyingBulk = ref(false)
const isSaving = ref(false)
const bulkActionRole = ref<Role | ''>('')
const searchQuery = ref('')
const roleFilter = ref('ALL')
const selectedRows = ref<string[]>([])
const pendingChanges = ref<Record<string, Partial<User>>>({})
const showUnsavedDialog = ref(false)
const navigationTarget = ref<string | null>(null)

// Paginación
const pagination = ref<Pagination>({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

// Computed
const isAllSelected = computed(() => {
  return users.value.length > 0 && selectedRows.value.length === users.value.length
})

const hasChanges = computed(() => Object.keys(pendingChanges.value).length > 0)
const pendingCount = computed(() => Object.keys(pendingChanges.value).length)

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5]
  }

  if (current >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total]
  }

  return [current - 2, current - 1, current, current + 1, current + 2]
})

// Helpers
const getRoleLabel = (role: Role) => {
  const labels: Record<Role, string> = {
    USER: 'Usuario',
    ADMIN: 'Administrador',
    ROOT: 'Superadmin',
  }
  return labels[role] || role
}

const getRoleBadgeVariant = (role: Role): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<Role, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    USER: 'secondary',
    ADMIN: 'default',
    ROOT: 'destructive',
  }
  return variants[role] || 'default'
}

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
}

const formatDate = (date: string | null) => {
  if (!date) return 'Nunca'
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getDisplayedStatus = (userId: string) => {
  const pending = pendingChanges.value[userId]
  const user = users.value.find(u => u.id === userId)
  return pending?.isActive ?? user?.isActive ?? false
}

// Cambios pendientes
const updateUserStatus = (userId: string, isActive: boolean) => {
  const user = users.value.find(u => u.id === userId)
  if (!user) return

  const currentPending = pendingChanges.value[userId] || {}
  const newPending = { ...currentPending, isActive }

  // Si el cambio vuelve al estado original, eliminar el pending
  const isSameAsOriginal = Object.keys(newPending).every((key) => {
    return (user as any)[key] === (newPending as any)[key]
  })

  if (isSameAsOriginal) {
    const { [userId]: _, ...rest } = pendingChanges.value
    pendingChanges.value = rest
  } else {
    pendingChanges.value = { ...pendingChanges.value, [userId]: newPending }
  }
}

const saveChanges = async () => {
  if (!hasChanges.value) return

  isSaving.value = true
  try {
    const changes = Object.entries(pendingChanges.value).map(([userId, data]) => ({
      userId,
      isActive: data.isActive,
    }))

    await $fetch('/api/users/bulk', {
      method: 'PATCH',
      body: { changes }
    })

    // Actualizar usuarios locales
    changes.forEach(({ userId, isActive }) => {
      const user = users.value.find(u => u.id === userId)
      if (user && isActive !== undefined) {
        user.isActive = isActive
      }
    })

    pendingChanges.value = {}
    toast.success('Éxito', {
      description: 'Cambios guardados correctamente',
    })
  } catch (error) {
    toast.error('Error', {
      description: 'No se pudieron guardar los cambios',
    })
  } finally {
    isSaving.value = false
  }
}

const discardChanges = () => {
  pendingChanges.value = {}
}

// Navegación con cambios sin guardar
const saveAndNavigate = async () => {
  await saveChanges()
  showUnsavedDialog.value = false
  if (navigationTarget.value) {
    await navigateTo(navigationTarget.value)
  }
}

const discardAndNavigate = () => {
  discardChanges()
  showUnsavedDialog.value = false
  if (navigationTarget.value) {
    navigateTo(navigationTarget.value)
  }
}

const cancelNavigation = () => {
  showUnsavedDialog.value = false
  navigationTarget.value = null
}

onBeforeRouteLeave((to) => {
  if (!hasChanges.value || showUnsavedDialog.value) return

  navigationTarget.value = to.fullPath
  showUnsavedDialog.value = true
  return false
})

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// Selección
const toggleSelection = (userId: string) => {
  const index = selectedRows.value.indexOf(userId)
  if (index === -1) {
    selectedRows.value.push(userId)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

const toggleAllSelection = () => {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = users.value.map(u => u.id)
  }
}

const clearSelection = () => {
  selectedRows.value = []
  bulkActionRole.value = ''
}

// API Calls
const refreshUsers = async () => {
  isLoading.value = true
  try {
    const data = await $fetch<{ users: User[], pagination: Pagination }>('/api/users', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value || undefined,
        role: roleFilter.value !== 'ALL' ? roleFilter.value : undefined,
      }
    })

    users.value = data.users
    pagination.value = data.pagination
  } catch (error) {
    toast.error('Error', {
      description: 'No se pudieron cargar los usuarios',
    })
  } finally {
    isLoading.value = false
  }
}

// Filtros
const handleSearch = () => {
  pagination.value.page = 1
  refreshUsers()
}

const handleRoleFilter = () => {
  pagination.value.page = 1
  refreshUsers()
}

// Paginación
const goToPage = async (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  clearSelection()
  await refreshUsers()
}

// Acciones en lote
const applyBulkRole = async () => {
  if (!bulkActionRole.value || selectedRows.value.length === 0) return

  isApplyingBulk.value = true
  try {
    await $fetch('/api/users/bulk', {
      method: 'PATCH',
      body: {
        userIds: selectedRows.value,
        role: bulkActionRole.value
      }
    })

    const newChanges = { ...pendingChanges.value }
    users.value.forEach(user => {
      if (selectedRows.value.includes(user.id)) {
        user.role = bulkActionRole.value as Role
        delete newChanges[user.id]
      }
    })
    pendingChanges.value = newChanges

    toast.success('Éxito', {
      description: `Rol actualizado en ${selectedRows.value.length} usuario(s)`,
    })
    clearSelection()
  } catch (error) {
    toast.error('Error', {
      description: 'No se pudieron actualizar los roles',
    })
  } finally {
    isApplyingBulk.value = false
  }
}

const bulkActivate = async (isActive: boolean) => {
  if (selectedRows.value.length === 0) return

  isApplyingBulk.value = true
  try {
    await $fetch('/api/users/bulk', {
      method: 'PATCH',
      body: {
        userIds: selectedRows.value,
        isActive
      }
    })

    const newChanges = { ...pendingChanges.value }
    users.value.forEach(user => {
      if (selectedRows.value.includes(user.id)) {
        user.isActive = isActive
        delete newChanges[user.id]
      }
    })
    pendingChanges.value = newChanges

    toast.success('Éxito', {
      description: `${selectedRows.value.length} usuario(s) ${isActive ? 'activado(s)' : 'desactivado(s)'}`,
    })
    clearSelection()
  } catch (error) {
    toast.error('Error', {
      description: 'No se pudieron actualizar los estados',
    })
  } finally {
    isApplyingBulk.value = false
  }
}

const editUser = (userId: string) => {
  // Implementar edición de usuario
  toast.info('Próximamente', {
    description: 'Edición de usuario en desarrollo',
  })
}

// Cargar usuarios al montar
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  refreshUsers()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
