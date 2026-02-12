"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

import { UrlPreviews } from "./url-previews";

export function DenoiseHero() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const create = api.analysis.create.useMutation({
    onSuccess: (data) => {
      router.push(`/s/${data.id}`);
    },
  });

  function handleSubmit() {
    if (!input.trim() || create.isPending) return;
    create.mutate({ content: input });
  }

  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
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
