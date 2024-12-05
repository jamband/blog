import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  loader: glob({
    pattern: "**\/[^_]*.md",
    base: "./src/content/posts",
  }),
  schema: z.object({
    title: z.string(),
    created_at: z.string(),
    last_updated: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { posts };
