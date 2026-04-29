import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  future: {
    compatibilityVersion: 4,
  },

  // Módulos
  modules: [
    '@pinia/nuxt',
    'nuxt-auth-utils',
    '@nuxt/icon',
    '@vee-validate/nuxt',
    '@nuxtjs/color-mode',
  ],

  // CSS
  css: ['~/assets/css/tailwind.css'],

  // Vite
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vueuse/core',
        'vue-sonner',
      ],
    },
  },

  // Runtime Config
  runtimeConfig: {
    // Variables privadas (servidor)
    dbUrl: process.env.DATABASE_URL,
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    
    // Variables públicas (cliente)
    public: {
      apiBase: '/api',
    }
  },

  // TypeScript
  typescript: {
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        baseUrl: '.',
      }
    }
  },

  // Nitro (servidor)
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // Configuración de imports
  imports: {
    dirs: ['composables/**']
  },

  // Componentes
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
      {
        path: '~/components/ui',
        pathPrefix: false,
      },
    ],
  },

  // Iconos
  icon: {
    serverBundle: {
      collections: ['lucide']
    }
  }
})
