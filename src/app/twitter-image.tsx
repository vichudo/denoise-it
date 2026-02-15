import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const alt = "Denoise It — Strip the noise. See what's real.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public", "denoiseit_logo_rounded.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 50% 35%, #1c1c22 0%, #09090b 65%)",
        }}
      >
        <img
          alt=""
          src={logoSrc}
          width={140}
          height={140}
          style={{ borderRadius: 28 }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 32,
          }}
        >
          <span
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.03em",
            }}
          >
            denoise
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 300,
              color: "#71717a",
              letterSpacing: "-0.03em",
            }}
          >
            it
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            marginTop: 12,
          }}
        >
          Strip the noise. See what&apos;s real.
        </p>
      </div>
    ),
    { ...size },
  );
}
