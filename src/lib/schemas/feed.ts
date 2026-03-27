import { z } from "zod";

/* ── Preferences input (settings form + tRPC) ────────────── */

export const feedPreferencesInputSchema = z.object({
  topics: z
    .array(z.string().min(1).max(100))
    .min(1, "Add at least one topic")
    .max(20),
  xAccounts: z.array(z.string().max(50)).max(30),
  communicationStyle: z.string().min(1).max(100),
  affectiveLevel: z.number().int().min(0).max(100),
  language: z.string().max(5),
  additionalInstructions: z.string().max(1000).optional(),
});

export type FeedPreferencesInput = z.infer<typeof feedPreferencesInputSchema>;

/* ── Feed item (AI agent structured output) ───────────────── */

export const feedItemSchema = z.object({
  headline: z
    .string()
    .describe(
      "Rewritten headline — concise, denoised, in the user's communication style. Max 15 words.",
    ),
  content: z
    .string()
    .describe(
      "1-2 sentence summary of the core signal. Pure information, zero emotional language.",
    ),
  expandedContent: z
    .string()
    .describe(
      "3-5 sentence expanded detail with key facts, numbers, and context. Still denoised.",
    ),
  source: z
    .string()
    .describe(
      "The source name — X account handle (with @), news outlet, or organization.",
    ),
  sourceUrl: z
    .string()
    .describe("Direct URL to the original post, article, or source."),
  sourceType: z
    .enum(["tweet", "article", "paper", "report", "post", "video", "podcast"])
    .describe(
      "Type of source content: 'tweet' for X/social posts, 'article' for news, 'paper' for academic, 'report' for official reports, 'post' for blog posts, 'video' for video content, 'podcast' for audio.",
    ),
  imageUrl: z
    .string()
    .optional()
    .describe(
      "URL to a preview image — article thumbnail, Open Graph image, or relevant visual. Only include if a real image URL is available from the source. Do NOT fabricate URLs.",
    ),
  contentDate: z
    .string()
    .optional()
    .describe(
      "When the content was published or posted. Use ISO 8601 format (YYYY-MM-DD) or relative like 'today', 'yesterday', '2 days ago'. Extract from the source if available.",
    ),
  topic: z
    .string()
    .describe(
      "Which of the user's topics this item matches. Use the exact topic string from preferences.",
    ),
});

export type FeedItem = z.infer<typeof feedItemSchema>;

/* ── Generation result (top-level agent output) ───────────── */

export const feedGenerationResultSchema = z.object({
  items: z
    .array(feedItemSchema)
    .describe(
      "10-15 high-signal feed items, sorted by relevance. Each stripped of noise and rewritten in the user's style.",
    ),
});

export type FeedGenerationResult = z.infer<typeof feedGenerationResultSchema>;
