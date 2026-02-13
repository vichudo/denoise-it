import { ToolLoopAgent, Output, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import dayjs from "dayjs";
import { z } from "zod";

import { analysisResultSchema } from "@/lib/schemas/analysis";
import { parseSignalData } from "@/lib/utils";
import { env } from "@/env";
import { db } from "@/server/db";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const ANALYSIS_INSTRUCTIONS = `You are a precision fact-checking agent. Your job: separate SIGNAL from NOISE in any content.

SIGNAL = independently verifiable, objective units of information. Each signal element must stand alone as a factual statement with all emotional, narrative, and rhetorical framing removed.

NOISE = everything that distorts signal — emotional language, bias, narrative framing, sensationalism, opinions presented as facts, speculation, and critical missing context.

## Process

1. VERDICT: Determine the overall truth status of the content. Use 'mixed' only when claims genuinely split with no dominant direction.

2. VERDICT HEADLINE: One punchy definitive sentence, max 12 words. First thing users see. E.g. "This claim is demonstrably false." or "Confirmed by multiple primary sources."

3. SUMMARY: Dense, scientific-abstract paragraph (3-5 sentences). ONLY facts, numbers, dates, entity names. Zero hedging, zero filler. If the user asks a question, ANSWER IT FIRST with precise data, then provide supporting context.

4. EXTRACT SIGNALS: For each distinct verifiable claim in the content:
   - Strip ALL affective language. Write it as pure objective information.
   - Categorize: fact (verified claim), statistic (quantitative data), attribution (from named source), context (verified background), event (confirmed occurrence)
   - Score confidence 0-100 based on SOURCE CREDIBILITY:
     * .gov, .edu, peer-reviewed journals, official records → high confidence
     * Major wire services (AP, Reuters) with primary sourcing → high confidence
     * News articles aggregating other news → medium confidence
     * Viral/social media without primary backing → low confidence
     * Wikipedia as sole source → low confidence (potential bias, recent edits)
   - Provide actual clickable source URLs from your web search

5. EXTRACT NOISE: For each piece of affective distortion:
   - Quote the original text fragment
   - Classify: emotional_language, bias, narrative, sensationalism, opinion_as_fact, speculation, missing_context, media_amplification
   - Explain precisely why it's noise and how it distorts the signal
   - Provide source URLs: for missing_context link to what was omitted, for media_amplification link to outlets amplifying without primary backing, for bias/narrative link to counter-evidence

6. SIGNAL SCORE: Compute 0-100 ratio of verified signal to total content.

Be rigorous. Commit to assessments. Never hedge when evidence is clear.`;

const analysisOutput = Output.object({ schema: analysisResultSchema });

/** Default agent — thorough analysis for text input */
const agent = new ToolLoopAgent({
  model: openrouter.chat("x-ai/grok-4.1-fast:online"),
  instructions: ANALYSIS_INSTRUCTIONS,
  output: analysisOutput,
  stopWhen: stepCountIs(3),
});

/** Fast agent — optimized for link mode where crawlers are waiting */
const fastAgent = new ToolLoopAgent({
  model: openrouter.chat("x-ai/grok-4.1-fast:online"),
  instructions: ANALYSIS_INSTRUCTIONS,
  output: analysisOutput,
  stopWhen: stepCountIs(2),
});

/** Fire-and-forget background generation */
async function generateAnalysis(
  id: string,
  content: string,
  useAgent: typeof agent = agent,
) {
  try {
    const result = await useAgent.generate({ prompt: content });
    await db.signal.update({
      where: { id },
      data: { data: JSON.parse(JSON.stringify(result.output)) },
    });
  } catch (error) {
    console.error(`[analysis] generation failed for ${id}:`, error);
    await db.signal.update({
      where: { id },
      data: {
        data: JSON.parse(JSON.stringify({ error: "Generation failed. Please try again." })),
      },
    });
  }
}

export const analysisRouter = createTRPCRouter({
  /** Create a signal record and start background generation. Returns the ID immediately. */
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(10000),
        sinceDays: z.number().int().min(1).max(730).optional(),
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
          prompt,
        },
      });

      // Fire and forget — generation runs in background
      void generateAnalysis(String(signal.id), prompt);

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

        void generateAnalysis(String(signal.id), input.url, fastAgent);

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
