<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAppUserSession } from '@/composables/useAppUserSession'

const { isMobile } = useSidebar()
const { session, logout } = useAppUserSession()
const user = computed(() => session.value.user)

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
}

const getRoleLabel = (role?: string | null) => {
  const labels: Record<string, string> = {
    USER: 'Usuario',
    ADMIN: 'Administrador',
    ROOT: 'Superadmin',
  }
  return labels[role || ''] || role
}
</script>

<template>
  <SidebarMenu v-if="user">
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user?.picture || ''" :alt="user?.firstName || ''" />
              <AvatarFallback class="rounded-lg">
                {{ getInitials(user?.firstName, user?.lastName) }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user?.firstName }} {{ user?.lastName }}</span>
              <span class="truncate text-xs">{{ getRoleLabel(user?.role) }}</span>
            </div>
            <Icon name="lucide:chevrons-up-down" class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user?.picture || ''" :alt="user?.firstName || ''" />
                <AvatarFallback class="rounded-lg">
                  {{ getInitials(user?.firstName, user?.lastName) }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user?.firstName }} {{ user?.lastName }}</span>
                <span class="truncate text-xs">{{ user?.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem as-child>
              <NuxtLink to="/usuario/perfil">
                <Icon name="lucide:user" class="mr-2 h-4 w-4" />
                Mi perfil
              </NuxtLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="logout">
            <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
