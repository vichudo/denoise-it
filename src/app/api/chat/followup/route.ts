import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { getLanguageName } from "@/lib/constants";
import { env } from "@/env";
import { db } from "@/server/db";
import { parseSignalData } from "@/lib/utils";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

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
${analysisResult.signals.map((s, i) => `${i + 1}. [${s.category}] ${s.content} (confidence: ${s.confidence}%)`).join("\n")}

### Noise Identified
${analysisResult.noise.map((n, i) => `${i + 1}. [${n.type}] "${n.original}" — ${n.reason}`).join("\n")}
`;
  }

  systemPrompt += `
## Instructions
- Answer the user's follow-up questions using the analysis context above.
- You can provide deeper analysis, explain specific findings, or help the user understand the nuances.
- Be concise and factual. If you don't know something, say so.
- Do NOT rely solely on Wikipedia. Always cross-reference with primary sources (official records, peer-reviewed research, .gov/.edu domains, wire services).
- Use markdown formatting for clarity.`;

  if (language && language !== "en") {
    const langName = getLanguageName(language);
    systemPrompt += `\n- Respond entirely in ${langName} (${language}).`;
  }

  const result = streamText({
    model: openrouter.chat("x-ai/grok-4.1-fast:online"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      // Auto-generate title from first user message
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("")
            .slice(0, 80)
            .trim()
        : undefined;

      // Persist messages + assistant response to DB
      const allMessages = [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          parts: [{ type: "text" as const, text }],
        },
      ];

      await db.followUps.update({
        where: { id: followUpId },
        data: {
          messages: JSON.parse(JSON.stringify(allMessages)),
          ...(title ? { title } : {}),
        },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
