<script setup lang="ts">
import SidebarGroup from '@/components/ui/sidebar/SidebarGroup.vue'
import SidebarGroupContent from '@/components/ui/sidebar/SidebarGroupContent.vue'
import SidebarMenu from '@/components/ui/sidebar/SidebarMenu.vue'
import SidebarMenuButton from '@/components/ui/sidebar/SidebarMenuButton.vue'
import SidebarMenuItem from '@/components/ui/sidebar/SidebarMenuItem.vue'
import type { NavItem } from '@/lib/config'

interface Props {
  items: NavItem[]
}

defineProps<Props>()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton as-child size="sm">
            <NuxtLink :to="item.url">
              <Icon :name="item.icon || 'lucide:circle'" v-if="item.icon" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
