"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import { OUTPUT_LANGUAGES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { api } from "@/trpc/react";

const STYLE_OPTIONS = [
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "academic", label: "Academic" },
  { value: "concise", label: "Concise" },
  { value: "direct", label: "Direct" },
] as const;

function getAffectiveLabel(value: number): string {
  if (value <= 12) return "Pure signal";
  if (value <= 37) return "Mostly neutral";
  if (value <= 62) return "Balanced";
  if (value <= 87) return "Some emotion ok";
  return "Raw content";
}

export function FeedSettingsForm() {
  const router = useRouter();
  const [prefs] = api.feed.getPreferences.useSuspenseQuery();

  // Form state
  const [topics, setTopics] = useState<string[]>(prefs?.topics ?? []);
  const [topicInput, setTopicInput] = useState("");
  const [xAccounts, setXAccounts] = useState<string[]>(
    prefs?.xAccounts ?? [],
  );
  const [accountInput, setAccountInput] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState(
    prefs?.communicationStyle ?? "balanced",
  );
  const [affectiveLevel, setAffectiveLevel] = useState(
    prefs?.affectiveLevel ?? 30,
  );
  const [language, setLanguage] = useState(prefs?.language ?? "en");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    prefs?.additionalInstructions ?? "",
  );

  const save = api.feed.savePreferences.useMutation({
    onSuccess: () => router.push("/feed"),
  });

  function handleTopicKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = topicInput.trim();
      if (value && !topics.includes(value) && topics.length < 20) {
        setTopics([...topics, value]);
        setTopicInput("");
      }
    }
    if (e.key === "Backspace" && !topicInput && topics.length > 0) {
      setTopics(topics.slice(0, -1));
    }
  }

  function handleAccountKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = accountInput.trim().replace(/^@/, "");
      if (value && !xAccounts.includes(value) && xAccounts.length < 30) {
        setXAccounts([...xAccounts, value]);
        setAccountInput("");
      }
    }
    if (e.key === "Backspace" && !accountInput && xAccounts.length > 0) {
      setXAccounts(xAccounts.slice(0, -1));
    }
  }

  function handleSubmit() {
    if (topics.length === 0 || save.isPending) return;
    save.mutate({
      topics,
      xAccounts,
      communicationStyle,
      affectiveLevel,
      language,
      additionalInstructions: additionalInstructions.trim() || undefined,
    });
  }

  return (
    <div className="space-y-8">
      {/* Topics */}
      <div className="space-y-2">
        <Label>
          Topics of interest{" "}
          <span className="text-muted-foreground font-normal">
            ({topics.length}/20)
          </span>
        </Label>
        <p className="text-muted-foreground text-xs">
          What do you want to stay informed about? Press Enter to add.
        </p>
        <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border px-3 py-2">
          {topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="gap-1 pr-1">
              {topic}
              <button
                type="button"
                onClick={() => setTopics(topics.filter((t) => t !== topic))}
                className="hover:text-foreground rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleTopicKeyDown}
            placeholder={topics.length === 0 ? "e.g. AI, climate, space..." : ""}
            className="h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* X Accounts */}
      <div className="space-y-2">
        <Label>
          X accounts to follow{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <p className="text-muted-foreground text-xs">
          Specific accounts whose posts you want in your feed. Press Enter to
          add.
        </p>
        <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border px-3 py-2">
          {xAccounts.map((account) => (
            <Badge key={account} variant="secondary" className="gap-1 pr-1">
              @{account}
              <button
                type="button"
                onClick={() =>
                  setXAccounts(xAccounts.filter((a) => a !== account))
                }
                className="hover:text-foreground rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={accountInput}
            onChange={(e) => setAccountInput(e.target.value)}
            onKeyDown={handleAccountKeyDown}
            placeholder={
              xAccounts.length === 0 ? "e.g. elonmusk, NASA, WHO..." : ""
            }
            className="h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Communication Style */}
      <div className="space-y-2">
        <Label>Communication style</Label>
        <p className="text-muted-foreground text-xs">
          How should your feed content be written?
        </p>
        <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Affective Level */}
      <div className="space-y-3">
        <Label>Affective content level</Label>
        <p className="text-muted-foreground text-xs">
          How much emotional content is acceptable in your feed?
        </p>
        <div className="space-y-2">
          <Slider
            min={0}
            max={100}
            step={1}
            value={[affectiveLevel]}
            onValueChange={([v]) => v !== undefined && setAffectiveLevel(v)}
          />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Pure signal</span>
            <span className="text-foreground text-sm font-medium">
              {getAffectiveLabel(affectiveLevel)} ({affectiveLevel})
            </span>
            <span className="text-muted-foreground text-xs">Raw content</span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label>Output language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OUTPUT_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Instructions */}
      <div className="space-y-2">
        <Label>
          Additional instructions{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <p className="text-muted-foreground text-xs">
          Tell the agent anything else about how to curate your feed.
        </p>
        <Textarea
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder="e.g. Focus on Latin America, avoid celebrity gossip, I prefer data-heavy content with charts and numbers..."
          className="min-h-[80px] resize-none"
          maxLength={1000}
        />
        {additionalInstructions.length > 0 && (
          <p className="text-muted-foreground text-right text-xs">
            {additionalInstructions.length}/1000
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        size="lg"
        className="w-full"
        disabled={topics.length === 0 || save.isPending}
        onClick={handleSubmit}
      >
        {save.isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Saving...
          </>
        ) : prefs ? (
          "Update & go to feed"
        ) : (
          "Save & go to feed"
        )}
      </Button>

      {save.isError && (
        <p className="text-destructive text-center text-sm">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
