"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";

import { useTranslation } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";

import { FollowUpChat } from "./follow-up-chat";

export function FollowUpPanel({
  signalId,
  open,
  onOpenChange,
}: {
  signalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [activeFollowUpId, setActiveFollowUpId] = useState<number | null>(null);
  const [initialMessages, setInitialMessages] = useState<
    UIMessage[] | undefined
  >(undefined);

  const utils = api.useUtils();

  const listQuery = api.followup.list.useQuery(
    { signalId },
    { enabled: open },
  );

  const createMutation = api.followup.create.useMutation({
    onSuccess: (data) => {
      setInitialMessages(undefined);
      setActiveFollowUpId(data.id);
      void utils.followup.list.invalidate({ signalId });
    },
  });

  function handleBack() {
    setActiveFollowUpId(null);
    setInitialMessages(undefined);
    void utils.followup.list.invalidate({ signalId });
  }

  async function handleSelectFollowUp(id: number) {
    const followUp = await utils.followup.get.fetch({ id });
    const messages = (followUp.messages as unknown as UIMessage[]) ?? [];
    setInitialMessages(messages.length > 0 ? messages : undefined);
    setActiveFollowUpId(id);
  }

  function handleNewConversation() {
    createMutation.mutate({ signalId });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        showCloseButton={!activeFollowUpId}
      >
        {activeFollowUpId ? (
          <>
            <SheetHeader className="flex-row items-center gap-2 border-b px-3 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <SheetTitle className="text-sm">{t("followUp.titleSingle")}</SheetTitle>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <FollowUpChat
                key={activeFollowUpId}
                signalId={signalId}
                followUpId={activeFollowUpId}
                initialMessages={initialMessages}
              />
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="border-b">
              <SheetTitle>{t("followUp.title")}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <Button
                variant="outline"
                className="mb-4 w-full gap-2"
                onClick={handleNewConversation}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {t("followUp.newConversation")}
              </Button>

              {listQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : listQuery.data?.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
                  <MessageCircle className="text-muted-foreground/40 size-8" />
                  <p className="text-sm">{t("followUp.empty")}</p>
                  <p className="text-xs">
                    {t("followUp.emptyHint")}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {listQuery.data?.map((followUp) => (
                    <button
                      key={followUp.id}
                      className="hover:bg-secondary/80 w-full rounded-lg px-3 py-2.5 text-left transition-colors"
                      onClick={() => handleSelectFollowUp(followUp.id)}
                    >
                      <p className="truncate text-sm font-medium">
                        {followUp.title ?? t("followUp.untitled")}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {new Date(followUp.updatedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
