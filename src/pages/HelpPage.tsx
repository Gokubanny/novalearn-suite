import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, MessageCircle, BookOpen, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within minutes." },
  { q: "How do students mark attendance?", a: "Students can mark attendance via facial recognition on supported devices, or lecturers can mark attendance manually through their dashboard." },
  { q: "Can I export my institution's data?", a: "Yes, administrators can export student records, attendance data, and results in CSV format from the admin dashboard." },
  { q: "How do I add a new course?", a: "Administrators can add courses from the Admin Dashboard → Courses section. Assign a lecturer, set credit units, and publish." },
  { q: "What browsers are supported?", a: "NexfordEdu works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version." },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Help Center</h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">How can we help you today?</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for help..." className="pl-10 h-12" />
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <FadeIn><h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2></FadeIn>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <FadeIn key={f.q} delay={i * 0.05}>
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-2">{f.q}</h3>
                    <p className="text-sm text-muted-foreground">{f.a}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
              <p className="text-muted-foreground mb-8">Our support team is available to assist you.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline"><Link to="/contact"><Mail className="mr-2 h-4 w-4" />Email Support</Link></Button>
                <Button asChild variant="outline"><Link to="/contact"><Phone className="mr-2 h-4 w-4" />Call Us</Link></Button>
                <Button asChild><Link to="/docs"><BookOpen className="mr-2 h-4 w-4" />Read Docs</Link></Button>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
