import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
}

export function HoverCard({
  children,
  className = "",
  hoverScale = 1.02,
  hoverY = -4,
}: HoverCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn("cursor-pointer", className)}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale, 
        y: hoverY,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
}
