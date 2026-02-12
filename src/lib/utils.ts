import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { AnalysisResult } from "@/lib/schemas/analysis"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Parse raw signal JSON into typed data + error. Shared by tRPC and OG image route. */
export function parseSignalData(raw: unknown): {
  data: AnalysisResult | null;
  error: string | null;
} {
  if (raw === null || raw === undefined) return { data: null, error: null };
  if (typeof raw === "object" && "error" in (raw as Record<string, unknown>)) {
    return { data: null, error: String((raw as Record<string, unknown>).error) };
  }
  return { data: raw as AnalysisResult, error: null };
}
