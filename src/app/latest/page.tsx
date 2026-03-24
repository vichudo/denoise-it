import { api, HydrateClient } from "@/trpc/server";
import { LatestFeed } from "@/app/_components/latest-feed";

export const metadata = {
  title: "Latest Signals — Denoise It",
  description: "Browse the latest public signal analyses, chronologically.",
};

export default async function LatestPage() {
  await api.analysis.latest.prefetchInfinite({ limit: 20 });

  return (
    <HydrateClient>
      <main className="mx-auto min-h-svh max-w-2xl px-4 pt-20 pb-16">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Latest Signals
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Public analyses from the community, newest first.
          </p>
        </div>
        <LatestFeed />
      </main>
    </HydrateClient>
  );
}
