import { motion } from "framer-motion";
import { FadeIn, ScaleIn } from "@/components/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { images } from "@/lib/images";
import { UserPlus, Settings, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign Up & Onboard",
    description: "Create your institution account in minutes. Add departments, courses, and invite your team.",
    image: images.technology.dashboard,
    gradient: "from-primary to-blue-600",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure & Customize",
    description: "Set up biometric attendance, configure matric formats, timetables, and grading systems.",
    image: images.features.biometric,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch & Transform",
    description: "Go live with AI-powered attendance, smart analytics, and seamless academic management.",
    image: images.classroom.modern,
    gradient: "from-amber-500 to-orange-500",
  },
];

export function HowItWorksSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-20 lg:py-32 relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="absolute inset-0 mesh-gradient opacity-20" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <FadeIn>
            <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
              How It Works
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2
              id="how-it-works-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Get Started in{" "}
              <span className="gradient-text">Three Simple Steps</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground">
              Transform your institution's academic operations from day one with our streamlined setup process.
            </p>
          </FadeIn>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <FadeIn key={step.number} delay={0.1 * index}>
                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isReversed ? "lg:direction-rtl" : ""}`}>
                  {/* Content */}
                  <div className={`space-y-6 ${isReversed ? "lg:order-2" : ""}`}>
                    <motion.div
                      initial={reducedMotion ? {} : { opacity: 0, x: isReversed ? 30 : -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                          <step.icon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-6xl font-bold text-muted-foreground/10">{step.number}</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold mb-4">{step.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>

                      {index < steps.length - 1 && (
                        <div className="hidden lg:flex items-center gap-2 mt-6 text-muted-foreground/40">
                          <ArrowRight className="h-5 w-5" />
                          <span className="text-sm">Next step</span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Image */}
                  <div className={isReversed ? "lg:order-1" : ""}>
                    <ScaleIn delay={0.2 + 0.1 * index}>
                      <div className="relative">
                        <ImageWithFallback
                          src={step.image}
                          alt={step.title}
                          aspectRatio="video"
                          className="rounded-2xl shadow-2xl ring-1 ring-border/50"
                        />
                        <div className={`absolute -inset-4 bg-gradient-to-r ${step.gradient} opacity-10 rounded-3xl blur-2xl -z-10`} aria-hidden="true" />
                      </div>
                    </ScaleIn>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
