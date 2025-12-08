import { useEffect, useCallback } from "react";
import { useAppStore } from "../store";
import type { ThemeMode, ResolvedTheme } from "../store/types";

export interface UseThemeReturn {
  /** Current theme mode (user selection) */
  themeMode: ThemeMode;
  /** Actually applied theme (resolved from mode) */
  resolvedTheme: ResolvedTheme;
  /** Change the theme mode */
  setTheme: (mode: ThemeMode) => Promise<void>;
  /** Convenience helper: true if resolvedTheme is 'dark' */
  isDark: boolean;
}

/**
 * Custom hook for theme management
 *
 * Provides:
 * - Access to current theme state from Zustand
 * - setTheme action for changing themes
 * - System theme change monitoring
 * - isDark convenience helper
 */
export function useTheme(): UseThemeReturn {
  // Get state from Zustand store (individual selectors for optimal re-renders)
  const themeMode = useAppStore((state) => state.themeMode);
  const resolvedTheme = useAppStore((state) => state.resolvedTheme);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setResolvedTheme = useAppStore((state) => state.setResolvedTheme);

  // Monitor system theme changes
  useEffect(() => {
    // Register listener for system theme changes
    const unsubscribe = window.electronAPI.theme.onSystemChanged((event) => {
      // Only update if we're in system mode
      if (themeMode === "system") {
        setResolvedTheme(event.resolvedTheme);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [themeMode, setResolvedTheme]);

  // Memoized setTheme wrapper
  const setTheme = useCallback(
    async (mode: ThemeMode) => {
      await setThemeMode(mode);
    },
    [setThemeMode],
  );

  // Compute isDark
  const isDark = resolvedTheme === "dark";

  return {
    themeMode,
    resolvedTheme,
    setTheme,
    isDark,
  };
}
