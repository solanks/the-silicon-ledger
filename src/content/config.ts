import { defineCollection, z } from 'astro:content';

const specRowSchema = z.object({
  category: z.string().optional(),
  label: z.string(),
  unit: z.string().optional().default(''),
  higherIsBetter: z.boolean().default(true),
  values: z.array(z.union([z.number(), z.string()])),
  notes: z.array(z.string().optional()).optional()
});

const articlesCollection = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      teaser: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      category: z.string().default('Silicon & SoCs'),
      tags: z.array(z.string()).default(['Hardware', 'Analysis']),
      featured: z.boolean().default(false),
      readingTimeMinutes: z.number().default(5),
      author: z
        .object({
          name: z.string().default('TechPulse Editorial Desk'),
          role: z.string().default('Senior Hardware Editor & Wallet Protector'),
          avatar: z.string().default('/images/authors/default-editor.svg'),
          url: z
            .string()
            .url()
            .default('https://siliconledger.io/about')
        })
        .default({}),
      /**
       * Google Discover 1200px+ (1600x900) 16:9 image with editorial hardware photography
       */
      heroImage: z
        .object({
          src: z
            .string()
            .default('/images/articles/m5-macbook-pro-throttle-trap.jpg'),
          alt: z.string().default('TechPulse Labs Hardware Teardown & Benchmark Analysis'),
          width: z.number().min(1200).default(1600),
          height: z.number().min(675).default(900),
          caption: z.string().optional(),
          focalCallout: z.string().optional()
        })
        .default({}),
      /**
       * Quick Verdict / Pros & Cons component at the top of every article
       */
      verdict: z
        .object({
          score: z.number().min(0).max(10).default(7.8),
          award: z.string().optional(),
          summary: z
            .string()
            .default(
              'While the headline specs look impressive on paper, buyers should weigh the real-world thermal and base-model memory bandwidth trade-offs carefully before upgrading.'
            ),
          pros: z
            .array(z.string())
            .default([
              'Strong single-core burst performance in daily workflows',
              'Improved display efficiency and peak HDR brightness'
            ]),
          cons: z
            .array(z.string())
            .default([
              'Base configuration compromises on memory/storage value',
              'Sustained workloads trigger aggressive thermal throttling'
            ]),
          price: z.string().optional(),
          buyUrl: z.string().url().optional()
        })
        .default({}),
      /**
       * Above-the-Fold Polarized 2-Option Reader Poll
       */
      poll: z
        .object({
          question: z
            .string()
            .default(
              'Is shipping a $1,599 "Pro" laptop with a single fan and 120 GB/s memory bus in 2026 an insult?'
            ),
          optionALabel: z.string().default('Yes, DOA Cash-Grab'),
          optionASubtext: z
            .string()
            .default('Pro price requires Pro thermals & bandwidth'),
          optionAVotes: z.number().default(1842),
          optionBLabel: z.string().default('Fine for Casual Pros'),
          optionBSubtext: z
            .string()
            .default('Single-core burst speed is all most users need'),
          optionBVotes: z.number().default(519),
          hotTakeQuote: z
            .string()
            .default(
              'Paying $1,599 for a single cooling fan and less memory bandwidth than a 2021 M1 Pro is peak marketing manipulation.'
            ),
          hotTakeAuthor: z
            .string()
            .default('@SiliconCynic · Top Reader Comment (+412 upvotes)')
        })
        .default({}),
      specComparison: z
        .object({
          title: z.string(),
          subtitle: z.string().optional(),
          baselineIndex: z.number().default(0),
          devices: z.array(
            z.object({
              name: z.string(),
              chip: z.string().optional(),
              price: z.string().optional(),
              isReviewed: z.boolean().default(false)
            })
          ),
          rows: z.array(specRowSchema)
        })
        .optional()
    })
    .transform((data) => ({
      ...data,
      description:
        data.description ??
        data.teaser ??
        data.subtitle ??
        data.verdict.summary
    }))
});

export const collections = {
  articles: articlesCollection
};
