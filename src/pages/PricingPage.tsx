import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn, ScaleIn, HoverCard } from "@/components/motion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { images } from "@/lib/images";
import {
  Check,
  X,
  ArrowRight,
  Building2,
  GraduationCap,
  Landmark,
  Star,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const plans = [
  {
    name: "Basic",
    description: "Perfect for small institutions getting started",
    monthlyPrice: 50000,
    yearlyPrice: 500000,
    icon: Building2,
    image: images.pricing.small,
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
  },
  {
    name: "Pro",
    description: "For growing institutions with advanced needs",
    monthlyPrice: 80000,
    yearlyPrice: 800000,
    icon: GraduationCap,
    image: images.pricing.medium,
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
  },
  {
    name: "Enterprise",
    description: "For large institutions requiring full capabilities",
    monthlyPrice: 120000,
    yearlyPrice: 1200000,
    icon: Landmark,
    image: images.pricing.enterprise,
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
  },
];

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "Start using NovaLearn Suite immediately with full access to all features in your selected plan. No credit card required to start. Cancel anytime during the trial if it's not right for you.",
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer:
      "Yes! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, the change takes effect at your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, debit/credit cards, and mobile money. For Enterprise plans, we also offer invoice-based billing with NET-30 terms.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "No setup fees for Basic and Pro plans. Enterprise plans include complimentary onboarding, training, and data migration assistance.",
  },
  {
    question: "What support is included?",
    answer:
      "All plans include email support. Pro plans add priority support with faster response times. Enterprise plans include 24/7 phone support and a dedicated account manager.",
  },
  {
    question: "Can I request custom features?",
    answer:
      "Enterprise customers can request custom features and integrations. Contact our sales team to discuss your specific requirements.",
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

function PricingCard({
  plan,
  isYearly,
}: {
  plan: (typeof plans)[0];
  isYearly: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  const CardContent = (
    <div
      className={`relative glass-premium p-8 h-full flex flex-col ${
        plan.popular ? "ring-2 ring-primary" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan image */}
      <div className="relative h-32 -mx-8 -mt-8 mb-6 overflow-hidden rounded-t-xl">
        <ImageWithFallback
          src={plan.image}
          alt={plan.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <plan.icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

      <div className="mb-6">
        {price ? (
          <>
            <span className="text-4xl font-bold">{formatCurrency(price)}</span>
            <span className="text-muted-foreground">
              /{isYearly ? "year" : "month"}
            </span>
            {isYearly && (
              <p className="text-sm text-success mt-1">Save 2 months free!</p>
            )}
          </>
        ) : (
          <span className="text-2xl font-bold">Contact Sales</span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature) => (
          <li key={feature.name} className="flex items-center gap-3">
            {feature.included ? (
              <Check className="h-5 w-5 text-success flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <span
              className={
                feature.included ? "text-foreground" : "text-muted-foreground"
              }
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        variant={plan.popular ? "default" : "outline"}
        className={`w-full ${plan.popular ? "btn-glow" : ""}`}
      >
        <Link to={price ? "/register" : "/contact"}>
          {price ? "Start Free Trial" : "Contact Sales"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  return reducedMotion ? (
    CardContent
  ) : (
    <HoverCard hoverY={-8}>{CardContent}</HoverCard>
  );
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden gradient-bg">
          <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <FadeIn>
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
                Pricing
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Simple, Transparent{" "}
                <span className="gradient-text">Pricing</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Choose the plan that fits your institution's needs. All plans
                include a 14-day free trial with no credit card required.
              </p>
            </FadeIn>

            {/* Billing Toggle */}
            <FadeIn delay={0.3}>
              <div className="flex items-center justify-center gap-4">
                <Label
                  htmlFor="billing-toggle"
                  className={!isYearly ? "font-semibold" : "text-muted-foreground"}
                >
                  Monthly
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                />
                <Label
                  htmlFor="billing-toggle"
                  className={isYearly ? "font-semibold" : "text-muted-foreground"}
                >
                  Yearly
                  <span className="ml-2 text-xs text-success">(Save 17%)</span>
                </Label>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 lg:py-24 -mt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <ScaleIn key={plan.name} delay={index * 0.1}>
                  <PricingCard plan={plan} isYearly={isYearly} />
                </ScaleIn>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Compare All Features
                </h2>
                <p className="text-lg text-muted-foreground">
                  See exactly what's included in each plan
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="overflow-x-auto">
                <table className="w-full max-w-5xl mx-auto glass-premium">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      {plans.map((plan) => (
                        <th key={plan.name} className="p-4 font-semibold text-center">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plans[0].features.map((feature, index) => (
                      <tr
                        key={feature.name}
                        className={index % 2 === 0 ? "bg-muted/30" : ""}
                      >
                        <td className="p-4">{feature.name}</td>
                        {plans.map((plan) => (
                          <td key={plan.name} className="p-4 text-center">
                            {plan.features[index].included ? (
                              <Check className="h-5 w-5 text-success mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need to know about our pricing
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="glass-card px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Still Have Questions?
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our team is ready to help you find the perfect plan for your
                institution.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="btn-glow group">
                  <Link to="/contact">
                    Contact Sales
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">Start Free Trial</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
