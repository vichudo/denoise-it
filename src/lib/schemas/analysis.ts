import { z } from "zod";

/* ── Verdict ──────────────────────────────────────────────── */

export const verdictSchema = z.enum([
  "true",
  "mostly_true",
  "mixed",
  "mostly_false",
  "false",
  "misleading",
  "satire",
  "unverifiable",
]);

export type Verdict = z.infer<typeof verdictSchema>;

export const verdictLabel: Record<Verdict, string> = {
  true: "TRUE",
  mostly_true: "MOSTLY TRUE",
  mixed: "MIXED",
  mostly_false: "MOSTLY FALSE",
  false: "FALSE",
  misleading: "MISLEADING",
  satire: "SATIRE",
  unverifiable: "UNVERIFIABLE",
};

export const verdictHexColor: Record<Verdict, string> = {
  true: "#34d399",
  mostly_true: "#6ee7b7",
  mixed: "#fbbf24",
  mostly_false: "#fb923c",
  false: "#f87171",
  misleading: "#fb923c",
  satire: "#a78bfa",
  unverifiable: "#9ca3af",
};

/* ── Signal (pure truth elements) ─────────────────────────── */

export const signalCategorySchema = z.enum([
  "fact",
  "statistic",
  "attribution",
  "context",
  "event",
]);

export type SignalCategory = z.infer<typeof signalCategorySchema>;

export const signalCategoryLabel: Record<SignalCategory, string> = {
  fact: "Fact",
  statistic: "Statistic",
  attribution: "Attribution",
  context: "Context",
  event: "Event",
};

export const signalElementSchema = z.object({
  category: signalCategorySchema.describe(
    "Type of signal: 'fact' = verified claim, 'statistic' = quantitative data point, 'attribution' = statement from a named source, 'context' = verified background info, 'event' = confirmed occurrence with time/place",
  ),
  content: z
    .string()
    .describe(
      "The factual, objective content with ALL affective language removed. Pure information only.",
    ),
  confidence: z
    .number()
    .describe(
      "Confidence 0-100 based on SOURCE CREDIBILITY and METHODOLOGICAL RIGOR, NOT search result prevalence. Primary sources (.gov, .edu, peer-reviewed) = higher. Viral/amplified media without primary backing = lower. Wikipedia-only = lower.",
    ),
  sources: z
    .array(z.string())
    .describe(
      "Actual clickable URLs from web search. Prioritize: .gov, .edu, peer-reviewed journals, official data over news and Wikipedia.",
    ),
});

export type SignalElement = z.infer<typeof signalElementSchema>;

/* ── Noise (filtered affective elements) ──────────────────── */

export const noiseTypeSchema = z.enum([
  "emotional_language",
  "bias",
  "narrative",
  "sensationalism",
  "opinion_as_fact",
  "speculation",
  "missing_context",
  "media_amplification",
]);

export type NoiseType = z.infer<typeof noiseTypeSchema>;

export const noiseTypeLabel: Record<NoiseType, string> = {
  emotional_language: "Emotional",
  bias: "Bias",
  narrative: "Narrative",
  sensationalism: "Sensational",
  opinion_as_fact: "Opinion",
  speculation: "Speculation",
  missing_context: "Omission",
  media_amplification: "Amplification",
};

export const noiseElementSchema = z.object({
  type: noiseTypeSchema.describe(
    "Type of noise: 'emotional_language' = loaded words/phrasing, 'bias' = systematic slant, 'narrative' = imposed storyline, 'sensationalism' = exaggeration for effect, 'opinion_as_fact' = subjective claim presented as objective, 'speculation' = ungrounded prediction, 'missing_context' = factual omission that distorts, 'media_amplification' = viral repetition without primary source backing",
  ),
  original: z
    .string()
    .describe("The original text fragment containing the noise"),
  reason: z
    .string()
    .describe(
      "Brief, precise explanation of why this is noise and how it distorts the signal.",
    ),
  sources: z
    .array(z.string())
    .describe(
      "URLs showing where this noise pattern appears or where it originated. For missing_context, link to sources that provide the omitted context. For media_amplification, link to the outlets amplifying without primary sourcing.",
    ),
});

export type NoiseElement = z.infer<typeof noiseElementSchema>;

/* ── Top-level analysis result ────────────────────────────── */

export const analysisResultSchema = z.object({
  verdict: verdictSchema.describe(
    "Single overall verdict. Use 'mixed' only when claims genuinely split with no dominant direction.",
  ),
  verdictHeadline: z
    .string()
    .describe(
      "One definitive sentence, max 12 words. E.g. 'This claim is demonstrably false.' or 'Verified by multiple independent sources.'",
    ),
  contentType: z
    .string()
    .describe("Type of content: 'news article', 'tweet', 'claim', 'rumor', etc."),
  signalScore: z
    .number()
    .describe("Signal-to-noise ratio 0-100. 0 = pure noise, 100 = pure verified signal"),
  summary: z
    .string()
    .describe(
      "Dense, information-rich paragraph (3-5 sentences) containing ONLY essential facts, precise numbers, dates, and specific entities. Zero fluff or hedging. Each sentence must convey unique verifiable information. If user input is a question, DIRECTLY ANSWER IT with precise data first, then supporting context.",
    ),
  signals: z
    .array(signalElementSchema)
    .describe(
      "Pure truth elements extracted from the content. Each is an independent, objectively verifiable unit of information with all affective noise stripped.",
    ),
  noise: z
    .array(noiseElementSchema)
    .describe(
      "Affective noise filtered out: emotional language, bias, narrative framing, sensationalism, speculation, omissions.",
    ),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
