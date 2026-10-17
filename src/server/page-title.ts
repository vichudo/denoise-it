import 'server-only';
import { linkTarget, type SignalPreview } from '@/lib/metadata';

// Apps that stream their metadata (Next.js among them) emit <title> after the
// <head>, behind a run of preload tags, so the cutoff has to reach past it.
const MAX_SCAN_BYTES = 65_536;

const TITLE_PATTERNS = [
  /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
  /<title[^>]*>([^<]+)<\/title>/i,
];

function findTitle(html: string) {
  for (const pattern of TITLE_PATTERNS) {
    const match = pattern.exec(html)?.[1]?.trim();
    if (match) return decodeEntities(match);
  }
  return null;
}

/**
 * Reads a page's `og:title` (or `<title>`) from the start of its HTML. Returns
 * null on any failure: callers always have a fallback label.
 */
export async function fetchPageTitle(url: string, timeoutMs = 4000) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DenoiseItBot/1.0)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });

    if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) {
      return null;
    }

    // Stream only the first chunks — the title is near the top
    const reader = res.body?.getReader();
    if (!reader) return null;

    const decoder = new TextDecoder();
    let html = '';
    let title: string | null = null;

    while (html.length < MAX_SCAN_BYTES) {
      // Chunks arrive in order: each read depends on the previous one.
      // oxlint-disable-next-line eslint/no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });

      // og:title lives in <head>, so once it has closed the best is in hand.
      title = findTitle(html);
      if (title && html.includes('</head>')) break;
    }
    void reader.cancel();

    return title;
  } catch {
    return null;
  }
}

/**
 * Adds the linked page's title to a signal that is only a link, so its preview
 * can say what the page is. Kept short: crawlers are waiting on it.
 */
export async function withPageTitle<
  T extends Pick<SignalPreview, 'prompt' | 'sourceUrl'>,
>(signal: T): Promise<T & { pageTitle: string | null }> {
  const url = linkTarget(signal);
  return { ...signal, pageTitle: url ? await fetchPageTitle(url, 2500) : null };
}

function decodeEntities(str: string): string {
  return str
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replaceAll(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
}
