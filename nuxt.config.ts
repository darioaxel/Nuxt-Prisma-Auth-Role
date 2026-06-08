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
    'shadcn-nuxt',
    '@nuxt/content',
    'nuxt-component-meta',
    '@nuxtjs/mdc',
    'nuxt-studio'
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
  css: ['~/assets/css/tailwind.css'],

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
  },

  // Nuxt Studio
  studio: {
    route: '/_studio',

    editor: {
      // Excluir componentes de navegación/sidebar del editor visual
      components: {
        exclude: [
          'AppSidebar',
          'NavMain',
          'NavSecondary',
          'NavUser',
          'DynamicBreadCrumb',
          'Sidebar',
          'SidebarHeader',
          'SidebarContent',
          'SidebarFooter',
          'SidebarMenu',
          'SidebarMenuButton',
          'SidebarMenuItem',
          'SidebarRail',
          'SidebarTrigger',
          'SidebarInset',
          'SidebarProvider',
          'SidebarGroup',
          'SidebarGroupContent',
          'SidebarGroupLabel',
          'SidebarMenuAction',
          'SidebarMenuBadge',
          'SidebarMenuSkeleton',
          'SidebarMenuSub',
          'SidebarMenuSubButton',
          'SidebarMenuSubItem',
        ]
      },

      // Restringir icon libraries al set usado en la app
      iconLibraries: ['lucide'],
    },

    // Configuración del repositorio (requerida para producción)
    repository: {
      provider: 'github',
      owner: 'darioaxel',
      repo: 'Nuxt-Prisma-Auth-Role',
      branch: 'main',
    },

    // Autenticación OAuth para GitHub (Nuxt Studio)
    auth: {
      github: {
        clientId: process.env.STUDIO_GITHUB_CLIENT_ID,
        clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET,
      }
    }
  }
})