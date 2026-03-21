# 実装ガイド: Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | UT-SLIDE-UI-001                    |
| タスク名 | Slide Workspace UI 4領域実装       |
| 更新日   | 2026-03-21                         |
| 対象     | `apps/desktop/src/renderer/slide/` |

## Part 1: 中学生レベルの説明

### なぜ必要か

Slide Workspace は、スライド作成の「今どんな状態か」と「次に何をすればいいか」を一画面で伝える必要があります。前の画面は最低限の情報しか出ていなかったので、設定不足なのか、同期失敗なのか、作業中なのかが見分けにくい状態でした。

### たとえば

学校の職員室の前にある連絡ボードを想像するとわかりやすいです。

- `SlideSyncCard` は「今は授業中です」「準備が必要です」の札です。
- `SlideProgressRow` は「今ここまで終わりました」という進み具合の帯です。
- `SlideWatchStatus` は「見回り中」「停止中」のランプです。
- `SlideGuidanceBlock` と `TerminalLauncher` は「困ったらこの順番で対処してください」という案内板です。

1つの大きな箱に全部を詰めるより、必要な札だけが出る方が、今の状態を早く判断できます。

### 何が変わるか

このタスクで、画面は 4 つの役割に分かれました。

1. 同期状態カードが常に出る
2. 実行中だけ進捗バーが出る
3. 設定不足と失敗時だけ復旧ガイドが出る
4. どの状態でも CLI コマンドを確認できる

### `deriveSlideUIStatus` の考え方

`deriveSlideUIStatus` は「どの札を出すか決める係」です。保健室の先生が「設定不足なら案内を最優先、エラーなら復旧、進行中なら進捗、それ以外は通常」と判断するのに近いです。

優先順位は `guidance > degraded > running > synced` です。

## Part 2: 開発者向け実装詳細

### 型定義

```typescript
// packages/shared/src/slide/types.ts
export type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

// apps/desktop/src/renderer/slide/types.ts
export type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";
export type GuidanceVariant = "guidance" | "degraded";

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

`SlideUIStatus` は UI 語彙、`SyncStatus` は shared/store 語彙です。shared の `out-of-sync` は現行 UI では `synced` シェルへフォールスルーさせています。

### APIシグネチャ

```typescript
window.slideApi.getSyncStatus(projectPath: string)
window.slideApi.manualSync(projectPath: string)
window.slideApi.cancelExecution()
window.slideApi.startWatching(projectPath: string)
window.slideApi.stopWatching()
```

```typescript
const terminalCommand = handoffGuidance?.terminalCommand ?? "claude --resume";
const setCurrentView = useSetCurrentView();
```

### 使用例

```tsx
const handoffGuidance = useHandoffGuidance();
const uiStatus = deriveSlideUIStatus(
  syncStatus,
  isExecuting,
  handoffGuidance !== null,
  error,
);

{
  uiStatus === "guidance" && (
    <SlideGuidanceBlock
      variant="guidance"
      primaryCTA={{
        label: "API キーを設定",
        onClick: () => setCurrentView("settings"),
      }}
      secondaryCTA={{
        label: "ターミナルを開く",
        onClick: handleLaunchTerminal,
      }}
    />
  );
}
```

```bash
node apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs
```

### エラーハンドリング

- `manualSync()` は失敗時に `setError()` と `setSyncStatus("error")` を設定します。
- クリップボード API が無い場合、コピー処理は no-op で落としません。
- `closeProject()` と `cancelExecution()` はまだ `console.error` 止まりで、UI 通知は未接続です。これは follow-up として残しています。

### エッジケース

- `handoffGuidance` と `error` が同時にある場合は `guidance` を優先します。
- `syncStatus === "out-of-sync"` は current branch では `synced` シェルに吸収され、reverse-sync 専用表示はまだありません。
- `TerminalLauncher` の「ターミナルを開く」は、ネイティブ IPC が無いため現状はコマンドコピーのフォールバックです。
- live preview は `esbuild` の native binary mismatch で起動できず、Phase 11 は static fallback で証跡化しました。

### 設定項目と定数一覧

| 項目                           | 値 / 役割                                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| `variantStyles.synced.badge`   | `bg-[#34C759]` + 黒文字で AA コントラストを確保                    |
| `variantStyles.running.badge`  | `bg-[#007AFF]`                                                     |
| `variantStyles.degraded.badge` | `bg-[#FF9500]`                                                     |
| `variantStyles.guidance.badge` | `bg-[#007AFF]`                                                     |
| `guidance` primary CTA         | `API キーを設定`                                                   |
| `degraded` primary CTA         | `再試行`                                                           |
| CLI fallback                   | `handoffGuidance.terminalCommand` 優先、無ければ `claude --resume` |

```typescript
interface SlideProgressRowProps {
  percent: number; // 0-100（範囲外は自動clamp）
  message: string; // 進捗メッセージ
  onCancel: () => void; // キャンセルコールバック
}
```

- `role="progressbar"` + `aria-valuenow/min/max` でWCAG準拠
- 進捗バーCSSトランジション: `transition-[width] duration-200`（200ms）

#### SlideWatchStatus

```typescript
interface SlideWatchStatusProps {
  watching: boolean; // 監視中フラグ
  watchPath?: string; // 監視パス（省略可）
  syncDirection?: "forward" | "reverse"; // 同期方向（省略可）
}
```

- `role="status"` で非侵入型のステータス通知
- dotStyles（P47対策: export済み）で active/inactive を制御

#### SlideGuidanceBlock

```typescript
interface SlideGuidanceBlockProps {
  variant: GuidanceVariant; // "guidance" | "degraded"
  title: string;
  reason: string;
  steps?: GuidanceStep[];
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
}
```

- `variant === "degraded"` → `role="alert"`（スクリーンリーダーへの即時通知）
- `variant === "guidance"` → `role="complementary"`（補完情報）

#### TerminalLauncher

```typescript
interface TerminalLauncherProps {
  terminalCommand?: string; // undefinedのとき null を返す（非表示）
  onCopy: () => void;
  onLaunch: () => void;
}
```

- `terminalCommand === undefined` の場合、コンポーネントは null を返す
- UT-SLIDE-IMPL-001 完了後に `handoffGuidance.terminalCommand` を接続

### Apple HIG カラーパレット実装

| 状態                   | Light                | Dark                    | 使用箇所                                          |
| ---------------------- | -------------------- | ----------------------- | ------------------------------------------------- |
| synced                 | `#34C759`            | `#30D158`               | SlideSyncCard badge                               |
| running/guidance       | `#007AFF`            | `#0A84FF`               | SlideSyncCard badge, SlideProgressRow bar, ボタン |
| degraded               | `#FF9500`            | `#FF9F0A`               | SlideSyncCard badge, SlideGuidanceBlock border    |
| error                  | `#FF3B30`            | `#FF453A`               | エラーテキスト, キャンセルボタン                  |
| テキスト（プライマリ） | `#000000`            | `#FFFFFF`               | 全コンポーネント                                  |
| テキスト（セカンダリ） | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | サブテキスト                                      |
| 背景（カード）         | `#FFFFFF`            | `#1C1C1E`               | カード系コンポーネント                            |
| ボーダー               | `#C6C6C8`            | `#38383A`               | 全コンポーネント境界                              |

**Tailwind Slate 不使用（01-architecture.md 準拠）**: `slate-*` クラスは一切不使用。Apple HIGのシステムカラー値を直接Tailwind arbitrary valuesで指定。

### 依存関係と暫定実装の状態

| 依存                               | 状態                                       | 接続先                                                             |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `hasHandoff`                       | 暫定 `false`                               | UT-SLIDE-IMPL-001: store接続後に `handoffGuidance !== null` で取得 |
| `handleLaunchTerminal`             | 空実装                                     | UT-SLIDE-IMPL-001: `handoffGuidance.terminalCommand` を使って起動  |
| `handleCopyCommand`                | 暫定実装（"claude --resume" ハードコード） | UT-SLIDE-IMPL-001: `handoffGuidance.terminalCommand` を使用        |
| `TerminalLauncher.terminalCommand` | 暫定 `"claude --resume"`                   | UT-SLIDE-IMPL-001: handoffGuidance.terminalCommand を渡す          |
| `lastSyncedAt`                     | 暫定 `null`                                | UT-SLIDE-IMPL-001: store接続後に取得                               |
