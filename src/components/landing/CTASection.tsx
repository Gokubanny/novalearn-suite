import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Clock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, ScaleIn } from "@/components/motion";
import { images } from "@/lib/images";

const benefits = [
  { icon: Clock, text: "14-day free trial" },
  { icon: Shield, text: "No credit card required" },
  { icon: Headphones, text: "24/7 support" },
];

export function CTASection() {
  return (
    <section 
      className="py-20 lg:py-32 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background Image with gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${images.cta.celebration})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90" aria-hidden="true" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative Icon */}
          <ScaleIn delay={0.1}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 mb-8 shadow-lg shadow-primary/30">
              <Sparkles className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
          </ScaleIn>

          <FadeIn delay={0.2}>
            <h2 
              id="cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Transform Your Institution?
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 500+ schools already using NexfordEdu to streamline their academic 
              operations and enhance student learning outcomes.
            </p>
          </FadeIn>

          {/* Benefits row */}
          <FadeIn delay={0.4}>
            <div 
              className="flex flex-wrap items-center justify-center gap-6 mb-10"
              role="list"
              aria-label="Sign up benefits"
            >
              {benefits.map((benefit) => (
                <div 
                  key={benefit.text}
                  className="flex items-center gap-2 text-muted-foreground"
                  role="listitem"
                >
                  <benefit.icon className="h-5 w-5 text-success" aria-hidden="true" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-8 text-base btn-glow group"
              >
                <Link to="/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-base hover:bg-accent"
              >
                <Link to="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mt-8 text-sm text-muted-foreground">
              Cancel anytime • No long-term contracts • Instant setup
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}