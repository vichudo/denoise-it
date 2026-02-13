import { analysisRouter } from "@/server/api/routers/analysis";
import { followupRouter } from "@/server/api/routers/followup";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  analysis: analysisRouter,
  followup: followupRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
