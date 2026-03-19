# Phase 2: UI/UX 実体化

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 2                                       |
| 作成日   | 2026-03-19                              |

---

## 4 領域コンポーネント設計

### SlideSyncCard Props

```typescript
type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

interface SlideSyncCardProps {
  status: SlideUIStatus;
  lastSyncedAt: Date | null;
  degradedReason?: string;
  guidanceType?: "api-key" | "auth" | "runtime-config";
  onRetry?: () => void;
  onOpenSettings?: () => void;
  onOpenTerminal?: () => void;
  onReverseSync?: () => void;
}
```

### SlideProgressRow Props

```typescript
interface SlideProgressRowProps {
  isVisible: boolean;
  percent: number;
  message: string;
  onCancel?: () => void;
}
```

### SlideWatchStatus Props

```typescript
type WatcherState = "active" | "inactive" | "error";

interface SlideWatchStatusProps {
  watcherState: WatcherState;
  watchPath: string;
  fileCount?: number;
}
```

### SlideGuidanceBlock Props

```typescript
interface SlideGuidanceBlockProps {
  isVisible: boolean;
  variant: "guidance" | "degraded";
  title: string;
  description: string;
  steps: string[];
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
}
```

---

## 状態 → UI マッピング

| 状態       | Badge テキスト | Badge 色     | ProgressRow | GuidanceBlock | Primary CTA    | Secondary CTA      |
| ---------- | -------------- | ------------ | ----------- | ------------- | -------------- | ------------------ |
| `synced`   | 同期済み       | systemGreen  | 非表示      | 非表示        | 同期を実行     | ウォッチ状態を確認 |
| `running`  | 同期中...      | systemBlue   | 表示        | 非表示        | キャンセル     | -                  |
| `degraded` | 同期失敗       | systemOrange | 非表示      | degraded      | 再試行         | ターミナルで実行   |
| `guidance` | 設定が必要です | systemBlue   | 非表示      | guidance      | API キーを設定 | ターミナルを開く   |

---

## SlideUIStatus の導出ロジック

```typescript
function deriveSlideUIStatus(state: SlideSliceState): SlideUIStatus {
  if (state.isHandoff) return "guidance";
  if (state.syncStatus === "syncing" || state.currentPhase !== "idle")
    return "running";
  if (state.syncStatus === "error" || state.syncError !== null)
    return "degraded";
  return "synced";
}
```

---

## マイクロコピーテンプレート

### degraded 時

| フィールド   | テンプレート                                 |
| ------------ | -------------------------------------------- |
| title        | AI 同期に失敗しました                        |
| description  | `{{degradedReason}}`                         |
| steps[0]     | エラーログを確認してください                 |
| steps[1]     | ネットワーク接続を確認してください           |
| steps[2]     | 問題が続く場合はターミナルで手動実行できます |
| primaryCTA   | 再試行                                       |
| secondaryCTA | ターミナルで手動実行                         |

### guidance 時（API key 未設定）

| フィールド   | テンプレート                                                 |
| ------------ | ------------------------------------------------------------ |
| title        | API キーが設定されていません                                 |
| description  | Slide AI 同期を使用するには、Claude API キーの設定が必要です |
| steps[0]     | 設定 → AI ランタイム を開く                                  |
| steps[1]     | API キーを入力して保存する                                   |
| steps[2]     | 同期を再実行する                                             |
| primaryCTA   | API キーを設定                                               |
| secondaryCTA | ターミナルを開く                                             |

---

## カラーパレット（Apple HIG System Colors 準拠）

| 用途               | Light モード                          | Dark モード                            | CSS 変数            |
| ------------------ | ------------------------------------- | -------------------------------------- | ------------------- |
| synced badge       | `#34C759` / `rgba(52,199,89,0.12)` bg | `#30D158` / `rgba(48,209,88,0.12)` bg  | `--status-synced`   |
| running / guidance | `#007AFF` / `rgba(0,122,255,0.08)` bg | `#0A84FF` / `rgba(10,132,255,0.08)` bg | `--status-running`  |
| degraded badge     | `#FF9500` / `rgba(255,149,0,0.12)` bg | `#FF9F0A` / `rgba(255,159,10,0.12)` bg | `--status-degraded` |
| error テキスト     | `#FF3B30`                             | `#FF453A`                              | `--status-error`    |
| カード背景         | `#F2F2F7`                             | `#1C1C1E`                              | `--bg-secondary`    |
| ボーダー           | `#C6C6C8`                             | `#38383A`                              | `--border`          |

---

## コンポーネント配置図

```
+-------------------------------------------------------+
|  SlideWorkspace                                        |
|                                                        |
|  +--------------------------------------------------+ |
|  |  SlideSyncCard                                    | |
|  |  [* 同期済み]  最終同期: 3分前    [同期を実行]    | |
|  +--------------------------------------------------+ |
|                                                        |
|  +--------------------------------------------------+ |
|  |  SlideProgressRow  (running 時のみ)               | |
|  |  ████████░░░  62%  HTML を生成中...  [キャンセル]  | |
|  +--------------------------------------------------+ |
|                                                        |
|  +--------------------------------------------------+ |
|  |  SlideWatchStatus                                 | |
|  |  [* 監視中]  ~/projects/my-slide  12 ファイル     | |
|  +--------------------------------------------------+ |
|                                                        |
|  +--------------------------------------------------+ |
|  |  SlideGuidanceBlock (degraded/guidance 時のみ)    | |
|  |  +----------------------------------------------+| |
|  |  | ! AI 同期に失敗しました                       || |
|  |  | タイムアウトが発生しました。                   || |
|  |  | 1. ネットワークを確認                          || |
|  |  | 2. 再試行する                                  || |
|  |  | [再試行]         [ターミナルで実行]             || |
|  |  +----------------------------------------------+| |
|  +--------------------------------------------------+ |
|                                                        |
|                          [>_ ターミナル] (右下固定)     |
+-------------------------------------------------------+
```

### Persistent Terminal Launcher

- 位置: SlideWorkspace 右下固定（`position: sticky` / footer 固定）
- 表示: 全状態で常時表示
- degraded 時: systemOrange border
- guidance 時: systemBlue border

---

## アクセシビリティ要件

| 要件                 | 実装方針                                        |
| -------------------- | ----------------------------------------------- |
| コントラスト比 4.5:1 | Badge テキストは白背景/黒背景に対して十分な比率 |
| キーボード操作       | Tab で CTA ボタンにフォーカス可能               |
| ARIA ラベル          | `aria-label="同期状態: 同期済み"` 等を付与      |
| 色以外の情報伝達     | アイコン + テキストで状態を示す                 |
