import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    created_at: z.string(),
    last_updated: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { posts };
