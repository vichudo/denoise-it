import type { Metadata } from 'next';

import { verdictLabel, type AnalysisResult } from '@/lib/schemas/analysis';
import { getDomain } from '@/lib/utils';

/** The fields of a signal a link preview is built from. */
export interface SignalPreview {
  id: string;
  prompt: string;
  sourceUrl: string | null;
  updatedAt: Date;
  data: AnalysisResult | null;
  /** Title of the linked page, when the signal is just a link. */
  pageTitle?: string | null;
}

/** The URL being checked when the content is nothing but a link. */
export function linkTarget({
  prompt,
  sourceUrl,
}: Pick<SignalPreview, 'prompt' | 'sourceUrl'>) {
  if (sourceUrl) return sourceUrl;
  const trimmed = prompt.trim();
  return URL.canParse(trimmed) ? trimmed : null;
}

/** Collapses whitespace and clips to `max` characters on a word boundary. */
export function clip(text: string, max: number) {
  const flat = text.replaceAll(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * What a preview should call the content being checked: the user's own words,
 * or for a pasted link, the page's title — failing that, where it points
 * (`ign.com/articles/gta-6-delay`).
 */
export function describeQuery(
  signal: Pick<SignalPreview, 'prompt' | 'sourceUrl' | 'pageTitle'>,
) {
  const url = linkTarget(signal);
  if (!url) return signal.prompt;
  if (signal.pageTitle) return signal.pageTitle;

  const { pathname } = new URL(url);
  const path = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  return `${getDomain(url)}${path}`;
}

/**
 * Versioned by `updatedAt`, so once the analysis lands a re-scrape fetches a
 * new image instead of the one cached while it was still running.
 */
export function signalImageUrl({ id, updatedAt }: SignalPreview) {
  return `/api/og-image?id=${id}&v=${updatedAt.getTime()}`;
}

/**
 * Open Graph + Twitter metadata for a signal. A finished analysis leads with
 * its verdict; one still running (or failed) leads with the query, so a link
 * shared straight away still says what it's about.
 */
export function buildSignalMetadata(signal: SignalPreview): Metadata {
  const { data } = signal;
  const query = describeQuery(signal);

  const title = data
    ? `${data.verdictHeadline} — Denoise It`
    : `Fact-check: “${clip(query, 80)}” — Denoise It`;

  const description = data
    ? `${verdictLabel[data.verdict]} · ${data.signalScore}/100 signal. ${clip(data.summary, 220)}`
    : `Is it true? Denoise It separates the verifiable facts from the noise in “${clip(query, 120)}”, with sources for every claim.`;

  const image = signalImageUrl(signal);

  return {
    title,
    description,
    alternates: { canonical: `/s/${signal.id}` },
    openGraph: {
      type: 'article',
      url: `/s/${signal.id}`,
      siteName: 'Denoise It',
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
