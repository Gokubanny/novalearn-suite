import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GraduationCap } from "lucide-react";

const institutions = [
  { name: "UNILAG", fullName: "University of Lagos" },
  { name: "UI", fullName: "University of Ibadan" },
  { name: "OAU", fullName: "Obafemi Awolowo University" },
  { name: "ABU", fullName: "Ahmadu Bello University" },
  { name: "FUTO", fullName: "Federal University of Technology" },
  { name: "UNIBEN", fullName: "University of Benin" },
  { name: "LASU", fullName: "Lagos State University" },
  { name: "COVENANT", fullName: "Covenant University" },
];

export function TrustedBySection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-12 lg:py-16 border-y border-border/50 bg-secondary/20" aria-label="Trusted by leading institutions">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 tracking-wider uppercase">
            Trusted by 500+ institutions across Nigeria
          </p>
        </FadeIn>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-12 items-center"
            animate={reducedMotion ? {} : { x: [0, -960] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {/* Double the items for seamless loop */}
            {[...institutions, ...institutions].map((inst, i) => (
              <div
                key={`${inst.name}-${i}`}
                className="flex items-center gap-3 flex-shrink-0 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <GraduationCap className="h-5 w-5 text-primary/60" />
                </div>
                <div>
                  <span className="text-base font-bold text-foreground/70 block leading-tight">{inst.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{inst.fullName}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
