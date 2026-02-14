"use client";

import { ExternalLink } from "lucide-react";

import type { NoiseElement } from "@/lib/schemas/analysis";
import { noiseTypeLabel } from "@/lib/schemas/analysis";
import { getDomain } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { ShareButton } from "./share-button";

export function NoiseCard({
  noise,
  index,
  signalId,
  prompt,
}: {
  noise: NoiseElement;
  index: number;
  signalId: string;
  prompt?: string;
}) {
  return (
    <div
      className="animate-in fade-in-0 slide-in-from-bottom-2 group relative rounded-lg border border-destructive/15 bg-destructive/5 px-4 py-3 fill-mode-both dark:bg-destructive/10"
      style={{ animationDelay: `${index * 60}ms`, animationDuration: "300ms" }}
    >
      <div className="space-y-2">
        {/* Type + original quote */}
        <div className="flex items-start gap-2.5">
          <Badge
            variant="outline"
            className="mt-0.5 h-5 shrink-0 border-destructive/25 px-1.5 text-[10px] font-medium text-destructive dark:text-red-400"
          >
            {noiseTypeLabel[noise.type]}
          </Badge>
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
            <span className="italic text-foreground/70">
              &ldquo;{noise.original}&rdquo;
            </span>
          </p>
          <ShareButton type="noise" id={signalId} index={index} prompt={prompt} />
        </div>

        {/* Reason */}
        <p className="text-[11px] leading-relaxed text-foreground/60">
          {noise.reason}
        </p>

        {/* Sources */}
        {noise.sources.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {noise.sources.map((url) => (
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
