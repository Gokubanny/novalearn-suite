import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarImageProps {
  src: string;
  alt: string;
  fallbackInitials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
};

export function AvatarImage({
  src,
  alt,
  fallbackInitials,
  size = "md",
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shadow-lg",
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      >
        {fallbackInitials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn(
        "rounded-full object-cover shadow-lg ring-2 ring-background",
        sizeClasses[size],
        className
      )}
      loading="lazy"
    />
  );
}
