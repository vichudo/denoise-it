import { Suspense } from "react";

import { DenoiseHero } from "@/app/_components/denoise-hero";
import {
  FinalCTA,
  HowItWorks,
  ImpactAreas,
  SignalVsNoise,
  TrustBar,
  UseCases,
} from "@/app/_components/landing-sections";

export default function Home() {
  return (
    <main>
      <Suspense fallback={null}>
        <DenoiseHero />
      </Suspense>
      <HowItWorks />
      <ImpactAreas />
      <SignalVsNoise />
      <UseCases />
      <TrustBar />
      <FinalCTA />
    </main>
  );
}
