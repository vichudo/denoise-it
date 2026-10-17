import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SignalView } from '@/app/_components/signal-view';
import { buildSignalMetadata } from '@/lib/metadata';
import { withPageTitle } from '@/server/page-title';
import { api, HydrateClient } from '@/trpc/server';

interface LinkPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: LinkPageProps): Promise<Metadata> {
  const { url } = await searchParams;
  if (typeof url !== 'string') return { title: 'Denoise It' };

  if (!URL.canParse(url)) return { title: 'Invalid URL — Denoise It' };

  // No waiting on the analysis: crawlers give up within seconds, and the
  // preview already says what is being checked while it runs.
  const { id } = await api.analysis.findOrCreateByUrl({ url });
  try {
    const signal = await api.analysis.get({ id });
    // Until there is a verdict the preview names the content, so a pasted
    // link is described by its page title.
    return buildSignalMetadata(
      signal.data ? signal : await withPageTitle(signal),
    );
  } catch {
    // Made private by its owner since it was first analyzed.
    return { title: 'Denoise It' };
  }
}

export default async function LinkPage({ searchParams }: LinkPageProps) {
  const { url } = await searchParams;

  if (typeof url !== 'string') notFound();

  if (!URL.canParse(url)) notFound();

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
