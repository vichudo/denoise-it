import { type Metadata } from "next";

import { api, HydrateClient } from "@/trpc/server";
import { SignalView } from "@/app/_components/signal-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const signal = await api.analysis.get({ id });
    return {
      title: signal.data
        ? `${signal.data.verdictHeadline} — Denoise It`
        : "Analyzing... — Denoise It",
      description: signal.data?.summary ?? "Analysis in progress.",
    };
  } catch {
    return { title: "Not Found — Denoise It" };
  }
}

export default async function SignalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await api.analysis.get.prefetch({ id });

  return (
    <HydrateClient>
      <main className="min-h-svh">
        <SignalView id={id} />
      </main>
    </HydrateClient>
  );
}
