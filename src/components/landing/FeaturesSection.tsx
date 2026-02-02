import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
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
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Learning Assistant",
    description:
      "Intelligent PDF analysis and personalized learning recommendations powered by advanced AI.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Fingerprint,
    title: "Biometric Attendance",
    description:
      "Face recognition with liveness detection and location-based verification for secure attendance.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Video,
    title: "Online Classes",
    description:
      "Seamless Zoom integration with automatic attendance tracking and class recordings.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: FileCheck,
    title: "Exam Proctoring",
    description:
      "AI-powered monitoring with focus detection, plagiarism checks, and behavior analysis.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Comprehensive dashboards with attendance rates, performance metrics, and predictive insights.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description:
      "Dedicated dashboards for Super Admin, School Admin, Lecturers, and Students.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Upload materials, create assignments, manage schedules, and track submissions effortlessly.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: GraduationCap,
    title: "Result Management",
    description:
      "Automated GPA calculation, transcript generation, and grade publishing workflows.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Role-based permissions, data isolation per school, and encrypted communications.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated alerts for deadlines, attendance risks, and personalized recommendations.",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
  {
    icon: Calendar,
    title: "Academic Calendar",
    description:
      "Manage semesters, exam schedules, holidays, and events across all departments.",
    color: "text-lime-500",
    bgColor: "bg-lime-500/10",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description:
      "Full functionality on any device with offline support for critical features.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group glass-card p-6 hover-lift cursor-pointer"
    >
      <div
        className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <feature.icon className={`h-6 w-6 ${feature.color}`} />
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {feature.title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium text-primary mb-4"
          >
            POWERFUL FEATURES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            Everything You Need to{" "}
            <span className="gradient-text">Run Your Institution</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            From attendance tracking to AI-powered learning, our platform provides
            comprehensive tools for modern educational institutions.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
