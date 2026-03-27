import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { GoogleSignInButton } from "@/app/_components/google-sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/";

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Denoise It</CardTitle>
          <CardDescription>
            Sign in to save your analyses and track follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
