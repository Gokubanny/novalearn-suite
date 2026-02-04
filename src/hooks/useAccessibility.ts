import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  focusVisible: boolean;
}

export const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrast: false,
  toggleHighContrast: () => {},
  reducedMotion: false,
  focusVisible: false,
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("highContrast") === "true";
    }
    return false;
  });

  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    // Track keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") setFocusVisible(true);
    };
    const handleMouseDown = () => setFocusVisible(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
      localStorage.setItem("highContrast", "true");
    } else {
      document.documentElement.classList.remove("high-contrast");
      localStorage.setItem("highContrast", "false");
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast(!highContrast);

  return {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    focusVisible,
    children,
  };
}
