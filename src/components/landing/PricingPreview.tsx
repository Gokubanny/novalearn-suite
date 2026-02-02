import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Sparkles, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "500,000",
    period: "annually",
    description: "Perfect for small institutions getting started",
    icon: Building2,
    features: [
      { name: "Up to 5,000 students", included: true },
      { name: "Manual attendance tracking", included: true },
      { name: "Basic course management", included: true },
      { name: "Result management", included: true },
      { name: "Email support", included: true },
      { name: "AI Learning Assistant", included: false },
      { name: "Biometric attendance", included: false },
      { name: "Exam proctoring", included: false },
      { name: "Plagiarism detection", included: false },
      { name: "Custom branding", included: false },
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "800,000",
    period: "annually",
    description: "For growing institutions with advanced needs",
    icon: Sparkles,
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
    price: "1,200,000",
    period: "annually",
    description: "For large institutions requiring full capabilities",
    icon: Crown,
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
  plan: (typeof plans)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={cn(
        "relative glass-card p-8 hover-lift",
        plan.popular && "ring-2 ring-primary scale-105 lg:scale-110"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <div
          className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
            plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          )}
        >
          <plan.icon className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-muted-foreground text-sm">{plan.description}</p>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-medium">₦</span>
          <span className="text-5xl font-bold">{plan.price}</span>
        </div>
        <span className="text-muted-foreground text-sm">per {plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature.name} className="flex items-center gap-3">
            {feature.included ? (
              <Check className="h-5 w-5 text-success flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-sm",
                !feature.included && "text-muted-foreground"
              )}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={cn(
          "w-full",
          plan.popular ? "btn-glow" : ""
        )}
        variant={plan.popular ? "default" : "outline"}
      >
        <Link to={plan.name === "Enterprise" ? "/contact" : "/register"}>
          {plan.cta}
        </Link>
      </Button>
    </motion.div>
  );
}

export function PricingPreview() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium text-primary mb-4"
          >
            SIMPLE PRICING
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            Choose the Right Plan for{" "}
            <span className="gradient-text">Your Institution</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            All plans include core features. Upgrade anytime as your institution grows.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* View All Plans Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/pricing"
            className="text-primary hover:underline font-medium inline-flex items-center gap-2"
          >
            Compare all features
            <span className="text-lg">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
