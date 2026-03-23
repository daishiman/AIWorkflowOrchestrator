# Phase 5: 変更スコープ

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

本タスクで変更するファイルの一覧と、ファイルごとの変更内容を定義する。
変更禁止ファイル（システムファイル・他タスク管轄ファイル）も明記する。

---

## 1. 変更対象ファイル一覧

### 1-A: 新規作成ファイル

| ファイルパス                                                              | 実装ステップ | 目的                                 |
| ------------------------------------------------------------------------- | ------------ | ------------------------------------ |
| `packages/shared/src/types/transcriptProvenance.ts`                       | Step 1       | TranscriptProvenance型の正本定義     |
| `apps/desktop/src/renderer/hooks/useTranscriptShare.ts`                   | Step 3       | OP-1/2/3操作のHook                   |
| `apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.tsx` | Step 4       | Provenanceメタ情報表示コンポーネント |

### 1-B: 既存拡張ファイル

| ファイルパス                                                         | 実装ステップ | 変更内容                                                                       |
| -------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| `packages/shared/src/types/workspaceChat.ts`                         | Step 1       | `WorkspaceChatMessage` に `transcriptProvenance?: TranscriptProvenance` を追加 |
| `packages/shared/src/index.ts`                                       | Step 1       | `TranscriptProvenance` 型のexportを追加                                        |
| `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`           | Step 2       | pendingProvenance状態と set/clear アクションを追加                             |
| `apps/desktop/src/renderer/components/organisms/ChatInputArea.tsx`   | Step 5       | TranscriptProvenanceChipの条件表示、clearアクション接続                        |
| `apps/desktop/src/renderer/components/molecules/ChatMessageItem.tsx` | Step 6       | transcriptProvenanceが存在する場合のChip表示                                   |

### 1-C: テストファイル（新規作成）

| ファイルパス                                                                 | 対応検証ID             |
| ---------------------------------------------------------------------------- | ---------------------- |
| `apps/desktop/src/__tests__/TranscriptProvenanceChip.test.tsx`               | V-C1, V-C2, V-C3, V-C4 |
| `apps/desktop/src/__tests__/useTranscriptShare.test.ts`                      | V-C5, V-C6, V-C7       |
| `apps/desktop/src/__tests__/TranscriptProvenance.types.test.ts`              | V-C8                   |
| `apps/desktop/src/__tests__/integration/transcriptShare.integration.test.ts` | V-I1〜V-I5             |
| `apps/desktop/src/__tests__/factories/transcriptProvenance.factory.ts`       | 共通モックファクトリ   |
| `apps/desktop/src/__tests__/factories/workspaceChatMessage.factory.ts`       | 共通モックファクトリ   |

---

## 2. ファイルごとの変更内容詳細

### `packages/shared/src/types/transcriptProvenance.ts`（新規）

```typescript
/**
 * Transcript -> Chat Provenance Linkage の型定義
 * TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
 */

/** Transcriptの共有元種別 */
export type TranscriptSourceType = "range" | "last-output" | "session";

/** メッセージ範囲（OP-1: 選択範囲 の場合のみ存在） */
export interface TranscriptMessageRange {
  /** 選択開始行（1始まり） */
  startLine: number;
  /** 選択終了行（1始まり） */
  endLine: number;
}

/**
 * TranscriptからChatへの共有時のProvenance（来歴）メタ情報
 *
 * 禁止:
 * - auto-send: このデータをセットした後に自動送信してはならない
 * - hidden parsing: originalContentを解析・変換してはならない
 * - 自動要約: originalContentをLLMで要約してはならない
 */
export interface TranscriptProvenance {
  /** 共有元の種別 */
  sourceType: TranscriptSourceType;
  /** 共有日時（ISO 8601形式） */
  sharedAt: string;
  /** 共有元のセッションタイトル */
  sessionTitle: string;
  /** メッセージ範囲（sourceType === "range" の場合のみ） */
  messageRange?: TranscriptMessageRange;
  /** 共有された生テキスト（解析・変換禁止） */
  originalContent: string;
}
```

---

### `packages/shared/src/types/workspaceChat.ts`（拡張）

追加するフィールドのみ記載:

```typescript
import type { TranscriptProvenance } from "./transcriptProvenance";

export interface WorkspaceChatMessage {
  // ... 既存フィールド（変更なし）

  /**
   * Transcript共有操作のProvenance情報（省略可能）
   * 存在する場合はTranscriptProvenanceChipを表示する
   * 存在しない場合（undefined）は表示しない（後方互換）
   */
  transcriptProvenance?: TranscriptProvenance;
}
```

---

### `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`（拡張）

追加する状態とアクション:

```typescript
// 追加する State の型
interface WorkspaceState {
  // ... 既存フィールド（変更なし）

  /** 送信待ちのTranscript Provenance（入力欄に表示中のもの） */
  pendingTranscriptProvenance: TranscriptProvenance | null;
}

// 追加する Slice アクション
interface WorkspaceActions {
  // ... 既存アクション（変更なし）

  /** Pending Provenanceをセットする（OP-1/2/3で呼ぶ） */
  setPendingTranscriptProvenance: (provenance: TranscriptProvenance) => void;
  /** Pending Provenanceをクリアする（送信後またはChip削除時） */
  clearPendingTranscriptProvenance: () => void;
}

// 追加する個別セレクタ（P31: 合成Hook無限ループ対策）
export const usePendingTranscriptProvenance = () =>
  useWorkspaceStore((state) => state.pendingTranscriptProvenance);
export const useSetPendingTranscriptProvenance = () =>
  useWorkspaceStore((state) => state.setPendingTranscriptProvenance);
export const useClearPendingTranscriptProvenance = () =>
  useWorkspaceStore((state) => state.clearPendingTranscriptProvenance);
```

**注意**: `pendingTranscriptProvenance` は送信前の一時状態。送信後に `WorkspaceChatMessage.transcriptProvenance` として確定する。

---

### `apps/desktop/src/renderer/hooks/useTranscriptShare.ts`（新規）

公開するインターフェース:

```typescript
interface UseTranscriptShareReturn {
  /** OP-1: 選択範囲をチャットへ送る */
  shareSelectedRange: (params: {
    content: string;
    startLine: number;
    endLine: number;
  }) => void;
  /** OP-2: 直近出力を添付 */
  shareLastOutput: (params: { content: string }) => void;
  /** OP-3: セッションを貼り付ける */
  pasteSession: (params: { content: string; sessionTitle?: string }) => void;
}
```

---

### `apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.tsx`（新規）

```typescript
interface TranscriptProvenanceChipProps {
  /** 表示するProvenance情報。undefinedの場合はnullを返す */
  transcriptProvenance: TranscriptProvenance | undefined;
  /** Chip削除ボタンクリック時のコールバック */
  onDismiss?: () => void;
}
```

Atomic Design: atoms レベルのコンポーネント。ビジネスロジックを含まない。

---

### `apps/desktop/src/renderer/components/organisms/ChatInputArea.tsx`（拡張）

変更箇所のみ:

- `usePendingTranscriptProvenance()` でPending Provenanceを取得
- `TranscriptProvenanceChip` を入力欄上部に条件表示（`pendingTranscriptProvenance !== null` の場合）
- `useClearPendingTranscriptProvenance()` をChipの `onDismiss` に接続

---

### `apps/desktop/src/renderer/components/molecules/ChatMessageItem.tsx`（拡張）

変更箇所のみ:

- `message.transcriptProvenance` を参照
- 存在する場合に `TranscriptProvenanceChip` をメッセージコンテンツの上部に表示
- `onDismiss` は不要（送信済みメッセージのProvenanceは削除しない）

---

## 3. 除外ファイル（変更禁止）

以下のファイルは本タスクの変更スコープ外。変更した場合は設計違反とみなす。

### システムファイル（絶対変更禁止）

| ファイルパス                                                | 理由                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/src/main/handlers/terminalHandoffHandlers.ts` | Task05（Terminal Handoff）管轄。責務分離                |
| `apps/desktop/src/preload/terminal-api.ts`                  | Terminal API は本タスクの変更スコープ外                 |
| `apps/desktop/src/main/index.ts`                            | Mainプロセスのエントリポイント。IPC追加は別タスクで行う |

### 他タスク管轄ファイル

| ファイルパス                                                      | 管轄タスク | 理由                                        |
| ----------------------------------------------------------------- | ---------- | ------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/TerminalView.tsx` | Task05     | Terminal Handoff のUI実装を管轄             |
| `apps/desktop/src/renderer/hooks/useTerminalHandoff.ts`           | Task05     | Handoff操作のHookを管轄                     |
| `apps/desktop/src/main/handlers/conversationHandlers.ts`          | 別タスク   | IPC handlerの追加は別タスクでスコープを切る |

### 変更不要ファイル（今回は触れない）

| ファイルパス                                          | 理由                       |
| ----------------------------------------------------- | -------------------------- |
| `apps/desktop/src/renderer/store/slices/authSlice.ts` | 認証状態。本タスクと無関係 |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`  | LLM設定。本タスクと無関係  |
| `packages/shared/src/types/agent.ts`                  | Agent型。本タスクと無関係  |
| `apps/desktop/electron.vite.config.ts`                | ビルド設定。変更不要       |
| `apps/desktop/vitest.config.ts`                       | テスト設定。変更不要       |

---

## 4. 変更ファイル数サマリー

| カテゴリ                   | ファイル数 |
| -------------------------- | ---------- |
| 新規作成（プロダクション） | 3          |
| 既存拡張（プロダクション） | 5          |
| 新規作成（テスト）         | 6          |
| **合計**                   | **14**     |

変更禁止ファイルへのアクセスが発生した場合は、設計を再確認して本タスクのスコープに立ち戻ること。
