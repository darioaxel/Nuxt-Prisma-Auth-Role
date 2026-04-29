import { useMediaQuery } from '@vueuse/core'

export function useSidebar() {
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const isOpen = useState('sidebar-open', () => true)

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isMobile,
    isOpen,
    toggle,
    open,
    close,
  }
}
