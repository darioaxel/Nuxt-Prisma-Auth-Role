/**
 * Guarda de Nuxt Studio
 * 
 * Restringe la inyeccion del componente <nuxt-studio> a:
 * - Rutas de contenido markdown (/blog/*, /daw/*)
 * - Panel de administracion de Studio (/admin/contenido, /_studio)
 * 
 * En el resto de la aplicacion (login, dashboard, perfil, etc.)
 * se elimina el componente del DOM para evitar que el boton de edicion
 * aparezca en paginas que no son contenido markdown.
 */
export default defineNuxtPlugin(() => {
  // Rutas donde Studio debe estar activo
  const allowedPatterns = [
    /^\/_studio/,           // Panel de Studio
    /^\/admin\/contenido/,  // Panel admin de contenido (si existe)
    /^\/blog/,              // Coleccion blog
    /^\/daw/,               // Coleccion daw
  ]

  const isAllowed = () => {
    const path = window.location.pathname
    return allowedPatterns.some(pattern => pattern.test(path))
  }

  // Si estamos en una ruta no permitida, eliminar <nuxt-studio> del DOM
  if (!isAllowed()) {
    const observer = new MutationObserver(() => {
      const studioEl = document.querySelector('nuxt-studio')
      if (studioEl) {
        studioEl.remove()
        observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Intento inmediato por si ya esta en el DOM
    const studioEl = document.querySelector('nuxt-studio')
    if (studioEl) {
      studioEl.remove()
      observer.disconnect()
    }
  }
})
