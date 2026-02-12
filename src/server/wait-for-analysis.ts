import "server-only";

import { db } from "@/server/db";
import { parseSignalData } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/schemas/analysis";

const POLL_MS = 2_000;
const TIMEOUT_MS = 120_000;

/**
 * Poll the database until a signal's analysis completes (or times out).
 * Used by generateMetadata and OG image route so crawlers get the final result.
 */
export async function waitForAnalysis(
  id: string,
): Promise<{ data: AnalysisResult | null; error: string | null }> {
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    const signal = await db.signal.findUnique({ where: { id } });
    if (!signal) return { data: null, error: "Not found" };

    const result = parseSignalData(signal.data);
    if (result.data || result.error) return result;

    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  return { data: null, error: null };
}
