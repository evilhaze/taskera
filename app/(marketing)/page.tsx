import { HeroSection } from "@/components/landing/HeroSection";
import { TrustRow } from "@/components/landing/TrustRow";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProductPreviewSection } from "@/components/landing/ProductPreviewSection";
import { PricingPreviewSection } from "@/components/landing/PricingPreviewSection";
import { DocsPreviewSection } from "@/components/landing/DocsPreviewSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustRow />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <PricingPreviewSection />
      <DocsPreviewSection />
      <CTASection />
    </>
  );
}
