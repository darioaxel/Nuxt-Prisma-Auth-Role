// ~/composables/useAppUserSession.ts

import { useEventBus } from '@vueuse/core'
import { toast } from 'vue-sonner'
import type { UserSessionState, FullUser } from '~/types/auth'

export const authBus = useEventBus<string>('auth-events')

/**
 * Composable para gestionar la sesión de usuario extendida
 * Proporciona acceso a datos completos del usuario y utilidades de autenticación
 */
export const useAppUserSession = () => {
  const { user: baseUser, clear: clearBaseSession } = useUserSession()

  // Estado reactivo compartido
  const state = useState<UserSessionState>('auth:state', () => ({
    user: null,
    loggedIn: false,
    loading: true,
    role: null
  }))

  /**
   * Carga los datos completos del usuario desde la API
   */
  const loadUser = async (): Promise<void> => {
    if (!baseUser.value?.id) {
      state.value = { user: null, loggedIn: false, loading: false, role: null }
      return
    }

    state.value.loading = true

    try {
      const data = await $fetch<FullUser>('/api/user')
      state.value = {
        user: data,
        loggedIn: true,
        loading: false,
        role: data.role
      }
      authBus.emit('user-loaded')
    } catch (error) {
      console.error('❌ Error cargando usuario:', error)
      state.value = { user: null, loggedIn: false, loading: false, role: null }
    }
  }

  // Watch para cambios en la sesión base
  watch(
    () => baseUser.value?.id,
    (userId) => {
      console.log('👀 ID de usuario cambiado:', userId)
      if (userId) {
        loadUser()
      } else {
        state.value = { user: null, loggedIn: false, loading: false, role: null }
      }
    },
    { immediate: true }
  )

  // Listener de eventos globales
  authBus.on((event) => {
    console.log('📡 Evento recibido:', event)

    if (event === 'logout') {
      state.value = { user: null, loggedIn: false, loading: false, role: null }
      clearNuxtData('/api/user')
      console.log('✅ Estado reseteado por evento logout')
    } else if (event === 'login') {
      loadUser()
    }
  })

  onMounted(() => {
    if (baseUser.value?.id) {
      loadUser()
    } else {
      state.value.loading = false
    }
  })

  /**
   * Cierra la sesión del usuario
   */
  const logout = async (): Promise<void> => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      await clearBaseSession()
      authBus.emit('logout')
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente'
      })
      await navigateTo('/login')
    } catch (error) {
      console.error('❌ Error en logout:', error)
      authBus.emit('logout')
      await navigateTo('/login')
    }
  }

  return {
    session: computed(() => state.value),
    logout,
    refresh: loadUser
  }
}
