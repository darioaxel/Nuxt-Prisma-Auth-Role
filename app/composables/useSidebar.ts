import { useMediaQuery } from '@vueuse/core'

export function useSidebar() {
  const isMobile = useMediaQuery('(max-width: 1024px)')

  return {
    isMobile,
  }
}
