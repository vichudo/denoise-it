/**
 * How long a signal may sit with no result before we call it dead. Every
 * handled failure is recorded explicitly by the workflow, so this is only the
 * safety net for a run that never got to record anything. It has to clear the
 * slowest legitimate run: two provider attempts plus a retry of each.
 */
export const STALE_ANALYSIS_MS = 12 * 60_000;

export const GENERATION_FAILED_MESSAGE =
  "We couldn't complete this analysis. Try again — it usually works on a second pass.";

export const GENERATION_TIMED_OUT_MESSAGE =
  'This analysis timed out before it finished. Try again.';
