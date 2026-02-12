import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

import { db } from "@/server/db";
import { verdictHexColor, verdictLabel } from "@/lib/schemas/analysis";
import { getDomain, parseSignalData } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const signal = await db.signal.findUnique({ where: { id } });
  if (!signal) {
    return new Response("Not found", { status: 404 });
  }

  const { data } = parseSignalData(signal.data);
  const domain = signal.sourceUrl ? getDomain(String(signal.sourceUrl)) : null;

  const [interRegular, interBold] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    ).then((res) => res.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
    ).then((res) => res.arrayBuffer()),
  ]);

  if (!data) {
    // Analyzing state
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#09090b",
            color: "#fafafa",
            fontFamily: "Inter",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 32,
            }}
          >
            denoiseit
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#1c1c1e",
              borderRadius: 9999,
              padding: "10px 24px",
              fontSize: 20,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: "#fbbf24",
              }}
            />
            Analyzing...
          </div>
          {domain && (
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 18,
                color: "#71717a",
              }}
            >
              {domain}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Inter", data: interBold, weight: 700 },
          { name: "Inter", data: interRegular, weight: 400 },
        ],
        headers: { "Cache-Control": "public, max-age=30" },
      },
    );
  }

  // Complete state
  const verdictColor = verdictHexColor[data.verdict];
  const verdict = verdictLabel[data.verdict];
  const summary =
    data.summary.length > 240
      ? data.summary.slice(0, 237) + "..."
      : data.summary;
  const scorePercent = data.signalScore;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily: "Inter",
          padding: "56px 72px",
        }}
      >
        {/* Top bar: logo + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#a1a1aa",
            }}
          >
            denoiseit
          </div>
          {domain && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 17,
                color: "#52525b",
              }}
            >
              {domain}
            </div>
          )}
        </div>

        {/* Verdict pill */}
        <div style={{ display: "flex", marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "5px 16px",
              borderRadius: 9999,
              backgroundColor: verdictColor + "18",
              border: `1.5px solid ${verdictColor}40`,
              color: verdictColor,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {verdict}
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 46,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            marginBottom: 18,
            maxWidth: 950,
            color: "#fafafa",
          }}
        >
          {data.verdictHeadline}
        </div>

        {/* Summary */}
        <div
          style={{
            display: "flex",
            fontSize: 19,
            color: "#71717a",
            lineHeight: 1.55,
            maxWidth: 920,
          }}
        >
          {summary}
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Score section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Score number */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: verdictColor,
              }}
            >
              {scorePercent}
            </span>
            <span style={{ fontSize: 16, color: "#52525b", fontWeight: 400 }}>
              /100
            </span>
          </div>

          {/* Bar */}
          <div
            style={{
              display: "flex",
              flex: 1,
              height: 6,
              backgroundColor: "#18181b",
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${scorePercent}%`,
                height: "100%",
                backgroundColor: verdictColor,
                borderRadius: 9999,
              }}
            />
          </div>

          <span style={{ fontSize: 14, color: "#3f3f46", fontWeight: 400 }}>
            signal
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: interBold, weight: 700 },
        { name: "Inter", data: interRegular, weight: 400 },
      ],
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
