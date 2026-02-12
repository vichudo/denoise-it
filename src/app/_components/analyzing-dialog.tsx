"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { POLL_INTERVAL, ANALYZING_PHRASES } from "@/lib/constants";

export function AnalyzingDialog({
  signalId,
  open,
  onOpenChange,
}: {
  signalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const signalUrl = signalId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${signalId}`
    : null;

  // Poll for completion
  const { data } = api.analysis.get.useQuery(
    { id: signalId! },
    {
      enabled: !!signalId,
      refetchInterval: (query) => {
        if (query.state.data?.data || query.state.data?.error) return false;
        return POLL_INTERVAL;
      },
    },
  );

  const isReady = !!data?.data;
  const hasError = !!data?.error;

  // Rotate phrases
  useEffect(() => {
    if (isReady || hasError) return;
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % ANALYZING_PHRASES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isReady, hasError]);

  // Navigate when ready
  useEffect(() => {
    if (isReady && signalId) {
      const timeout = setTimeout(() => {
        router.push(`/s/${signalId}`);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [isReady, signalId, router]);

  function handleCopy() {
    if (!signalUrl) return;
    void navigator.clipboard.writeText(signalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="items-center">
          <div className="mb-2">
            {isReady ? (
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <Check className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <DialogTitle>
            {isReady ? "Analysis complete" : "Denoising..."}
          </DialogTitle>
          <DialogDescription className="text-center">
            {hasError
              ? data.error
              : isReady
                ? "Your analysis is ready. Redirecting..."
                : ANALYZING_PHRASES[phraseIndex]}
          </DialogDescription>
        </DialogHeader>

        {/* Shareable link */}
        {signalUrl && (
          <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
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
        )}

        {/* Actions */}
        <div className="flex justify-center gap-2">
          {isReady ? (
            <Button
              onClick={() => router.push(`/s/${signalId}`)}
              className="gap-2"
            >
              <ExternalLink className="size-3.5" />
              View Analysis
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close &mdash; we&apos;ll keep analyzing
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
