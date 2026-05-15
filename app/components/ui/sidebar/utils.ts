import type { ComputedRef, InjectionKey, Ref } from "vue"
import { computed, inject, provide, ref } from "vue"

export const SIDEBAR_COOKIE_NAME = "sidebar_state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

export interface SidebarContext {
  state: ComputedRef<"expanded" | "collapsed">
  open: Ref<boolean>
  setOpen: (value: boolean) => void
  isMobile: Ref<boolean>
  openMobile: Ref<boolean>
  setOpenMobile: (value: boolean) => void
  toggleSidebar: () => void
}

const SidebarContextKey = Symbol("SidebarContext") as InjectionKey<SidebarContext>

export function provideSidebarContext(context: SidebarContext) {
  provide(SidebarContextKey, context)
}

export function useSidebar(): SidebarContext {
  const context = inject(SidebarContextKey)
  if (!context) {
    // Fallback para SSR o cuando no hay provider
    const open = ref(true)
    const isMobile = ref(false)
    const openMobile = ref(false)
    return {
      state: computed(() => (open.value ? "expanded" : "collapsed")),
      open,
      setOpen: (v: boolean) => { open.value = v },
      isMobile,
      openMobile,
      setOpenMobile: (v: boolean) => { openMobile.value = v },
      toggleSidebar: () => { open.value = !open.value },
    }
  }
  return context
}
