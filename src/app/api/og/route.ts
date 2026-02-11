import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ title: null }, { status: 400 });
  }

  try {
    new URL(url); // validate
  } catch {
    return NextResponse.json({ title: null }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "bot",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(4000),
      redirect: "follow",
    });

    if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
      return NextResponse.json({ title: null });
    }

    // Stream only the first chunk — title is always in <head>
    const reader = res.body?.getReader();
    if (!reader) return NextResponse.json({ title: null });

    const decoder = new TextDecoder();
    let html = "";
    const maxBytes = 16_384; // 16 KB is plenty for <head>

    while (html.length < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });

      // Stop early once we've passed </head>
      if (html.includes("</head>")) break;
    }
    reader.cancel().catch(() => {});

    // Try og:title first, then <title>
    const ogMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    ) ??
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
      );

    if (ogMatch?.[1]) {
      return NextResponse.json(
        { title: decodeEntities(ogMatch[1]) },
        { headers: { "Cache-Control": "public, max-age=86400" } },
      );
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) {
      return NextResponse.json(
        { title: decodeEntities(titleMatch[1].trim()) },
        { headers: { "Cache-Control": "public, max-age=86400" } },
      );
    }

    return NextResponse.json({ title: null });
  } catch {
    return NextResponse.json({ title: null });
  }
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) =>
      String.fromCharCode(Number(n)),
    );
}
