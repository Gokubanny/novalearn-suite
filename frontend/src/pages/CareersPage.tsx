import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const openings = [
  { title: "Senior Frontend Engineer", department: "Engineering", location: "Lagos, Nigeria", type: "Full-time" },
  { title: "AI/ML Engineer", department: "AI & Data", location: "Remote (Nigeria)", type: "Full-time" },
  { title: "Product Designer", department: "Design", location: "Lagos, Nigeria", type: "Full-time" },
  { title: "Customer Success Manager", department: "Operations", location: "Lagos, Nigeria", type: "Full-time" },
  { title: "DevOps Engineer", department: "Engineering", location: "Remote (Nigeria)", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <FadeIn>
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">Careers</span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Build the Future of <span className="gradient-text">Education</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our team and help transform how institutions across Nigeria manage academics, attendance, and student success.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <FadeIn>
              <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
            </FadeIn>
            <div className="space-y-4">
              {openings.map((job, i) => (
                <FadeIn key={job.title} delay={i * 0.05}>
                  <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/contact">Apply <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.4}>
              <div className="mt-12 text-center glass-card p-8">
                <h3 className="text-xl font-semibold mb-3">Don't see a role that fits?</h3>
                <p className="text-muted-foreground mb-6">We're always looking for talented people. Send us your resume and we'll keep you in mind.</p>
                <Button asChild>
                  <Link to="/contact">Get in Touch</Link>
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
