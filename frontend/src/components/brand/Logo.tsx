import { cn } from "@/lib/utils";
import logoLight from "@/assets/nexfordedu-logo-light.png";
import logoDark from "@/assets/nexfordedu-logo-dark.png";
import mark from "@/assets/nexfordedu-mark.png";

interface LogoProps {
  className?: string;
  alt?: string;
  /**
   * Force a variant when the logo sits on a fixed surface regardless of theme
   * (e.g. photo overlays or solid brand-gradient panels). Omit for adaptive use.
   */
  force?: "light" | "dark";
}

/**
 * Full NexfordEdu lockup (hexagon mark + wordmark).
 * Adaptive by default: navy "Nexford" on light surfaces, white on dark.
 */
export function Logo({ className, alt = "NexfordEdu", force }: LogoProps) {
  const showLight = !force || force === "light";
  const showDark = !force || force === "dark";
  return (
    <>
      {showLight && (
        <img
          src={logoLight}
          alt={showDark ? undefined : alt}
          aria-hidden={showDark ? true : undefined}
          className={cn("w-auto", showDark && "hidden dark:block", className)}
        />
      )}
      {showDark && (
        <img
          src={logoDark}
          alt={showLight ? alt : undefined}
          aria-hidden={showLight ? true : undefined}
          className={cn("w-auto", showLight && "dark:hidden", className)}
        />
      )}
    </>
  );
}

/** Hexagon crest only — for compact placements (dashboard sidebar, favicon source). */
export function LogoMark({ className, alt = "NexfordEdu crest" }: { className?: string; alt?: string }) {
  return <img src={mark} alt={alt} className={cn("object-contain", className)} />;
}
