import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().optional(),
      }),
    }),
    cpifp_enlaces: defineCollection({
      type: 'page',
      source: '50010314-CPIFP_Los_Enlaces/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    }),
    campus_virtual: defineCollection({
      type: 'page',
      source: '50020125-CampusVirtualFP/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    }),
  },
})
