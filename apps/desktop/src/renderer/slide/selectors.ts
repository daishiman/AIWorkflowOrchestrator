/**
 * Slide 個別セレクタ（P31/P48 対策）
 * @module renderer/slide/selectors
 */

import { useSlideProjectStore, selectIsExecuting } from "./store";
import { deriveSlideUIStatus } from "./types";
import type { SlideUIStatus } from "./types";
import { useHandoffGuidance } from "../store";

// スカラー値: 個別セレクタ（P31 対策）
export const useSyncStatus = () => useSlideProjectStore((s) => s.syncStatus);

export const useIsWatching = () => useSlideProjectStore((s) => s.isWatching);

export const useProjectPath = () => useSlideProjectStore((s) => s.projectPath);

export const useExecutionProgress = () =>
  useSlideProjectStore((s) => s.executionProgress);

export const useSlideError = () => useSlideProjectStore((s) => s.error);

export const useLastSyncAt = () => useSlideProjectStore((s) => s.lastSyncAt);

export const useCurrentPhase = () =>
  useSlideProjectStore((s) => s.currentPhase);

// 導出状態
export const useSlideUIStatus = (): SlideUIStatus => {
  const syncStatus = useSyncStatus();
  const isExecuting = useSlideProjectStore(selectIsExecuting);
  const error = useSlideError();
  const handoffGuidance = useHandoffGuidance();
  return deriveSlideUIStatus(
    syncStatus,
    isExecuting,
    handoffGuidance !== null,
    error,
  );
};
