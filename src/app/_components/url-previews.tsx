"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";

const URL_REGEX = /https?:\/\/[^\s<>)"',]+/gi;

function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  return [...new Set(matches)];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function useUrlTitles(urls: string[]) {
  const [titles, setTitles] = useState<Record<string, string | null>>({});
  const cacheRef = useRef<Record<string, string | null>>({});

  useEffect(() => {
    for (const url of urls) {
      if (url in cacheRef.current) continue;
      // Mark as in-flight
      cacheRef.current[url] = null;

      fetch(`/api/og?url=${encodeURIComponent(url)}`)
        .then((res) => res.json() as Promise<{ title: string | null }>)
        .then(({ title }) => {
          cacheRef.current[url] = title;
          setTitles((prev) => ({ ...prev, [url]: title }));
        })
        .catch(() => {
          cacheRef.current[url] = null;
        });
    }
  }, [urls]);

  return titles;
}

export function UrlPreviews({
  text,
  onRemove,
}: {
  text: string;
  onRemove?: (url: string) => void;
}) {
  const urls = useMemo(() => extractUrls(text), [text]);
  const titles = useUrlTitles(urls);

  if (urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url) => {
        const domain = getDomain(url);
        const title = titles[url];
        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={url}
            className="animate-in fade-in-0 zoom-in-95 group inline-flex max-w-[300px] cursor-pointer items-center gap-1.5 rounded-md border bg-secondary/50 px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-secondary hover:text-foreground"
            style={{ animationDuration: "150ms" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt=""
              width={14}
              height={14}
              className="shrink-0 rounded-sm"
            />
            <span className="truncate">
              {title ? (
                <>
                  <span className="text-foreground/70 group-hover:text-foreground">{title}</span>
                  <span className="mx-1 text-muted-foreground/40">·</span>
                  <span>{domain}</span>
                </>
              ) : (
                domain
              )}
            </span>
            <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(url);
                }}
                className="shrink-0 rounded-sm opacity-50 transition-opacity hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            )}
          </a>
        );
      })}
    </div>
  );
}
