<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'reka-ui'
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

defineProps<Props>()
</script>

<template>
  <div v-for="section in sections" :key="section.title">
    <SidebarGroup>
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
              <SidebarMenuButton :tooltip="item.title">
                <Icon :name="item.icon || 'lucide:circle'" v-if="item.icon" />
                <span>{{ item.title }}</span>
                <Icon
                  v-if="item.items"
                  name="lucide:chevron-right"
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent v-if="item.items">
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                  <SidebarMenuSubButton as-child>
                    <NuxtLink :to="subItem.url">
                      <span>{{ subItem.title }}</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
            <NuxtLink v-else :to="item.url" class="hidden" />
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  </div>
</template>
