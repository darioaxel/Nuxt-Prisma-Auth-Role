<script setup lang="ts">
import NavMain from '@/components/NavMain.vue'
import NavSecondary from '@/components/NavSecondary.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { navSections, navSecondary } from '@/lib/config'

const { session } = useAppUserSession()
const userRole = computed(() => session.value.role)

// Filtrar secciones según el rol del usuario
const filteredSections = computed(() => {
  if (!userRole.value) return []
  
  return navSections.filter(section => {
    if (!section.roles) return true
    return section.roles.includes(userRole.value!)
  })
})
</script>

<template>
  <Sidebar variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon name="lucide:layout-grid" class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Mi App</span>
                <span class="truncate text-xs">v1.0.0</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <NavMain :sections="filteredSections" />
      <NavSecondary :items="navSecondary" class="mt-auto" />
    </SidebarContent>

    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
</template>
