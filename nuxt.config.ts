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
        '@tiptap/vue-3',
        '@tiptap/extension-document',
        '@tiptap/extension-paragraph',
        '@tiptap/extension-text',
        '@tiptap/extension-bold',
        '@tiptap/extension-italic',
        '@tiptap/extension-strike',
        '@tiptap/extension-heading',
        '@tiptap/extension-bullet-list',
        '@tiptap/extension-ordered-list',
        '@tiptap/extension-list-item',
        '@tiptap/extension-list-keymap',
        '@tiptap/extension-blockquote',
        '@tiptap/extension-code-block',
        '@tiptap/extension-history',
        '@tiptap/extension-dropcursor',
        '@tiptap/extension-gapcursor',
        '@tiptap/extension-table',
        '@tiptap/extension-table-cell',
        '@tiptap/extension-table-header',
        '@tiptap/extension-table-row',
        '@tiptap/extension-image',
        'marked',
        'turndown',
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

  // Registrar componentes de contenido como globales (requerido en Nuxt Content v3)
  hooks: {
    'components:extend': (components) => {
      const contentComponents = components.filter(c =>
        c.filePath.includes('/components/content/')
      )
      contentComponents.forEach(c => {
        c.global = true
      })
    },
  },

  // Iconos
  icon: {
    serverBundle: {
      collections: ['lucide']
    }
  },

  // MDC: registrar componentes personalizados para que el parser los reconozca
  // El parser remark-mdc requiere PascalCase exacto (no soporta guiones en tags)
  mdc: {
    components: {
      prose: true,
      map: {
        'MdcAccordion': 'MdcAccordion',
        'MdcAccordionItem': 'MdcAccordionItem',
        'MdcBadge': 'MdcBadge',
        'MdcCallout': 'MdcCallout',
        'MdcCard': 'MdcCard',
        'MdcCardGroup': 'MdcCardGroup',
        'MdcCollapsible': 'MdcCollapsible',
        'MdcField': 'MdcField',
        'MdcFieldGroup': 'MdcFieldGroup',
        'MdcIcon': 'MdcIcon',
        'MdcKbd': 'MdcKbd',
        'MdcSteps': 'MdcSteps',
        'MdcTabs': 'MdcTabs',
      }
    }
  },
})
