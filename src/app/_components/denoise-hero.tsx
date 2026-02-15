"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";

import { useOutputLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

import { UrlPreviews } from "./url-previews";

/** Slider stops — index-based so each step feels equal on the track */
const TIME_STOPS = [
  { days: 1, label: "24 hours" },
  { days: 3, label: "3 days" },
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 30, label: "1 month" },
  { days: 90, label: "3 months" },
  { days: 180, label: "6 months" },
  { days: 365, label: "1 year" },
  { days: 730, label: "2 years" },
] as const;

const DEFAULT_STOP = 2; // index → "1 week"

export function DenoiseHero() {
  const router = useRouter();
  const { language } = useOutputLanguage();
  const [input, setInput] = useState("");
  const [timeSensitive, setTimeSensitive] = useState(false);
  const [stopIndex, setStopIndex] = useState(DEFAULT_STOP);
  const currentStop = TIME_STOPS[stopIndex]!;

  const create = api.analysis.create.useMutation({
    onSuccess: (data) => {
      router.push(`/s/${data.id}`);
    },
  });

  function handleSubmit() {
    if (!input.trim() || create.isPending) return;
    create.mutate({
      content: input,
      ...(timeSensitive && { sinceDays: currentStop.days }),
      ...(language !== "en" && { language }),
    });
  }

  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/denoiseit_logo_rounded.png"
            alt="denoise it"
            width={72}
            height={72}
            className="size-[72px] drop-shadow-lg"
            priority
          />
          <h1 className="text-5xl font-extrabold tracking-tight">
            denoise
            <span className="text-muted-foreground font-light">it</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Strip the noise. See what&apos;s real.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Textarea
            placeholder="Paste a link, tweet, headline, article, claim, a question, or rumor..."
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
              setInput((prev) =>
                prev
                  .replace(url, "")
                  .replace(/\s{2,}/g, " ")
                  .trim(),
              )
            }
          />

          {/* Time-sensitive toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="time-sensitive"
                size="sm"
                checked={timeSensitive}
                onCheckedChange={setTimeSensitive}
              />
              <Label
                htmlFor="time-sensitive"
                className="text-muted-foreground flex cursor-pointer items-center gap-1.5 text-sm"
              >
                <Clock className="size-3.5" />
                Time-sensitive
              </Label>
              {timeSensitive && (
                <span className="text-foreground ml-auto text-sm font-medium">
                  Last {currentStop.label}
                </span>
              )}
            </div>
            {timeSensitive && (
              <Slider
                min={0}
                max={TIME_STOPS.length - 1}
                step={1}
                value={[stopIndex]}
                onValueChange={([v]) => v !== undefined && setStopIndex(v)}
                className="py-1"
              />
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!input.trim() || create.isPending}
            onClick={handleSubmit}
          >
            {create.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Creating...
              </>
            ) : (
              "Denoise"
            )}
          </Button>
        </div>

        {create.isError && (
          <p className="text-destructive text-sm">
            Something went wrong. Please try again.
          </p>
        )}

        <p className="text-muted-foreground text-xs">
          We extract signal from noise — no account required.
        </p>
      </div>
    </section>
  );
}
