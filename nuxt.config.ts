import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // Módulos
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'nuxt-auth-utils',
    '@nuxt/icon',
    '@vee-validate/nuxt',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@nuxt/content',
  ],
  devtools: { enabled: true },

  // CSS
  css: [
    resolve(import.meta.dirname, 'assets/css/tailwind.css'),
    resolve(import.meta.dirname, 'assets/css/content-prose.css'),
  ],

  // Color Mode
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
  },

  content: {
    database: {
      type: 'pglite',
      dataDir: '.data/content/pglite',
    },
  },

  // MDC: registrar componentes personalizados para que el parser los reconozca
  // El parser remark-mdc requiere PascalCase exacto (no soporta guiones en tags)
  mdc: {
    components: {
      prose: true,
      map: {
        MdcAccordion: 'MdcAccordion',
        MdcAccordionItem: 'MdcAccordionItem',
        MdcBadge: 'MdcBadge',
        MdcCallout: 'MdcCallout',
        MdcCard: 'MdcCard',
        MdcCardGroup: 'MdcCardGroup',
        MdcCollapsible: 'MdcCollapsible',
        MdcField: 'MdcField',
        MdcFieldGroup: 'MdcFieldGroup',
        MdcIcon: 'MdcIcon',
        MdcKbd: 'MdcKbd',
        MdcSteps: 'MdcSteps',
        MdcTabs: 'MdcTabs',
      },
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
    },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-06-01',

  // Nitro (servidor)
  nitro: {
    experimental: {
      wasm: true,
    },
    externals: {
      external: ['@prisma/client', '.prisma/client'],
    },
  },

  // Vite
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    optimizeDeps: {
      include: [
        '@vueuse/core',
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

  // TypeScript
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {},
    },
  },

  hooks: {
    // Eliminar plugin de vue-router incompatible con vue-tsc 2.2.x / vue-router 4.6.x
    'prepare:types': ({ tsConfig }) => {
      if (tsConfig.vueCompilerOptions?.plugins) {
        tsConfig.vueCompilerOptions.plugins = []
      }
    },
    // Nuxt Content v3 registra automáticamente los componentes de app/components/content/
    // como globales para MDC; no se requiere hook manual.
  },

  eslint: {
    config: {
      stylistic: true,
      standalone: false,
    },
  },

  // Iconos
  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
})
