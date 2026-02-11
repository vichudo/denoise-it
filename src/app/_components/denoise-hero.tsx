"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { ResultsSkeleton } from "./results-skeleton";
import { TruthCard, type DenoiseResult } from "./truth-card";
import { UrlPreviews } from "./url-previews";

const mockResult: DenoiseResult = {
  summary:
    "This content contains a mix of verifiable facts and subjective interpretation. The core claims are partially supported, but several statements lack context or rely on speculation.",
  signalScore: 62,
  originalType: "news article",
  elements: [
    {
      id: "1",
      claim: "The event occurred on the reported date and location",
      confidence: 0.92,
      category: "fact",
      explanation:
        "Multiple independent sources confirm the date, time, and location of this event. Public records corroborate the core details.",
      source: "Associated Press, Reuters — confirmed independently",
    },
    {
      id: "2",
      claim: "The broader trend has been building for several years",
      confidence: 0.78,
      category: "context",
      explanation:
        "While the general trend is real, the specific framing omits important context about contributing factors and counter-trends that complicate the narrative.",
    },
    {
      id: "3",
      claim: "This represents the most significant development in decades",
      confidence: 0.35,
      category: "opinion",
      explanation:
        'The word "most significant" is a subjective judgment. Reasonable experts disagree on the relative importance compared to other recent developments.',
    },
    {
      id: "4",
      claim: "This will likely lead to widespread changes in the industry",
      confidence: 0.25,
      category: "speculation",
      explanation:
        "This is a forward-looking prediction without strong evidence. Similar predictions in the past have had mixed outcomes.",
    },
    {
      id: "5",
      claim: "Critics say the response was deliberately delayed",
      confidence: 0.15,
      category: "misleading",
      explanation:
        "The timeline presented omits key intermediate steps that explain the delay. The framing implies intent without evidence of deliberate action.",
      source: "Official timeline released by the organization",
    },
    {
      id: "6",
      claim: "Internal sources suggest additional details not yet public",
      confidence: 0.1,
      category: "unverifiable",
      explanation:
        "Anonymous sourcing makes this impossible to independently verify. The claim may be accurate but cannot be confirmed or denied with available information.",
    },
  ],
};

export function DenoiseHero() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DenoiseResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSubmit() {
    if (!input.trim() || isPending) return;

    startTransition(async () => {
      // Simulated delay (1.5–2.5s)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 1000) + 1500),
      );
      setResult(mockResult);

      // Scroll to results after render
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  return (
    <>
      {/* Hero */}
      <section className="flex min-h-svh flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight">
              denoise
              <span className="font-light text-muted-foreground">it</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Strip the noise. See what&apos;s real.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Textarea
              placeholder="Paste a link, tweet, headline, article, claim, or rumor..."
              className="min-h-[120px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <UrlPreviews
              text={input}
              onRemove={(url) =>
                setInput((prev) => prev.replace(url, "").replace(/\s{2,}/g, " ").trim())
              }
            />
            <Button
              size="lg"
              className="w-full"
              disabled={!input.trim() || isPending}
              onClick={handleSubmit}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Denoising...
                </>
              ) : (
                "Denoise"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            We extract signal from noise — no account required.
          </p>
        </div>
      </section>

      {/* Results */}
      {(isPending || result) && (
        <section
          ref={resultsRef}
          className="flex min-h-svh flex-col items-center px-4 py-24"
        >
          {isPending ? (
            <ResultsSkeleton />
          ) : (
            result && (
              <div className="w-full max-w-2xl space-y-8">
                {/* Signal score */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Signal Score
                    </span>
                    <Badge variant="secondary">{result.signalScore}/100</Badge>
                  </div>
                  <Progress value={result.signalScore} className="h-1.5" />
                </div>

                {/* Summary */}
                <Card className="border-none bg-secondary/50 shadow-none">
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {result.summary}
                    </p>
                  </CardContent>
                </Card>

                <Separator />

                {/* Truth cards */}
                <div className="space-y-4">
                  {result.elements.map((element, index) => (
                    <TruthCard
                      key={element.id}
                      element={element}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </section>
      )}
    </>
  );
}
