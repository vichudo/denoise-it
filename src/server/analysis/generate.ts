import { getLanguageName } from "@/lib/constants";
import { db } from "@/server/db";
import { type AnalysisAgent, pickAgent } from "./agents";
import { progressBus } from "./progress-bus";

const QUERY_PREVIEW_LEN = 70;

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function safeDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function generateAnalysis(
  id: string,
  content: string,
  options?: { fast?: boolean; language?: string },
) {
  const agent: AnalysisAgent = pickAgent(content, options?.fast);

  try {
    progressBus.publish(
      id,
      options?.fast
        ? "Quick scan starting…"
        : "Deep analysis starting — gathering sources…",
    );

    let prompt = content;

    if (options?.language && options.language !== "en") {
      const langName = getLanguageName(options.language);
      prompt += `\n\n[LANGUAGE INSTRUCTION: Respond entirely in ${langName} (${options.language}). All output — verdict, headline, summary, signal descriptions, noise explanations — must be in ${langName}. Keep quoted noise fragments in their original language.]`;
    }

    let stepCount = 0;
    let sawAnyToolCall = false;

    const result = await agent.generate({
      prompt,
      onStepFinish: (step) => {
        stepCount += 1;

        const messages: string[] = [];

        const searchCalls = step.toolCalls.filter(
          (tc) => tc.toolName === "web_search",
        );
        for (const tc of searchCalls) {
          sawAnyToolCall = true;
          const query = (tc.input as { query?: unknown } | null)?.query;
          if (typeof query === "string" && query.length > 0) {
            messages.push(`Searching: "${truncate(query, QUERY_PREVIEW_LEN)}"`);
          } else {
            messages.push("Searching the web…");
          }
        }

        const searchResults = step.toolResults.filter(
          (tr) => tr.toolName === "web_search",
        );
        for (const tr of searchResults) {
          const items = Array.isArray(tr.output)
            ? (tr.output as Array<{ url?: string | null }>)
            : [];
          if (items.length === 0) continue;
          const domains = [
            ...new Set(
              items
                .map((i) => safeDomain(i.url))
                .filter((d): d is string => Boolean(d)),
            ),
          ].slice(0, 3);
          messages.push(
            `Found ${items.length} source${items.length === 1 ? "" : "s"}` +
              (domains.length ? ` (${domains.join(", ")}…)` : ""),
          );
        }

        if (messages.length === 0) {
          messages.push(
            sawAnyToolCall
              ? "Distilling signal & noise from sources…"
              : `Step ${stepCount} — synthesizing analysis…`,
          );
        }

        for (const m of messages) progressBus.publish(id, m);
      },
    });

    await db.signal.update({
      where: { id },
      data: { data: JSON.parse(JSON.stringify(result.output)) },
    });
  } catch (error) {
    console.error(`[analysis] generation failed for ${id}:`, error);
    progressBus.publish(id, "Generation failed");
    await db.signal.update({
      where: { id },
      data: {
        data: JSON.parse(
          JSON.stringify({ error: "Generation failed. Please try again." }),
        ),
      },
    });
  } finally {
    progressBus.finish(id);
  }
}
