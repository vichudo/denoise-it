"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCw, Rss, Settings } from "lucide-react";

import { ANALYZING_PHRASES, POLL_INTERVAL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

import { FeedCard } from "./feed-card";

export function PersonalFeed() {
  const utils = api.useUtils();

  /* ── Feed items (infinite scroll) ─────────────────────── */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.feed.items.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  /* ── Generation status polling ────────────────────────── */
  const [phraseIndex, setPhraseIndex] = useState(0);
  const wasGeneratingRef = useRef(false);

  // Always poll — the interval is cheap and simplifies logic
  const { data: status } = api.feed.status.useQuery(undefined, {
    refetchInterval: POLL_INTERVAL,
  });

  const generating = status?.generating ?? false;

  // Track transitions from generating → done to trigger refetch
  const handleGenerationComplete = useCallback(() => {
    void utils.feed.items.invalidate();
  }, [utils.feed.items]);

  useEffect(() => {
    if (generating) {
      wasGeneratingRef.current = true;
    } else if (wasGeneratingRef.current) {
      wasGeneratingRef.current = false;
      handleGenerationComplete();
    }
  }, [generating, handleGenerationComplete]);

  // Rotate phrases while generating
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % ANALYZING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [generating]);

  /* ── Refresh mutation ─────────────────────────────────── */
  const refresh = api.feed.refresh.useMutation({
    onSuccess: () => {
      wasGeneratingRef.current = true;
      setPhraseIndex(0);
      void utils.feed.status.invalidate();
    },
  });

  /* ── Infinite scroll sentinel ─────────────────────────── */
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
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allItems = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data?.pages],
  );

  // Derive last retrieval time from the newest item's createdAt
  const lastRetrieved = useMemo(() => {
    const first = allItems[0];
    if (!first) return null;
    return formatDistanceToNow(new Date(first.createdAt as unknown as string), { addSuffix: true });
  }, [allItems]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Feed</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Curated for you. Pure signal, no noise.
          </p>
          {lastRetrieved && (
            <p className="text-muted-foreground/60 mt-0.5 text-xs">
              Last updated {lastRetrieved}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={generating ?? refresh.isPending}
            onClick={() => refresh.mutate()}
          >
            <RefreshCw
              className={`h-4 w-4 ${generating ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Generating indicator */}
      {generating && (
        <div className="bg-muted/50 mb-6 flex items-center gap-3 rounded-lg border px-4 py-3">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          <span className="text-muted-foreground text-sm">
            {ANALYZING_PHRASES[phraseIndex]}
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allItems.length === 0 && !generating && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Rss className="text-muted-foreground/50 h-10 w-10" />
          <div>
            <p className="text-muted-foreground text-sm">
              Your feed is empty.
            </p>
            <p className="text-muted-foreground/70 mt-1 text-xs">
              Generate your first feed to see curated content here.
            </p>
          </div>
          <Button
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
          >
            {refresh.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Starting...
              </>
            ) : (
              "Generate your feed"
            )}
          </Button>
        </div>
      )}

      {/* Feed items */}
      {allItems.length > 0 && (
        <div className="space-y-2">
          {allItems.map((item, i) => (
            <FeedCard key={item.id} item={item} index={i} />
          ))}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-px" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}

          {!hasNextPage && allItems.length > 0 && (
            <p className="text-muted-foreground py-8 text-center text-xs">
              You&apos;ve reached the end.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
