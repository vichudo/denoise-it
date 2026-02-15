import { type Metadata } from "next";

import { api, HydrateClient } from "@/trpc/server";
import { SignalView } from "@/app/_components/signal-view";
import { buildSignalMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const signal = await api.analysis.get({ id });
    return buildSignalMetadata(id, signal.data, "Analyzing...", "Analysis in progress.");
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

  try {
    await api.analysis.get.prefetch({ id });
  } catch {
    // Signal may be private or deleted — let client handle the error state
  }

  return (
    <HydrateClient>
      <main className="min-h-svh">
        <SignalView id={id} />
      </main>
    </HydrateClient>
  );
}
