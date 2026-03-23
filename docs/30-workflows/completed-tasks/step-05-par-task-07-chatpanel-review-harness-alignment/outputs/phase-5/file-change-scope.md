# Phase 5: ファイル変更スコープ

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 5 — 実装                                        |
| 対象コンポーネント | ChatPanel.tsx                                   |
| タスク種別         | 設計タスク（プロダクションコード変更なし）      |

---

## 1. 変更対象ファイル

### 変更するファイル（1 ファイル）

| ファイルパス                                              | 変更内容                              | 変更種別                      |
| --------------------------------------------------------- | ------------------------------------- | ----------------------------- |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` | GAP-01〜04 の no-op 置換 + JSDoc 追加 | 修正（4 箇所 + JSDoc 1 箇所） |

### 変更内容の内訳

| 変更箇所             | 変更前     | 変更後                                 | GAP       |
| -------------------- | ---------- | -------------------------------------- | --------- |
| `onTerminalSwitch`   | `() => {}` | `handleTerminalSwitch`（Store action） | GAP-01    |
| `onSelectProvider`   | `() => {}` | `handleSelectProvider`（Store action） | GAP-02    |
| `onSelectModel`      | `() => {}` | `handleSelectModel`（Store action）    | GAP-03    |
| `onOpenTerminal`     | `() => {}` | `handleOpenTerminal`（IPC call）       | GAP-04    |
| コンポーネント JSDoc | なし       | `@role review-harness` を含む JSDoc    | Concern 1 |

---

## 2. 変更しないファイル（除外リスト）

### 除外対象と除外理由

| ファイルパス                                                       | 除外理由                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useStreamingChat.ts`              | 本タスクの GAP は ChatPanel の props 渡し部分に限定。Hook 内部には no-op なし                             |
| `apps/desktop/src/renderer/store/chatSlice.ts`                     | Store action の追加は不要。既存の `setActiveView` / `setSelectedProvider` / `setSelectedModel` を使用する |
| `apps/desktop/src/renderer/components/chat/MessageList.tsx`        | 子コンポーネント内部の変更は本タスクのスコープ外                                                          |
| `apps/desktop/src/renderer/components/chat/ChatInput.tsx`          | 同上                                                                                                      |
| `apps/desktop/src/renderer/components/chat/StreamingIndicator.tsx` | 同上                                                                                                      |
| `apps/desktop/src/main/handlers/skillCreatorHandlers.ts`           | IPC ハンドラ側の変更は不要。`openTerminal` の実装が存在するかの確認のみ（P65 対策）                       |
| `apps/desktop/src/preload/index.ts`                                | Preload の allowlist 変更は不要。既存 IPC チャンネルを使用する                                            |

---

## 3. rollback リスク評価

### リスク評価

| リスク項目         | 評価               | 根拠                                                                           |
| ------------------ | ------------------ | ------------------------------------------------------------------------------ |
| 既存動作への影響   | 低                 | no-op を actionable に変えるだけであり、既存の動作（何もしない）より悪化しない |
| 型安全性           | 低                 | Store action・IPC call の型は既存の型定義に従うため型エラーが起きない          |
| 無限ループリスク   | 低（P31 対策済み） | 個別セレクタを使用するため `useEffect` 依存配列問題は発生しない                |
| 二重登録リスク     | 低（P5 対策済み）  | IPC リスナーの登録は行わず、既存 IPC チャンネルを呼ぶだけ                      |
| namespace ドリフト | 低（P65 対策済み） | 既存 IPC チャンネルを使用し、新規 namespace は作成しない                       |

### rollback 手順

変更後に問題が発生した場合のロールバック手順:

```bash
# ChatPanel.tsx のみを git で元に戻す
git checkout HEAD -- apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# テストで問題が再現しないことを確認
cd apps/desktop && pnpm vitest run src/renderer/components/chat/
```

---

## 4. 影響範囲の境界定義

### 変更が伝播しない理由

本タスクの変更（no-op → actionable）は以下の境界内に封じ込められる:

```
ChatPanel.tsx（変更対象）
  ├── props として受け取るコールバックを Store/IPC に接続する
  ├── 親コンポーネントから渡される props には変更なし
  └── 子コンポーネントへの props には変更なし

変更の封じ込め:
  - Store の action 定義は変更しない（呼び出し側の追加のみ）
  - IPC ハンドラ実装は変更しない（呼び出し側の追加のみ）
  - 親コンポーネントの Props インターフェースは変更しない
```

### 変更検証コマンド

```bash
# 変更ファイル数が 1 であることを確認
git diff --stat -- apps/desktop/src/renderer/

# ChatPanel.tsx 以外に変更がないことを確認
git diff --name-only -- apps/desktop/src/renderer/ | grep -v "ChatPanel.tsx"
# 出力が空であること

# no-op が残っていないことを確認
grep -n "() => {}" apps/desktop/src/renderer/components/chat/ChatPanel.tsx
# 出力が空であること
```

---

## 5. テストファイルの変更スコープ

### 変更するテストファイル

| ファイルパス                                                             | 変更内容                   |
| ------------------------------------------------------------------------ | -------------------------- |
| `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | TC-01〜TC-05、TC-08 を追加 |

### 変更しないテストファイル

| ファイルパス                                                         | 除外理由                  |
| -------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingChat.test.ts` | Hook 本体を変更しないため |
| `apps/desktop/src/renderer/store/__tests__/chatSlice.test.ts`        | Store を変更しないため    |
