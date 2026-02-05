import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  parallaxAmount?: number;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
}

export function ParallaxImage({
  src,
  alt,
  className,
  containerClassName,
  parallaxAmount = 50,
  aspectRatio = "video",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-parallaxAmount, parallaxAmount]
  );

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      <motion.div style={{ y }} className="relative">
        <ImageWithFallback
          src={src}
          alt={alt}
          aspectRatio={aspectRatio}
          className={cn("rounded-2xl", className)}
        />
      </motion.div>
    </div>
  );
}
