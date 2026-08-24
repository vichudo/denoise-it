import { getLanguageName } from "@/lib/constants";
import { db } from "@/server/db";
import { pickAttempts } from "./agents";

/** Longest a single provider attempt may run before we give up on it. */
const ATTEMPT_TIMEOUT_MS = 140_000;

/**
 * Total wall clock across every attempt. Generation runs in an `after()`
 * callback, so it shares the route's 300s function budget — overrun it and the
 * platform kills the invocation before anything is written to the database.
 */
const TOTAL_BUDGET_MS = 270_000;

/** How long a signal may sit with no result before we call it dead. */
export const STALE_ANALYSIS_MS = 330_000;

export const GENERATION_FAILED_MESSAGE =
  "We couldn't complete this analysis. Try again — it usually works on a second pass.";

export const GENERATION_TIMED_OUT_MESSAGE =
  "This analysis timed out before it finished. Try again.";

/** Marks a signal as failed. Never throws — a failed write must not mask the cause. */
export async function markAnalysisFailed(id: string, error: string) {
  try {
    await db.signal.update({ where: { id }, data: { data: { error } } });
  } catch (dbError) {
    console.error(`[analysis] could not record failure for ${id}:`, dbError);
  }
}

export async function generateAnalysis(
  id: string,
  content: string,
  options?: { fast?: boolean; language?: string },
) {
  let prompt = content;

  if (options?.language && options.language !== "en") {
    const langName = getLanguageName(options.language);
    prompt += `\n\n[LANGUAGE INSTRUCTION: Respond entirely in ${langName} (${options.language}). All output — verdict, headline, summary, signal descriptions, noise explanations — must be in ${langName}. Keep quoted noise fragments in their original language.]`;
  }

  const attempts = pickAttempts(content, options?.fast);
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (const [index, { label, agent }] of attempts.entries()) {
    const isLast = index === attempts.length - 1;
    // Never start an attempt that cannot finish, and never let one run past the
    // shared budget: a fallback that gets killed mid-flight is worse than one
    // that is skipped, because the failure never gets recorded.
    const remaining = Math.min(ATTEMPT_TIMEOUT_MS, deadline - Date.now());
    if (remaining <= 0) {
      await markAnalysisFailed(id, GENERATION_TIMED_OUT_MESSAGE);
      return;
    }

    let output: unknown;

    try {
      const result = await agent.generate({
        prompt,
        timeout: { totalMs: remaining },
      });
      output = result.output;
    } catch (error) {
      console.error(
        `[analysis] ${label} attempt ${index + 1}/${attempts.length} failed for ${id}:`,
        error,
      );
      // Keep going: the next provider is a genuinely different code path, so a
      // model that won't emit parseable output is often rescued by the fallback.
      if (isLast) {
        await markAnalysisFailed(id, GENERATION_FAILED_MESSAGE);
      }
      continue;
    }

    // Outside the retry loop on purpose: a database error here is not something
    // another provider can fix, and re-running the model would just burn tokens.
    try {
      await db.signal.update({
        where: { id },
        data: { data: JSON.parse(JSON.stringify(output)) as object },
      });
    } catch (dbError) {
      console.error(`[analysis] could not save result for ${id}:`, dbError);
    }
    return;
  }
}
