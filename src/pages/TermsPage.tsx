import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using the NexfordEdu platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an institution, you represent that you have authority to bind that institution to these terms." },
  { title: "Account Registration", content: "You must provide accurate and complete information when creating an account. Each institution is responsible for managing its users' access. You are responsible for maintaining the confidentiality of your login credentials." },
  { title: "Acceptable Use", content: "You agree to use the platform only for legitimate educational purposes. You shall not attempt to access data belonging to other institutions, reverse engineer our systems, or use our AI features to generate harmful content." },
  { title: "Subscription & Payments", content: "Paid features require an active subscription. Prices are listed in Nigerian Naira (₦). Subscriptions renew automatically unless cancelled. Refunds are available within the first 14 days of a new subscription." },
  { title: "Data Ownership", content: "Your institution retains ownership of all academic data entered into the platform. NexfordEdu is granted a license to process this data solely for the purpose of providing our services." },
  { title: "Service Availability", content: "We target 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance windows will be communicated in advance. We are not liable for outages caused by factors outside our control." },
  { title: "Intellectual Property", content: "The NexfordEdu platform, including its design, code, and AI models, is the intellectual property of NexfordEdu Ltd. Institutions may not copy, modify, or distribute any part of the platform." },
  { title: "Limitation of Liability", content: "NexfordEdu shall not be liable for indirect, incidental, or consequential damages arising from use of the platform. Our total liability is limited to the amount paid by your institution in the 12 months preceding the claim." },
  { title: "Termination", content: "Either party may terminate the agreement with 30 days written notice. Upon termination, your institution may request an export of its data within 90 days, after which data will be permanently deleted." },
  { title: "Governing Law", content: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through arbitration in Lagos, Nigeria." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <FadeIn>
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-muted-foreground mb-12">Last updated: March 2026</p>
            </FadeIn>
            <div className="space-y-8">
              {sections.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.05}>
                  <div>
                    <h2 className="text-xl font-semibold mb-3">{i + 1}. {s.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{s.content}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
