"use client";

import { Fragment } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Globe,
  HeartPulse,
  Landmark,
  Megaphone,
  Newspaper,
  Scale,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import type { TranslationKey } from "@/i18n";
import { useTranslation } from "@/components/language-provider";

/* ------------------------------------------------------------------ */
/*  Section 1 — How it works                                          */
/* ------------------------------------------------------------------ */

const STEPS: {
  icon: typeof Megaphone;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    icon: Megaphone,
    titleKey: "howItWorks.step1.title",
    descKey: "howItWorks.step1.desc",
  },
  {
    icon: BrainCircuit,
    titleKey: "howItWorks.step2.title",
    descKey: "howItWorks.step2.desc",
  },
  {
    icon: Sparkles,
    titleKey: "howItWorks.step3.title",
    descKey: "howItWorks.step3.desc",
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          {t("howItWorks.label")}
        </p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t("howItWorks.title")}
        </h2>

        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start md:gap-0">
          {STEPS.map((step, i) => (
            <Fragment key={step.titleKey}>
              <div
                className="flex flex-col items-center text-center"
              >
                {/* Step number pill */}
                <span className="text-muted-foreground bg-muted mb-4 inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                  {i + 1}
                </span>

                {/* Icon */}
                <div className="bg-primary/5 border-border mb-5 flex size-14 items-center justify-center rounded-2xl border">
                  <step.icon
                    className="text-foreground size-6"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="mb-2 text-lg font-semibold">{t(step.titleKey)}</h3>
                <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>

              {/* Connector arrow between steps */}
              {i < STEPS.length - 1 && (
                <div className="hidden items-center pt-14 md:flex">
                  <div className="bg-border h-px w-8" />
                  <ArrowRight className="text-muted-foreground/40 size-4" />
                  <div className="bg-border h-px w-8" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2 — Impact areas (bento grid)                             */
/* ------------------------------------------------------------------ */

const IMPACT_AREAS: {
  icon: typeof Landmark;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  accent: string;
  iconColor: string;
  exKeys: [TranslationKey, TranslationKey, TranslationKey];
}[] = [
  {
    icon: Landmark,
    titleKey: "impact.politics.title",
    descKey: "impact.politics.desc",
    accent: "from-blue-500/20 to-blue-500/0",
    iconColor: "text-blue-500",
    exKeys: ["impact.politics.ex1", "impact.politics.ex2", "impact.politics.ex3"],
  },
  {
    icon: HeartPulse,
    titleKey: "impact.health.title",
    descKey: "impact.health.desc",
    accent: "from-emerald-500/20 to-emerald-500/0",
    iconColor: "text-emerald-500",
    exKeys: ["impact.health.ex1", "impact.health.ex2", "impact.health.ex3"],
  },
  {
    icon: TrendingUp,
    titleKey: "impact.finance.title",
    descKey: "impact.finance.desc",
    accent: "from-amber-500/20 to-amber-500/0",
    iconColor: "text-amber-500",
    exKeys: ["impact.finance.ex1", "impact.finance.ex2", "impact.finance.ex3"],
  },
  {
    icon: Globe,
    titleKey: "impact.world.title",
    descKey: "impact.world.desc",
    accent: "from-violet-500/20 to-violet-500/0",
    iconColor: "text-violet-500",
    exKeys: ["impact.world.ex1", "impact.world.ex2", "impact.world.ex3"],
  },
  {
    icon: Users,
    titleKey: "impact.social.title",
    descKey: "impact.social.desc",
    accent: "from-pink-500/20 to-pink-500/0",
    iconColor: "text-pink-500",
    exKeys: ["impact.social.ex1", "impact.social.ex2", "impact.social.ex3"],
  },
  {
    icon: BookOpen,
    titleKey: "impact.education.title",
    descKey: "impact.education.desc",
    accent: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-500",
    exKeys: ["impact.education.ex1", "impact.education.ex2", "impact.education.ex3"],
  },
];

export function ImpactAreas() {
  const { t } = useTranslation();

  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          {t("impact.label")}
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t("impact.title")}
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center text-base">
          {t("impact.desc1")} denoise
          <span className="font-light">it</span> {t("impact.desc2")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT_AREAS.map((area) => (
            <div
              key={area.titleKey}
              className="border-border group relative overflow-hidden rounded-xl border p-6 transition-colors hover:border-foreground/20"
            >
              {/* Gradient background accent */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${area.accent} opacity-0 transition-opacity group-hover:opacity-100`}
              />

              <div className="relative z-10">
                <area.icon
                  className={`${area.iconColor} mb-4 size-8`}
                  strokeWidth={1.5}
                />
                <h3 className="mb-2 text-base font-semibold">{t(area.titleKey)}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {t(area.descKey)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {area.exKeys.map((exKey) => (
                    <span
                      key={exKey}
                      className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
                    >
                      {t(exKey)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Signal vs Noise (visual comparison)                   */
/* ------------------------------------------------------------------ */

const NOISE_ITEMS: { textKey: TranslationKey; typeKey: TranslationKey }[] = [
  { textKey: "svn.noise1.text", typeKey: "svn.noise1.type" },
  { textKey: "svn.noise2.text", typeKey: "svn.noise2.type" },
  { textKey: "svn.noise3.text", typeKey: "svn.noise3.type" },
  { textKey: "svn.noise4.text", typeKey: "svn.noise4.type" },
];

const SIGNAL_ITEMS: { textKey: TranslationKey; confidence: number }[] = [
  { textKey: "svn.signal1.text", confidence: 94 },
  { textKey: "svn.signal2.text", confidence: 91 },
  { textKey: "svn.signal3.text", confidence: 88 },
  { textKey: "svn.signal4.text", confidence: 85 },
];

export function SignalVsNoise() {
  const { t } = useTranslation();

  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          {t("svn.label")}
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t("svn.title")}
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center text-base">
          {t("svn.desc")}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Noise column */}
          <div className="border-border rounded-xl border p-6">
            <div className="mb-5 flex items-center gap-2">
              <Activity className="size-5 text-red-400" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                {t("svn.noise")}
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {NOISE_ITEMS.map((item) => (
                <div
                  key={item.textKey}
                  className="flex items-start gap-3 rounded-lg bg-red-500/5 p-3"
                >
                  <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-red-400" />
                  <div>
                    <p className="text-muted-foreground text-sm italic">
                      {t(item.textKey)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-red-400/80">
                      {t(item.typeKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal column */}
          <div className="border-border rounded-xl border p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3
                className="size-5 text-emerald-400"
                strokeWidth={1.5}
              />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                {t("svn.signal")}
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {SIGNAL_ITEMS.map((item) => (
                <div
                  key={item.textKey}
                  className="flex items-start gap-3 rounded-lg bg-emerald-500/5 p-3"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm">{t(item.textKey)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-emerald-400">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4 — Use cases (quick prompts)                             */
/* ------------------------------------------------------------------ */

const USE_CASES: {
  icon: typeof Newspaper;
  labelKey: TranslationKey;
  promptKey: TranslationKey;
}[] = [
  {
    icon: Newspaper,
    labelKey: "useCases.verify.label",
    promptKey: "useCases.verify.prompt",
  },
  {
    icon: Search,
    labelKey: "useCases.factCheck.label",
    promptKey: "useCases.factCheck.prompt",
  },
  {
    icon: Shield,
    labelKey: "useCases.health.label",
    promptKey: "useCases.health.prompt",
  },
  {
    icon: Scale,
    labelKey: "useCases.policy.label",
    promptKey: "useCases.policy.prompt",
  },
  {
    icon: Zap,
    labelKey: "useCases.viral.label",
    promptKey: "useCases.viral.prompt",
  },
  {
    icon: Globe,
    labelKey: "useCases.worldNews.label",
    promptKey: "useCases.worldNews.prompt",
  },
];

export function UseCases() {
  const { t } = useTranslation();

  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          {t("useCases.label")}
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t("useCases.title")}
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center text-base">
          {t("useCases.desc1")} denoise
          <span className="font-light">it</span> {t("useCases.desc2")}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <button
              key={uc.labelKey}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="border-border hover:border-foreground/20 hover:bg-muted/50 group flex items-start gap-4 rounded-xl border p-5 text-left transition-all"
            >
              <div className="bg-primary/5 flex size-10 shrink-0 items-center justify-center rounded-lg">
                <uc.icon
                  className="text-foreground size-5"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{t(uc.labelKey)}</p>
                <p className="text-muted-foreground mt-0.5 text-sm italic">
                  &ldquo;{t(uc.promptKey)}&rdquo;
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5 — Trust bar (stats + principles)                        */
/* ------------------------------------------------------------------ */

const PRINCIPLES: {
  icon: typeof Search;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    icon: Search,
    titleKey: "trust.sourceFirst.title",
    descKey: "trust.sourceFirst.desc",
  },
  {
    icon: Shield,
    titleKey: "trust.noBias.title",
    descKey: "trust.noBias.desc",
  },
  {
    icon: Zap,
    titleKey: "trust.realTime.title",
    descKey: "trust.realTime.desc",
  },
];

export function TrustBar() {
  const { t } = useTranslation();

  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          {t("trust.label")}
        </p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t("trust.title")}
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.titleKey} className="flex flex-col items-center text-center">
              <div className="bg-primary/5 border-border mb-5 flex size-14 items-center justify-center rounded-xl border">
                <p.icon
                  className="text-foreground size-6"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mb-2 text-base font-semibold">{t(p.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(p.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 6 — Final CTA                                             */
/* ------------------------------------------------------------------ */

export function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="bg-primary/5 border-border mb-6 flex size-16 items-center justify-center rounded-2xl border">
          <Sparkles className="text-foreground size-7" strokeWidth={1.5} />
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("cta.title")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md text-base">
          {t("cta.desc")}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-medium transition-colors"
        >
          {t("cta.button")}
          <ArrowDown className="size-4 rotate-180" />
        </button>
      </div>
    </section>
  );
}
