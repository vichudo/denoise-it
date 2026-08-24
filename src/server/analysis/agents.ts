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

5. EXTRACT NOISE: Identify affective distortion found IN THE SOURCES you researched. Only flag noise from articles, reports, and other source material discovered during your research.
   - Quote the original text fragment from the SOURCE
   - Classify: emotional_language, bias, narrative, sensationalism, opinion_as_fact, speculation, missing_context, media_amplification
   - Explain precisely why it's noise and how it distorts the signal
   - Provide source URLs: for missing_context link to what was omitted, for media_amplification link to outlets amplifying without primary backing, for bias/narrative link to counter-evidence
   - If you detected coverage asymmetry earlier, surface it here: flag which narrative is over-represented vs. under-represented, and link to the less-amplified sources so the user can judge for themselves

6. SIGNAL SCORE: Compute 0-100 ratio of verified signal to total content.

Be rigorous. Commit to assessments. Never hedge when evidence is clear.

## Output discipline

You MUST finish with the complete structured result. Keep every field tight so the whole
object fits comfortably in one response: aim for 6-12 signals and 4-8 noise elements,
picking the most load-bearing ones rather than exhaustively listing every candidate.
Never end your turn on a tool call — once you have enough evidence, stop searching and
emit the result. A short complete analysis is far better than a long truncated one.`;

/* ── Providers & shared output ─────────────────────────────── */

const analysisOutput = Output.object({ schema: analysisResultSchema });

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

// Provider-executed tools have a known type mismatch with ToolSet
const anthropicTools = {
  web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }),
} as unknown as ToolSet;

/**
 * Neither `claude-sonnet-5` nor `claude-opus-5` is in @ai-sdk/anthropic@3's model
 * table, so the provider falls back to a 4096-token cap for both. A full analysis
 * routinely needs ~12k output tokens, and a truncated response finishes with
 * `length` instead of `stop`, which makes the AI SDK throw
 * `AI_NoOutputGeneratedError`. Always set this explicitly.
 */
const MAX_OUTPUT_TOKENS = 16_000;

/**
 * Zod defaults in `src/env.js` are bypassed when `SKIP_ENV_VALIDATION` is set
 * (Docker builds), so fall back here too rather than handing the provider
 * `undefined` as a model id.
 */
const ANALYSIS_MODEL = env.ANALYSIS_MODEL ?? "claude-sonnet-5";

/* ── Agent factory ─────────────────────────────────────────── */

type Provider = "anthropic" | "grok";

function createAgent(provider: Provider, maxSteps: number, fast: boolean) {
  const isAnthropic = provider === "anthropic";

  return new ToolLoopAgent({
    model: isAnthropic
      ? anthropic(ANALYSIS_MODEL)
      : openrouter.chat("x-ai/grok-4.5:online"),
    instructions: ANALYSIS_INSTRUCTIONS,
    ...(isAnthropic && { tools: anthropicTools }),
    output: analysisOutput,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    // Retries transient failures (429, 5xx, connection resets) inside a single attempt.
    maxRetries: 2,
    stopWhen: stepCountIs(maxSteps),
    // Last step must produce the structured output, so take the tools away and
    // let the model do nothing but answer. Without this, a loop that spends its
    // whole budget searching ends on `tool-calls` and yields no output at all.
    prepareStep: ({ stepNumber }) =>
      stepNumber >= maxSteps - 1 ? { activeTools: [] } : {},
    providerOptions: {
      anthropic: {
        // Sonnet 5 and Opus 5 both support native structured outputs
        // (`output_config.format`). The provider's `auto` mode doesn't know that
        // for these model ids and falls back to a forced `json` tool call, which
        // is both less reliable and throws away the model's cited text.
        structuredOutputMode: "outputFormat",
        // Cheaper/faster reasoning for the fast path. Do NOT disable thinking
        // outright — with it off these models sometimes write tool calls as
        // plain text and leak `<thinking>` tags into the response.
        ...(fast && { effort: "low" as const }),
      },
      // Deliberately no `openrouter.reasoning` override: `x-ai/grok-4.5:online`
      // rejects the whole request with "Reasoning is mandatory for this endpoint
      // and cannot be disabled", so the old fast-path setting failed every call.
    },
  });
}

/* ── Agent instances ───────────────────────────────────────── */

const anthropicAgent = createAgent("anthropic", 6, false);
const anthropicFastAgent = createAgent("anthropic", 4, true);
const grokAgent = createAgent("grok", 6, false);
const grokFastAgent = createAgent("grok", 4, true);

/* ── Social media detection ────────────────────────────────── */

const SOCIAL_MEDIA_PATTERN =
  /(?:twitter\.com|x\.com|instagram\.com|linkedin\.com|facebook\.com|fb\.com|tiktok\.com|threads\.net|reddit\.com|bsky\.app|mastodon\.social)/i;

function isSocialMediaContent(content: string): boolean {
  return SOCIAL_MEDIA_PATTERN.test(content);
}

/* ── Public API ────────────────────────────────────────────── */

export type AnalysisAgent = typeof anthropicAgent;

export interface AnalysisAttempt {
  /** Identifies the provider in logs. */
  label: Provider;
  agent: AnalysisAgent;
}

/**
 * Ordered list of agents to try for a piece of content. The preferred provider
 * comes first; the other one is the fallback, so a provider outage or a model
 * that refuses to produce parseable output doesn't kill the whole analysis.
 *
 * Grok goes first for social media because its `:online` search indexes posts
 * that Anthropic's web search cannot reach.
 */
export function pickAttempts(content: string, fast = false): AnalysisAttempt[] {
  const anthropicAttempt: AnalysisAttempt = {
    label: "anthropic",
    agent: fast ? anthropicFastAgent : anthropicAgent,
  };
  const grokAttempt: AnalysisAttempt = {
    label: "grok",
    agent: fast ? grokFastAgent : grokAgent,
  };

  return isSocialMediaContent(content)
    ? [grokAttempt, anthropicAttempt]
    : [anthropicAttempt, grokAttempt];
}
