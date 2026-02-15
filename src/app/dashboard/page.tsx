import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { SignalsList } from "@/app/_components/signals-list";

export const metadata = {
  title: "My Signals — Denoise It",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await api.user.signals.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto min-h-svh max-w-3xl px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">My Signals</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your analyses and follow-ups in one place.
          </p>
        </div>
        <SignalsList />
      </main>
    </HydrateClient>
  );
}
