import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';
import { secureStorage } from '../utils/secureStorage';

const STORAGE_KEY = 'theme-preference';

// Initial theme detection for SSR safety
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'default';

  try {
    // Check secure storage first
    const savedTheme = secureStorage.get<Theme>(STORAGE_KEY);
    if (savedTheme && isValidTheme(savedTheme)) {
      return savedTheme;
    }

    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'default' : 'light-clean';
  } catch (e) {
    console.warn('Failed to get initial theme:', e);
    return 'default';
  }
}

export function useTheme() {
  // Initialize with default, will update on mount
  const [theme, setTheme] = useState<Theme>('default');
  const [isReady, setIsReady] = useState(false);

  // Load theme from secureStorage on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    setIsReady(true);
  }, []);

  // Update theme
  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      secureStorage.set(STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only auto-switch if user hasn't manually set a preference
      try {
        if (!secureStorage.has(STORAGE_KEY)) {
          const newTheme = mediaQuery.matches ? 'default' : 'light-clean';
          handleThemeChange(newTheme);
        }
      } catch (e) {
        console.warn('Failed to check theme preference:', e);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [handleThemeChange]);

  return { theme, setTheme: handleThemeChange, isReady };
}

function isValidTheme(theme: string): theme is Theme {
  const validThemes: Theme[] = [
    'default', 'light-sky', 'light-clean', 'light-warm',
    'purple-voltage', 'emerald-energy', 'ruby-power',
    'amber-blaze', 'teal-wave', 'pink-spark'
  ];
  return validThemes.includes(theme as Theme);
}
