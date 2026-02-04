import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <div className="section-divider" aria-hidden="true" />
        <FeaturesSection />
        <div className="section-divider" aria-hidden="true" />
        <TestimonialsSection />
        <div className="section-divider" aria-hidden="true" />
        <PricingPreview />
        <div className="section-divider" aria-hidden="true" />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
