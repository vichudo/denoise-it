'use client';

import { formatDistanceToNow } from 'date-fns';
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
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { getDomain } from '@/lib/utils';

/* ── Source type config ───────────────────────────────────── */

const SOURCE_TYPE_CONFIG: Record<
  string,
  { icon: typeof Twitter; label: string; color: string }
> = {
  tweet: { icon: Twitter, label: 'Post', color: 'text-sky-500' },
  article: { icon: Newspaper, label: 'Article', color: 'text-amber-500' },
  paper: { icon: GraduationCap, label: 'Paper', color: 'text-violet-500' },
  report: { icon: FileText, label: 'Report', color: 'text-emerald-500' },
  post: { icon: PenLine, label: 'Blog', color: 'text-rose-500' },
  video: { icon: Play, label: 'Video', color: 'text-red-500' },
  podcast: { icon: Headphones, label: 'Podcast', color: 'text-purple-500' },
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
  const typeConfig =
    SOURCE_TYPE_CONFIG[item.sourceType] ?? SOURCE_TYPE_CONFIG.article!;
  const TypeIcon = typeConfig.icon;
  const domain = getDomain(item.sourceUrl);
  const hasImage = item.imageUrl && !imgError;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group w-full animate-in overflow-hidden rounded-xl border text-left transition-all duration-200 fade-in-0 fill-mode-both slide-in-from-bottom-1 hover:bg-muted/50 hover:shadow-sm"
          style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
        >
          {/* Image banner */}
          {hasImage && (
            <div className="relative h-36 w-full overflow-hidden bg-muted">
              <Image
                src={item.imageUrl!}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 672px) 100vw, 672px"
                onError={() => setImgError(true)}
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/80" />
            </div>
          )}

          <div className="px-4 py-3">
            {/* Source row */}
            <div className="mb-1.5 flex items-center gap-2">
              <TypeIcon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
              <span className="text-xs font-medium text-muted-foreground">
                {item.source}
              </span>
              <span className="text-xs text-muted-foreground/40">{domain}</span>
              <span className="ml-auto text-xs text-muted-foreground/50">
                {item.contentDate ??
                  formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
              </span>
            </div>

            {/* Headline */}
            <p className="text-sm leading-snug font-semibold">
              {item.headline}
            </p>

            {/* Content preview */}
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {item.content}
            </p>

            {/* Footer */}
            <div className="mt-2.5 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {item.topic}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs font-normal ${typeConfig.color}`}
              >
                {typeConfig.label}
              </Badge>
              <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="-mt-1 rounded-b-xl border border-t-0 bg-muted/30 px-4 py-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.expandedContent}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
