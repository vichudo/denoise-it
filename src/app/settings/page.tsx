import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { FeedSettingsForm } from "@/app/_components/feed-settings-form";

export const metadata = {
  title: "Feed Settings — Denoise It",
  description: "Configure your personalized denoised feed.",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/settings");
  }

  await api.feed.getPreferences.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto min-h-svh max-w-2xl px-4 pt-20 pb-16">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Feed Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tell us what matters to you. We&apos;ll curate a feed that&apos;s
            pure signal — no noise, no triggers, no manipulation.
          </p>
        </div>
        <FeedSettingsForm />
      </main>
    </HydrateClient>
  );
}
