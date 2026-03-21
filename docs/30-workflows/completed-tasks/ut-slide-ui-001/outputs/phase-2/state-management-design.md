# Phase 2 成果物: 状態管理・セレクタ設計

## 型定義 (types.ts)

```typescript
// apps/desktop/src/renderer/slide/types.ts

import type { SyncStatus } from "@repo/shared";

/** UI 表示状態（SyncStatus とは独立した UI レイヤーの状態） */
export type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

/** ガイダンスバリアント */
export type GuidanceVariant = "guidance" | "degraded";

/** ガイダンス手順 */
export interface GuidanceStep {
  label: string;
  description: string;
}

/**
 * SlideUIStatus 導出ロジック
 * 優先順位: guidance > degraded > running > synced
 */
export function deriveSlideUIStatus(
  syncStatus: SyncStatus,
  isExecuting: boolean,
  hasHandoff: boolean,
  error: string | null,
): SlideUIStatus {
  if (hasHandoff) return "guidance";
  if (error !== null || syncStatus === "error") return "degraded";
  if (isExecuting || syncStatus === "syncing") return "running";
  return "synced";
}
```

## セレクタ設計 (selectors.ts)

```typescript
// apps/desktop/src/renderer/slide/selectors.ts

import { useSlideProjectStore, selectIsExecuting } from "./store";
import { deriveSlideUIStatus } from "./types";

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

// アクション: 安定参照
export const useManualSync = () => useSlideProjectStore((s) => s.manualSync); // UT-SLIDE-IMPL-001 で追加予定

export const useCancelExecution = () =>
  useSlideProjectStore((s) => s.cancelExecution); // UT-SLIDE-IMPL-001 で追加予定

// 導出状態
export const useSlideUIStatus = (): SlideUIStatus => {
  const syncStatus = useSyncStatus();
  const isExecuting = useSlideProjectStore(selectIsExecuting);
  const error = useSlideError();
  // hasHandoff は UT-SLIDE-IMPL-001 完了後に store から取得
  // 暫定: false（モック値）
  return deriveSlideUIStatus(syncStatus, isExecuting, false, error);
};
```

## P31/P48 対策の設計判断

| セレクタ             | 戻り値の型     | パターン  | 理由                         |
| -------------------- | -------------- | --------- | ---------------------------- |
| useSyncStatus        | SyncStatus     | 個別      | スカラー値、Object.is で安定 |
| useIsWatching        | boolean        | 個別      | スカラー値                   |
| useProjectPath       | string \| null | 個別      | スカラー値                   |
| useSlideUIStatus     | SlideUIStatus  | 個別+導出 | 複数セレクタを組み合わせ     |
| useExecutionProgress | number         | 個別      | スカラー値                   |

**P48 該当なし**: 現設計では `.filter()` / `.map()` で新配列を返すセレクタが存在しないため、`useShallow` は不要。将来追加時に適用する。
