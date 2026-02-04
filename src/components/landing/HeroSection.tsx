import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";
import { FadeIn } from "@/components/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy load the 3D scene for better performance
const HeroScene = lazy(() =>
  import("./HeroScene").then((module) => ({ default: module.HeroScene }))
);

const stats = [
  { value: 500, suffix: "+", label: "Schools Served" },
  { value: 250000, suffix: "+", label: "Students Enrolled" },
  { value: 15000, suffix: "+", label: "Active Lecturers" },
  { value: 99.9, suffix: "%", label: "Uptime" },
];

const features = [
  "AI-Powered Learning Assistant",
  "Biometric Attendance System",
  "Real-time Analytics Dashboard",
];

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg"
      aria-labelledby="hero-heading"
    >
      {/* 3D Background - only load if motion is allowed */}
      {!reducedMotion && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}

      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30 dark:opacity-10" aria-hidden="true" />

      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 mesh-gradient" aria-hidden="true" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 badge-primary mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">
                NovaLearn Suite — Trusted by 500+ Nigerian Schools
              </span>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.1}>
            <h1 
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-balance"
            >
              Transform Your School with{" "}
              <span className="gradient-text">Smart Technology</span>
            </h1>
          </FadeIn>

          {/* Subheadline */}
          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
              An enterprise-grade platform with AI-powered learning, biometric attendance, 
              exam proctoring, and comprehensive academic management for modern institutions.
            </p>
          </FadeIn>

          {/* Feature Pills */}
          <FadeIn delay={0.3}>
            <div 
              className="flex flex-wrap items-center justify-center gap-3 mb-10"
              role="list"
              aria-label="Key features"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 glass-card px-4 py-2"
                  role="listitem"
                >
                  <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                  <span className="text-sm font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-8 text-base btn-glow group"
                aria-describedby="trial-info"
              >
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base group hover:bg-accent"
                aria-label="Watch product demo video"
              >
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                Watch Demo
              </Button>
            </div>
          </FadeIn>

          {/* Stats */}
          <div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            role="list"
            aria-label="Platform statistics"
          >
            {stats.map((stat, index) => (
              <FadeIn key={stat.label} delay={0.6 + index * 0.1}>
                <div className="stat-card" role="listitem">
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {!reducedMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </motion.div>
        </motion.div>
      )}

      {/* Hidden trial info for screen readers */}
      <span id="trial-info" className="sr-only">
        No credit card required. 14-day free trial. Cancel anytime.
      </span>
    </section>
  );
}
