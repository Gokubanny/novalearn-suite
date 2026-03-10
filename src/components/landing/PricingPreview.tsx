import { Link } from "react-router-dom";
import { Check, X, Sparkles, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeIn, StaggerContainer, staggerItemVariants, HoverCard } from "@/components/motion";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LucideIcon } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  icon: LucideIcon;
  features: PlanFeature[];
  popular: boolean;
  cta: string;
  gradient: string;
}

const plans: Plan[] = [
  {
    name: "Basic",
    monthlyPrice: "50,000",
    yearlyPrice: "500,000",
    description: "Perfect for small institutions getting started",
    icon: Building2,
    gradient: "from-slate-500 to-slate-600",
    features: [
      { name: "Up to 5,000 students", included: true },
      { name: "Manual attendance tracking", included: true },
      { name: "Basic course management", included: true },
      { name: "Result management", included: true },
      { name: "Email support", included: true },
      { name: "AI Learning Assistant", included: false },
      { name: "Biometric attendance", included: false },
      // { name: "Exam proctoring", included: false },
      { name: "Plagiarism detection", included: false },
      { name: "Custom branding", included: false },
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    monthlyPrice: "80,000",
    yearlyPrice: "800,000",
    description: "For growing institutions with advanced needs",
    icon: Sparkles,
    gradient: "from-primary to-blue-600",
    features: [
      { name: "Up to 50,000 students", included: true },
      { name: "AI PDF Assistant", included: true },
      { name: "Smart attendance analytics", included: true },
      { name: "Face recognition attendance", included: true },
      { name: "Online class integration", included: true },
      { name: "Priority support", included: true },
      { name: "Exam proctoring", included: false },
      { name: "Plagiarism detection", included: false },
      { name: "Custom branding", included: false },
      { name: "Dedicated account manager", included: false },
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthlyPrice: "120,000",
    yearlyPrice: "1,200,000",
    description: "For large institutions requiring full capabilities",
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    features: [
      { name: "Unlimited students", included: true },
      { name: "Full AI capabilities", included: true },
      { name: "Biometric attendance", included: true },
      { name: "Exam proctoring & monitoring", included: true },
      { name: "Plagiarism detection", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "24/7 phone support", included: true },
      { name: "On-premise deployment option", included: true },
    ],
    popular: false,
    cta: "Contact Sales",
  },
];

function PricingCard({
  plan,
  index,
}: {
  plan: Plan;
  index: number;
}) {
  const reducedMotion = useReducedMotion();

  const CardContent = (
    <motion.article
      variants={staggerItemVariants}
      className={cn(
        "relative glass-premium p-8",
        plan.popular && "ring-2 ring-primary lg:scale-105"
      )}
      aria-labelledby={`plan-name-${index}`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="text-center mb-8">
        <div
          className={cn(
            "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg",
            `bg-gradient-to-br ${plan.gradient}`
          )}
          aria-hidden="true"
        >
          <plan.icon className="h-8 w-8 text-white" />
        </div>
        <h3 
          id={`plan-name-${index}`}
          className="text-2xl font-bold mb-2"
        >
          {plan.name}
        </h3>
        <p className="text-muted-foreground text-sm">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-medium text-muted-foreground">₦</span>
          <span className="text-5xl font-bold">{plan.yearlyPrice}</span>
        </div>
        <span className="text-muted-foreground text-sm">per year</span>
        <p className="text-xs text-muted-foreground mt-1">or ₦{plan.monthlyPrice}/month</p>
      </div>

      {/* Features list */}
      <ul className="space-y-3 mb-8" role="list" aria-label={`${plan.name} features`}>
        {plan.features.map((feature) => (
          <li key={feature.name} className="flex items-center gap-3">
            {feature.included ? (
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-success" aria-hidden="true" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <X className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
            <span
              className={cn(
                "text-sm",
                !feature.included && "text-muted-foreground"
              )}
            >
              {feature.name}
              {!feature.included && <span className="sr-only"> (not included)</span>}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        asChild
        className={cn(
          "w-full h-12",
          plan.popular ? "btn-glow" : ""
        )}
        variant={plan.popular ? "default" : "outline"}
      >
        <Link to={plan.name === "Enterprise" ? "/contact" : "/register"}>
          {plan.cta}
        </Link>
      </Button>
    </motion.article>
  );

  return reducedMotion ? CardContent : (
    <HoverCard hoverScale={plan.popular ? 1.02 : 1.03}>
      {CardContent}
    </HoverCard>
  );
}

export function PricingPreview() {
  return (
    <section 
      className="py-20 lg:py-32 relative overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
              Simple Pricing
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 
              id="pricing-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Choose the Right Plan for{" "}
              <span className="gradient-text">Your Institution</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground">
              All plans include core features. Upgrade anytime as your institution grows.
            </p>
          </FadeIn>
        </div>

        {/* Pricing Cards */}
        <StaggerContainer 
          className="grid lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto items-start"
          staggerDelay={0.1}
        >
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </StaggerContainer>

        {/* View All Plans Link */}
        <FadeIn delay={0.5}>
          <div className="text-center mt-12">
            <Link
              to="/pricing"
              className="text-primary hover:underline font-medium inline-flex items-center gap-2 focus-ring rounded-lg px-2 py-1"
            >
              Compare all features
              <span className="text-lg" aria-hidden="true">→</span>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
