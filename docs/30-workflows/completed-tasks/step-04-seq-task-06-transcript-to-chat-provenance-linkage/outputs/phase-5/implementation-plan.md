# Phase 5: 実装計画

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

Transcript -> Chat Provenance Linkage の実装順序・責任範囲・禁止事項を定義する。
変更は型定義 → Hook拡張 → コンポーネント実装 → 統合 の順で行う。

---

## 1. 変更順序（実装シーケンス）

### Step 1: 型定義（packages/shared）

**順序**: 最初に実施。後続ステップの全ファイルがこの型に依存する。

```
packages/shared/src/types/transcriptProvenance.ts   [新規]
packages/shared/src/types/workspaceChat.ts          [既存拡張]
packages/shared/src/index.ts                        [export追加]
```

**完了条件**: `pnpm --filter @repo/shared build` がエラーなく完了すること。

---

### Step 2: Zustand Store拡張（workspaceSlice）

**前提**: Step 1（型定義）完了後。

```
apps/desktop/src/renderer/store/slices/workspaceSlice.ts  [既存拡張]
```

**追加する状態**:

- `pendingTranscriptProvenance: TranscriptProvenance | null` （送信前の保留Provenance）
- `setTranscriptProvenance(messageId: string, provenance: TranscriptProvenance): void`
- `clearTranscriptProvenance(messageId: string): void`

**完了条件**: Storeの型チェック（`pnpm typecheck`）がエラーなく通ること。

---

### Step 3: Hook実装（useTranscriptShare）

**前提**: Step 1（型定義）+ Step 2（Store拡張）完了後。

```
apps/desktop/src/renderer/hooks/useTranscriptShare.ts  [新規]
```

**実装する操作**:

- `shareSelectedRange(params: { content: string; startLine: number; endLine: number }): void` ... OP-1
- `shareLastOutput(params: { content: string }): void` ... OP-2
- `pasteSession(params: { content: string; sessionTitle: string }): void` ... OP-3

**完了条件**: ユニットテスト（V-C5〜V-C7）が全PASS。

---

### Step 4: コンポーネント実装（TranscriptProvenanceChip）

**前提**: Step 1（型定義）完了後。Step 2/3 からは独立して実施可能。

```
apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.tsx  [新規]
apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.css  [新規、任意]
```

**表示仕様**:

- `sourceType: "range"` → "選択範囲 L{startLine}-L{endLine}" + セッションタイトル
- `sourceType: "last-output"` → "直近出力" + セッションタイトル
- `sourceType: "session"` → sessionTitle + "（全体）"
- `transcriptProvenance` が `undefined` の場合は `null` を返す（非表示）

**完了条件**: ユニットテスト（V-C1〜V-C4）が全PASS。

---

### Step 5: チャット入力欄への統合

**前提**: Step 2/3/4 全て完了後。

```
apps/desktop/src/renderer/components/organisms/ChatInputArea.tsx  [既存拡張]
```

**変更内容**:

- `useTranscriptShare` Hook をChrome入力欄コンポーネントに統合
- `TranscriptProvenanceChip` を入力欄の上部に条件表示
- Chip削除ボタンで `clearTranscriptProvenance` を呼ぶ

**完了条件**: インテグレーションテスト（V-I1〜V-I4）が全PASS。

---

### Step 6: チャット履歴表示への統合

**前提**: Step 4（コンポーネント実装）完了後。Step 5 からは独立して実施可能。

```
apps/desktop/src/renderer/components/molecules/ChatMessageItem.tsx  [既存拡張]
```

**変更内容**:

- `WorkspaceChatMessage.transcriptProvenance` を参照
- `transcriptProvenance` が存在する場合に `TranscriptProvenanceChip` を表示
- `transcriptProvenance` が `undefined` の場合は表示しない（後方互換、V-I5）

**完了条件**: インテグレーションテスト（V-I5）がPASS。

---

## 2. Ownership（ファイル責任者）

| ファイルパス                                                              | 変更種別 | 責務                                   |
| ------------------------------------------------------------------------- | -------- | -------------------------------------- |
| `packages/shared/src/types/transcriptProvenance.ts`                       | 新規     | 型定義の正本                           |
| `packages/shared/src/types/workspaceChat.ts`                              | 拡張     | `transcriptProvenance?` フィールド追加 |
| `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`                | 拡張     | 状態管理                               |
| `apps/desktop/src/renderer/hooks/useTranscriptShare.ts`                   | 新規     | OP-1/2/3 のビジネスロジック            |
| `apps/desktop/src/renderer/components/atoms/TranscriptProvenanceChip.tsx` | 新規     | Provenanceの表示                       |
| `apps/desktop/src/renderer/components/organisms/ChatInputArea.tsx`        | 拡張     | 入力欄へのProvenance統合               |
| `apps/desktop/src/renderer/components/molecules/ChatMessageItem.tsx`      | 拡張     | 履歴表示へのProvenance統合             |

---

## 3. 禁止事項

以下は実装上の絶対禁止事項。Phase 3（設計レビュー）で確定済み。

### 禁止1: Auto-send（自動送信）

```typescript
// 禁止: Provenanceをセットした後に自動でsubmitMessageを呼ぶ
const shareSelectedRange = (params: ShareParams) => {
  setTranscriptProvenance(provenance);
  submitMessage(); // <-- 絶対禁止
};

// 許可: Provenanceをセットするだけ。送信はユーザー操作を待つ
const shareSelectedRange = (params: ShareParams) => {
  setTranscriptProvenance(provenance);
  // 送信はしない
};
```

### 禁止2: Hidden Parsing（隠れた解析）

```typescript
// 禁止: originalContentをパース・解析して構造化データを生成する
const buildProvenance = (content: string) => {
  const parsed = parseTerminalOutput(content); // <-- 禁止
  return { ...provenance, structuredData: parsed };
};

// 許可: originalContentはそのまま格納する
const buildProvenance = (content: string): TranscriptProvenance => ({
  sourceType: "range",
  originalContent: content, // そのまま
  sharedAt: new Date().toISOString(),
  sessionTitle: currentSession.title,
});
```

### 禁止3: 自動要約

```typescript
// 禁止: LLMや外部APIを呼んでcontentを要約する
const shareLastOutput = async (params: ShareParams) => {
  const summary = await llm.summarize(params.content); // <-- 禁止
  setTranscriptProvenance({ ...provenance, originalContent: summary });
};

// 許可: contentをそのまま使う
const shareLastOutput = (params: ShareParams) => {
  setTranscriptProvenance({
    sourceType: "last-output",
    originalContent: params.content, // 要約しない
    sharedAt: new Date().toISOString(),
    sessionTitle: currentSession.title,
  });
};
```

### 禁止4: Silent Fallback（黙示的フォールバック）

```typescript
// 禁止: Provenanceが未定義の場合にデフォルト値で黙示的に補完する
const getProvenance = (message: WorkspaceChatMessage) =>
  message.transcriptProvenance ?? DEFAULT_PROVENANCE; // <-- 禁止（P62同様のパターン）

// 許可: undefined はundefinedとして扱い、UI側で条件分岐する
const getProvenance = (message: WorkspaceChatMessage) =>
  message.transcriptProvenance; // undefinedを返す
```

### 禁止5: ローカル判定（Local判定）

```typescript
// 禁止: Terminal Handoff（Task05）との責務境界をコンポーネント内で独自判定する
const isHandoffMessage = (content: string) => content.startsWith("[HANDOFF]"); // <-- 責務外の判定

// 許可: Provenanceの存在のみで表示/非表示を制御する
const shouldShowChip = (message: WorkspaceChatMessage): boolean =>
  message.transcriptProvenance !== undefined;
```

---

## 4. Task05（Terminal Handoff）との責務分離

本タスク（TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001）と Task05（Terminal Handoff）の責務は以下の通り明確に分離する。

| 観点           | Terminal Handoff（Task05）   | Transcript Copy（本タスク）        |
| -------------- | ---------------------------- | ---------------------------------- |
| トリガー       | ハンドオフ操作（端末終了等） | ユーザーの明示的な共有操作         |
| データ形式     | 構造化ハンドオフデータ       | 生テキスト（originalContent）      |
| 送信           | 自動送信あり                 | 自動送信なし（ユーザー操作が必要） |
| Provenanceメタ | なし                         | あり（TranscriptProvenance型）     |
| IPC channel    | `terminal:handoff`           | `conversation:appendProvenance`    |

**実装時**: 両タスクのコードが混在しないよう、ファイル先頭コメントに責務を明記すること。

```typescript
/**
 * useTranscriptShare
 *
 * Terminal画面からチャットへのTranscript共有操作を管理するHook。
 * 責務: OP-1（選択範囲）/ OP-2（直近出力）/ OP-3（セッション貼り付け）の
 *       provenance生成とStoreへの格納。
 *
 * 注意: Terminal Handoff (Task05) とは別責務。
 *       本Hookは自動送信を一切行わない。
 *       参照: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
 */
```

---

## 5. 実装完了チェックリスト

- [ ] Step 1: 型定義完了 + `pnpm --filter @repo/shared build` PASS
- [ ] Step 2: Store拡張完了 + `pnpm typecheck` PASS
- [ ] Step 3: Hook実装完了 + V-C5〜V-C7 全PASS
- [ ] Step 4: コンポーネント実装完了 + V-C1〜V-C4 全PASS
- [ ] Step 5: ChatInputArea統合完了 + V-I1〜V-I4 全PASS
- [ ] Step 6: ChatMessageItem統合完了 + V-I5 PASS
- [ ] 禁止事項（auto-send / hidden parsing / 自動要約 / silent fallback / local判定）がコードに存在しないことを確認
- [ ] JSDocコメントに禁止事項と責務分離が明記されていることを確認
