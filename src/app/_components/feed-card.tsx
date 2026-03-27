"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  Newspaper,
  PenLine,
  Play,
  Twitter,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getDomain } from "@/lib/utils";

/* ── Source type config ───────────────────────────────────── */

const SOURCE_TYPE_CONFIG: Record<
  string,
  { icon: typeof Twitter; label: string; color: string }
> = {
  tweet: { icon: Twitter, label: "Post", color: "text-sky-500" },
  article: { icon: Newspaper, label: "Article", color: "text-amber-500" },
  paper: { icon: GraduationCap, label: "Paper", color: "text-violet-500" },
  report: { icon: FileText, label: "Report", color: "text-emerald-500" },
  post: { icon: PenLine, label: "Blog", color: "text-rose-500" },
  video: { icon: Play, label: "Video", color: "text-red-500" },
  podcast: { icon: Headphones, label: "Podcast", color: "text-purple-500" },
};

/* ── Component ────────────────────────────────────────────── */

interface FeedItemData {
  id: string;
  headline: string;
  content: string;
  expandedContent: string;
  source: string;
  sourceUrl: string;
  sourceType: string;
  imageUrl: string | null;
  contentDate: string | null;
  topic: string;
  createdAt: Date;
}

export function FeedCard({
  item,
  index,
}: {
  item: FeedItemData;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const typeConfig = SOURCE_TYPE_CONFIG[item.sourceType] ?? SOURCE_TYPE_CONFIG.article!;
  const TypeIcon = typeConfig.icon;
  const domain = getDomain(item.sourceUrl);
  const hasImage = item.imageUrl && !imgError;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group hover:bg-muted/50 animate-in fade-in-0 slide-in-from-bottom-1 w-full overflow-hidden rounded-xl border text-left transition-all duration-200 hover:shadow-sm fill-mode-both"
          style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
        >
          {/* Image banner */}
          {hasImage && (
            <div className="bg-muted relative h-36 w-full overflow-hidden">
              <Image
                src={item.imageUrl!}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 672px) 100vw, 672px"
                onError={() => setImgError(true)}
                unoptimized
              />
              <div className="from-background/80 absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t" />
            </div>
          )}

          <div className="px-4 py-3">
            {/* Source row */}
            <div className="mb-1.5 flex items-center gap-2">
              <TypeIcon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
              <span className="text-muted-foreground text-xs font-medium">
                {item.source}
              </span>
              <span className="text-muted-foreground/40 text-xs">
                {domain}
              </span>
              <span className="text-muted-foreground/50 ml-auto text-xs">
                {item.contentDate ??
                  formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
              </span>
            </div>

            {/* Headline */}
            <p className="text-sm font-semibold leading-snug">{item.headline}</p>

            {/* Content preview */}
            <p className="text-muted-foreground mt-1.5 line-clamp-2 text-[13px] leading-relaxed">
              {item.content}
            </p>

            {/* Footer */}
            <div className="mt-2.5 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs font-normal"
              >
                {item.topic}
              </Badge>
              <Badge variant="outline" className={`text-xs font-normal ${typeConfig.color}`}>
                {typeConfig.label}
              </Badge>
              <ChevronDown className="text-muted-foreground/40 ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-muted/30 -mt-1 rounded-b-xl border border-t-0 px-4 py-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {item.expandedContent}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              View original on {domain}
            </a>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
