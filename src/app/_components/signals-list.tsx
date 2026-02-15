"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  XCircle,
  MessageCircle,
  Loader2,
  ExternalLink,
  Signal,
} from "lucide-react";

import { verdictLabel } from "@/lib/schemas/analysis";
import { getDomain } from "@/lib/utils";
import { verdictIcon, verdictColor } from "@/lib/verdict";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

/* ── Component ───────────────────────────────────────────── */

export function SignalsList() {
  const { data: signals, isLoading } = api.user.signals.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!signals?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Signal className="text-muted-foreground/50 h-10 w-10" />
        <p className="text-muted-foreground text-sm">
          No signals yet. Start by analyzing something on the{" "}
          <Link href="/" className="text-foreground underline underline-offset-4">
            homepage
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="divide-border divide-y">
      {signals.map((signal) => {
        const Icon = signal.verdict ? verdictIcon[signal.verdict] : null;
        const color = signal.verdict ? verdictColor[signal.verdict] : "";

        return (
          <Link
            key={signal.id}
            href={`/s/${signal.id}`}
            className="hover:bg-muted/50 group flex items-start gap-4 py-4 transition-colors first:pt-0"
          >
            {/* Verdict icon or pending state */}
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
              {signal.pending ? (
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              ) : signal.error ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : Icon ? (
                <Icon className={`h-4 w-4 ${color}`} />
              ) : null}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <p className="truncate text-sm font-medium">{signal.title}</p>
                {signal.sourceUrl && (
                  <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                    <ExternalLink className="mr-0.5 inline h-3 w-3" />
                    {getDomain(signal.sourceUrl)}
                  </span>
                )}
              </div>

              {signal.verdictHeadline && (
                <p className="text-muted-foreground mt-0.5 truncate text-sm">
                  {signal.verdictHeadline}
                </p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {signal.verdict && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {verdictLabel[signal.verdict]}
                    {signal.signalScore !== null && (
                      <span className="text-muted-foreground ml-1">
                        {signal.signalScore}%
                      </span>
                    )}
                  </Badge>
                )}
                {signal.error && (
                  <Badge variant="destructive" className="text-xs font-normal">
                    Error
                  </Badge>
                )}
                {signal.followUpCount > 0 && (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MessageCircle className="h-3 w-3" />
                    {signal.followUpCount}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(signal.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
