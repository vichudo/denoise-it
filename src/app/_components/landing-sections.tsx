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

/* ------------------------------------------------------------------ */
/*  Section 1 — How it works                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: Megaphone,
    title: "Paste anything",
    description:
      "A tweet, headline, article, claim, link, question, or rumor — any piece of content you want verified.",
  },
  {
    icon: BrainCircuit,
    title: "AI analyzes",
    description:
      "Our agent cross-references primary sources, government data, and peer-reviewed research in real time.",
  },
  {
    icon: Sparkles,
    title: "See the signal",
    description:
      "Get a clear verdict with confidence scores, sourced facts, and every piece of noise identified and explained.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          How it works
        </p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          From noise to clarity in seconds
        </h2>

        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start md:gap-0">
          {STEPS.map((step, i) => (
            <Fragment key={step.title}>
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

                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed">
                  {step.description}
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

const IMPACT_AREAS = [
  {
    icon: Landmark,
    title: "Politics & Policy",
    description:
      "Cut through partisan framing, verify political claims, and see what legislation actually says.",
    accent: "from-blue-500/20 to-blue-500/0",
    iconColor: "text-blue-500",
    examples: ["Campaign promises", "Voting records", "Policy impact"],
  },
  {
    icon: HeartPulse,
    title: "Health & Science",
    description:
      "Separate evidence-based medicine from viral misinformation that puts lives at risk.",
    accent: "from-emerald-500/20 to-emerald-500/0",
    iconColor: "text-emerald-500",
    examples: ["Clinical studies", "Drug claims", "Wellness trends"],
  },
  {
    icon: TrendingUp,
    title: "Finance & Markets",
    description:
      "Verify market claims, earnings reports, and financial advice against actual data.",
    accent: "from-amber-500/20 to-amber-500/0",
    iconColor: "text-amber-500",
    examples: ["Stock tips", "Crypto claims", "Economic data"],
  },
  {
    icon: Globe,
    title: "World Events",
    description:
      "Get the facts on breaking news and global events without sensationalism or spin.",
    accent: "from-violet-500/20 to-violet-500/0",
    iconColor: "text-violet-500",
    examples: ["Conflicts", "Diplomacy", "Disasters"],
  },
  {
    icon: Users,
    title: "Social Media",
    description:
      "Fact-check viral posts, threads, and screenshots before sharing them further.",
    accent: "from-pink-500/20 to-pink-500/0",
    iconColor: "text-pink-500",
    examples: ["Viral claims", "Screenshots", "Influencer takes"],
  },
  {
    icon: BookOpen,
    title: "Education & Research",
    description:
      "Verify academic claims, citations, and research findings against primary sources.",
    accent: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-500",
    examples: ["Study results", "Statistics", "Historical claims"],
  },
] as const;

export function ImpactAreas() {
  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          Impact
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Truth matters everywhere
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center text-base">
          Misinformation doesn&apos;t stay in one lane. denoise
          <span className="font-light">it</span> works across every domain
          where facts matter.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT_AREAS.map((area) => (
            <div
              key={area.title}
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
                <h3 className="mb-2 text-base font-semibold">{area.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {area.examples.map((ex) => (
                    <span
                      key={ex}
                      className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
                    >
                      {ex}
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

const NOISE_ITEMS = [
  { text: '"SHOCKING development that changes EVERYTHING"', type: "Sensational" },
  { text: '"Experts agree this is unprecedented"', type: "Vague attribution" },
  { text: '"Could this mean the end of...?"', type: "Speculation" },
  { text: '"People are furious about..."', type: "Emotional framing" },
];

const SIGNAL_ITEMS = [
  { text: "FDA approved drug X on Jan 15, 2026 for condition Y", confidence: 94 },
  { text: "Study sample size: 2,340 participants across 12 centers", confidence: 91 },
  { text: "Treatment showed 23% improvement vs placebo (p<0.01)", confidence: 88 },
  { text: "3 of 5 independent reviews confirmed efficacy", confidence: 85 },
];

export function SignalVsNoise() {
  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          The difference
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          See what others miss
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center text-base">
          Every piece of content is a mix of verifiable facts and narrative
          framing. We separate them so you can think clearly.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Noise column */}
          <div className="border-border rounded-xl border p-6">
            <div className="mb-5 flex items-center gap-2">
              <Activity className="size-5 text-red-400" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                Noise
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {NOISE_ITEMS.map((item) => (
                <div
                  key={item.text}
                  className="flex items-start gap-3 rounded-lg bg-red-500/5 p-3"
                >
                  <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-red-400" />
                  <div>
                    <p className="text-muted-foreground text-sm italic">
                      {item.text}
                    </p>
                    <p className="mt-1 text-xs font-medium text-red-400/80">
                      {item.type}
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
                Signal
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {SIGNAL_ITEMS.map((item) => (
                <div
                  key={item.text}
                  className="flex items-start gap-3 rounded-lg bg-emerald-500/5 p-3"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm">{item.text}</p>
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

const USE_CASES = [
  {
    icon: Newspaper,
    label: "Verify a headline",
    prompt: "Is it true that...",
  },
  {
    icon: Search,
    label: "Fact-check a claim",
    prompt: "Someone told me that...",
  },
  {
    icon: Shield,
    label: "Check health advice",
    prompt: "Is this supplement safe...",
  },
  {
    icon: Scale,
    label: "Analyze a policy",
    prompt: "What does this bill actually do...",
  },
  {
    icon: Zap,
    label: "Decode viral content",
    prompt: "This post went viral claiming...",
  },
  {
    icon: Globe,
    label: "Understand world news",
    prompt: "What's actually happening in...",
  },
];

export function UseCases() {
  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          Use cases
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Start with a question
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-center text-base">
          Whether you&apos;re a journalist, researcher, student, or just a
          curious citizen — denoise
          <span className="font-light">it</span> helps you think for yourself.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <button
              key={uc.label}
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
                <p className="text-sm font-semibold">{uc.label}</p>
                <p className="text-muted-foreground mt-0.5 text-sm italic">
                  &ldquo;{uc.prompt}&rdquo;
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

const PRINCIPLES = [
  {
    icon: Search,
    title: "Source-first",
    description:
      "Every claim is traced back to primary sources — .gov, .edu, peer-reviewed journals, and official records.",
  },
  {
    icon: Shield,
    title: "No bias, no agenda",
    description:
      "We don't tell you what to think. We separate facts from framing so you can decide for yourself.",
  },
  {
    icon: Zap,
    title: "Real-time verification",
    description:
      "Live web search cross-references claims against the latest available data, not stale databases.",
  },
];

export function TrustBar() {
  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-widest">
          Our principles
        </p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Built for trust
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex flex-col items-center text-center">
              <div className="bg-primary/5 border-border mb-5 flex size-14 items-center justify-center rounded-xl border">
                <p.icon
                  className="text-foreground size-6"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mb-2 text-base font-semibold">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {p.description}
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
  return (
    <section className="border-border/40 border-t px-4 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="bg-primary/5 border-border mb-6 flex size-16 items-center justify-center rounded-2xl border">
          <Sparkles className="text-foreground size-7" strokeWidth={1.5} />
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Stop scrolling. Start knowing.
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md text-base">
          Paste any claim, headline, or link and get a clear, sourced analysis
          in seconds. No account required.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-medium transition-colors"
        >
          Try it now
          <ArrowDown className="size-4 rotate-180" />
        </button>
      </div>
    </section>
  );
}
