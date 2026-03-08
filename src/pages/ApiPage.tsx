import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, Lock, Zap, ArrowRight } from "lucide-react";

const endpoints = [
  { method: "GET", path: "/api/v1/students", description: "List all students in your institution" },
  { method: "GET", path: "/api/v1/courses", description: "Retrieve courses and enrollment data" },
  { method: "POST", path: "/api/v1/attendance", description: "Submit attendance records" },
  { method: "GET", path: "/api/v1/results", description: "Fetch published results and grades" },
  { method: "POST", path: "/api/v1/notifications", description: "Send notifications to users" },
];

export default function ApiPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <FadeIn>
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">Developer API</span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                NexfordEdu <span className="gradient-text">API Reference</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Integrate NexfordEdu with your existing systems using our RESTful API. Available on Enterprise plans.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="grid sm:grid-cols-3 gap-6 mb-16">
              {[
                { icon: Zap, title: "RESTful", desc: "Standard REST endpoints with JSON responses" },
                { icon: Lock, title: "Secure", desc: "API key authentication with rate limiting" },
                { icon: Code, title: "Well-Documented", desc: "Comprehensive examples and SDKs" },
              ].map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.1}>
                  <div className="glass-card p-6 text-center">
                    <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn><h2 className="text-2xl font-bold mb-6">Sample Endpoints</h2></FadeIn>
            <div className="space-y-3">
              {endpoints.map((e, i) => (
                <FadeIn key={e.path} delay={i * 0.05}>
                  <div className="glass-card p-4 flex items-center gap-4">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${e.method === "GET" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>
                      {e.method}
                    </span>
                    <code className="text-sm font-mono flex-1">{e.path}</code>
                    <span className="text-sm text-muted-foreground hidden sm:block">{e.description}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.4}>
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">API access is available on Enterprise plans. Contact us to get started.</p>
                <Button asChild size="lg">
                  <Link to="/contact">Request API Access <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
