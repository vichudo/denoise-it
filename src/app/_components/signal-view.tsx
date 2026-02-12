"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Laugh,
  Loader2,
  Scale,
  Signal,
  Volume2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import { getDomain } from "@/lib/utils";

import type { Verdict, AnalysisResult } from "@/lib/schemas/analysis";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { POLL_INTERVAL, ANALYZING_PHRASES } from "@/lib/constants";

import { NoiseCard } from "./noise-card";
import { ResultsSkeleton } from "./results-skeleton";
import { SignalCard } from "./truth-card";

/* ── Verdict config ───────────────────────────────────────── */

const verdictConfig: Record<
  Verdict,
  { icon: typeof CheckCircle; color: string; bg: string; border: string }
> = {
  true: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
  },
  mostly_true: {
    icon: CheckCircle,
    color: "text-emerald-600/80 dark:text-emerald-400/80",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    border: "border-emerald-200/40 dark:border-emerald-800/30",
  },
  mixed: {
    icon: Scale,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200/60 dark:border-amber-800/40",
  },
  mostly_false: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200/60 dark:border-orange-800/40",
  },
  false: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200/60 dark:border-red-800/40",
  },
  misleading: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200/60 dark:border-orange-800/40",
  },
  satire: {
    icon: Laugh,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200/60 dark:border-violet-800/40",
  },
  unverifiable: {
    icon: HelpCircle,
    color: "text-muted-foreground",
    bg: "bg-secondary/50",
    border: "border-border/50",
  },
};

/* ── Analyzing state ──────────────────────────────────────── */

function AnalyzingState() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % ANALYZING_PHRASES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32">
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Denoising...</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {ANALYZING_PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  );
}

/* ── Verdict Banner ───────────────────────────────────────── */

function VerdictBanner({ result }: { result: AnalysisResult }) {
  const isDefinitive = result.verdict !== "mixed" && result.verdict !== "unverifiable";
  if (!isDefinitive) return null;

  const config = verdictConfig[result.verdict];
  const Icon = config.icon;

  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-bottom-2 flex items-center gap-4 rounded-2xl border px-6 py-5 ${config.bg} ${config.border}`}
    >
      <Icon className={`size-7 shrink-0 ${config.color}`} strokeWidth={2.5} />
      <p className={`text-base font-semibold tracking-tight ${config.color}`}>
        {result.verdictHeadline}
      </p>
    </div>
  );
}

/* ── Section header ───────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  label,
  count,
  muted,
}: {
  icon: typeof Signal;
  label: string;
  count?: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`size-3.5 ${muted ? "text-muted-foreground/40" : "text-muted-foreground/60"}`}
      />
      <span
        className={`text-xs font-medium uppercase tracking-widest ${muted ? "text-muted-foreground/40" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="font-mono text-[10px] text-muted-foreground/40">
          {count}
        </span>
      )}
    </div>
  );
}

/* ── Results ──────────────────────────────────────────────── */

function Results({ result }: { result: AnalysisResult }) {
  return (
    <div className="w-full max-w-2xl space-y-10">
      {/* 1. Verdict */}
      <VerdictBanner result={result} />

      {/* 2. Abstract */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Analysis
          </span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
            {result.signalScore}/100 signal &middot; {result.contentType}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/80">
          {result.summary}
        </p>
      </div>

      <Separator className="opacity-50" />

      {/* 3. Signal */}
      {result.signals.length > 0 && (
        <div className="space-y-3">
          <SectionHeader icon={Signal} label="Signal" count={result.signals.length} />
          <div className="space-y-2">
            {result.signals.map((signal, index) => (
              <SignalCard key={index} signal={signal} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Noise */}
      {result.noise.length > 0 && (
        <>
          <Separator className="opacity-30" />
          <div className="space-y-3">
            <SectionHeader icon={Volume2} label="Noise Removed" count={result.noise.length} muted />
            <div className="space-y-2">
              {result.noise.map((item, index) => (
                <NoiseCard key={index} noise={item} index={index} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export function SignalView({ id, sourceUrl }: { id: string; sourceUrl?: string }) {
  const { data, error } = api.analysis.get.useQuery(
    { id },
    {
      refetchInterval: (query) => {
        if (query.state.data?.data || query.state.data?.error) return false;
        return POLL_INTERVAL;
      },
    },
  );

  return (
    <div className="flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 w-full max-w-2xl space-y-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="size-3.5" />
            New analysis
          </Button>
        </Link>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg border bg-secondary/30 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${getDomain(sourceUrl)}&sz=32`}
              alt=""
              width={16}
              height={16}
              className="size-4 rounded-sm"
            />
            <span className="truncate">{sourceUrl}</span>
            <ExternalLink className="ml-auto size-3.5 shrink-0 opacity-40" />
          </a>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="py-32 text-center">
          <p className="text-sm text-destructive">Analysis not found.</p>
        </div>
      ) : !data ? (
        <ResultsSkeleton />
      ) : data.error ? (
        <div className="py-32 text-center">
          <p className="text-sm text-destructive">{data.error}</p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Try again</Button>
          </Link>
        </div>
      ) : data.data ? (
        <Results result={data.data} />
      ) : (
        <AnalyzingState />
      )}
    </div>
  );
}
