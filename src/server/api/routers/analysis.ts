import dayjs from "dayjs";
import { z } from "zod";

import { parseSignalData } from "@/lib/utils";
import { generateAnalysis } from "@/server/analysis/generate";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const analysisRouter = createTRPCRouter({
  /** Create a signal record and start background generation. Returns the ID immediately. */
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(10000),
        sinceDays: z.number().int().min(1).max(730).optional(),
        language: z.string().max(5).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let prompt = input.content;

      if (input.sinceDays) {
        const since = dayjs().subtract(input.sinceDays, "day").format("YYYY-MM-DD");
        prompt += `\n\n[TIME CONSTRAINT: Focus ONLY on information from ${since} onward (last ${input.sinceDays} day${input.sinceDays > 1 ? "s" : ""}). Discard outdated sources. Prioritize the most recent developments.]`;
      }

      const signal = await ctx.db.signal.create({
        data: {
          title: input.content.slice(0, 120).trim(),
          prompt: input.content,
        },
      });

      void generateAnalysis(String(signal.id), prompt, {
        language: input.language,
      });

      return { id: signal.id };
    }),

  /** Idempotent: find existing signal by URL or create + start generation. */
  findOrCreateByUrl: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ ctx, input }) => {
      const existing = await ctx.db.signal.findUnique({
        where: { sourceUrl: input.url },
      });

      if (existing) return { id: existing.id };

      try {
        const signal = await ctx.db.signal.create({
          data: {
            title: input.url,
            prompt: input.url,
            sourceUrl: input.url,
          },
        });

        void generateAnalysis(String(signal.id), input.url, { fast: true });

        return { id: signal.id };
      } catch (e) {
        // Race condition: another request created it first
        if (
          typeof e === "object" &&
          e !== null &&
          "code" in e &&
          (e as { code: string }).code === "P2002"
        ) {
          const signal = await ctx.db.signal.findUniqueOrThrow({
            where: { sourceUrl: input.url },
          });
          return { id: signal.id };
        }
        throw e;
      }
    }),

  /** Get a signal by ID. Returns null data while still generating. */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const signal = await ctx.db.signal.findUniqueOrThrow({
        where: { id: input.id },
      });

      const { data, error } = parseSignalData(signal.data);

      return {
        id: signal.id,
        title: signal.title,
        prompt: signal.prompt,
        createdAt: signal.createdAt,
        data,
        error,
      };
    }),
});
