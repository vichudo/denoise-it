'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  ExternalLink,
  Loader2,
  MessageCircle,
  Signal,
  Zap,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { verdictLabel } from '@/lib/schemas/analysis';
import type { Verdict } from '@/lib/schemas/analysis';
import { getDomain } from '@/lib/utils';
import {
  verdictIcon,
  verdictColor,
  verdictBg,
  verdictBorder,
} from '@/lib/verdict';
import { api } from '@/trpc/react';

export function LatestFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.analysis.latest.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  /* ── Infinite scroll sentinel ─────────────────────────────── */
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Signal className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No public signals yet. Be the first to{' '}
          <Link
            href="/"
            className="text-foreground underline underline-offset-4"
          >
            analyze something
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allItems.map((item, i) => (
        <SignalCard key={item.id} item={item} index={i} />
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasNextPage && allItems.length > 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">
          You&apos;ve reached the end.
        </p>
      )}
    </div>
  );
}

/* ── Individual signal card ─────────────────────────────────── */

interface SignalItem {
  id: string;
  title: string;
  sourceUrl: string | null;
  createdAt: Date;
  followUpCount: number;
  verdict: Verdict;
  verdictHeadline: string;
  signalScore: number;
  contentType: string;
  summary: string;
  signalCount: number;
  noiseCount: number;
  user: { name: string | null; image: string | null } | null;
}

function SignalCard({ item, index }: { item: SignalItem; index: number }) {
  const Icon = verdictIcon[item.verdict];
  const color = verdictColor[item.verdict];
  const bg = verdictBg[item.verdict];
  const border = verdictBorder[item.verdict];

  return (
    <Link
      href={`/s/${item.id}`}
      className={`group relative block rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${bg} ${border} animate-in fade-in-0 fill-mode-both slide-in-from-bottom-2`}
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
    >
      {/* Top row: verdict + title + time */}
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-medium">{item.title}</h3>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Verdict headline */}
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {item.verdictHeadline}
          </p>

          {/* Summary — 2 lines max */}
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
            {item.summary}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {verdictLabel[item.verdict]}
              <span className="ml-1 text-muted-foreground">
                {item.signalScore}%
              </span>
            </Badge>

            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              {item.signalCount}
            </span>

            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              {item.noiseCount}
            </span>

            {item.followUpCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                {item.followUpCount}
              </span>
            )}

            {item.sourceUrl && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                {getDomain(item.sourceUrl)}
              </span>
            )}

            <Badge variant="outline" className="text-xs font-normal capitalize">
              {item.contentType}
            </Badge>
          </div>
        </div>

        {/* Hover arrow */}
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
      </div>
    </Link>
  );
}
