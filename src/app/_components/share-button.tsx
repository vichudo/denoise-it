"use client";

import { useState } from "react";
import { Download, Share, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shareStoryImage, type StoryType } from "@/lib/share";

type ShareState = "idle" | "loading" | "done";

export function ShareButton({
  type,
  id,
  index,
  alwaysVisible,
}: {
  type: StoryType;
  id: string;
  index?: number;
  alwaysVisible?: boolean;
}) {
  const [state, setState] = useState<ShareState>("idle");

  async function handleShare() {
    if (state !== "idle") return;
    setState("loading");
    try {
      await shareStoryImage({ type, id, index });
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      toast.error("Failed to generate story image");
      setState("idle");
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`size-7 shrink-0 transition-opacity ${alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"}`}
            onClick={handleShare}
            disabled={state === "loading"}
          >
            {state === "loading" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : state === "done" ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <>
                <Download className="size-3.5 [@media(hover:none)]:hidden" />
                <Share className="hidden size-3.5 [@media(hover:none)]:block" />
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Share as story</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
