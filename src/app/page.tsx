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
      <DenoiseHero />
      <HowItWorks />
      <ImpactAreas />
      <SignalVsNoise />
      <UseCases />
      <TrustBar />
      <FinalCTA />
    </main>
  );
}
