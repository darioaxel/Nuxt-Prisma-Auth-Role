import tailwindcss from "@tailwindcss/vite";
import { resolve } from 'node:path';

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
    'shadcn-nuxt',
    '@nuxt/content',
  ],

  content: {
    database: {
      type: 'pglite',
      dataDir: '.data/content/pglite',
    },
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  // Color Mode
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
  },

  // CSS
  css: [
    resolve(import.meta.dirname, 'assets/css/tailwind.css'),
    resolve(import.meta.dirname, 'assets/css/content-prose.css'),
  ],

  // Vite
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vueuse/core',
        'vue-sonner',
        'lucide-vue-next',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'reka-ui',
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
    },
    externals: {
      external: ['@prisma/client', '.prisma/client']
    }
  },

  // Configuración de imports
  imports: {
    dirs: ['composables/**']
  },

  // Iconos
  icon: {
    serverBundle: {
      collections: ['lucide']
    }
  }
})
