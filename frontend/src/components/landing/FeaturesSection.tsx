import { useState } from "react";
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
  // FileCheck,
  Calendar,
  Smartphone,
  LucideIcon,
} from "lucide-react";
import { FadeIn, StaggerContainer, staggerItemVariants, HoverCard } from "@/components/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { featureImages } from "@/lib/images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  details: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Learning Assistant",
    description:
      "Intelligent PDF analysis and personalized learning recommendations powered by advanced AI.",
    gradient: "from-purple-500 to-violet-600",
    details:
      "Our AI Learning Assistant analyzes uploaded course PDFs, extracts key concepts, and generates personalized study guides, flashcards, and practice questions. Students can ask questions about their materials in natural language and receive instant, context-aware answers. The system adapts to each student's learning pace and identifies knowledge gaps to recommend targeted review topics.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Attendance",
    description:
      "Face recognition with liveness detection and location-based verification for secure attendance.",
    gradient: "from-blue-500 to-cyan-500",
    details:
      "Our biometric attendance system uses advanced facial recognition with liveness detection to prevent spoofing. Students simply look at their device camera to mark attendance. The system also verifies GPS location to ensure students are physically present on campus or within a designated zone. Lecturers get real-time dashboards showing who has checked in, with confidence scores for each recognition.",
  },
  {
    icon: Video,
    title: "Online Classes",
    description:
      "Seamless Zoom integration with automatic attendance tracking and class recordings.",
    gradient: "from-green-500 to-emerald-500",
    details:
      "Integrate your existing Zoom or video conferencing setup directly into the platform. Classes are automatically scheduled from the timetable, attendance is tracked when students join, and recordings are saved to the course materials for later review. Lecturers can share screens, use breakout rooms, and run live polls—all while the platform handles the administrative overhead.",
  },
  // {
  //   icon: FileCheck,
  //   title: "Exam Proctoring",
  //   description:
  //     "AI-powered monitoring with focus detection, plagiarism checks, and behavior analysis.",
  //   gradient: "from-orange-500 to-amber-500",
  //   details:
  //     "AI-powered exam monitoring that detects when a student navigates away from the exam window, identifies suspicious eye movements, and flags potential plagiarism. The system records exam sessions for review and provides detailed integrity reports to lecturers.",
  // },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Comprehensive dashboards with attendance rates, performance metrics, and predictive insights.",
    gradient: "from-cyan-500 to-blue-500",
    details:
      "Get a bird's-eye view of your institution with real-time dashboards that track attendance trends, course performance, assignment completion rates, and more. Predictive analytics identify at-risk students early so lecturers and administrators can intervene before it's too late. Export detailed reports in PDF or CSV format for accreditation and board meetings.",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description:
      "Dedicated dashboards for Super Admin, School Admin, Lecturers, and Students.",
    gradient: "from-pink-500 to-rose-500",
    details:
      "Each user role gets a purpose-built dashboard. Super Admins manage the entire platform and all institutions. School Admins handle their institution's departments, lecturers, and students. Lecturers manage courses, grade assignments, and track attendance. Students access their courses, view results, and interact with the AI assistant. Role-based permissions ensure data isolation and security.",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Upload materials, create assignments, manage schedules, and track submissions effortlessly.",
    gradient: "from-amber-500 to-yellow-500",
    details:
      "A complete course lifecycle management system. Lecturers can upload lecture notes, slides, and reference materials. Create assignments with deadlines, attach rubrics, and accept file submissions. The built-in discussion forum lets students ask questions and collaborate. Automatic notifications keep everyone informed about new materials, upcoming deadlines, and grade releases.",
  },
  {
    icon: GraduationCap,
    title: "Result Management",
    description:
      "Automated GPA calculation, transcript generation, and grade publishing workflows.",
    gradient: "from-indigo-500 to-purple-500",
    details:
      "Streamline your grading workflow from CA scores to final transcripts. Lecturers enter continuous assessment and exam scores; the system automatically calculates totals, assigns letter grades, and computes GPAs. Results go through an approval workflow before being published to students. Generate official transcripts with one click, complete with your institution's branding.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Role-based permissions, data isolation per school, and encrypted communications.",
    gradient: "from-red-500 to-rose-500",
    details:
      "Built with enterprise-grade security from the ground up. Row-level security ensures institutions can only access their own data. All communications are encrypted in transit and at rest. Role-based access control prevents unauthorized actions. Audit logs track every significant operation for compliance and accountability.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated alerts for deadlines, attendance risks, and personalized recommendations.",
    gradient: "from-teal-500 to-cyan-500",
    details:
      "Never miss a deadline or overlook an at-risk student. The notification system sends automated alerts for upcoming assignment due dates, low attendance warnings, new course materials, and grade releases. Administrators receive alerts about system-wide metrics. All notifications are configurable so users control what they receive.",
  },
  {
    icon: Calendar,
    title: "Academic Calendar",
    description:
      "Manage semesters, exam schedules, holidays, and events across all departments.",
    gradient: "from-lime-500 to-green-500",
    details:
      "Centrally manage your institution's academic calendar including semester start/end dates, examination periods, public holidays, and special events. The timetable system prevents scheduling conflicts across rooms and lecturers. Students see a unified view of all their classes, exams, and deadlines in one place.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description:
      "Full functionality on any device with offline support for critical features.",
    gradient: "from-violet-500 to-purple-500",
    details:
      "Access the full platform from any device—desktop, tablet, or smartphone. The responsive design adapts to any screen size without losing functionality. Critical features like viewing course materials and checking schedules work even with limited connectivity, so students in areas with unreliable internet aren't left behind.",
  },
];

function FeatureCard({
  feature,
  index,
  onLearnMore,
}: {
  feature: Feature;
  index: number;
  onLearnMore: (feature: Feature) => void;
}) {
  const reducedMotion = useReducedMotion();
  const imageUrl = featureImages[feature.title];

  const CardContent = (
    <div className="block">
      <motion.article
        variants={staggerItemVariants}
        className="group feature-card overflow-hidden"
        aria-labelledby={`feature-title-${index}`}
      >
        {/* Feature image */}
        <div className="relative h-40 -mx-6 -mt-6 mb-5 overflow-hidden">
          <ImageWithFallback
            src={imageUrl}
            alt={feature.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          
          {/* Icon overlay */}
          <div
            className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
            aria-hidden="true"
          >
            <feature.icon className="h-6 w-6 text-white" />
          </div>
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

        {/* Learn more button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onLearnMore(feature);
          }}
          className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          Learn more
          <motion.span 
            className="ml-1"
            animate={reducedMotion ? {} : { x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </button>
      </motion.article>
    </div>
  );

  return reducedMotion ? CardContent : <HoverCard>{CardContent}</HoverCard>;
}

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

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
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              onLearnMore={setSelectedFeature}
            />
          ))}
        </StaggerContainer>
      </div>

      {/* Feature Detail Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={(open) => !open && setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedFeature && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center`}
                  >
                    <selectedFeature.icon className="h-5 w-5 text-white" />
                  </div>
                  <DialogTitle className="text-xl">{selectedFeature.title}</DialogTitle>
                </div>
                <DialogDescription>{selectedFeature.description}</DialogDescription>
              </DialogHeader>
              <div className="relative h-48 rounded-lg overflow-hidden my-4">
                <ImageWithFallback
                  src={featureImages[selectedFeature.title]}
                  alt={selectedFeature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedFeature.details}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
