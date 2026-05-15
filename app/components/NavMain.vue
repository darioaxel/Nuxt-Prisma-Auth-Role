<script setup lang="ts">
import {
  CollapsibleRoot,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'reka-ui'
import SidebarGroup from '@/components/ui/sidebar/SidebarGroup.vue'
import SidebarGroupLabel from '@/components/ui/sidebar/SidebarGroupLabel.vue'
import SidebarMenu from '@/components/ui/sidebar/SidebarMenu.vue'
import SidebarMenuButton from '@/components/ui/sidebar/SidebarMenuButton.vue'
import SidebarMenuItem from '@/components/ui/sidebar/SidebarMenuItem.vue'
import SidebarMenuSub from '@/components/ui/sidebar/SidebarMenuSub.vue'
import SidebarMenuSubButton from '@/components/ui/sidebar/SidebarMenuSubButton.vue'
import SidebarMenuSubItem from '@/components/ui/sidebar/SidebarMenuSubItem.vue'
import type { NavSection } from '@/lib/config'

interface Props {
  sections: NavSection[]
}

defineProps<Props>()

const route = useRoute()

function isRouteActive(url: string): boolean {
  if (!url || url === '#') return false
  return route.path === url || route.path.startsWith(url + '/')
}
</script>

<template>
  <SidebarGroup v-for="section in sections" :key="section.title">
    <SidebarGroupLabel>{{ section.title }}</SidebarGroupLabel>
    <SidebarMenu>
      <CollapsibleRoot
        v-for="item in section.items"
        :key="item.title"
        as-child
        :default-open="item.isActive || isRouteActive(item.url)"
        class="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="item.title" :is-active="isRouteActive(item.url)">
              <Icon :name="item.icon || 'lucide:circle'" v-if="item.icon" />
              <span class="group-data-[collapsible=icon]:hidden">{{ item.title }}</span>
              <Icon
                v-if="item.items"
                name="lucide:chevron-right"
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent v-if="item.items">
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                <SidebarMenuSubButton as-child :is-active="isRouteActive(subItem.url)">
                  <NuxtLink :to="subItem.url">
                    <span>{{ subItem.title }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </CollapsibleRoot>
    </SidebarMenu>
  </SidebarGroup>
</template>
