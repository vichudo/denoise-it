import type { Metadata } from 'next';

import { SignalView } from '@/app/_components/signal-view';
import { buildSignalMetadata } from '@/lib/metadata';
import { withPageTitle } from '@/server/page-title';
import { api, HydrateClient } from '@/trpc/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const signal = await api.analysis.get({ id });
    // Until there is a verdict the preview names the content, so a pasted
    // link is described by its page title.
    return buildSignalMetadata(
      signal.data ? signal : await withPageTitle(signal),
    );
  } catch {
    return { title: 'Not Found — Denoise It' };
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
