import { type NextRequest, NextResponse } from 'next/server';

import { fetchPageTitle } from '@/server/page-title';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ title: null }, { status: 400 });
  }

  if (!URL.canParse(url)) {
    return NextResponse.json({ title: null }, { status: 400 });
  }

  const title = await fetchPageTitle(url);
  if (!title) return NextResponse.json({ title: null });

  return NextResponse.json(
    { title },
    { headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
