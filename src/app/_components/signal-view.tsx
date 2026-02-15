"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Link2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { getDomain } from "@/lib/utils";

import type { Verdict, AnalysisResult } from "@/lib/schemas/analysis";
import { useTranslation } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { POLL_INTERVAL } from "@/lib/constants";
import { ANALYZING_PHRASES_COUNT } from "@/i18n";

import { copySignalUrl } from "@/lib/share";

import { FollowUpPanel } from "./follow-up-panel";
import { NoiseCard } from "./noise-card";
import { ResultsSkeleton } from "./results-skeleton";
import { ShareButton } from "./share-button";
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
  const { t } = useTranslation();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const signalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${id}`
      : `/s/${id}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % ANALYZING_PHRASES_COUNT);
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
        <h2 className="text-lg font-semibold">{t("signal.denoising")}</h2>
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
              {t(`analyzing.${phraseIndex}`)}
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
        {t("signal.bookmark")}
      </p>
    </motion.div>
  );
}

/* ── Verdict Banner ───────────────────────────────────────── */

function VerdictBanner({ result }: { result: AnalysisResult }) {
  const { t } = useTranslation();
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
          {t(`verdict.${result.verdict}`)}
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

/* ── Prompt display ───────────────────────────────────────── */

const URL_REGEX = /https?:\/\/[^\s<>)"',]+/gi;
const PROMPT_CLAMP_PX = 80; // ~3 lines of text

function PromptDisplay({ prompt }: { prompt: string }) {
  const { t } = useTranslation();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { text, urls } = useMemo(() => {
    const matches = [...new Set(prompt.match(URL_REGEX) ?? [])];
    const cleaned = matches
      .reduce((t, url) => t.replace(url, ""), prompt)
      .replace(/\s{2,}/g, " ")
      .trim();
    return { text: cleaned, urls: matches };
  }, [prompt]);

  useEffect(() => {
    const el = textRef.current;
    if (el) setClamped(el.scrollHeight > PROMPT_CLAMP_PX);
  }, [text]);

  function handleCopy() {
    void navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3 text-center">
      {text && (
        <div>
          <p
            ref={textRef}
            className={`text-foreground/80 text-base leading-relaxed font-medium ${
              !expanded && clamped ? "line-clamp-3" : ""
            }`}
          >
            &ldquo;{text}&rdquo;
          </p>
          {clamped && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-muted-foreground/50 hover:text-muted-foreground mt-1.5 text-xs transition-colors"
            >
              {expanded ? t("signal.showLess") : t("signal.seeAll")}
            </button>
          )}
        </div>
      )}

      {urls.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {urls.map((url) => {
            const domain = getDomain(url);
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={url}
                className="group inline-flex max-w-[280px] items-center gap-1.5 rounded-md border bg-secondary/50 px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-secondary hover:text-foreground"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  alt=""
                  width={14}
                  height={14}
                  className="shrink-0 rounded-sm"
                />
                <span className="truncate">{domain}</span>
                <ExternalLink className="size-3 shrink-0 opacity-40" />
              </a>
            );
          })}
        </div>
      )}

      <button
        onClick={handleCopy}
        className="text-muted-foreground/40 hover:text-muted-foreground inline-flex items-center gap-1 text-xs transition-colors"
      >
        {copied ? (
          <>
            <Check className="size-3" />
            {t("signal.copied")}
          </>
        ) : (
          <>
            <Copy className="size-3" />
            {t("signal.copyPrompt")}
          </>
        )}
      </button>
    </div>
  );
}

/* ── Results ──────────────────────────────────────────────── */

function CopyLinkButton({ id }: { id: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void copySignalUrl(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="size-3" />
      ) : (
        <Link2 className="size-3" />
      )}
      <span className="hidden sm:inline">{copied ? t("signal.copied") : t("signal.copyLink")}</span>
    </Button>
  );
}

function Results({
  result,
  id,
  prompt,
  onFollowUp,
}: {
  result: AnalysisResult;
  id: string;
  prompt?: string;
  onFollowUp: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl space-y-10">
      {/* 0. Original prompt */}
      {prompt && <PromptDisplay prompt={prompt} />}

      {/* 1. Verdict */}
      <VerdictBanner result={result} />

      {/* 2. Abstract */}
      <div className="bg-secondary/30 group space-y-3 rounded-xl border px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            {t("signal.analysis")}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60 font-mono text-[11px] tabular-nums">
              {t("signal.signalScore", { score: result.signalScore })} &middot; {result.contentType}
            </span>
            <ShareButton type="analysis" id={id} prompt={prompt} />
          </div>
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
            label={t("signal.sectionSignal")}
            count={result.signals.length}
          />
          <div className="space-y-2">
            {result.signals.map((signal, index) => (
              <SignalCard key={index} signal={signal} index={index} signalId={id} prompt={prompt} />
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
              label={t("signal.sectionNoise")}
              count={result.noise.length}
              muted
            />
            <div className="space-y-2">
              {result.noise.map((item, index) => (
                <NoiseCard key={index} noise={item} index={index} signalId={id} prompt={prompt} />
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
          {t("signal.followUp")}
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
  const { t } = useTranslation();
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
        <div className="flex items-center justify-between pr-24 sm:pr-0">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              {t("signal.newAnalysis")}
            </Button>
          </Link>
          {data?.data && (
            <div className="flex items-center gap-2">
              <CopyLinkButton id={id} />
              <ShareButton type="verdict" id={id} alwaysVisible prompt={data.prompt} />
            </div>
          )}
        </div>
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
            <p className="text-destructive text-sm">{t("signal.notFound")}</p>
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
                {t("signal.tryAgain")}
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
              id={id}
              prompt={data.prompt}
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
