import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Reconstruct the target URL — browsers/proxies collapse // to /
  const targetUrl = pathname.startsWith('/https:/')
    ? pathname.replace('/https:/', 'https://')
    : pathname.replace('/http:/', 'http://');

  if (!URL.canParse(targetUrl)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/link';
  url.searchParams.set('url', targetUrl);

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/(https?:/.+)'],
};
