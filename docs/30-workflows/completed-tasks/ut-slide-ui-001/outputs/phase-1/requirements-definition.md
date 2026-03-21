# Phase 1 成果物: 要件定義書

## メタ情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | UT-SLIDE-UI-001 |
| Phase    | 1 - 要件定義    |
| 作成日   | 2026-03-21      |

## Task 1: 正本仕様からの要件抽出

### 4領域コンポーネント要件

| コンポーネント     | 責務                                          | 配置                             |
| ------------------ | --------------------------------------------- | -------------------------------- |
| SlideSyncCard      | 同期状態バッジ + メタ情報 + runtime/auth 表示 | SlideWorkspace 上部、常時表示    |
| SlideProgressRow   | 進捗バー + メッセージ + キャンセル CTA        | SlideSyncCard 直下、running のみ |
| SlideWatchStatus   | ファイル監視状態 + 同期方向表示               | SlideSyncCard 内サブ情報         |
| SlideGuidanceBlock | 設定ガイダンス / エラー復旧 + CTA             | メインコンテンツ、条件表示       |
| TerminalLauncher   | コマンドコピー + ターミナル起動               | 右下固定、全状態共通             |

### Props 型定義

```typescript
// SlideSyncCard
interface SlideSyncCardProps {
  projectPath: string;
  uiStatus: SlideUIStatus;
  lastSyncedAt: Date | null;
  degradedReason?: string;
}

// SlideProgressRow
interface SlideProgressRowProps {
  percent: number; // 0-100
  message: string;
  onCancel: () => void;
}

// SlideWatchStatus
interface SlideWatchStatusProps {
  watching: boolean;
  watchPath?: string;
  syncDirection?: "forward" | "reverse";
}

// SlideGuidanceBlock
interface SlideGuidanceBlockProps {
  variant: "guidance" | "degraded";
  title: string;
  reason: string;
  steps?: GuidanceStep[];
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
}

// TerminalLauncher
interface TerminalLauncherProps {
  terminalCommand?: string;
  onCopy: () => void;
  onLaunch: () => void;
}
```

### 状態 -> UI マッピング

| SlideUIStatus | Badge 色     | Badge テキスト | Progress | Guidance | Primary CTA    |
| ------------- | ------------ | -------------- | -------- | -------- | -------------- |
| `synced`      | systemGreen  | 同期済み       | 非表示   | 非表示   | 同期を実行     |
| `running`     | systemBlue   | 同期中...      | 表示     | 非表示   | キャンセル     |
| `degraded`    | systemOrange | 同期失敗       | 非表示   | 表示     | 再試行         |
| `guidance`    | systemBlue   | 設定が必要です | 非表示   | 表示     | API キーを設定 |

### カラーパレット（Apple HIG System Colors）

| 用途             | CSS 変数          | Light     | Dark      |
| ---------------- | ----------------- | --------- | --------- |
| synced           | --status-synced   | `#34C759` | `#30D158` |
| running/guidance | --status-running  | `#007AFF` | `#0A84FF` |
| degraded         | --status-degraded | `#FF9500` | `#FF9F0A` |
| error text       | --status-error    | `#FF3B30` | `#FF453A` |
| カード背景       | --bg-secondary    | `#F2F2F7` | `#1C1C1E` |
| ボーダー         | --border          | `#C6C6C8` | `#38383A` |

### マイクロコピー

**degraded バリアント**:

- タイトル: 「AI 同期に失敗しました」
- ステップ: エラーログ確認 / ネットワーク確認 / ターミナル手動実行案内
- Primary CTA: 「再試行」
- Secondary CTA: 「ターミナルで手動実行」

**guidance バリアント (api-key)**:

- タイトル: 「API キーが設定されていません」
- ステップ: 設定画面を開く / API キー入力 / 同期再実行
- Primary CTA: 「API キーを設定」
- Secondary CTA: 「ターミナルを開く」

## Task 2: 現行実装との GAP 分析

→ 別ファイル `gap-analysis.md` 参照

## Task 3: 依存タスク状態確認

### UT-SLIDE-IMPL-001 の状態

| 項目       | 状態                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスク状態 | 未完了（unassigned-task）                                                                             |
| 仕様書場所 | `docs/30-workflows/completed-tasks/step-04-par-task-09-.../unassigned-task/task-ut-slide-impl-001.md` |

### Store フィールド実装状況

| フィールド        | 存在する store     | 実装状態                                    |
| ----------------- | ------------------ | ------------------------------------------- |
| syncStatus        | slideProjectStore  | 実装済み                                    |
| isWatching        | slideProjectStore  | 実装済み                                    |
| currentPhase      | slideProjectStore  | 実装済み                                    |
| error             | slideProjectStore  | 実装済み                                    |
| executionProgress | slideProjectStore  | 実装済み                                    |
| lastSyncAt        | slideProjectStore  | 実装済み                                    |
| handoffGuidance   | agentSlice         | 実装済み（別 store）                        |
| terminalCommand   | HandoffGuidance 型 | 実装済み（handoffGuidance.terminalCommand） |
| syncDirection     | -                  | 未実装                                      |
| syncProgress      | -                  | 未実装（executionProgress で代替可能）      |
| syncError         | -                  | 未実装（error で代替可能）                  |
| isHandoff         | -                  | 未実装                                      |

### 判断

store フィールド `syncDirection` / `isHandoff` は未実装のため、本タスクでは**モック状態で UI 実装**し、store 接続は UT-SLIDE-IMPL-001 完了後に結合する。`handoffGuidance` は agentSlice から取得可能だが、slide store との統合は UT-SLIDE-IMPL-001 のスコープ。

## Task 4: 受入基準定義

### 機能要件

- [ ] F-1: `SlideSyncCard` が synced / running / degraded / guidance の4状態を表示できる
- [ ] F-2: `SlideProgressRow` が running 時に進捗バー + メッセージ + キャンセルボタンを表示する
- [ ] F-3: `SlideWatchStatus` が watcher active/inactive と syncDirection を表示する
- [ ] F-4: `SlideGuidanceBlock` が guidance/degraded の2バリアントで CTA + 理由を表示する
- [ ] F-5: Persistent Terminal Launcher が全状態で右下固定表示される
- [ ] F-6: degraded 時に failure reason + retry CTA + terminal fallback CTA が表示される
- [ ] F-7: guidance 時に設定導線 CTA + terminal launcher CTA が表示される

### 品質要件

- [ ] Q-1: Apple HIG System Colors 準拠（コントラスト比 4.5:1 以上）
- [ ] Q-2: キーボード操作で全 CTA にアクセス可能
- [ ] Q-3: ARIA ラベルが各 UI 要素へ明示的に付与されている
- [ ] Q-4: 個別セレクタパターン使用（P31/P48 対策）
- [ ] Q-5: テストカバレッジ: Line 80%+, Branch 60%+, Function 80%+

### ドキュメント要件

- [ ] D-1: Phase 11 スクリーンショット（5状態: empty / synced / guidance / running / degraded）
- [ ] D-2: task-09 workflow の Phase 11/12 成果物更新
- [ ] D-3: aiworkflow-requirements の UI 正本が実装済み状態へ同期

## Task 5: store 語彙と UI 語彙の境界確定

### 現行 store / IPC 語彙

- `SyncStatus`: `"synced" | "out-of-sync" | "syncing" | "error"`
- 正本定義との drift: 正本は `"idle"` を含むが、現行実装は `"out-of-sync"` を使用
- 本タスクでは store / IPC 契約を直接変更しない

### UI 語彙

- `SlideUIStatus`: `"synced" | "running" | "degraded" | "guidance"`

### 導出ルール

```typescript
function deriveSlideUIStatus(
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

**優先順位**: guidance > degraded > running > synced
