'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  XCircle,
  MessageCircle,
  Loader2,
  ExternalLink,
  Signal,
  Globe,
  Link2,
  Lock,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { verdictLabel } from '@/lib/schemas/analysis';
import { getDomain } from '@/lib/utils';
import { verdictIcon, verdictColor } from '@/lib/verdict';
import { api, type RouterOutputs } from '@/trpc/react';

/* ── Privacy config ──────────────────────────────────────── */

const privacyOptions = [
  { value: 'PUBLIC', label: 'Public', icon: Globe },
  { value: 'UNLISTED', label: 'Unlisted', icon: Link2 },
  { value: 'PRIVATE', label: 'Private', icon: Lock },
] as const;

type Privacy = (typeof privacyOptions)[number]['value'];

type SignalRow = RouterOutputs['user']['signals'][number];

/** Spinner while pending, an error mark, or the verdict's icon. */
function SignalStatusIcon({ signal }: { signal: SignalRow }) {
  if (signal.pending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
  if (signal.error) {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  if (!signal.verdict) return null;
  const Icon = verdictIcon[signal.verdict];
  return <Icon className={`h-4 w-4 ${verdictColor[signal.verdict]}`} />;
}

/* ── Component ───────────────────────────────────────────── */

export function SignalsList() {
  const utils = api.useUtils();
  const { data: signals, isLoading } = api.user.signals.useQuery();
  const updatePrivacy = api.user.updatePrivacy.useMutation({
    onMutate: async ({ id, privacy }) => {
      await utils.user.signals.cancel();
      const prev = utils.user.signals.getData();
      utils.user.signals.setData(undefined, (old) =>
        old?.map((s) => (s.id === id ? { ...s, privacy } : s)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.user.signals.setData(undefined, ctx.prev);
    },
    onSettled: () => void utils.user.signals.invalidate(),
  });

  const deleteSignal = api.user.deleteSignal.useMutation({
    onMutate: async ({ id }) => {
      await utils.user.signals.cancel();
      const prev = utils.user.signals.getData();
      utils.user.signals.setData(undefined, (old) =>
        old?.filter((s) => s.id !== id),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.user.signals.setData(undefined, ctx.prev);
    },
    onSettled: () => void utils.user.signals.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!signals?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Signal className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No signals yet. Start by analyzing something on the{' '}
          <Link
            href="/"
            className="text-foreground underline underline-offset-4"
          >
            homepage
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {signals.map((signal) => {
        return (
          <div
            key={signal.id}
            className="flex items-start gap-4 py-4 first:pt-0"
          >
            {/* Verdict icon or pending state */}
            <Link
              href={`/s/${signal.id}`}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center"
            >
              <SignalStatusIcon signal={signal} />
            </Link>

            {/* Content */}
            <Link
              href={`/s/${signal.id}`}
              className="min-w-0 flex-1 rounded-md transition-colors hover:bg-muted/50"
            >
              <div className="flex items-baseline gap-2">
                <p className="truncate text-sm font-medium">{signal.title}</p>
                {signal.sourceUrl && (
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    <ExternalLink className="mr-0.5 inline h-3 w-3" />
                    {getDomain(signal.sourceUrl)}
                  </span>
                )}
              </div>

              {signal.verdictHeadline && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {signal.verdictHeadline}
                </p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {signal.verdict && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {verdictLabel[signal.verdict]}
                    {signal.signalScore !== null && (
                      <span className="ml-1 text-muted-foreground">
                        {signal.signalScore}%
                      </span>
                    )}
                  </Badge>
                )}
                {signal.error && (
                  <Badge variant="destructive" className="text-xs font-normal">
                    Error
                  </Badge>
                )}
                {signal.followUpCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    {signal.followUpCount}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(signal.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <Select
                value={signal.privacy}
                onValueChange={(value: Privacy) =>
                  updatePrivacy.mutate({ id: signal.id, privacy: value })
                }
              >
                <SelectTrigger className="h-8 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {privacyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete signal</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this signal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this analysis and all its
                      follow-ups. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteSignal.mutate({ id: signal.id })}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      })}
    </div>
  );
}
