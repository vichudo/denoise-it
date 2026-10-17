import type { AnalysisResult } from '@/lib/schemas/analysis';

import type { AnalysisProvider } from './agents';
import {
  recordAnalysisFailure,
  runAnalysisAttempt,
  saveAnalysis,
} from './steps';

/**
 * Durable analysis run for one signal. Each provider attempt is its own step,
 * so a function that dies mid-generation is re-run instead of stranding the
 * signal, and every outcome ends in a write the client can poll for.
 */
export async function analyzeSignal(
  id: string,
  prompt: string,
  providers: AnalysisProvider[],
  fast: boolean,
) {
  'use workflow';

  let output: AnalysisResult | undefined;

  // Providers are tried one after another: an attempt only runs once the
  // previous one has failed.
  /* oxlint-disable eslint/no-await-in-loop */
  for (const provider of providers) {
    try {
      output = await runAnalysisAttempt(provider, prompt, fast);
      break;
    } catch {
      // Logged by the step. The next provider is a genuinely different code
      // path, so a model that won't emit parseable output is often rescued.
    }
  }
  /* oxlint-enable eslint/no-await-in-loop */

  // Saving is outside the attempt loop on purpose: a database error is not
  // something another provider can fix, and re-running the model would just
  // burn tokens.
  if (output) {
    await saveAnalysis(id, output);
  } else {
    await recordAnalysisFailure(id);
  }
}
