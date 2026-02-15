"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  ArrowDown,
  ChevronDown,
  ExternalLink,
  Globe,
  MessageCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { getDomain } from "@/lib/utils";
import { useTranslation } from "@/components/language-provider";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

interface Source {
  url: string;
  title: string;
}

function getMessageSources(message: UIMessage): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];

  // 1. Check for source-url parts from the AI SDK stream
  for (const part of message.parts) {
    if (part.type === "source-url" && !seen.has(part.url)) {
      seen.add(part.url);
      sources.push({
        url: part.url,
        title: part.title ?? getDomain(part.url),
      });
    }
  }

  // 2. Extract markdown links [title](url) from text
  const text = getMessageText(message);
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(text)) !== null) {
    const url = match[2]!;
    if (!seen.has(url)) {
      seen.add(url);
      sources.push({ url, title: match[1] ?? getDomain(url) });
    }
  }

  // 3. Extract bare URLs not already captured
  const bareUrlRegex = /(?<!\()(https?:\/\/[^\s)<>]+)/g;
  while ((match = bareUrlRegex.exec(text)) !== null) {
    const url = match[1] ?? match[0];
    if (!seen.has(url)) {
      seen.add(url);
      sources.push({ url, title: getDomain(url) });
    }
  }

  return sources;
}

function MessageSources({ sources }: { sources: Source[] }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  const preview = sources.slice(0, 3);
  const remaining = sources.length - preview.length;
  const domainList = preview.map((s) => getDomain(s.url)).join(", ");

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1.5 text-[11px] transition-colors"
      >
        <Globe className="size-3 shrink-0" />
        <span>
          {t(
            sources.length === 1
              ? "chat.sourceSingular"
              : "chat.sourcePlural",
            { count: sources.length },
          )}
          {!expanded && (
            <span className="text-muted-foreground/40">
              {" "}
              &middot; {domainList}
              {remaining > 0 && ` +${remaining}`}
            </span>
          )}
        </span>
        <ChevronDown
          className={`size-3 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 space-y-0.5">
              {sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1.5 py-0.5 text-[11px] transition-colors"
                >
                  <ExternalLink className="size-2.5 shrink-0" />
                  <span className="min-w-0 truncate">{source.title}</span>
                  <span className="text-muted-foreground/30 shrink-0">
                    {getDomain(source.url)}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BOTTOM_THRESHOLD = 40;

export function FollowUpChat({
  signalId,
  followUpId,
  initialMessages,
}: {
  signalId: string;
  followUpId: number;
  initialMessages?: UIMessage[];
}) {
  const { language, t } = useTranslation();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/followup",
        body: {
          signalId,
          followUpId,
          ...(language !== "en" && { language }),
        },
      }),
    [signalId, followUpId, language],
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    messages: initialMessages,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const stuckRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    stuckRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, []);

  // Auto-scroll when stuck to bottom and messages/status change
  useEffect(() => {
    if (stuckRef.current) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, status]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    stuckRef.current = true;
    setIsAtBottom(true);
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={checkBottom}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="text-muted-foreground">
              <MessageCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">{t("chat.askTitle")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("chat.askHint")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 p-4">
            {messages.map((message) => {
              const text = getMessageText(message);
              const isAssistant = message.role === "assistant";
              const sources = isAssistant ? getMessageSources(message) : [];
              const isLoading = isAssistant && !text && status !== "ready";

              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "user" ? (
                      <p>{text}</p>
                    ) : isLoading ? (
                      <Shimmer as="span" duration={1.5} className="text-sm">
                        {t("chat.thinking")}
                      </Shimmer>
                    ) : (
                      <>
                        <MessageResponse>{text}</MessageResponse>
                        <MessageSources sources={sources} />
                      </>
                    )}
                  </MessageContent>
                </Message>
              );
            })}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer as="span" duration={1.5} className="text-sm">
                    {t("chat.thinking")}
                  </Shimmer>
                </MessageContent>
              </Message>
            )}
          </div>
        )}
      </div>

      {!isAtBottom && (
        <Button
          className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full"
          onClick={scrollToBottom}
          size="icon"
          variant="outline"
        >
          <ArrowDown className="size-4" />
        </Button>
      )}

      <div className="border-t p-3">
        <PromptInput
          onSubmit={(msg) => {
            void sendMessage({ text: msg.text });
            // Re-stick on send
            stuckRef.current = true;
            setIsAtBottom(true);
          }}
        >
          <PromptInputTextarea placeholder={t("chat.placeholder")} />
          <PromptInputFooter>
            <div />
            <PromptInputSubmit
              status={status}
              onStop={() => void stop()}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
