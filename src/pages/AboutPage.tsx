import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Target, Globe, Award } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { images } from "@/lib/images";

const values = [
  { icon: Target, title: "Innovation", description: "We leverage cutting-edge AI and biometric technology to solve real educational challenges across Africa." },
  { icon: Users, title: "Accessibility", description: "Making world-class academic management tools affordable and accessible to institutions of all sizes." },
  { icon: Globe, title: "Impact", description: "Empowering over 500 institutions and 250,000+ students with smarter, more efficient learning systems." },
  { icon: Award, title: "Excellence", description: "Committed to 99.9% uptime, enterprise-grade security, and continuous improvement of our platform." },
];

const team = [
  { name: "Dr. Chukwuemeka Obi", role: "Founder & CEO", initials: "CO" },
  { name: "Amina Yusuf", role: "CTO", initials: "AY" },
  { name: "Babatunde Afolabi", role: "Head of Product", initials: "BA" },
  { name: "Ngozi Eze", role: "Head of Customer Success", initials: "NE" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Hero */}
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <FadeIn>
                  <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">About Us</span>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                    Transforming Education Across <span className="gradient-text">Nigeria</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p className="text-lg text-muted-foreground mb-8">
                    NexfordEdu was founded with a mission to modernize academic management in Nigerian institutions. 
                    We combine AI, biometric technology, and intuitive design to help schools focus on what matters most — educating students.
                  </p>
                </FadeIn>
              </div>
              <FadeIn delay={0.3}>
                <ImageWithFallback
                  src={images.hero.campus}
                  alt="University campus"
                  aspectRatio="video"
                  className="rounded-2xl shadow-2xl"
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v, i) => (
                <FadeIn key={v.title} delay={i * 0.1}>
                  <div className="glass-card p-6 text-center h-full">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <v.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {team.map((m, i) => (
                <FadeIn key={m.name} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-primary">{m.initials}</span>
                    </div>
                    <h3 className="font-semibold">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.role}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join hundreds of institutions already using NexfordEdu.</p>
              <Button asChild size="lg" className="btn-glow">
                <Link to="/register">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
