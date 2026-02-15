import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { parseSignalData } from "@/lib/utils";

const privacySchema = z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]);

export const userRouter = createTRPCRouter({
  /** Get all signals for the logged-in user, newest first. */
  signals: protectedProcedure.query(async ({ ctx }) => {
    const signals = await ctx.db.signal.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { followUps: true } },
      },
    });

    return signals.map((signal) => {
      const { data, error } = parseSignalData(signal.data);
      return {
        id: signal.id,
        title: signal.title,
        sourceUrl: signal.sourceUrl,
        createdAt: signal.createdAt,
        privacy: signal.privacy,
        followUpCount: signal._count.followUps,
        verdict: data?.verdict ?? null,
        verdictHeadline: data?.verdictHeadline ?? null,
        signalScore: data?.signalScore ?? null,
        pending: data === null && error === null,
        error,
      };
    });
  }),

  /** Delete a signal owned by the current user. */
  deleteSignal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.signal.deleteMany({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { success: true };
    }),

  /** Update the privacy setting for a signal owned by the current user. */
  updatePrivacy: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        privacy: privacySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.signal.updateMany({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { privacy: input.privacy },
      });
      return { success: true };
    }),
});
