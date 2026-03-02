import { useState, useCallback } from "react";

interface UseUnsavedWarningResult {
  isDialogOpen: boolean;
  pendingPath: string | null;
  requestNavigation: (path: string) => boolean;
  confirmSave: () => void;
  confirmDiscard: () => void;
  cancelNavigation: () => void;
}

export const useUnsavedWarning = (
  isModified: boolean,
  onSave: () => Promise<void>,
): UseUnsavedWarningResult => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const requestNavigation = useCallback(
    (path: string): boolean => {
      if (!isModified) {
        return true;
      }
      setPendingPath(path);
      setIsDialogOpen(true);
      return false;
    },
    [isModified],
  );

  const confirmSave = useCallback(async () => {
    await onSave();
    setIsDialogOpen(false);
    setPendingPath(null);
  }, [onSave]);

  const confirmDiscard = useCallback(() => {
    setIsDialogOpen(false);
    setPendingPath(null);
  }, []);

  const cancelNavigation = useCallback(() => {
    setIsDialogOpen(false);
    setPendingPath(null);
  }, []);

  return {
    isDialogOpen,
    pendingPath,
    requestNavigation,
    confirmSave,
    confirmDiscard,
    cancelNavigation,
  };
};
