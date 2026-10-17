import { anthropic } from '@ai-sdk/anthropic';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { getLanguageName } from '@/lib/constants';
import { parseSignalData } from '@/lib/utils';
import { db } from '@/server/db';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages: UIMessage[];
    signalId: string;
    followUpId: number;
    language?: string;
  };

  const { messages, signalId, followUpId, language } = body;

  // Load signal from DB for context
  const signal = await db.signal.findUniqueOrThrow({
    where: { id: signalId },
  });

  const { data: analysisResult } = parseSignalData(signal.data);

  // Build system prompt with full signal context
  let systemPrompt = `You are a helpful follow-up assistant for a fact-checking platform called "Denoise It". The user has already received an analysis of some content and wants to ask follow-up questions.

## Original Content Analyzed
${signal.prompt}
`;

  if (analysisResult) {
    systemPrompt += `
## Analysis Results
- **Verdict:** ${analysisResult.verdict}
- **Headline:** ${analysisResult.verdictHeadline}
- **Signal Score:** ${analysisResult.signalScore}/100
- **Content Type:** ${analysisResult.contentType}

### Summary
${analysisResult.summary}

### Signals Found
${analysisResult.signals.map((s, i) => `${i + 1}. [${s.category}] ${s.content} (confidence: ${s.confidence}%)`).join('\n')}

### Noise Identified
${analysisResult.noise.map((n, i) => `${i + 1}. [${n.type}] "${n.original}" — ${n.reason}`).join('\n')}
`;
  }

  systemPrompt += `
## Instructions
- Answer the user's follow-up questions using the analysis context above.
- You can provide deeper analysis, explain specific findings, or help the user understand the nuances.
- Be concise and factual. If you don't know something, say so.
- Do NOT rely solely on Wikipedia. Always cross-reference with primary sources (official records, peer-reviewed research, .gov/.edu domains, wire services).
- Use markdown formatting for clarity.`;

  if (language && language !== 'en') {
    const langName = getLanguageName(language);
    systemPrompt += `\n- Respond entirely in ${langName} (${language}).`;
  }

  const result = streamText({
    model: anthropic('claude-opus-5-5'),
    instructions: systemPrompt,
    // Follow-ups often ask about developments the original analysis didn't
    // cover, so the model can look things up; results stream back as sources.
    tools: {
      web_search: anthropic.tools.webSearch_20260318({ maxUses: 3 }),
    },
    providerOptions: {
      // Conversational turns: keep latency low. Opus 5.5 can't disable
      // thinking, so effort is the lever.
      anthropic: { effort: 'low', fallbacks: 'default' },
    },
    messages: await convertToModelMessages(messages),
    onEnd: async ({ text }) => {
      // Auto-generate title from first user message
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.parts
            .filter((p) => p.type === 'text')
            .map((p) => p.text)
            .join('')
            .slice(0, 80)
            .trim()
        : undefined;

      // Persist messages + assistant response to DB
      const allMessages = [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          parts: [{ type: 'text' as const, text }],
        },
      ];

      await db.followUps.update({
        where: { id: followUpId },
        data: {
          // A JSON round-trip, not a clone: it drops `undefined` and anything
          // else a Json column cannot store.
          // oxlint-disable-next-line unicorn/prefer-structured-clone
          messages: JSON.parse(JSON.stringify(allMessages)) as object,
          ...(title ? { title } : {}),
        },
      });
    },
  });

  return createUIMessageStreamResponse({
    // Search results surface as `source-url` parts, which the chat renders
    // as links under the answer.
    stream: toUIMessageStream({ stream: result.stream, sendSources: true }),
  });
}
