"use client";

import { useState } from "react";
import { Download, Share, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { useTranslation } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shareStoryImage, storyImageUrl, type StoryType } from "@/lib/share";

type ShareState = "idle" | "loading" | "done";

export function ShareButton({
  type,
  id,
  index,
  alwaysVisible,
  prompt,
}: {
  type: StoryType;
  id: string;
  index?: number;
  alwaysVisible?: boolean;
  prompt?: string;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<ShareState>("idle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [includePrompt, setIncludePrompt] = useState(false);

  const showDialog = !!prompt;

  async function doShare(withPrompt?: boolean) {
    if (state !== "idle") return;
    setState("loading");
    try {
      await shareStoryImage({ type, id, index, includePrompt: withPrompt });
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      toast.error(t("share.error"));
      setState("idle");
    }
  }

  function handleClick() {
    if (showDialog) {
      setDialogOpen(true);
    } else {
      void doShare();
    }
  }

  async function handleDialogShare() {
    setDialogOpen(false);
    await doShare(includePrompt);
  }

  const previewUrl = showDialog
    ? storyImageUrl({ type, id, index, includePrompt })
    : null;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`size-7 shrink-0 transition-opacity ${alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"}`}
              onClick={handleClick}
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
          <TooltipContent side="top">{t("share.tooltip")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showDialog && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-medium">
                {t("share.title")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("share.description")}
              </DialogDescription>
            </DialogHeader>

            {/* Preview */}
            <div className="bg-secondary/30 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={String(includePrompt)}
                src={previewUrl!}
                alt="Story preview"
                className="aspect-9/16 w-full object-cover"
              />
            </div>

            {/* Toggle */}
            <label className="flex cursor-pointer items-center justify-between py-1">
              <span className="text-muted-foreground text-sm">
                {t("share.includePrompt")}
              </span>
              <Switch
                size="sm"
                checked={includePrompt}
                onCheckedChange={setIncludePrompt}
              />
            </label>

            <DialogFooter>
              <Button
                className="w-full gap-2"
                size="sm"
                onClick={() => void handleDialogShare()}
              >
                <Download className="size-3.5 [@media(hover:none)]:hidden" />
                <Share className="hidden size-3.5 [@media(hover:none)]:block" />
                {t("share.button")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
