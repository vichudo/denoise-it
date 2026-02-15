import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Laugh,
  Scale,
} from "lucide-react";

import type { Verdict } from "@/lib/schemas/analysis";

export const verdictIcon: Record<Verdict, typeof CheckCircle> = {
  true: CheckCircle,
  mostly_true: CheckCircle,
  mixed: Scale,
  mostly_false: AlertTriangle,
  false: XCircle,
  misleading: AlertTriangle,
  satire: Laugh,
  unverifiable: HelpCircle,
};

export const verdictColor: Record<Verdict, string> = {
  true: "text-emerald-600 dark:text-emerald-400",
  mostly_true: "text-emerald-600/80 dark:text-emerald-400/80",
  mixed: "text-amber-600 dark:text-amber-400",
  mostly_false: "text-orange-600 dark:text-orange-400",
  false: "text-red-600 dark:text-red-400",
  misleading: "text-orange-600 dark:text-orange-400",
  satire: "text-violet-600 dark:text-violet-400",
  unverifiable: "text-zinc-500 dark:text-zinc-400",
};

export const verdictBg: Record<Verdict, string> = {
  true: "bg-emerald-50 dark:bg-emerald-950/30",
  mostly_true: "bg-emerald-50/60 dark:bg-emerald-950/20",
  mixed: "bg-amber-50 dark:bg-amber-950/30",
  mostly_false: "bg-secondary/40",
  false: "bg-secondary/40",
  misleading: "bg-secondary/40",
  satire: "bg-violet-50 dark:bg-violet-950/30",
  unverifiable: "bg-secondary/50",
};

export const verdictBorder: Record<Verdict, string> = {
  true: "border-emerald-200/60 dark:border-emerald-800/40",
  mostly_true: "border-emerald-200/40 dark:border-emerald-800/30",
  mixed: "border-amber-200/60 dark:border-amber-800/40",
  mostly_false: "border-border/60",
  false: "border-border/60",
  misleading: "border-border/60",
  satire: "border-violet-200/60 dark:border-violet-800/40",
  unverifiable: "border-border/50",
};
