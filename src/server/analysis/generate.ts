import { getLanguageName } from "@/lib/constants";
import { db } from "@/server/db";
import { type AnalysisAgent, pickAgent } from "./agents";

export async function generateAnalysis(
  id: string,
  content: string,
  options?: { fast?: boolean; language?: string },
) {
  const agent: AnalysisAgent = pickAgent(content, options?.fast);

  try {
    let prompt = content;

    if (options?.language && options.language !== "en") {
      const langName = getLanguageName(options.language);
      prompt += `\n\n[LANGUAGE INSTRUCTION: Respond entirely in ${langName} (${options.language}). All output — verdict, headline, summary, signal descriptions, noise explanations — must be in ${langName}. Keep quoted noise fragments in their original language.]`;
    }

    const result = await agent.generate({ prompt });
    await db.signal.update({
      where: { id },
      data: { data: JSON.parse(JSON.stringify(result.output)) },
    });
  } catch (error) {
    console.error(`[analysis] generation failed for ${id}:`, error);
    await db.signal.update({
      where: { id },
      data: {
        data: JSON.parse(
          JSON.stringify({ error: "Generation failed. Please try again." }),
        ),
      },
    });
  }
}
