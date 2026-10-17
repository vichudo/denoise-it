import { APICallError, RetryError } from 'ai';
import { FatalError, RetryableError } from 'workflow';

import type { AnalysisResult } from '@/lib/schemas/analysis';
import { db } from '@/server/db';

import { getAnalysisAgent, type AnalysisProvider } from './agents';
import { GENERATION_FAILED_MESSAGE } from './status';

/**
 * Longest a single provider attempt may run. Each step runs in its own function
 * invocation, so this only has to fit inside one function's max duration, not
 * share it with the other attempts.
 */
const ATTEMPT_TIMEOUT_MS = 210_000;

/** Provider errors worth another go once the SDK's own quick retries gave up. */
function isTransient(error: unknown) {
  if (RetryError.isInstance(error)) return true;
  return APICallError.isInstance(error) && error.isRetryable;
}

/** Runs one provider's agent to a complete, schema-valid analysis. */
export async function runAnalysisAttempt(
  provider: AnalysisProvider,
  prompt: string,
  fast: boolean,
): Promise<AnalysisResult> {
  'use step';

  try {
    const { output } = await getAnalysisAgent(provider, fast).generate({
      prompt,
      timeout: { totalMs: ATTEMPT_TIMEOUT_MS },
    });
    return output;
  } catch (error) {
    console.error(`[analysis] ${provider} attempt failed:`, error);
    // An overloaded or rate-limited provider often recovers within seconds.
    if (isTransient(error)) {
      throw new RetryableError(`${provider} is unavailable`, {
        retryAfter: '15s',
      });
    }
    // Bad credentials, exhausted credits, a timeout or output that never
    // parsed fail the same way on a rerun, so hand over to the next provider.
    throw new FatalError(
      `${provider} attempt failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
runAnalysisAttempt.maxRetries = 1;

export async function saveAnalysis(id: string, output: AnalysisResult) {
  'use step';

  await db.signal.update({
    where: { id },
    // A JSON round-trip, not a clone: it drops `undefined` and anything else a
    // Json column cannot store.
    // oxlint-disable-next-line unicorn/prefer-structured-clone
    data: { data: JSON.parse(JSON.stringify(output)) as object },
  });
}

export async function recordAnalysisFailure(id: string) {
  'use step';

  await db.signal.update({
    where: { id },
    data: { data: { error: GENERATION_FAILED_MESSAGE } },
  });
}
