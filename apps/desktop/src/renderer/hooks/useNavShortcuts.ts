import { useEffect } from "react";
import {
  getViewFromNavigationShortcut,
  isGoBackNavigationShortcut,
  type DockViewType,
} from "../navigation/navContract";

export interface UseNavShortcutsOptions {
  onViewChange: (view: DockViewType) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export function useNavShortcuts({
  onViewChange,
  onGoBack,
  canGoBack = false,
}: UseNavShortcutsOptions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isGoBackNavigationShortcut(event)) {
        if (canGoBack && onGoBack) {
          event.preventDefault();
          onGoBack();
        }
        return;
      }

      const view = getViewFromNavigationShortcut(event);
      if (!view) {
        return;
      }

      event.preventDefault();
      onViewChange(view);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoBack, onGoBack, onViewChange]);
}
