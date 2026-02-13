import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const followupRouter = createTRPCRouter({
  /** List all follow-ups for a signal (metadata only, no messages blob). */
  list: publicProcedure
    .input(z.object({ signalId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.followUps.findMany({
        where: { signalId: input.signalId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  /** Get a single follow-up with messages. */
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.followUps.findUniqueOrThrow({
        where: { id: input.id },
      });
    }),

  /** Create an empty follow-up linked to a signal. */
  create: publicProcedure
    .input(z.object({ signalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const followUp = await ctx.db.followUps.create({
        data: { signalId: input.signalId },
      });
      return { id: followUp.id };
    }),

  /** Update messages JSON and optional title. */
  saveMessages: publicProcedure
    .input(
      z.object({
        id: z.number(),
        messages: z.unknown(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.followUps.update({
        where: { id: input.id },
        data: {
          messages: input.messages as Parameters<
            typeof ctx.db.followUps.update
          >[0]["data"]["messages"],
          ...(input.title !== undefined ? { title: input.title } : {}),
        },
      });
    }),
});
