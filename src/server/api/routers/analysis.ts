import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";

import { parseSignalData } from "@/lib/utils";
import { generateAnalysis } from "@/server/analysis/generate";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Prisma } from "generated/prisma";

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
          userId: ctx.session?.user?.id,
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
            userId: ctx.session?.user?.id,
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

  /** Public feed of completed signals, newest first, with cursor pagination. */
  latest: publicProcedure
    .input(
      z
        .object({
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const signals = await ctx.db.signal.findMany({
        where: {
          privacy: "PUBLIC",
          NOT: { data: { equals: Prisma.JsonNull } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        include: {
          _count: { select: { followUps: true } },
          user: { select: { name: true, image: true } },
        },
      });

      let nextCursor: string | undefined;
      if (signals.length > limit) {
        const next = signals.pop()!;
        nextCursor = next.id;
      }

      const items = [];
      for (const signal of signals) {
        const { data } = parseSignalData(signal.data);
        if (!data) continue;
        items.push({
          id: signal.id,
          title: signal.title,
          sourceUrl: signal.sourceUrl,
          createdAt: signal.createdAt,
          followUpCount: signal._count.followUps,
          verdict: data.verdict,
          verdictHeadline: data.verdictHeadline,
          signalScore: data.signalScore,
          contentType: data.contentType,
          summary: data.summary,
          signalCount: data.signals.length,
          noiseCount: data.noise.length,
          user: signal.user
            ? { name: signal.user.name, image: signal.user.image }
            : null,
        });
      }

      return { items, nextCursor };
    }),

  /** Get a signal by ID. Returns null data while still generating. */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const signal = await ctx.db.signal.findUniqueOrThrow({
        where: { id: input.id },
      });

      // Private signals are only visible to their owner
      if (
        signal.privacy === "PRIVATE" &&
        signal.userId !== ctx.session?.user?.id
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

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
