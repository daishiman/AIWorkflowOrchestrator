# Phase 8 リファクタリング: 簡略化候補

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 8 - リファクタリング

---

## 目的

ChatPanel.tsx のリファクタリングにおいて、将来的な保守性向上のために検討すべき
簡略化候補を記録する。各候補について trade-off を評価し、今回のスコープ内で
実施するか見送るかを判断する。

---

## Candidate 1: computed state のカスタムフック抽出

### 概要

`isBlocked`、`isHandoff`、`showComposer` の計算ロジックを
`useChatPanelDerivedState` カスタムフックとして抽出する。

### 現状の問題

```typescript
// ChatPanel.tsx 内に散在する computed state
const isBlocked = chatState === "blocked";
const isHandoff = chatState === "handoff";
const showComposer = chatState === "idle" || chatState === "streaming";

// さらに派生 computed が追加される場合を想定
const showLoadingIndicator = chatState === "loading";
const showErrorBanner = chatState === "error";
const showEmptyState = chatState === "empty";
const showCancelledNotice = chatState === "cancelled";
```

ChatPanel.tsx 内に 7〜8 個の computed 変数が並列する構造になると、
コンポーネントの本質的なロジック（レンダリング分岐）が埋もれる。

### 提案するリファクタリング

```typescript
// useChatPanelDerivedState.ts
export function useChatPanelDerivedState(chatState: ChatState) {
  return useMemo(
    () => ({
      isBlocked: chatState === "blocked",
      isHandoff: chatState === "handoff",
      showComposer: chatState === "idle" || chatState === "streaming",
      showLoadingIndicator: chatState === "loading",
      showErrorBanner: chatState === "error",
      showEmptyState: chatState === "empty",
      showCancelledNotice: chatState === "cancelled",
    }),
    [chatState],
  );
}

// ChatPanel.tsx
const {
  isBlocked,
  isHandoff,
  showComposer,
  showLoadingIndicator,
  showErrorBanner,
  showEmptyState,
  showCancelledNotice,
} = useChatPanelDerivedState(chatState);
```

### Trade-off

| 観点           | 利点                                          | 欠点                                     |
| -------------- | --------------------------------------------- | ---------------------------------------- |
| 可読性         | ChatPanel.tsx の行数が削減される              | 抽象化レイヤーが増え、初見で把握しにくい |
| テスタビリティ | フック単体テストが書きやすい                  | テストファイルが増える                   |
| 再利用性       | 同じ derived state を他コンポーネントで使える | 現時点では ChatPanel のみが使用者        |
| DRY 原則       | computed を1箇所に集約できる                  | 分散していても量は少ない（7変数）        |
| P48 リスク     | `useMemo` で参照安定化できる                  | `useMemo` の依存配列管理が必要           |

### 判断: 今回は見送り

**理由**:

1. 本タスクは設計タスクであり、プロダクションコード変更のスコープが最小
2. computed 変数は 7 個程度であり、フック抽出の投資対効果が低い
3. フック抽出は「コンポーネントを理解してから行う」が鉄則であり、
   review harness の役割が確定する前に抽出すると設計意図が曖昧になる
4. 後続の実装タスクで handler 配線が完了した後、改めて評価する

**後続タスク候補**: MINOR 扱いで `unassigned-task-detection.md` に記録する

---

## Candidate 2: handler 4 個の useCallback パターン統一

### 概要

GAP-01〜04 の 4 handler（`handleSendMessage`、`handleCancelStream`、
`handleOpenSettings`、`handleOpenTerminal`）を一貫した `useCallback` パターンで記述する。

### 現状の問題

no-op インライン関数 `() => {}` は useCallback を使用していないため、
後続実装タスクで実装を追加する際にパターンが不統一になるリスクがある。
特に `handleSendMessage` は引数（`_message: string`）を受け取るため、
他の 3 handler と関数シグネチャが異なる。

### 提案するリファクタリング

```typescript
// 統一パターン: useCallback + 型付き引数 + TODO コメント

// 引数なし handler（GAP-02, GAP-03, GAP-04）
const handleCancelStream = useCallback((): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): IPC chat:cancel-stream 配線
}, []);

const handleOpenSettings = useCallback((): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): Store navigate 配線
}, []);

const handleOpenTerminal = useCallback((): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): IPC app:open-terminal 配線
  // NOTE(MINOR-A): IPC channel 名は実装前に mainline 側のハンドラ登録を確認すること
}, []);

// 引数あり handler（GAP-01）
const handleSendMessage = useCallback((_message: string): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): chatSlice dispatch 配線
}, []);
```

### Trade-off

| 観点                  | 利点                                          | 欠点                                       |
| --------------------- | --------------------------------------------- | ------------------------------------------ |
| パターン統一          | 後続実装者が一貫したパターンで理解できる      | useCallback の依存配列管理が必要           |
| 型安全                | `: void` 明示で戻り値の誤用を防ぐ             | 若干冗長に見える                           |
| ESLint 対応           | 空の useCallback は ESLint ルールに抵触しない | `react-hooks/exhaustive-deps` の警告に注意 |
| TODO トレーサビリティ | タスク ID 付きコメントで追跡可能              | コメントが多くなる                         |

### 判断: 今回スコープに含める（refactor-boundaries.md の 1-A に記載済み）

**理由**:

1. パターン統一は後続実装タスクの品質を高める準備作業として価値がある
2. `useCallback` + `(): void` 型付き + `TODO` コメントの 3 点セットは
   本プロジェクトの IPC 配線パターンとして標準化されている（P44 対策）
3. 変数化自体は振る舞いを変えないため「安全なリファクタリング」に分類できる

**実施タイミング**: 後続の実装タスクで handler 配線と同時に実施する

---

## 総評: Phase 8 での実施範囲

| 候補                                  | 判断                 | 理由                                  |
| ------------------------------------- | -------------------- | ------------------------------------- |
| Candidate 1: computed フック抽出      | 見送り               | 設計タスクスコープ外、投資対効果低    |
| Candidate 2: useCallback パターン統一 | 後続実装タスクで実施 | refactor-boundaries.md 1-A に記録済み |

**Phase 8 での実際の作業**:

- `refactor-boundaries.md` への境界定義の記録
- 安全なリファクタリング手順の文書化
- 禁止事項と Contract の明文化

プロダクションコードへの変更は後続実装タスクで行うため、
Phase 8 は「実施計画の確定」フェーズとして完了とする。
