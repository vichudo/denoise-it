import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { parseSignalData } from "@/lib/utils";

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
        followUpCount: signal._count.followUps,
        verdict: data?.verdict ?? null,
        verdictHeadline: data?.verdictHeadline ?? null,
        signalScore: data?.signalScore ?? null,
        pending: data === null && error === null,
        error,
      };
    });
  }),
});
