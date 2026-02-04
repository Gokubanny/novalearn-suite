import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Brain,
  Video,
  Fingerprint,
  Bell,
  FileCheck,
  Calendar,
  Smartphone,
  LucideIcon,
} from "lucide-react";
import { FadeIn, StaggerContainer, staggerItemVariants, HoverCard } from "@/components/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Learning Assistant",
    description:
      "Intelligent PDF analysis and personalized learning recommendations powered by advanced AI.",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: Fingerprint,
    title: "Biometric Attendance",
    description:
      "Face recognition with liveness detection and location-based verification for secure attendance.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Video,
    title: "Online Classes",
    description:
      "Seamless Zoom integration with automatic attendance tracking and class recordings.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: FileCheck,
    title: "Exam Proctoring",
    description:
      "AI-powered monitoring with focus detection, plagiarism checks, and behavior analysis.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Comprehensive dashboards with attendance rates, performance metrics, and predictive insights.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description:
      "Dedicated dashboards for Super Admin, School Admin, Lecturers, and Students.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Upload materials, create assignments, manage schedules, and track submissions effortlessly.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: GraduationCap,
    title: "Result Management",
    description:
      "Automated GPA calculation, transcript generation, and grade publishing workflows.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Role-based permissions, data isolation per school, and encrypted communications.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated alerts for deadlines, attendance risks, and personalized recommendations.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Academic Calendar",
    description:
      "Manage semesters, exam schedules, holidays, and events across all departments.",
    gradient: "from-lime-500 to-green-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description:
      "Full functionality on any device with offline support for critical features.",
    gradient: "from-violet-500 to-purple-500",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const reducedMotion = useReducedMotion();

  const CardContent = (
    <motion.article
      variants={staggerItemVariants}
      className="group feature-card"
      aria-labelledby={`feature-title-${index}`}
    >
      {/* Icon with gradient background */}
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-lg`}
        aria-hidden="true"
      >
        <feature.icon className="h-7 w-7 text-white" />
      </div>
      
      <h3 
        id={`feature-title-${index}`}
        className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors"
      >
        {feature.title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Hover indicator */}
      <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more
        <motion.span 
          className="ml-1"
          animate={reducedMotion ? {} : { x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          →
        </motion.span>
      </div>
    </motion.article>
  );

  return reducedMotion ? CardContent : <HoverCard>{CardContent}</HoverCard>;
}

export function FeaturesSection() {
  return (
    <section 
      className="py-20 lg:py-32 bg-secondary/30 relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
              Powerful Features
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 
              id="features-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Everything You Need to{" "}
              <span className="gradient-text">Run Your Institution</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground">
              From attendance tracking to AI-powered learning, our platform provides
              comprehensive tools for modern educational institutions.
            </p>
          </FadeIn>
        </div>

        {/* Features Grid */}
        <StaggerContainer 
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          staggerDelay={0.05}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
