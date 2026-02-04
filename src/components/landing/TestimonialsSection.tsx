import { Quote, Star } from "lucide-react";
import { FadeIn, StaggerContainer, staggerItemVariants, HoverCard } from "@/components/motion";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const testimonials = [
  {
    quote:
      "NovaLearn Suite transformed how we manage our institution. The biometric attendance alone saved us countless hours and improved accuracy by 98%.",
    author: "Dr. Adebayo Johnson",
    role: "Vice Chancellor",
    institution: "Federal University of Technology",
    avatar: "AJ",
    rating: 5,
  },
  {
    quote:
      "The AI learning assistant has been a game-changer for our students. They're more engaged and their performance has improved significantly.",
    author: "Prof. Ngozi Okonkwo",
    role: "Dean of Studies",
    institution: "Lagos State University",
    avatar: "NO",
    rating: 5,
  },
  {
    quote:
      "Implementation was seamless and support has been exceptional. We onboarded 15,000 students in just two weeks.",
    author: "Mr. Emeka Chukwu",
    role: "IT Director",
    institution: "Covenant University",
    avatar: "EC",
    rating: 5,
  },
  {
    quote:
      "The exam proctoring feature gives us confidence in our online assessments. Academic integrity is no longer a concern.",
    author: "Dr. Fatima Ibrahim",
    role: "Registrar",
    institution: "Ahmadu Bello University",
    avatar: "FI",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-warning fill-warning" : "text-muted-foreground"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const reducedMotion = useReducedMotion();

  const CardContent = (
    <motion.article
      variants={staggerItemVariants}
      className="glass-premium p-8"
      aria-labelledby={`testimonial-author-${index}`}
    >
      {/* Quote icon */}
      <div className="flex items-center justify-between mb-6">
        <Quote className="h-10 w-10 text-primary/20" aria-hidden="true" />
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Quote text */}
      <blockquote>
        <p className="text-foreground mb-6 leading-relaxed text-base">
          "{testimonial.quote}"
        </p>
      </blockquote>

      {/* Author info */}
      <footer className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shadow-lg"
          aria-hidden="true"
        >
          {testimonial.avatar}
        </div>
        <div>
          <cite 
            id={`testimonial-author-${index}`}
            className="font-semibold not-italic block"
          >
            {testimonial.author}
          </cite>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.institution}
          </p>
        </div>
      </footer>
    </motion.article>
  );

  return reducedMotion ? CardContent : <HoverCard hoverY={-6}>{CardContent}</HoverCard>;
}

export function TestimonialsSection() {
  return (
    <section 
      className="py-20 lg:py-32 bg-secondary/30 relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 mesh-gradient opacity-30" aria-hidden="true" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
              Testimonials
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 
              id="testimonials-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Trusted by Leading{" "}
              <span className="gradient-text">Nigerian Institutions</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground">
              See what educators and administrators are saying about NovaLearn Suite.
            </p>
          </FadeIn>
        </div>

        {/* Testimonials Grid */}
        <StaggerContainer 
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          staggerDelay={0.1}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </StaggerContainer>

        {/* Trust indicators */}
        <FadeIn delay={0.5}>
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Trusted by 500+ educational institutions across Nigeria
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {/* Institution logos placeholder - using text for now */}
              {["UNILAG", "UI", "OAU", "ABU", "FUTO", "UNIBEN"].map((name) => (
                <span key={name} className="text-lg font-bold text-muted-foreground">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
