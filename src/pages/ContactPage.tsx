import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn, ScaleIn } from "@/components/motion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { images } from "@/lib/images";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team will respond within 24 hours",
    contact: "support@novalearn.ng",
    action: "mailto:support@novalearn.ng",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri from 8am to 6pm WAT",
    contact: "+234 800 NOVA LEARN",
    action: "tel:+2348000682527",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    contact: "Lagos, Nigeria",
    action: "#",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Available during business hours",
    contact: "Start a conversation",
    action: "#",
  },
];

const inquiryTypes = [
  { value: "demo", label: "Request a Demo" },
  { value: "sales", label: "Sales Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const reducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden gradient-bg">
          <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <FadeIn>
                  <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
                    Contact Us
                  </span>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                    Let's Start a{" "}
                    <span className="gradient-text">Conversation</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p className="text-lg text-muted-foreground mb-8">
                    Have questions about NovaLearn Suite? Our team is here to help
                    you transform your institution with smart technology.
                  </p>
                </FadeIn>

                {/* Contact methods */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactMethods.map((method, index) => (
                    <FadeIn key={method.title} delay={0.3 + index * 0.1}>
                      <a
                        href={method.action}
                        className="glass-card p-4 flex items-start gap-4 hover:bg-accent/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <method.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{method.title}</h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {method.description}
                          </p>
                          <p className="text-sm text-primary">{method.contact}</p>
                        </div>
                      </a>
                    </FadeIn>
                  ))}
                </div>
              </div>

              <FadeIn delay={0.4}>
                <div className="relative">
                  <ImageWithFallback
                    src={images.contact.team}
                    alt="NovaLearn support team"
                    aspectRatio="video"
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl -z-10" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Form */}
              <FadeIn>
                <div className="glass-premium p-8 lg:p-10">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                  {isSubmitted ? (
                    <motion.div
                      initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll get back to you within 24
                        hours.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)}>
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@university.edu.ng"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution Name</Label>
                        <Input
                          id="institution"
                          placeholder="Your University or College"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiryType">Type of Inquiry</Label>
                        <Select disabled={isSubmitting}>
                          <SelectTrigger id="inquiryType">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            {inquiryTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your institution and how we can help..."
                          rows={5}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full btn-glow"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                              }}
                              className="mr-2"
                            >
                              <Clock className="h-5 w-5" />
                            </motion.div>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </FadeIn>

              {/* Office Info */}
              <div className="space-y-8">
                <FadeIn delay={0.2}>
                  <div className="glass-premium p-8">
                    <h3 className="text-xl font-semibold mb-4">Our Office</h3>
                    <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                      <ImageWithFallback
                        src={images.contact.office}
                        alt="NovaLearn office"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">NovaLearn Technologies</p>
                          <p className="text-sm text-muted-foreground">
                            123 Innovation Drive, Victoria Island
                            <br />
                            Lagos, Nigeria
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Business Hours</p>
                          <p className="text-sm text-muted-foreground">
                            Monday - Friday: 8:00 AM - 6:00 PM WAT
                            <br />
                            Saturday: 9:00 AM - 2:00 PM WAT
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <div className="glass-premium p-8">
                    <h3 className="text-xl font-semibold mb-4">Quick Response</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm">
                          Average response time: <strong>under 2 hours</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-sm">
                          Customer satisfaction: <strong>98%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-sm">
                          Support available in: <strong>English, Yoruba, Igbo, Hausa</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
