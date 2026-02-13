"use client";

import { ExternalLink } from "lucide-react";

import type { SignalElement } from "@/lib/schemas/analysis";
import { signalCategoryLabel } from "@/lib/schemas/analysis";
import { getDomain } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { ShareButton } from "./share-button";

function confidenceColor(c: number): string {
  if (c >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (c >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-orange-600 dark:text-orange-400";
}

function confidenceBg(c: number): string {
  if (c >= 80) return "bg-emerald-500/10";
  if (c >= 50) return "bg-amber-500/10";
  return "bg-orange-500/10";
}

export function SignalCard({
  signal,
  index,
  signalId,
}: {
  signal: SignalElement;
  index: number;
  signalId: string;
}) {
  return (
    <div
      className="animate-in fade-in-0 slide-in-from-bottom-4 group relative rounded-xl border border-border/50 bg-card px-5 py-4 fill-mode-both"
      style={{ animationDelay: `${index * 80}ms`, animationDuration: "400ms" }}
    >
      {/* Confidence accent bar */}
      <div
        className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${confidenceBg(signal.confidence)}`}
      />

      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-[13px] leading-relaxed text-foreground">
            {signal.content}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <ShareButton type="signal" id={signalId} index={index} />
            <span
              className={`font-mono text-[11px] font-bold tabular-nums ${confidenceColor(signal.confidence)}`}
            >
              {signal.confidence}
            </span>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-medium"
            >
              {signalCategoryLabel[signal.category]}
            </Badge>
          </div>
        </div>

        {/* Sources */}
        {signal.sources.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border/30 pt-2">
            {signal.sources.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-2.5" />
                {getDomain(url)}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
