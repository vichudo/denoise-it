import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { PersonalFeed } from "@/app/_components/personal-feed";

export const metadata = {
  title: "Your Feed — Denoise It",
  description: "Your personalized, denoised content feed.",
};

export default async function FeedPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/feed");
  }

  const prefs = await api.feed.getPreferences();

  if (!prefs) {
    redirect("/settings");
  }

  await api.feed.items.prefetchInfinite({ limit: 20 });
  await api.feed.status.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto min-h-svh max-w-2xl px-4 pt-20 pb-16">
        <PersonalFeed />
      </main>
    </HydrateClient>
  );
}
