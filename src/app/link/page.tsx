import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { api, HydrateClient } from "@/trpc/server";
import { SignalView } from "@/app/_components/signal-view";
import { buildSignalMetadata } from "@/lib/metadata";
import { getDomain } from "@/lib/utils";
import { waitForAnalysis } from "@/server/wait-for-analysis";

interface LinkPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: LinkPageProps): Promise<Metadata> {
  const { url } = await searchParams;
  if (typeof url !== "string") return { title: "Denoise It" };

  try {
    new URL(url);
  } catch {
    return { title: "Invalid URL — Denoise It" };
  }

  const domain = getDomain(url);
  const { id } = await api.analysis.findOrCreateByUrl({ url });
  const { data } = await waitForAnalysis(String(id));

  return buildSignalMetadata(
    String(id),
    data,
    `Denoising ${domain}...`,
    `Analysis of ${domain} in progress.`,
  );
}

export default async function LinkPage({ searchParams }: LinkPageProps) {
  const { url } = await searchParams;

  if (typeof url !== "string") notFound();

  try {
    new URL(url);
  } catch {
    notFound();
  }

  const { id } = await api.analysis.findOrCreateByUrl({ url });
  await api.analysis.get.prefetch({ id });

  return (
    <HydrateClient>
      <main className="min-h-svh">
        <SignalView id={id} sourceUrl={url} />
      </main>
    </HydrateClient>
  );
}
