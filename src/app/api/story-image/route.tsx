import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

import { db } from "@/server/db";
import {
  verdictHexColor,
  verdictLabel,
  noiseTypeLabel,
  signalCategoryLabel,
  type AnalysisResult,
  type SignalElement,
  type NoiseElement,
} from "@/lib/schemas/analysis";
import { getDomain, parseSignalData } from "@/lib/utils";

export const runtime = "nodejs";

/* ── Font loader ──────────────────────────────────────────── */

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
    ).then((r) => r.arrayBuffer()),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400 as const },
    { name: "Inter", data: bold, weight: 700 as const },
  ];
}

/* ── Shared components ────────────────────────────────────── */

function BrandFooter() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <span
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#3f3f46",
        }}
      >
        denoise it
      </span>
    </div>
  );
}

function StoryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#09090b",
        color: "#fafafa",
        fontFamily: "Inter",
        padding: "100px 80px 80px",
      }}
    >
      {children}
    </div>
  );
}

function SourcesList({ sources }: { sources: string[] }) {
  if (sources.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        justifyContent: "center",
      }}
    >
      {sources.slice(0, 4).map((url) => (
        <span
          key={url}
          style={{
            fontSize: 22,
            color: "#52525b",
            backgroundColor: "#18181b",
            padding: "8px 20px",
            borderRadius: 9999,
          }}
        >
          {getDomain(url)}
        </span>
      ))}
    </div>
  );
}

/* ── Story templates ──────────────────────────────────────── */

function VerdictStory({ data }: { data: AnalysisResult }) {
  const color = verdictHexColor[data.verdict];
  const summary =
    data.summary.length > 180
      ? data.summary.slice(0, 177) + "..."
      : data.summary;
  return (
    <StoryWrapper>
      {/* Top spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      {/* Centered content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 40,
        }}
      >
        {/* Verdict pill */}
        <div
          style={{
            display: "flex",
            padding: "14px 36px",
            borderRadius: 9999,
            backgroundColor: color + "18",
            border: `2px solid ${color}40`,
            color: color,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          {verdictLabel[data.verdict]}
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#fafafa",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {data.verdictHeadline}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: 80,
            height: 3,
            backgroundColor: color + "60",
            borderRadius: 9999,
          }}
        />

        {/* Summary */}
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#a1a1aa",
            lineHeight: 1.55,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {summary}
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      {/* Score bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 48,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 52, fontWeight: 700, color }}>
            {data.signalScore}
          </span>
          <span style={{ fontSize: 22, color: "#52525b" }}>/100</span>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            height: 10,
            backgroundColor: "#18181b",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${data.signalScore}%`,
              height: "100%",
              backgroundColor: color,
              borderRadius: 9999,
            }}
          />
        </div>
        <span style={{ fontSize: 20, color: "#3f3f46" }}>signal</span>
      </div>

      <BrandFooter />
    </StoryWrapper>
  );
}

function AnalysisStory({ data }: { data: AnalysisResult }) {
  const color = verdictHexColor[data.verdict];
  return (
    <StoryWrapper>
      {/* Top spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      {/* Centered content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 48,
        }}
      >
        {/* Label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#52525b",
            }}
          >
            ANALYSIS
          </span>
          <span style={{ fontSize: 24, color: "#71717a" }}>
            {data.contentType}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: 60,
            height: 2,
            backgroundColor: "#27272a",
            borderRadius: 9999,
          }}
        />

        {/* Summary */}
        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: "#d4d4d8",
            lineHeight: 1.6,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {data.summary}
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      {/* Score bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 48,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 52, fontWeight: 700, color }}>
            {data.signalScore}
          </span>
          <span style={{ fontSize: 22, color: "#52525b" }}>/100</span>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            height: 10,
            backgroundColor: "#18181b",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${data.signalScore}%`,
              height: "100%",
              backgroundColor: color,
              borderRadius: 9999,
            }}
          />
        </div>
        <span style={{ fontSize: 20, color: "#3f3f46" }}>signal</span>
      </div>

      <BrandFooter />
    </StoryWrapper>
  );
}

function confidenceHex(c: number): string {
  if (c >= 80) return "#34d399";
  if (c >= 50) return "#fbbf24";
  return "#fb923c";
}

function SignalStory({
  signal,
  index,
}: {
  signal: SignalElement;
  index: number;
}) {
  const color = confidenceHex(signal.confidence);
  return (
    <StoryWrapper>
      {/* Top spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      {/* Centered content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 48,
        }}
      >
        {/* Category badge */}
        <div
          style={{
            display: "flex",
            padding: "10px 28px",
            borderRadius: 9999,
            backgroundColor: "#18181b",
            border: "1.5px solid #27272a",
            color: "#a1a1aa",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          SIGNAL #{index + 1} · {signalCategoryLabel[signal.category].toUpperCase()}
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            fontSize: 42,
            color: "#e4e4e7",
            lineHeight: 1.55,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {signal.content}
        </div>

        {/* Confidence */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 700, color }}>
            {signal.confidence}
          </span>
          <span style={{ fontSize: 28, color: "#52525b", fontWeight: 400 }}>
            / 100
          </span>
        </div>

        {/* Sources */}
        <SourcesList sources={signal.sources} />
      </div>

      {/* Bottom spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      <BrandFooter />
    </StoryWrapper>
  );
}

function NoiseStory({
  noise,
  index,
}: {
  noise: NoiseElement;
  index: number;
}) {
  return (
    <StoryWrapper>
      {/* Top spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      {/* Centered content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 48,
        }}
      >
        {/* Type badge */}
        <div
          style={{
            display: "flex",
            padding: "10px 28px",
            borderRadius: 9999,
            backgroundColor: "#f8717118",
            border: "1.5px solid #f8717140",
            color: "#f87171",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          NOISE #{index + 1} · {noiseTypeLabel[noise.type].toUpperCase()}
        </div>

        {/* Original quote */}
        <div
          style={{
            display: "flex",
            fontSize: 44,
            color: "#e4e4e7",
            lineHeight: 1.5,
            fontStyle: "italic",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          &ldquo;{noise.original}&rdquo;
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: 60,
            height: 2,
            backgroundColor: "#f8717130",
            borderRadius: 9999,
          }}
        />

        {/* Reason */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a1a1aa",
            lineHeight: 1.6,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {noise.reason}
        </div>

        {/* Sources */}
        <SourcesList sources={noise.sources} />
      </div>

      {/* Bottom spacer */}
      <div style={{ display: "flex", flex: 1 }} />

      <BrandFooter />
    </StoryWrapper>
  );
}

/* ── Route handler ────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const indexStr = searchParams.get("index");

  if (!id || !type) {
    return new Response("Missing id or type", { status: 400 });
  }

  const signal = await db.signal.findUnique({ where: { id } });
  if (!signal) {
    return new Response("Not found", { status: 404 });
  }

  const { data } = parseSignalData(signal.data);
  if (!data) {
    return new Response("Analysis not ready", { status: 404 });
  }

  const index = indexStr ? parseInt(indexStr, 10) : 0;
  const fonts = await loadFonts();

  let element: React.ReactElement;

  switch (type) {
    case "verdict":
      element = <VerdictStory data={data} />;
      break;
    case "analysis":
      element = <AnalysisStory data={data} />;
      break;
    case "signal": {
      const s = data.signals[index];
      if (!s) return new Response("Signal index out of range", { status: 400 });
      element = <SignalStory signal={s} index={index} />;
      break;
    }
    case "noise": {
      const n = data.noise[index];
      if (!n) return new Response("Noise index out of range", { status: 400 });
      element = <NoiseStory noise={n} index={index} />;
      break;
    }
    default:
      return new Response("Invalid type", { status: 400 });
  }

  return new ImageResponse(element, {
    width: 1080,
    height: 1920,
    fonts,
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
