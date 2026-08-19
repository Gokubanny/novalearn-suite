import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

function getInitial(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * Shared light/dark theme state. Persists to localStorage and keeps the
 * `dark` class on <html> in sync across public and dashboard surfaces.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(getInitial);

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIsDark(e.newValue === "dark");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  return { isDark, setIsDark, toggleTheme };
}
