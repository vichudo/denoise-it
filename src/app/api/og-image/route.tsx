import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

import { clip, describeQuery } from '@/lib/metadata';
import {
  verdictHexColor,
  verdictLabel,
  type AnalysisResult,
} from '@/lib/schemas/analysis';
import { getDomain, parseSignalData } from '@/lib/utils';
import { db } from '@/server/db';
import { withPageTitle } from '@/server/page-title';

export const runtime = 'nodejs';

const SIZE = { width: 1200, height: 630 };

/** Loaded once per instance: every preview uses the same two weights. */
let fontsPromise: Promise<[ArrayBuffer, ArrayBuffer]> | undefined;

const loadFont = (url: string) => fetch(url).then((res) => res.arrayBuffer());

function loadFonts() {
  fontsPromise ??= Promise.all([
    loadFont(
      'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
    ),
    loadFont(
      'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
    ),
  ]).catch((error: unknown) => {
    // Don't pin a failed download: the next request tries again.
    fontsPromise = undefined;
    throw error;
  });
  return fontsPromise;
}

async function render(card: React.ReactElement, cacheControl: string) {
  const [interRegular, interBold] = await loadFonts();
  return new ImageResponse(card, {
    ...SIZE,
    fonts: [
      { name: 'Inter', data: interBold, weight: 700 },
      { name: 'Inter', data: interRegular, weight: 400 },
    ],
    headers: { 'Cache-Control': cacheControl },
  });
}

/* ── Shared pieces ────────────────────────────────────────── */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#09090b',
        color: '#fafafa',
        fontFamily: 'Inter',
        padding: '56px 72px',
      }}
    >
      {children}
    </div>
  );
}

function TopBar({ domain }: { domain: string | null }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#a1a1aa',
        }}
      >
        denoiseit
      </div>
      {domain && (
        <div style={{ display: 'flex', fontSize: 17, color: '#52525b' }}>
          {domain}
        </div>
      )}
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          padding: '5px 16px',
          borderRadius: 9999,
          backgroundColor: `${color}18`,
          border: `1.5px solid ${color}40`,
          color,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Cards ────────────────────────────────────────────────── */

/** Shown until there is a verdict: what is being checked, not a spinner. */
function QueryCard({
  query,
  domain,
}: {
  query: string;
  domain: string | null;
}) {
  const text = clip(query, 170);
  // Short questions get poster-sized type; long claims shrink to stay legible.
  let fontSize = 42;
  if (text.length <= 60) fontSize = 64;
  else if (text.length <= 110) fontSize = 52;

  return (
    <Frame>
      <TopBar domain={domain} />
      <Pill label="FACT-CHECK" color="#a1a1aa" />
      <div
        style={{
          display: 'flex',
          fontSize,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.025em',
          maxWidth: 1040,
        }}
      >
        “{text}”
      </div>
      <div style={{ display: 'flex', flex: 1 }} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 20,
          color: '#71717a',
        }}
      >
        <span>Verifiable signal vs. noise, with sources</span>
        <span style={{ color: '#52525b' }}>denoiseit.com</span>
      </div>
    </Frame>
  );
}

function VerdictCard({
  data,
  query,
  domain,
}: {
  data: AnalysisResult;
  query: string;
  domain: string | null;
}) {
  const color = verdictHexColor[data.verdict];

  return (
    <Frame>
      <TopBar domain={domain} />

      <div
        style={{
          display: 'flex',
          fontSize: 20,
          color: '#71717a',
          marginBottom: 18,
          maxWidth: 1040,
        }}
      >
        “{clip(query, 95)}”
      </div>

      <Pill label={verdictLabel[data.verdict]} color={color} />

      <div
        style={{
          display: 'flex',
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: '-0.025em',
          marginBottom: 18,
          maxWidth: 1000,
        }}
      >
        {clip(data.verdictHeadline, 110)}
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 22,
          color: '#a1a1aa',
          lineHeight: 1.5,
          maxWidth: 1040,
        }}
      >
        {clip(data.summary, 170)}
      </div>

      <div style={{ display: 'flex', flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color }}>
            {data.signalScore}
          </span>
          <span style={{ fontSize: 16, color: '#52525b' }}>/100</span>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            height: 6,
            backgroundColor: '#18181b',
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${data.signalScore}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: 9999,
            }}
          />
        </div>
        <span style={{ fontSize: 14, color: '#3f3f46' }}>signal</span>
      </div>
    </Frame>
  );
}

/* ── Route ────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const signal = await db.signal.findUnique({ where: { id } });
  if (!signal) {
    return new Response('Not found', { status: 404 });
  }

  // Crawlers carry no session, so a private signal never gets past the brand.
  if (signal.privacy === 'PRIVATE') {
    return render(
      <QueryCard query="Private analysis" domain={null} />,
      'public, max-age=3600',
    );
  }

  const { data } = parseSignalData(signal.data);
  const query = describeQuery(await withPageTitle(signal));
  const domain = signal.sourceUrl ? getDomain(signal.sourceUrl) : null;

  if (!data) {
    // Short-lived: the same URL is re-requested until the verdict lands.
    return render(
      <QueryCard query={query} domain={domain} />,
      'public, max-age=60, s-maxage=60',
    );
  }

  // A result never changes, and metadata versions the URL with `v`, so a
  // versioned request can be cached for good.
  const versioned = req.nextUrl.searchParams.has('v');
  return render(
    <VerdictCard data={data} query={query} domain={domain} />,
    versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
  );
}
