"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DenoiseCategory =
  | "fact"
  | "context"
  | "opinion"
  | "speculation"
  | "misleading"
  | "unverifiable";

export interface DenoiseElement {
  id: string;
  claim: string;
  confidence: number;
  category: DenoiseCategory;
  explanation: string;
  source?: string;
}

export interface DenoiseResult {
  summary: string;
  signalScore: number;
  originalType: string;
  elements: DenoiseElement[];
}

const categoryVariant: Record<
  DenoiseCategory,
  "default" | "secondary" | "outline" | "destructive"
> = {
  fact: "default",
  context: "secondary",
  opinion: "outline",
  speculation: "outline",
  misleading: "destructive",
  unverifiable: "outline",
};

const categoryLabel: Record<DenoiseCategory, string> = {
  fact: "Fact",
  context: "Context",
  opinion: "Opinion",
  speculation: "Speculation",
  misleading: "Misleading",
  unverifiable: "Unverifiable",
};

export function TruthCard({
  element,
  index,
}: {
  element: DenoiseElement;
  index: number;
}) {
  return (
    <Card
      className="animate-in fade-in-0 slide-in-from-bottom-4 border-none bg-secondary/50 shadow-none fill-mode-both"
      style={{ animationDelay: `${index * 100}ms`, animationDuration: "400ms" }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium leading-snug">
            {element.claim}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(element.confidence * 100)}%
            </span>
            <Badge variant={categoryVariant[element.category]}>
              {categoryLabel[element.category]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{element.explanation}</p>
        {element.source && (
          <blockquote className="rounded-md bg-secondary/80 px-3 py-2 text-xs text-muted-foreground">
            {element.source}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
