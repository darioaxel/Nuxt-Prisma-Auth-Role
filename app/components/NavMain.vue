<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { NavSection } from '@/lib/config'

interface Props {
  sections: NavSection[]
}

const props = defineProps<Props>()

const route = useRoute()

function isRouteActive(url: string): boolean {
  if (!url || url === '#') return false
  return route.path === url || route.path.startsWith(url + '/')
}

// Detectar si algún sub-item está activo
function hasActiveSubItem(subItems?: { url: string }[]): boolean {
  if (!subItems) return false
  return subItems.some(sub => isRouteActive(sub.url))
}

// Computed para items con estado activo calculado dinámicamente
const sectionsWithActiveState = computed(() => {
  return props.sections.map(section => ({
    ...section,
    items: section.items.map(item => {
      const subItemsActive = hasActiveSubItem(item.items)
      const itemActive = isRouteActive(item.url)
      const isActive = itemActive || subItemsActive

      return {
        ...item,
        isActive,
        items: item.items?.map(sub => ({
          ...sub,
          isActive: isRouteActive(sub.url)
        }))
      }
    })
  }))
})
</script>

<template>
  <SidebarGroup v-for="section in sectionsWithActiveState" :key="section.title">
    <SidebarGroupLabel>{{ section.title }}</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible
        v-for="item in section.items"
        :key="item.title"
        as-child
        :default-open="item.isActive"
        class="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="item.title" :is-active="item.isActive">
              <Icon :name="item.icon || 'lucide:circle'" v-if="item.icon" />
              <span class="group-data-[collapsible=icon]:hidden">{{ item.title }}</span>
              <ChevronRight
                v-if="item.items"
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent v-if="item.items">
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                <SidebarMenuSubButton as-child :is-active="subItem.isActive">
                  <NuxtLink :to="subItem.url">
                    <span>{{ subItem.title }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
