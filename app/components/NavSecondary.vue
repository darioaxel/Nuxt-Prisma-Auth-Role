<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { NavItem } from '@/lib/config'

interface Props {
  items: NavItem[]
}

defineProps<Props>()

const { logout } = useAppUserSession()

async function onLogout() {
  await logout()
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem
          v-for="item in items"
          :key="item.title"
        >
          <SidebarMenuButton
            as-child
            size="sm"
          >
            <NuxtLink :to="item.url">
              <Icon
                v-if="item.icon"
                :name="item.icon || 'lucide:circle'"
              />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Button
        variant="ghost"
        class="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-white hover:text-slate-900 w-full shadow-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
        size="sm"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4" />
        <span class="group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
      </Button>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
