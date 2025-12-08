import { useEffect, useRef } from "react";
import { useAppStore } from "../store";

/**
 * Hook to initialize theme on app startup
 *
 * Should be called once at the root component (e.g., App.tsx)
 * to restore theme settings from electron-store
 */
export function useThemeInitializer(): void {
  const initializeTheme = useAppStore((state) => state.initializeTheme);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization (React StrictMode)
    if (initialized.current) return;
    initialized.current = true;

    // Initialize theme asynchronously
    initializeTheme().catch((error) => {
      console.error("[useThemeInitializer] Failed to initialize theme:", error);
    });
  }, [initializeTheme]);
}
