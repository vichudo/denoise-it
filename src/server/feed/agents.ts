import { type ToolSet, ToolLoopAgent, Output, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { feedGenerationResultSchema } from "@/lib/schemas/feed";
import { getLanguageName } from "@/lib/constants";
import { env } from "@/env";

/* ── Providers ────────────────────────────────────────────── */

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

const anthropicTools = {
  web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }),
} as unknown as ToolSet;

const feedOutput = Output.object({ schema: feedGenerationResultSchema });

/* ── Instructions builder ─────────────────────────────────── */

interface FeedPrefs {
  topics: string[];
  xAccounts: string[];
  communicationStyle: string;
  affectiveLevel: number;
  language: string;
  additionalInstructions?: string | null;
}

function buildInstructions(prefs: FeedPrefs, mode: "social" | "topics"): string {
  const langName = getLanguageName(prefs.language);

  const topicsList = prefs.topics.map((t) => `• ${t}`).join("\n");
  const accountsList =
    prefs.xAccounts.length > 0
      ? prefs.xAccounts.map((a) => `• @${a.replace(/^@/, "")}`).join("\n")
      : "(none specified)";

  const affectiveGuidance =
    prefs.affectiveLevel <= 20
      ? "ZERO emotional content. Strictly objective, clinical tone. Remove ALL affective language."
      : prefs.affectiveLevel <= 50
        ? "Minimal emotional content. Keep tone neutral and informative. Remove sensationalism but allow factual emotional context (e.g. 'protests erupted')."
        : prefs.affectiveLevel <= 80
          ? "Moderate emotional content allowed. Preserve genuine human sentiment but strip sensationalism and manipulation."
          : "Raw content is acceptable. Preserve original emotional tone but still flag manipulative framing.";

  return `You are a personalized feed curator for a content denoising platform. Your job: find RECENT, HIGH-SIGNAL content and present it stripped of noise, tailored to this specific user.

## USER PREFERENCES

**Topics of interest:**
${topicsList}

**X accounts to follow:**
${accountsList}

**Communication style:** ${prefs.communicationStyle}
**Affective tolerance:** ${prefs.affectiveLevel}/100
${affectiveGuidance}

**Output language:** ${langName} (${prefs.language})

## YOUR TASK

${mode === "social"
      ? `Search X (Twitter) for recent posts (last 24-48 hours) from the specified accounts AND about the specified topics. Prioritize posts from the listed accounts, then add relevant posts from other accounts that match the topics.`
      : `Search the web for recent news and content (last 24-48 hours) about the specified topics. Prioritize high-credibility sources (.gov, .edu, major wire services, established outlets).`
    }

For EACH piece of content worth surfacing:

1. **Extract the signal** — what is the actual, verifiable information?
2. **Rewrite the headline** in the user's "${prefs.communicationStyle}" communication style. Max 15 words. No clickbait, no sensationalism.
3. **Write a 1-2 sentence summary** (content field) — pure information only.
4. **Write an expanded detail** (expandedContent field) — 3-5 sentences with key facts, numbers, dates, context.
5. **Calibrate emotional content** to the user's affective level (${prefs.affectiveLevel}/100).
6. **Note the source** (account handle or outlet name) and provide the source URL.
7. **Tag the topic** — use the EXACT topic string from the user's preferences list.
8. **Classify the source type** — tweet, article, paper, report, post, video, or podcast.
9. **Include an image URL** if the source has an Open Graph image, article thumbnail, or relevant visual. Only include REAL image URLs from the source — never fabricate them.
10. **Extract the content date** — when the content was originally published or posted. Use ISO 8601 (YYYY-MM-DD) format. If only a relative date is available (e.g. "2 hours ago"), convert it to an absolute date based on today (${new Date().toISOString().split("T")[0]}).

Return 10-15 items, prioritized by signal-to-noise ratio and relevance to the user's interests.

ALL output MUST be in ${langName}.
Do NOT include content that is purely opinion, speculation, or noise with no underlying signal.
Do NOT include duplicate stories — if multiple sources cover the same event, pick the highest-signal version.${prefs.additionalInstructions ? `\n\n## ADDITIONAL USER INSTRUCTIONS\n\n${prefs.additionalInstructions}` : ""}`;
}

/* ── Agent factory ────────────────────────────────────────── */

function createFeedAgent(
  provider: "anthropic" | "grok",
  prefs: FeedPrefs,
) {
  const mode = provider === "grok" ? "social" : "topics";

  return new ToolLoopAgent({
    model:
      provider === "anthropic"
        ? anthropic("claude-sonnet-4-6")
        : openrouter.chat("x-ai/grok-4.1-fast:online"),
    instructions: buildInstructions(prefs, mode),
    ...(provider === "anthropic" && { tools: anthropicTools }),
    output: feedOutput,
    stopWhen: stepCountIs(3),
  });
}

/* ── Public API ───────────────────────────────────────────── */

export type FeedAgent = ReturnType<typeof createFeedAgent>;

export function createFeedAgents(prefs: FeedPrefs) {
  return {
    social: prefs.xAccounts.length > 0 ? createFeedAgent("grok", prefs) : null,
    topics: prefs.topics.length > 0 ? createFeedAgent("anthropic", prefs) : null,
  };
}
