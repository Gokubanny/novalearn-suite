import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { images } from "@/lib/images";

const demoFeatures = [
  "Student & Lecturer dashboards",
  "AI-powered learning assistant",
  "Biometric attendance tracking",
  "Course & result management",
  "Real-time analytics",
  "Multi-role access control",
];

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <FadeIn>
                  <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">Product Demo</span>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                    See NexfordEdu <span className="gradient-text">In Action</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p className="text-lg text-muted-foreground mb-8">
                    Explore our platform with a live demo. See how AI-powered attendance, smart analytics, 
                    and comprehensive academic management work together.
                  </p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {demoFeatures.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="btn-glow">
                      <Link to="/register">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/contact">Schedule Live Demo</Link>
                    </Button>
                  </div>
                </FadeIn>
              </div>
              <FadeIn delay={0.3}>
                <div className="relative">
                  <ImageWithFallback
                    src={images.technology.dashboard}
                    alt="NexfordEdu dashboard preview"
                    aspectRatio="video"
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl cursor-pointer hover:bg-primary transition-colors">
                      <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
