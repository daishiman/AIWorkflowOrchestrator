import { useEffect, useRef, useState } from "react";

type WatchState = "idle" | "starting" | "watching" | "error";

export interface UseFileWatcherArgs {
  filePath: string | null;
  enabled: boolean;
  onFileChanged: (filePath: string) => Promise<void> | void;
}

export interface UseFileWatcherReturn {
  watchState: WatchState;
  watchError: string | null;
}

let guardedWatchId: string | null = null;
let guardedWatchPath: string | null = null;

export function resetFileWatcherGuard(): void {
  guardedWatchId = null;
  guardedWatchPath = null;
}

export function useFileWatcher({
  filePath,
  enabled,
  onFileChanged,
}: UseFileWatcherArgs): UseFileWatcherReturn {
  const [watchState, setWatchState] = useState<WatchState>("idle");
  const [watchError, setWatchError] = useState<string | null>(null);
  const watchIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const onFileChangedRef = useRef(onFileChanged);

  useEffect(() => {
    onFileChangedRef.current = onFileChanged;
  }, [onFileChanged]);

  useEffect(() => {
    if (!enabled || !filePath || !window.electronAPI?.file) {
      setWatchState("idle");
      return undefined;
    }

    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    const startWatching = async (): Promise<void> => {
      setWatchState("starting");
      setWatchError(null);

      if (guardedWatchPath === filePath && guardedWatchId) {
        watchIdRef.current = guardedWatchId;
        setWatchState("watching");
      } else {
        if (guardedWatchId) {
          await window.electronAPI.file.watchStop(guardedWatchId);
          resetFileWatcherGuard();
        }

        const response = await window.electronAPI.file.watchStart({
          watchPath: filePath,
        });

        if (!response.success || !response.watchId) {
          setWatchState("error");
          setWatchError(response.error ?? "watch-start failed");
          return;
        }

        guardedWatchId = response.watchId;
        guardedWatchPath = filePath;
        watchIdRef.current = response.watchId;
        setWatchState("watching");
      }

      unsubscribe = window.electronAPI.file.onChanged((event) => {
        if (event.filePath !== filePath) {
          return;
        }

        if (debounceTimerRef.current !== null) {
          window.clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = window.setTimeout(() => {
          void onFileChangedRef.current(filePath);
        }, 300);
      });
    };

    void startWatching().catch((error) => {
      if (disposed) {
        return;
      }
      setWatchState("error");
      setWatchError(error instanceof Error ? error.message : "watch failed");
    });

    return () => {
      disposed = true;
      unsubscribe?.();
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      if (watchIdRef.current) {
        void window.electronAPI.file.watchStop(watchIdRef.current);
        if (guardedWatchId === watchIdRef.current) {
          resetFileWatcherGuard();
        }
      }
    };
  }, [enabled, filePath]);

  return {
    watchState,
    watchError,
  };
}
