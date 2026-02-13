"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Laugh,
  Scale,
  Signal,
  Volume2,
  ArrowLeft,
  ExternalLink,
  Check,
  Copy,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { getDomain } from "@/lib/utils";

import type { Verdict, AnalysisResult } from "@/lib/schemas/analysis";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { POLL_INTERVAL, ANALYZING_PHRASES } from "@/lib/constants";

import { FollowUpPanel } from "./follow-up-panel";
import { NoiseCard } from "./noise-card";
import { ResultsSkeleton } from "./results-skeleton";
import { SignalCard } from "./truth-card";
import { WaveformAnimation } from "./waveform-animation";

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
    bg: "bg-secondary/40",
    border: "border-border/60",
  },
  false: {
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-secondary/40",
    border: "border-border/60",
  },
  misleading: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-secondary/40",
    border: "border-border/60",
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

function AnalyzingState({ id }: { id: string }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const signalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${id}`
      : `/s/${id}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % ANALYZING_PHRASES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  function handleCopy() {
    void navigator.clipboard.writeText(signalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-md flex-col items-center justify-center gap-8 py-24"
    >
      <WaveformAnimation />

      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-lg font-semibold">Denoising...</h2>
        <div className="h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground text-sm"
            >
              {ANALYZING_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Shareable URL */}
      <div className="bg-secondary/50 flex w-full items-center gap-2 rounded-lg border px-3 py-2">
        <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">
          {signalUrl}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>

      <p className="text-muted-foreground/60 flex items-center gap-1.5 text-xs">
        <Bookmark className="size-3" />
        Bookmark this page to check back later
      </p>
    </motion.div>
  );
}

/* ── Verdict Banner ───────────────────────────────────────── */

const verdictLabels: Record<Verdict, string> = {
  true: "Verified",
  mostly_true: "Mostly True",
  mixed: "Mixed",
  mostly_false: "Mostly False",
  false: "False",
  misleading: "Misleading",
  satire: "Satire",
  unverifiable: "Unverifiable",
};

function VerdictBanner({ result }: { result: AnalysisResult }) {
  const isDefinitive =
    result.verdict !== "mixed" && result.verdict !== "unverifiable";
  if (!isDefinitive) return null;

  const config = verdictConfig[result.verdict];
  const Icon = config.icon;

  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-bottom-2 flex items-start gap-4 rounded-2xl border px-6 py-5 ${config.bg} ${config.border}`}
    >
      <Icon className={`mt-0.5 size-6 shrink-0 ${config.color}`} strokeWidth={2.5} />
      <div className="min-w-0 space-y-1">
        <span
          className={`text-[10px] font-semibold tracking-widest uppercase ${config.color}`}
        >
          {verdictLabels[result.verdict]}
        </span>
        <p className="text-foreground text-base font-semibold leading-snug tracking-tight">
          {result.verdictHeadline}
        </p>
      </div>
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
        className={`size-3.5 ${muted ? "text-muted-foreground/60" : "text-muted-foreground/60"}`}
      />
      <span
        className={`text-xs font-medium tracking-widest uppercase ${muted ? "text-muted-foreground/60" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground/40 font-mono text-[10px]">
          {count}
        </span>
      )}
    </div>
  );
}

/* ── Results ──────────────────────────────────────────────── */

function Results({
  result,
  onFollowUp,
}: {
  result: AnalysisResult;
  onFollowUp: () => void;
}) {
  return (
    <div className="w-full max-w-2xl space-y-10">
      {/* 1. Verdict */}
      <VerdictBanner result={result} />

      {/* 2. Abstract */}
      <div className="bg-secondary/30 space-y-3 rounded-xl border px-6 py-5">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Analysis
          </span>
          <span className="text-muted-foreground/60 font-mono text-[11px] tabular-nums">
            {result.signalScore}/100 signal &middot; {result.contentType}
          </span>
        </div>
        <p className="text-foreground/80 text-justify text-[13px] leading-relaxed">
          {result.summary}
        </p>
      </div>

      <Separator className="opacity-50" />

      {/* 3. Signal */}
      {result.signals.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            icon={Signal}
            label="Signal"
            count={result.signals.length}
          />
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
            <SectionHeader
              icon={Volume2}
              label="Noise Removed"
              count={result.noise.length}
              muted
            />
            <div className="space-y-2">
              {result.noise.map((item, index) => (
                <NoiseCard key={index} noise={item} index={index} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 5. Follow Up */}
      <Separator className="opacity-30" />
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="gap-2"
          onClick={onFollowUp}
        >
          <MessageCircle className="size-4" />
          Follow Up
        </Button>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export function SignalView({
  id,
  sourceUrl,
}: {
  id: string;
  sourceUrl?: string;
}) {
  const [followUpOpen, setFollowUpOpen] = useState(false);

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
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            New analysis
          </Button>
        </Link>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary/30 text-muted-foreground hover:text-foreground flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm transition-colors"
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
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 text-center"
          >
            <p className="text-destructive text-sm">Analysis not found.</p>
          </motion.div>
        ) : !data ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsSkeleton />
          </motion.div>
        ) : data.error ? (
          <motion.div
            key="data-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 text-center"
          >
            <p className="text-destructive text-sm">{data.error}</p>
            <Link href="/" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Try again
              </Button>
            </Link>
          </motion.div>
        ) : data.data ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex w-full flex-col items-center"
          >
            <Results
              result={data.data}
              onFollowUp={() => setFollowUpOpen(true)}
            />
          </motion.div>
        ) : (
          <AnalyzingState key="analyzing" id={id} />
        )}
      </AnimatePresence>

      <FollowUpPanel
        signalId={id}
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
      />
    </div>
  );
}
