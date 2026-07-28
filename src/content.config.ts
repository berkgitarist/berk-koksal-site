import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writings = defineCollection({
  loader: glob({
    base: './src/content/writings',
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default("Qur'an Reflections"),
    language: z.enum(['tr', 'en']).default('tr'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    author: z.string().default('Berk K\u00d6KSAL'),
  }),
});

export const collections = { writings };
