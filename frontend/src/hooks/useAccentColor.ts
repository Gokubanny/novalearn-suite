import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_DEFAULTS: Record<string, string> = {
  student: 'hsl(221, 83%, 53%)',
  lecturer: 'hsl(142, 71%, 45%)',
  admin: 'hsl(262, 83%, 58%)',
  super_admin: 'hsl(0, 84%, 60%)',
};

const ACCENT_PRESETS = [
  { name: 'Blue', value: 'hsl(221, 83%, 53%)' },
  { name: 'Purple', value: 'hsl(262, 83%, 58%)' },
  { name: 'Green', value: 'hsl(142, 71%, 45%)' },
  { name: 'Red', value: 'hsl(0, 84%, 60%)' },
  { name: 'Orange', value: 'hsl(25, 95%, 53%)' },
  { name: 'Teal', value: 'hsl(172, 66%, 50%)' },
  { name: 'Pink', value: 'hsl(330, 81%, 60%)' },
  { name: 'Indigo', value: 'hsl(239, 84%, 67%)' },
  { name: 'Amber', value: 'hsl(45, 93%, 47%)' },
  { name: 'Cyan', value: 'hsl(189, 94%, 43%)' },
];

export { ACCENT_PRESETS };

const STORAGE_KEY = 'nexford_accent_color';

export function useAccentColor() {
  const { user } = useAuth();
  const defaultColor = ROLE_DEFAULTS[user?.role || 'student'] || ROLE_DEFAULTS.student;
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || defaultColor;
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setAccentColor(stored || defaultColor);
  }, [user?.userId, defaultColor]);

  const updateAccentColor = useCallback(async (color: string) => {
    setAccentColor(color);
    localStorage.setItem(STORAGE_KEY, color);
  }, []);

  return { accentColor, updateAccentColor, isLoading, defaultColor };
}
