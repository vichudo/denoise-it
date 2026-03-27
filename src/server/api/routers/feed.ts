import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { feedPreferencesInputSchema } from "@/lib/schemas/feed";
import { generateFeed } from "@/server/feed/generate";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const feedRouter = createTRPCRouter({
  /** Get the current user's feed preferences, or null if not configured. */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.feedPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });
  }),

  /** Create or update feed preferences. */
  savePreferences: protectedProcedure
    .input(feedPreferencesInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Strip @ prefix from handles for consistency
      const xAccounts = input.xAccounts.map((a) => a.replace(/^@/, ""));

      return ctx.db.feedPreferences.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          ...input,
          xAccounts,
          userId: ctx.session.user.id,
        },
        update: {
          ...input,
          xAccounts,
        },
      });
    }),

  /** Paginated feed items for the current user, newest first. */
  items: protectedProcedure
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

      const items = await ctx.db.feedItem.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop()!;
        nextCursor = next.id;
      }

      return { items, nextCursor };
    }),

  /** Trigger a feed refresh. Fire-and-forget generation. */
  refresh: protectedProcedure.mutation(async ({ ctx }) => {
    const prefs = await ctx.db.feedPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!prefs) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Configure your feed preferences first.",
      });
    }

    if (prefs.generatingBatchId) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A feed generation is already in progress.",
      });
    }

    void generateFeed(ctx.session.user.id, {
      topics: prefs.topics,
      xAccounts: prefs.xAccounts,
      communicationStyle: prefs.communicationStyle,
      affectiveLevel: prefs.affectiveLevel,
      language: prefs.language,
      additionalInstructions: prefs.additionalInstructions,
    });

    return { status: "generating" as const };
  }),

  /** Check if a feed generation is currently in progress. */
  status: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.db.feedPreferences.findUnique({
      where: { userId: ctx.session.user.id },
      select: { generatingBatchId: true },
    });

    return { generating: prefs?.generatingBatchId != null };
  }),
});
