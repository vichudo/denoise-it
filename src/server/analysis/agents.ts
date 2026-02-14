import { type ToolSet, ToolLoopAgent, Output, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { analysisResultSchema } from "@/lib/schemas/analysis";
import { env } from "@/env";

/* ── Instructions ──────────────────────────────────────────── */

const ANALYSIS_INSTRUCTIONS = `You are a precision fact-checking agent. Your job: separate SIGNAL from NOISE in any content.

SIGNAL = independently verifiable, objective units of information. Each signal element must stand alone as a factual statement with all emotional, narrative, and rhetorical framing removed.

NOISE = everything that distorts signal — emotional language, bias, narrative framing, sensationalism, opinions presented as facts, speculation, and critical missing context.

## Coverage Asymmetry Awareness

Before scoring, Consider scanning for lopsided coverage — situations where one narrative dominates media volume while an equally relevant counter-narrative has narrow or minimal amplification. This can happen when:
- A widely repeated claim has credible counter-evidence that received little distribution.
- Sources overwhelmingly represent one stakeholder while other affected parties are absent or underquoted.
- Sheer repetition across outlets creates an impression of consensus that doesn't match the underlying evidence.
- Official or institutional positions are echoed broadly while independent or on-the-ground accounts remain niche.

When you notice this pattern, gently compensate: actively search for the underrepresented side, weigh evidence by its quality rather than its volume, and reflect this in confidence scores and the signal score. Surface the imbalance explicitly as missing_context or media_amplification noise so the user sees the full picture.

## Process

1. VERDICT: Determine the overall truth status of the content. Use 'mixed' only when claims genuinely split with no dominant direction.

2. VERDICT HEADLINE: One punchy definitive sentence, max 12 words. First thing users see. E.g. "This claim is demonstrably false." or "Confirmed by multiple primary sources."

3. SUMMARY: Dense, scientific-abstract paragraph (3-5 sentences). ONLY facts, numbers, dates, entity names. Zero hedging, zero filler. If the user asks a question, ANSWER IT FIRST with precise data, then provide supporting context.

4. EXTRACT SIGNALS: For each distinct verifiable claim in the content:
   - Strip ALL affective language. Write it as pure objective information.
   - Categorize: fact (verified claim), statistic (quantitative data), attribution (from named source), context (verified background), event (confirmed occurrence)
   - Score confidence 0-100 based on SOURCE CREDIBILITY:
     * .gov, .edu, peer-reviewed journals, official records → high confidence
     * Major wire services (AP, Reuters) with primary sourcing → high confidence
     * News articles aggregating other news → medium confidence
     * Viral/social media without primary backing → low confidence
     * Wikipedia as sole source → low confidence (potential bias, recent edits)
   - NEVER rely solely on Wikipedia. Always cross-reference with primary sources (official records, peer-reviewed research, .gov/.edu domains, wire services). If only Wikipedia is available, flag the claim as unverified and note the limitation.
   - Provide actual clickable source URLs from your web search

5. EXTRACT NOISE: Identify affective distortion found IN THE SOURCES you researched — NOT in the user's original question or prompt. The user's input is just a query; never quote it as noise or analyze its framing. Only flag noise from articles, reports, and other source material discovered during your research.
   - Quote the original text fragment from the SOURCE
   - Classify: emotional_language, bias, narrative, sensationalism, opinion_as_fact, speculation, missing_context, media_amplification
   - Explain precisely why it's noise and how it distorts the signal
   - Provide source URLs: for missing_context link to what was omitted, for media_amplification link to outlets amplifying without primary backing, for bias/narrative link to counter-evidence
   - If you detected coverage asymmetry earlier, surface it here: flag which narrative is over-represented vs. under-represented, and link to the less-amplified sources so the user can judge for themselves

6. SIGNAL SCORE: Compute 0-100 ratio of verified signal to total content.

Be rigorous. Commit to assessments. Never hedge when evidence is clear.`;

/* ── Providers & shared output ─────────────────────────────── */

const analysisOutput = Output.object({ schema: analysisResultSchema });

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

// Provider-executed tools have a known type mismatch with ToolSet
const anthropicTools = {
  web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }),
} as unknown as ToolSet;

/* ── Agent factory ─────────────────────────────────────────── */

function createAgent(provider: "anthropic" | "grok", maxSteps: number) {
  return new ToolLoopAgent({
    model:
      provider === "anthropic"
        ? anthropic("claude-opus-4-6")
        : openrouter.chat("x-ai/grok-4.1-fast:online"),
    instructions: ANALYSIS_INSTRUCTIONS,
    ...(provider === "anthropic" && { tools: anthropicTools }),
    output: analysisOutput,
    stopWhen: stepCountIs(maxSteps),
  });
}

/* ── Agent instances ───────────────────────────────────────── */

const anthropicAgent = createAgent("anthropic", 3);
const anthropicFastAgent = createAgent("anthropic", 2);
const grokAgent = createAgent("grok", 3);
const grokFastAgent = createAgent("grok", 2);

/* ── Social media detection ────────────────────────────────── */

const SOCIAL_MEDIA_PATTERN =
  /(?:twitter\.com|x\.com|instagram\.com|linkedin\.com|facebook\.com|fb\.com|tiktok\.com|threads\.net|reddit\.com|bsky\.app|mastodon\.social)/i;

function isSocialMediaContent(content: string): boolean {
  return SOCIAL_MEDIA_PATTERN.test(content);
}

/* ── Public API ────────────────────────────────────────────── */

export type AnalysisAgent = typeof anthropicAgent;

export function pickAgent(content: string, fast = false): AnalysisAgent {
  const social = isSocialMediaContent(content);
  if (social) return fast ? grokFastAgent : grokAgent;
  return fast ? anthropicFastAgent : anthropicAgent;
}
