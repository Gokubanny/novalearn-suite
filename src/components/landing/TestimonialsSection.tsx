import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "SmartSchool transformed how we manage our institution. The biometric attendance alone saved us countless hours and improved accuracy by 98%.",
    author: "Dr. Adebayo Johnson",
    role: "Vice Chancellor",
    institution: "Federal University of Technology",
    avatar: "AJ",
  },
  {
    quote:
      "The AI learning assistant has been a game-changer for our students. They're more engaged and their performance has improved significantly.",
    author: "Prof. Ngozi Okonkwo",
    role: "Dean of Studies",
    institution: "Lagos State University",
    avatar: "NO",
  },
  {
    quote:
      "Implementation was seamless and support has been exceptional. We onboarded 15,000 students in just two weeks.",
    author: "Mr. Emeka Chukwu",
    role: "IT Director",
    institution: "Covenant University",
    avatar: "EC",
  },
  {
    quote:
      "The exam proctoring feature gives us confidence in our online assessments. Academic integrity is no longer a concern.",
    author: "Dr. Fatima Ibrahim",
    role: "Registrar",
    institution: "Ahmadu Bello University",
    avatar: "FI",
  },
];

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="glass-card p-8 hover-lift"
    >
      <Quote className="h-10 w-10 text-primary/20 mb-4" />
      <p className="text-foreground mb-6 leading-relaxed">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold">{testimonial.author}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.institution}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium text-primary mb-4"
          >
            TESTIMONIALS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            Trusted by Leading{" "}
            <span className="gradient-text">Nigerian Institutions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            See what educators and administrators are saying about SmartSchool.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
