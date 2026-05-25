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
    daw: defineCollection({
      type: 'page',
      source: 'daw/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().optional(),
      }),
    }),
  },
})
