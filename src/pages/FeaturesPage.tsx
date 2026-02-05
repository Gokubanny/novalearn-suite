import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn, StaggerContainer, staggerItemVariants, HoverCard } from "@/components/motion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { images, featureImages } from "@/lib/images";
import {
  Brain,
  BookOpen,
  GraduationCap,
  Smartphone,
  Users,
  BarChart3,
  Fingerprint,
  FileCheck,
  Video,
  Shield,
  Settings,
  CreditCard,
  ArrowRight,
  CheckCircle,
  LucideIcon,
} from "lucide-react";

interface RoleFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

const roleFeatures: Record<string, { title: string; description: string; features: RoleFeature[] }> = {
  students: {
    title: "For Students",
    description: "Personalized learning experience with AI-powered tools",
    features: [
      {
        icon: Brain,
        title: "AI Learning Assistant",
        description: "Get instant answers, study recommendations, and PDF analysis to enhance your learning.",
        image: featureImages["AI Learning Assistant"],
      },
      {
        icon: BookOpen,
        title: "Course Materials",
        description: "Access all your course materials, assignments, and resources in one place.",
        image: images.features.books,
      },
      {
        icon: GraduationCap,
        title: "Result Portal",
        description: "View grades, transcripts, and academic progress with detailed analytics.",
        image: images.features.graduation,
      },
      {
        icon: Smartphone,
        title: "Mobile Access",
        description: "Study on the go with our responsive mobile app and offline support.",
        image: images.features.mobile,
      },
    ],
  },
  lecturers: {
    title: "For Lecturers",
    description: "Powerful tools to manage classes and track student progress",
    features: [
      {
        icon: Users,
        title: "Class Management",
        description: "Manage student enrollment, attendance, and class schedules effortlessly.",
        image: images.classroom.lecture,
      },
      {
        icon: Fingerprint,
        title: "Biometric Attendance",
        description: "Track attendance with facial recognition and location verification.",
        image: featureImages["Biometric Attendance"],
      },
      {
        icon: FileCheck,
        title: "Assessment Tools",
        description: "Create quizzes, assignments, and exams with automated grading.",
        image: images.features.exam,
      },
      {
        icon: Video,
        title: "Online Classes",
        description: "Conduct live classes with Zoom integration and automatic recordings.",
        image: featureImages["Online Classes"],
      },
    ],
  },
  admins: {
    title: "For Administrators",
    description: "Complete institutional management at your fingertips",
    features: [
      {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Real-time insights into attendance, performance, and institutional metrics.",
        image: images.features.analytics,
      },
      {
        icon: Users,
        title: "User Management",
        description: "Manage students, lecturers, and staff with role-based access control.",
        image: images.features.team,
      },
      {
        icon: Shield,
        title: "Security Controls",
        description: "Enterprise-grade security with data isolation and encrypted communications.",
        image: images.features.security,
      },
      {
        icon: Settings,
        title: "System Configuration",
        description: "Customize the platform to match your institution's workflow.",
        image: images.technology.dashboard,
      },
    ],
  },
  superadmins: {
    title: "For Super Admins",
    description: "Multi-institutional management and platform oversight",
    features: [
      {
        icon: Settings,
        title: "Platform Management",
        description: "Manage multiple schools, configure system-wide settings.",
        image: images.technology.coding,
      },
      {
        icon: CreditCard,
        title: "Revenue Analytics",
        description: "Track subscription revenues, usage metrics, and billing across institutions.",
        image: images.technology.dashboard,
      },
    ],
  },
};

function FeatureCard({ feature, index }: { feature: RoleFeature; index: number }) {
  const reducedMotion = useReducedMotion();

  const CardContent = (
    <motion.div
      variants={staggerItemVariants}
      className="group glass-premium overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={feature.image}
          alt={feature.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
          <feature.icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm">{feature.description}</p>
      </div>
    </motion.div>
  );

  return reducedMotion ? CardContent : <HoverCard>{CardContent}</HoverCard>;
}

function RoleSection({ roleKey, role }: { roleKey: string; role: typeof roleFeatures.students }) {
  return (
    <section className="py-16 lg:py-24" id={roleKey}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{role.title}</h2>
            <p className="text-lg text-muted-foreground">{role.description}</p>
          </div>
        </FadeIn>

        <StaggerContainer
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          staggerDelay={0.1}
        >
          {role.features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden gradient-bg">
          <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <FadeIn>
                  <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
                    Platform Features
                  </span>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                    Powerful Tools for{" "}
                    <span className="gradient-text">Every Role</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p className="text-lg text-muted-foreground mb-8">
                    From students to super admins, NovaLearn Suite provides tailored 
                    features that enhance productivity and learning outcomes.
                  </p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg" className="btn-glow group">
                      <Link to="/register">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/pricing">View Pricing</Link>
                    </Button>
                  </div>
                </FadeIn>
              </div>

              <FadeIn delay={0.4}>
                <div className="relative">
                  <ImageWithFallback
                    src={images.classroom.studying}
                    alt="Students collaborating in modern learning space"
                    aspectRatio="video"
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl -z-10" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8 bg-secondary/50 border-y border-border sticky top-16 z-30 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {Object.entries(roleFeatures).map(([key, role]) => (
                <Button
                  key={key}
                  variant="ghost"
                  asChild
                  className="hover:bg-primary/10"
                >
                  <a href={`#${key}`}>{role.title}</a>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Role Sections */}
        <div className="divide-y divide-border">
          {Object.entries(roleFeatures).map(([key, role]) => (
            <RoleSection key={key} roleKey={key} role={role} />
          ))}
        </div>

        {/* All Features List */}
        <section className="py-20 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Complete Feature List
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything included in the NovaLearn Suite platform
                </p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[
                "AI Learning Assistant",
                "Biometric Attendance",
                "Online Classes",
                "Exam Proctoring",
                "Real-time Analytics",
                "Multi-Role Access",
                "Course Management",
                "Result Management",
                "Enterprise Security",
                "Smart Notifications",
                "Academic Calendar",
                "Mobile Responsive",
                "Offline Support",
                "Custom Branding",
                "API Access",
              ].map((feature, index) => (
                <FadeIn key={feature} delay={index * 0.03}>
                  <div className="flex items-center gap-3 p-4 glass-card">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join 500+ institutions already transforming their academic operations.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Button asChild size="lg" className="btn-glow group">
                <Link to="/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
