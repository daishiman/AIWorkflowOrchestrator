# Phase 2: 設計 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 2                            |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

Phase 1 で定義した要件に基づき、4領域コンポーネントのアーキテクチャ・インターフェース・状態管理設計を行う。

## 実行タスク

| #   | タスク名                  | 目的                                           |
| --- | ------------------------- | ---------------------------------------------- |
| 1   | コンポーネント設計        | 4領域の Props / 内部状態 / レンダリング仕様    |
| 2   | 型定義設計                | SlideUIStatus / WatcherState / GuidanceVariant |
| 3   | Store セレクタ設計        | 個別セレクタ + useShallow パターン             |
| 4   | SlideWorkspace 再構成設計 | 既存コンポーネントと新4領域の配置・責務分離    |
| 5   | Terminal Launcher 設計    | 全状態共通の persistent ランチャー             |

- 設計確定: 4領域コンポーネント、派生型、selector、SlideWorkspace 配置、Terminal Launcher 常時表示を定義する。

## 参照資料

| 資料                                                                                                                    | 用途                                          |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `phase-1-requirements.md`                                                                                               | 要件定義（前 Phase 成果物）                   |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`                                 | UI 4領域の正本設計                            |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                              | slide IPC / SyncStatus / SlideUIStatus 契約   |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`                                  | handoffGuidance / stale state / selector 境界 |
| `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-2/ui-ux-realization.md` | カラー/配置/マイクロコピー                    |

## 実行手順

### Task 1: コンポーネント設計

#### 1.1 SlideSyncCard

**責務**: プロジェクトパス・同期状態バッジ・runtime/auth バッジの集約表示

```typescript
// 配置: apps/desktop/src/renderer/slide/components/SlideSyncCard.tsx

interface SlideSyncCardProps {
  projectPath: string;
  uiStatus: SlideUIStatus;
  lastSyncedAt: Date | null;
  degradedReason?: string;
}

// SlideUIStatus に応じて Badge 色・ラベルを切り替え
// synced: systemGreen + "同期済み"
// running: systemBlue + "実行中"
// degraded: systemOrange + "問題あり"
// guidance: systemBlue + "設定が必要"
```

**配置**: SlideWorkspace 上部、プロジェクト情報セクション内

#### 1.2 SlideProgressRow

**責務**: running 状態時の進捗バー + メッセージ + キャンセル CTA

```typescript
// 配置: apps/desktop/src/renderer/slide/components/SlideProgressRow.tsx

interface SlideProgressRowProps {
  percent: number; // 0-100
  message: string; // "Phase 2: 構成設計中..."
  onCancel: () => void;
}

// running 状態時のみ表示（条件レンダリング）
// percent === 0 の場合は indeterminate 表示
// キャンセルボタンは destructive スタイル
```

**配置**: SlideSyncCard 直下、running 状態時のみ表示

#### 1.3 SlideWatchStatus

**責務**: ファイル監視接続状態と同期方向の表示

```typescript
// 配置: apps/desktop/src/renderer/slide/components/SlideWatchStatus.tsx

interface SlideWatchStatusProps {
  watching: boolean;
  watchPath?: string;
  syncDirection?: "forward" | "reverse";
}

// watching=true: 緑ドット + "監視中"
// watching=false: 灰色ドット + "停止中"
// syncDirection 表示: forward="→" / reverse="←"
```

**配置**: SlideSyncCard 内のサブ情報として表示

#### 1.4 SlideGuidanceBlock

**責務**: degraded/guidance 状態時の理由表示 + CTA 提供

```typescript
// 配置: apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.tsx

type GuidanceVariant = "guidance" | "degraded";

interface GuidanceStep {
  label: string;
  description: string;
}

interface SlideGuidanceBlockProps {
  variant: GuidanceVariant;
  title: string;
  reason: string;
  steps?: GuidanceStep[];
  primaryCTA: {
    label: string;
    onClick: () => void;
  };
  secondaryCTA?: {
    label: string;
    onClick: () => void;
  };
}

// guidance variant: systemBlue アクセント、設定導線
// degraded variant: systemOrange アクセント、retry + terminal fallback
```

**配置**: メインコンテンツ領域、degraded/guidance 状態時に表示

#### 1.5 Terminal Launcher（Persistent）

```typescript
// 配置: apps/desktop/src/renderer/slide/components/TerminalLauncher.tsx

interface TerminalLauncherProps {
  terminalCommand?: string;
  onCopy: () => void;
  onLaunch: () => void;
}

// 全状態で右下固定表示
// command が null の場合は非表示
// コピーボタン + 起動ボタン
```

**配置**: SlideWorkspace 内、right-0 bottom-0 固定

### Task 2: 型定義設計

```typescript
// 配置: apps/desktop/src/renderer/slide/types.ts（新規）

/** UI 表示状態（SyncStatus とは独立した UI レイヤーの状態） */
export type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

/** ファイル監視状態 */
export type WatcherState = "active" | "inactive";

/** ガイダンスバリアント */
export type GuidanceVariant = "guidance" | "degraded";

/** ガイダンス手順 */
export interface GuidanceStep {
  label: string;
  description: string;
}

/** SlideUIStatus 導出ロジック */
export function deriveSlideUIStatus(
  syncStatus: SyncStatus,
  isExecuting: boolean,
  isHandoff: boolean,
  error: string | null,
): SlideUIStatus {
  if (isHandoff) return "guidance";
  if (error !== null || syncStatus === "error") return "degraded";
  if (isExecuting || syncStatus === "syncing") return "running";
  return "synced";
}
```

**設計判断**: `SlideUIStatus` を `SyncStatus` から独立させる理由:

- `SyncStatus` は store/IPC 層の語彙（`idle` / `syncing` / `synced` / `error`）
- `SlideUIStatus` は UI 表示層の語彙（`synced` / `running` / `degraded` / `guidance`）
- `deriveSlideUIStatus()` で store 状態から UI 状態を導出し、関心を分離

### Task 3: Store セレクタ設計

```typescript
// 配置: apps/desktop/src/renderer/slide/selectors.ts（新規）

import { useShallow } from "zustand/react/shallow";
import { useSlideProjectStore } from "./store";

// スカラー値: 個別セレクタ（P31 対策）
export const useSyncStatus = () => useSlideProjectStore((s) => s.syncStatus);

export const useIsWatching = () => useSlideProjectStore((s) => s.isWatching);

export const useProjectPath = () => useSlideProjectStore((s) => s.projectPath);

export const useExecutionProgress = () =>
  useSlideProjectStore((s) => s.executionProgress);

export const useSlideError = () => useSlideProjectStore((s) => s.error);

export const useLastSyncAt = () => useSlideProjectStore((s) => s.lastSyncAt);

// オブジェクト: useShallow でラップ（P48 対策）
export const useSyncProgress = () =>
  useSlideProjectStore(
    useShallow((s) => ({
      percent: s.executionProgress,
      message: s.currentPhase === "idle" ? "" : `Phase: ${s.currentPhase}`,
    })),
  );

// アクション: 安定参照（useEffect 依存配列に安全に含められる）
export const useManualSync = () => useSlideProjectStore((s) => s.manualSync);

export const useCancelExecution = () =>
  useSlideProjectStore((s) => s.cancelExecution);

// 導出状態
export const useSlideUIStatus = (): SlideUIStatus => {
  const syncStatus = useSyncStatus();
  const error = useSlideError();
  // isHandoff は UT-SLIDE-IMPL-001 完了後に store から取得
  // 暫定: error があれば degraded、それ以外は syncStatus ベース
  return deriveSlideUIStatus(syncStatus, false, error);
};
```

### Task 4: SlideWorkspace 再構成設計

**現行構造 → 新構造の変換**:

```
[現行]                          [新構造]
SlideWorkspace                  SlideWorkspace
├── ヘッダー                    ├── ヘッダー（変更なし）
├── [no project]                ├── [no project]（変更なし）
│   └── open CTA               │   └── open CTA
└── [has project]               └── [has project]
    ├── project info panel          ├── SlideSyncCard ← NEW（project info 置換）
    │   ├── path                    │   ├── path + lastSyncedAt
    │   └── SyncStatusIndicator     │   ├── SlideUIStatus badge
    ├── error alert                 │   └── SlideWatchStatus ← NEW
    ├── SkillPhasePanel             ├── SlideProgressRow ← NEW（running 時のみ）
    ├── manual sync button          ├── SlideGuidanceBlock ← NEW（degraded/guidance 時）
    └── file info grid              ├── SkillPhasePanel（synced 時のみ表示）
                                    ├── file info grid（変更なし）
                                    └── TerminalLauncher ← NEW（右下固定）
```

**条件レンダリング設計**:

```typescript
// SlideWorkspace.tsx 内の条件分岐
const uiStatus = useSlideUIStatus();

return (
  <div className="relative h-full">
    {/* 常時表示 */}
    <SlideSyncCard ... />

    {/* running 時のみ */}
    {uiStatus === "running" && <SlideProgressRow ... />}

    {/* degraded / guidance 時のみ */}
    {(uiStatus === "degraded" || uiStatus === "guidance") && (
      <SlideGuidanceBlock ... />
    )}

    {/* synced 時のみ: Phase 選択 */}
    {uiStatus === "synced" && <SkillPhasePanel ... />}

    {/* 常時表示: 右下固定 */}
    <TerminalLauncher ... />
  </div>
);
```

### Task 5: Terminal Launcher 設計

**表示条件**: `handoffGuidance?.terminalCommand` が存在する場合のみ表示（全状態共通）

**レイアウト**: `position: fixed`（SlideWorkspace 内の `relative` コンテナに対して `absolute`）

```
┌─────────────────────────┐
│  $ claude --resume ...  │
│  [コピー] [ターミナル]  │
└─────────────────────────┘
```

**アクセシビリティ**:

- `role="complementary"` + `aria-label="ターミナルランチャー"`
- コピーボタン: クリック後 "コピーしました" のトースト表示
- キーボード: Tab でフォーカス可能

## 統合テスト連携

本 Phase で定義した型・セレクタ・コンポーネントインターフェースは Phase 4 でテスト設計の基盤となる。

## 多角的チェック観点

| 観点         | チェック項目                                                      |
| ------------ | ----------------------------------------------------------------- |
| UI/UX        | 4領域の配置が垂直積層で一貫している                               |
| 状態管理     | 個別セレクタ + useShallow で P31/P48 回避                         |
| 設計原則     | SRP（1コンポーネント1責務）、DIP（UI状態をstore状態から導出分離） |
| Apple HIG    | System Colors 使用、8px グリッド、角丸統一                        |
| P62 三層防御 | UI 層で `canSend` 相当のガードを SlideGuidanceBlock で実現        |

## 成果物

| ファイル                                     | 説明                           |
| -------------------------------------------- | ------------------------------ |
| `outputs/phase-2/design-summary.md`          | 設計概要                       |
| `outputs/phase-2/component-interfaces.md`    | コンポーネントインターフェース |
| `outputs/phase-2/state-management-design.md` | 状態管理・セレクタ設計         |

## 完了条件

- [ ] 4領域コンポーネントの Props 型が TypeScript で定義されている
- [ ] SlideUIStatus 導出ロジック（deriveSlideUIStatus）が設計されている
- [ ] 個別セレクタが P31/P48 対策込みで設計されている
- [ ] SlideWorkspace の再構成（現行 → 新構造）が図示されている
- [ ] Terminal Launcher の配置・表示条件が定義されている
- [ ] 条件レンダリングの分岐が全 SlideUIStatus に対して定義されている

## サブタスク管理

```
- [ ] SlideSyncCard インターフェース設計
- [ ] SlideProgressRow インターフェース設計
- [ ] SlideWatchStatus インターフェース設計
- [ ] SlideGuidanceBlock インターフェース設計
- [ ] Terminal Launcher 設計
- [ ] 型定義（SlideUIStatus / WatcherState / GuidanceVariant）
- [ ] Store セレクタ設計（selectors.ts）
- [ ] SlideWorkspace 再構成レイアウト設計
```

## タスク 100% 実行確認

- [ ] 全サブタスクが完了している
- [ ] 成果物が outputs/phase-2/ に配置されている
- [ ] 完了条件の全項目にチェックが入っている

## 次の Phase

Phase 3: 設計レビュー（phase-3-design-review.md）
