import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Calendar, BookOpen, ArrowRight } from "lucide-react";

const resources = [
  { icon: MessageCircle, title: "Discussion Forum", description: "Connect with other institutions, share best practices, and get answers from the community.", cta: "Coming Soon" },
  { icon: Calendar, title: "Webinars & Events", description: "Join monthly webinars on platform features, edtech trends, and best practices in academic management.", cta: "Coming Soon" },
  { icon: Users, title: "User Groups", description: "Join regional user groups to network with nearby institutions and share localized solutions.", cta: "Coming Soon" },
  { icon: BookOpen, title: "Knowledge Base", description: "Browse community-contributed guides, templates, and configuration tips.", cta: "Coming Soon" },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <FadeIn>
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">Community</span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Join the NexfordEdu <span className="gradient-text">Community</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect with educators, administrators, and developers building the future of education technology in Nigeria.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="grid sm:grid-cols-2 gap-6">
              {resources.map((r, i) => (
                <FadeIn key={r.title} delay={i * 0.1}>
                  <div className="glass-card p-6 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <r.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1 mb-4">{r.description}</p>
                    <Button variant="outline" size="sm" disabled>{r.cta}</Button>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.5}>
              <div className="mt-16 text-center glass-card p-8">
                <h3 className="text-xl font-semibold mb-3">Want to stay updated?</h3>
                <p className="text-muted-foreground mb-6">Subscribe to our newsletter for community updates and platform news.</p>
                <Button asChild>
                  <Link to="/contact">Get in Touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
