import { type Metadata } from "next";

import type { AnalysisResult } from "@/lib/schemas/analysis";

/** Build OG + Twitter metadata for a signal page. */
export function buildSignalMetadata(
  id: string,
  data: AnalysisResult | null,
  fallbackTitle: string,
  fallbackDescription: string,
): Metadata {
  const title = data
    ? `${data.verdictHeadline} — Denoise It`
    : `${fallbackTitle} — Denoise It`;

  const description = data?.summary ?? fallbackDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/api/og-image?id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og-image?id=${id}`],
    },
  };
}
