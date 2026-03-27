import { nanoid } from "nanoid";

import type { FeedItem } from "@/lib/schemas/feed";
import { db } from "@/server/db";
import { createFeedAgents } from "./agents";

interface FeedPrefs {
  topics: string[];
  xAccounts: string[];
  communicationStyle: string;
  affectiveLevel: number;
  language: string;
  additionalInstructions?: string | null;
}

export async function generateFeed(userId: string, preferences: FeedPrefs) {
  const batchId = nanoid();

  // Mark generation in progress
  await db.feedPreferences.update({
    where: { userId },
    data: { generatingBatchId: batchId },
  });

  try {
    const agents = createFeedAgents(preferences);

    // Build prompt for each agent
    const prompt =
      `Find the latest content for my feed. Today is ${new Date().toISOString().split("T")[0]}.` +
      `\n\nTopics: ${preferences.topics.join(", ")}` +
      (preferences.xAccounts.length > 0
        ? `\nX accounts: ${preferences.xAccounts.map((a) => `@${a.replace(/^@/, "")}`).join(", ")}`
        : "");

    // Run agents in parallel
    const results = await Promise.allSettled([
      agents.social?.generate({ prompt }),
      agents.topics?.generate({ prompt }),
    ]);

    // Collect items from all successful results
    const allItems: FeedItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled" && result.value?.output?.items) {
        allItems.push(...result.value.output.items);
      }
    }

    // Deduplicate by sourceUrl
    const seen = new Set<string>();
    const uniqueItems = allItems.filter((item) => {
      if (seen.has(item.sourceUrl)) return false;
      seen.add(item.sourceUrl);
      return true;
    });

    // Bulk create feed items
    if (uniqueItems.length > 0) {
      await db.feedItem.createMany({
        data: uniqueItems.map((item) => ({
          headline: item.headline,
          content: item.content,
          expandedContent: item.expandedContent,
          source: item.source,
          sourceUrl: item.sourceUrl,
          sourceType: item.sourceType,
          imageUrl: item.imageUrl ?? null,
          contentDate: item.contentDate ?? null,
          topic: item.topic,
          batchId,
          userId,
        })),
      });
    }
  } catch (error) {
    console.error(`[feed] generation failed for user ${userId}:`, error);
  } finally {
    // Always clear generating state
    await db.feedPreferences.update({
      where: { userId },
      data: { generatingBatchId: null },
    });
  }
}
