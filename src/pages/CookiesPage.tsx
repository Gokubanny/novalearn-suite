import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";

const cookieTypes = [
  { name: "Essential Cookies", description: "Required for platform functionality including authentication, session management, and security features. These cannot be disabled.", examples: "Session tokens, CSRF protection, role-based access" },
  { name: "Functional Cookies", description: "Remember your preferences such as theme (dark/light mode), language, and dashboard layout settings.", examples: "Theme preference, high contrast mode, sidebar state" },
  { name: "Analytics Cookies", description: "Help us understand how users interact with the platform so we can improve features and performance.", examples: "Page views, feature usage patterns, error tracking" },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <FadeIn>
              <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
              <p className="text-muted-foreground mb-12">Last updated: March 2026</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground leading-relaxed mb-8">
                NexfordEdu uses cookies and similar technologies to provide, protect, and improve our platform.
                This policy explains what cookies we use and why.
              </p>
            </FadeIn>
            <div className="space-y-8">
              {cookieTypes.map((c, i) => (
                <FadeIn key={c.name} delay={(i + 2) * 0.05}>
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-2">{c.name}</h2>
                    <p className="text-muted-foreground mb-3">{c.description}</p>
                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">Examples:</strong> {c.examples}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.3}>
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-3">Managing Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can manage cookie preferences through your browser settings. Note that disabling essential cookies 
                  may prevent you from using certain features of the platform. For questions, contact us at privacy@nexfordedu.ng.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
