# Phase 2: 設計サマリー - Design Summary

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 2                                                  |
| 作成日   | 2026-03-22                                         |

## 1. Concern 分解（3つ以下）

### Concern-1: reason-action matrix

blocked reason ごとに primary/secondary action を `Record<BlockedReason, GuidanceConfig>` で型安全に定義する。

### Concern-2: store/controller boundary

guidance 生成ロジックの配置先を決定し、ChatView / WorkspaceChatPanel が同一のソースを消費する。

### Concern-3: surface 間 copy consistency

メッセージテキスト・CTA ラベル・variant を統一ソースから取得し、surface 固有のハードコードを排除する。

## 2. Guidance 配置先の決定

### 評価マトリクス

| 基準           | A: DTO 拡張               | B: 共有 Hook        | C: Store derived      |
| -------------- | ------------------------- | ------------------- | --------------------- |
| 単一責務       | Main Process に集約       | UI 層で完結         | Store 層に混在        |
| テスタビリティ | IPC mock 必要             | 関数単体テスト可能  | Store mock 必要       |
| P31/P48 リスク | なし（IPC 経由）          | なし（純関数）      | あり（derived state） |
| IPC 契約変更   | 必要（shape 変更）        | 不要                | 不要                  |
| 実装コスト     | 高（Main + Preload 変更） | 低（Renderer のみ） | 中（Store 変更）      |
| 後続タスク影響 | Task02 への依存追加       | 独立実装可能        | chatSlice 変更        |

### 決定: **選択肢 B（共有 Hook: useBlockedGuidance）**

**根拠**:

1. **単一責務**: reason -> guidance 変換は UI 表示の関心事であり、Renderer 層で完結すべき
2. **テスタビリティ**: 純関数として切り出せば、Store/IPC mock なしで unit test 可能
3. **P31/P48 安全**: Hook 内部で derived state を生成しないため、再描画ループのリスクなし
4. **IPC 非依存**: Main Process / Preload の contract を変更しないため、Task02 への依存追加不要
5. **実装コスト**: Renderer のみの変更で完結し、後続実装者のスコープが明確

### 不採用理由

- **A (DTO 拡張)**: IPC shape 変更は P44/P45 のドリフトリスクを増大させる。guidance の文言は Renderer の関心事であり、Main Process に持ち込むべきでない
- **C (Store derived)**: chatSlice に未使用 state が既に溜まっている（G-04〜G-06）。derived state 追加は P48 リスクを生む

## 3. 設計の詳細

### 3.1 reason-action mapping 定義

```typescript
// 新規: apps/desktop/src/renderer/guidance/blockedGuidanceConfig.ts

export type BlockedReason =
  | "NO_PROVIDER"
  | "NO_MODEL"
  | "NO_API_KEY"
  | "AUTH_EXPIRED"
  | "NETWORK_ERROR"
  | "POLICY_VIOLATION";

export type GuidanceActionType =
  | "navigate-settings"
  | "open-terminal"
  | "copy-command"
  | "retry-connection";

export interface GuidanceAction {
  type: GuidanceActionType;
  label: string;
}

export interface GuidanceConfig {
  message: string;
  variant: "blocked" | "error" | "handoff";
  primaryAction: GuidanceAction;
  secondaryAction: GuidanceAction;
}

export const BLOCKED_GUIDANCE_MAP: Record<BlockedReason, GuidanceConfig> = {
  NO_PROVIDER: {
    message:
      "AI Provider が選択されていません。設定画面で Provider を選択してください。",
    variant: "blocked",
    primaryAction: { type: "navigate-settings", label: "設定を見る" },
    secondaryAction: { type: "open-terminal", label: "terminal を開く" },
  },
  NO_MODEL: {
    message:
      "AI モデルが選択されていません。設定画面でモデルを選択してください。",
    variant: "blocked",
    primaryAction: { type: "navigate-settings", label: "設定を見る" },
    secondaryAction: { type: "open-terminal", label: "terminal を開く" },
  },
  NO_API_KEY: {
    message:
      "API キーが設定されていません。設定画面で API キーを入力してください。",
    variant: "blocked",
    primaryAction: { type: "navigate-settings", label: "設定を見る" },
    secondaryAction: { type: "open-terminal", label: "terminal を開く" },
  },
  AUTH_EXPIRED: {
    message: "認証の有効期限が切れています。設定画面で再認証してください。",
    variant: "error",
    primaryAction: { type: "navigate-settings", label: "設定を見る" },
    secondaryAction: { type: "open-terminal", label: "terminal を開く" },
  },
  NETWORK_ERROR: {
    message: "ネットワーク接続に問題があります。接続を確認してください。",
    variant: "error",
    primaryAction: { type: "retry-connection", label: "接続を再確認" },
    secondaryAction: { type: "open-terminal", label: "terminal を開く" },
  },
  POLICY_VIOLATION: {
    message:
      "この操作は現在の設定では実行できません。terminal で直接実行してください。",
    variant: "handoff",
    primaryAction: { type: "open-terminal", label: "terminal を開く" },
    secondaryAction: { type: "copy-command", label: "command をコピー" },
  },
};
```

### 3.2 共有 Hook: useBlockedGuidance

```typescript
// 新規: apps/desktop/src/renderer/guidance/useBlockedGuidance.ts

import { useMemo } from "react";
import {
  BLOCKED_GUIDANCE_MAP,
  type BlockedReason,
  type GuidanceConfig,
} from "./blockedGuidanceConfig";

/**
 * blocked reason から GuidanceConfig を取得する Hook。
 * reason が null の場合は null を返す（ready 状態）。
 *
 * P31 安全: useMemo で参照安定化。reason が変わらなければ同一オブジェクト。
 * P48 安全: derived array を返さないため useShallow 不要。
 */
export function useBlockedGuidance(
  reason: BlockedReason | null,
): GuidanceConfig | null {
  return useMemo(() => {
    if (reason === null) return null;
    return BLOCKED_GUIDANCE_MAP[reason];
  }, [reason]);
}
```

### 3.3 action dispatcher

```typescript
// 新規: apps/desktop/src/renderer/guidance/guidanceActionDispatcher.ts

import type { GuidanceActionType } from "./blockedGuidanceConfig";

export type ViewSetter = (view: string) => void;

export interface GuidanceActionHandlers {
  navigateToSettings: () => void;
  openTerminal: () => void;
  copyCommand: (command: string) => void;
  retryConnection: () => void;
}

/**
 * GuidanceActionType を実際の handler に dispatch する。
 * surface ごとに異なる handler 実装を注入できる。
 */
export function createGuidanceActionDispatcher(
  handlers: GuidanceActionHandlers,
): (actionType: GuidanceActionType) => void {
  return (actionType) => {
    switch (actionType) {
      case "navigate-settings":
        handlers.navigateToSettings();
        break;
      case "open-terminal":
        handlers.openTerminal();
        break;
      case "copy-command":
        handlers.copyCommand(""); // handoff context から取得
        break;
      case "retry-connection":
        handlers.retryConnection();
        break;
    }
  };
}
```

### 3.4 ChatView / WorkspaceChatPanel の消費パターン

```typescript
// ChatView での使用例
const guidance = useBlockedGuidance(blockedReason);
const dispatch = useMemo(() => createGuidanceActionDispatcher({
  navigateToSettings: () => setCurrentView("settings"),
  openTerminal: () => { /* terminal launcher */ },
  copyCommand: (cmd) => navigator.clipboard.writeText(cmd),
  retryConnection: () => { /* health check retry */ },
}), [setCurrentView]);

// GuidanceBlock への props 渡し
{guidance && (
  <GuidanceBlock
    variant={guidance.variant}
    message={guidance.message}
    actionLabel={guidance.primaryAction.label}
    onAction={() => dispatch(guidance.primaryAction.type)}
  />
)}
```

### 3.5 GuidanceBlock props 拡張設計

```typescript
// GuidanceBlock.tsx - secondary CTA 対応
export interface GuidanceBlockProps {
  variant: GuidanceVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string; // 追加
  onSecondaryAction?: () => void; // 追加
}
```

## 4. Concern-2: 既存 chatSlice state の活用方針

| state              | 方針             | 理由                                                |
| ------------------ | ---------------- | --------------------------------------------------- |
| ChatPanelStatus    | 後続タスクで活用 | blocked reason の導出に使えるが、本タスクスコープ外 |
| streamingError     | 後続タスクで活用 | error variant の guidance に活用可能だが実装タスク  |
| resolvedCapability | 後続タスクで活用 | policy DTO 消費で代替可能、削除候補でもある         |

本タスク（設計）では chatSlice への変更を設計しない。後続実装タスクで判断する。

## 5. simpler alternative

### Alternative: inline mapping（Hook なし）

```typescript
// GuidanceBlock を直接呼ぶ surface で reason -> props をインライン変換
const MESSAGE_MAP = { NO_PROVIDER: "...", NO_MODEL: "..." } as const;
<GuidanceBlock message={MESSAGE_MAP[reason]} ... />
```

**不採用理由**: surface ごとに mapping がコピーされ、G-02/G-10 の不統一が再発する。

## 6. Phase 3 review 観点

### drift しやすいポイント

1. `BLOCKED_GUIDANCE_MAP` の reason 追加漏れ: 新 reason を追加した際に mapping テーブルの更新を忘れる → `Record<BlockedReason, ...>` で型レベルで防止
2. CTA ラベルの surface 間差異: 各 surface で独自ラベルを追加してしまう → 統一 mapping からのみ取得するルール
3. action dispatcher の handler 未実装: `openTerminal` が placeholder のまま残る → 後続実装タスクで対応

### blocked 条件

- `blockedReason` の供給元（policy DTO からの変換）は本タスクでは設計のみ。実装は後続タスク
- `openTerminal` handler の実装は Task06 依存
