import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Settings, GraduationCap, Shield, ArrowRight } from "lucide-react";

const docSections = [
  { icon: BookOpen, title: "Getting Started", description: "Learn how to set up your institution, create departments, and invite your first users.", link: "/contact" },
  { icon: Users, title: "User Management", description: "Manage students, lecturers, and administrators. Configure roles and permissions.", link: "/contact" },
  { icon: GraduationCap, title: "Academic Management", description: "Set up courses, manage enrollments, configure grading systems, and publish results.", link: "/contact" },
  { icon: Settings, title: "Platform Configuration", description: "Customize matric number formats, timetables, attendance settings, and branding.", link: "/contact" },
  { icon: Shield, title: "Security & Compliance", description: "Understand our security architecture, data isolation, and compliance features.", link: "/contact" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <FadeIn>
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">Documentation</span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Learn How to Use <span className="gradient-text">NexfordEdu</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive guides and documentation to help you get the most out of the platform.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="space-y-6">
              {docSections.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.05}>
                  <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={s.link}>Read More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.4}>
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">Need help? Our support team is ready to assist.</p>
                <Button asChild>
                  <Link to="/contact">Contact Support</Link>
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
