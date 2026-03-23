# Phase 12: 実装ガイド

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

---

## Part 1: 中学生レベルの概念説明

### 「郵便の消印」でprovenanceを理解する

手紙に「消印」が押されているのを見たことがありますか？消印には「どこの郵便局から」「いつ」送られたかが刻まれています。この消印があることで、手紙がどこから来たのかが後からでもわかります。

**Transcript Provenance（トランスクリプト由来情報）** も同じ考え方です。

AIとの会話履歴（Transcript）から一部を取り出してチャットに貼り付けると、そのメッセージには「消印」が自動的に押されます。この消印には:

- どのセッションから取り出したか（`sessionTitle`）
- いつ取り出したか（`sharedAt`）
- どの操作で取り出したか（`sourceType`）

が記録されています。

後でチャットを見返したとき、「このAIの返答はいったいどのセッションから取り出したんだっけ？」と疑問に思わなくて済みます。消印を見れば一目瞭然です。

### 3つの取り出し方

郵便にたとえると、手紙の取り出し方には3種類あります：

1. **OP-1（選択範囲をチャットへ送る）**: 手紙の特定の段落だけ切り抜いて送る。自分でどこを切り抜くか選びます。
2. **OP-2（直近出力を添付）**: 最後に届いた手紙をそのままコピーして送る。
3. **OP-3（セッションを貼り付ける）**: 手紙の束全体をまとめてコピーして送る。

どの方法でも、必ず「あなたが送信ボタンを押すまで」は送られません。勝手に送られることはありません（auto-send禁止）。

### 消印の見た目

チャット画面では、消印は `TranscriptProvenanceChip`（プロベナンスチップ）というラベルとして表示されます。メッセージの近くに小さく「[セッション名] より 2026-03-22」のような形で表示されます。このラベルはコンテンツの邪魔をしないよう控えめに表示されます（Apple Human Interface Guidelines の「Deference」原則）。

---

## Part 2: 開発者向け実装詳細

### 型定義の配置

`TranscriptProvenance` 型は `packages/shared` に配置し、`apps/desktop` と `apps/web` の両方から参照できるようにする。

```typescript
// packages/shared/src/types/transcript-provenance.ts

export interface TranscriptProvenance {
  /** 取り出し操作の種類 */
  sourceType: "range" | "last-output" | "session";
  /** 取り出した日時（ISO 8601、Main Process側でセット） */
  sharedAt: string;
  /** 取り出し元のセッション名 */
  sessionTitle: string;
  /** 選択範囲（OP-1の場合のみ。OP-2/OP-3はundefined） */
  messageRange?: {
    startLine: number;
    endLine: number;
  };
  /** 取り出した原文（最大10,000文字。超過分は切り捨て） */
  originalContent: string;
}

// WorkspaceChatMessageへの追加（既存型にオプショナルフィールドを追加）
// packages/shared/src/types/workspace-chat-message.ts

export interface WorkspaceChatMessage {
  // ...既存フィールド（変更しない）
  transcriptProvenance?: TranscriptProvenance; // 追加
}
```

### 実装順序

設計タスクで確定した実装の推奨順序：

1. **型定義** (`packages/shared/src/types/transcript-provenance.ts`)
2. **IPCチャンネル定数** (`apps/desktop/src/main/ipc/channels.ts` に追加)
3. **Main Processハンドラ** (`apps/desktop/src/main/handlers/transcript-handlers.ts`)
4. **Preload Bridge** (`apps/desktop/src/preload/` のホワイトリストと型に追加)
5. **Hook層** (`apps/desktop/src/renderer/hooks/useTranscriptSelection.ts` / `useTranscriptShare.ts`)
6. **新規コンポーネント** (`TranscriptPanel`, `TranscriptSelectionToolbar`)
7. **既存コンポーネント拡張** (`TranscriptProvenanceChip`, `WorkspaceChatPanel`)

### Hook実装のポイント

```typescript
// useTranscriptShare の骨格

import { useCallback } from "react";
// Zustand Storeのアクションは個別セレクタで取得（P31対策）
import { useAddChatMessage } from "@/renderer/store/chatSlice";

export function useTranscriptShare(sessionTitle: string) {
  const addChatMessage = useAddChatMessage();

  // OP-1: 選択範囲をチャットへ送る
  const shareRange = useCallback(
    (selectedText: string, startLine: number, endLine: number) => {
      const provenance: TranscriptProvenance = {
        sourceType: "range",
        sharedAt: new Date().toISOString(), // Main Process側でセットが理想だが、設計レビューの結果Renderer側でもOK
        sessionTitle,
        messageRange: { startLine, endLine },
        originalContent: selectedText.slice(0, 10000), // M-3対応: 上限10,000文字
      };
      // ChatPanelの入力エリアに追記（auto-sendではなく入力補助）
      addChatMessage({
        pendingProvenance: provenance,
        pendingContent: selectedText,
      });
    },
    [addChatMessage, sessionTitle],
  );

  // OP-2: 直近出力を添付
  const shareLastOutput = useCallback(
    (lastAiOutput: string) => {
      const provenance: TranscriptProvenance = {
        sourceType: "last-output",
        sharedAt: new Date().toISOString(),
        sessionTitle,
        // messageRange は省略（OP-2では不要）
        originalContent: lastAiOutput.slice(0, 10000),
      };
      addChatMessage({
        pendingProvenance: provenance,
        pendingContent: lastAiOutput,
      });
    },
    [addChatMessage, sessionTitle],
  );

  // OP-3: セッションを貼り付ける
  const shareSession = useCallback(
    (sessionContent: string) => {
      const truncated = sessionContent.slice(0, 10000);
      const isTruncated = sessionContent.length > 10000;
      const provenance: TranscriptProvenance = {
        sourceType: "session",
        sharedAt: new Date().toISOString(),
        sessionTitle,
        originalContent: isTruncated ? `${truncated}...[省略]` : truncated,
      };
      addChatMessage({
        pendingProvenance: provenance,
        pendingContent: provenance.originalContent,
      });
    },
    [addChatMessage, sessionTitle],
  );

  return { shareRange, shareLastOutput, shareSession };
}
```

### IPCバリデーション（P42対策）

IPCハンドラでは3段バリデーションを実施する：

```typescript
// 3段バリデーション: 型チェック → 空文字列 → トリム空文字列
function validateSessionTitle(value: unknown): value is string {
  return typeof value === "string" && value !== "" && value.trim() !== "";
}
```

### TranscriptProvenanceChip の実装ポイント

- `sourceType` が未知の値の場合のフォールバック表示を必ず実装する（R-05対策）
- `React.HTMLAttributes<HTMLSpanElement>` を extends する場合、衝突属性を `Omit` で除外する（P46対策）
- `sharedAt` は表示時に `new Date(sharedAt).toLocaleDateString('ja-JP')` で変換する

```typescript
// 未知sourceTypeへのフォールバック
const sourceLabel: Record<string, string> = {
  range: "選択範囲",
  "last-output": "直近出力",
  session: "セッション",
};

const label =
  sourceLabel[provenance.sourceType] ?? `ソース: ${provenance.sourceType}`;
```

### sharedAt 生成責任（監査証跡の信頼性）

`sharedAt` はMain Process側のIPCハンドラで生成することを**強く推奨**する。Renderer側の `new Date().toISOString()` はシステムクロックの改ざんや時刻ズレに脆弱であり、NFR-5（監査証跡の信頼性）を損なう。

```typescript
// Main Process側（推奨）
ipcMain.handle("transcript:share", async (event, args) => {
  const provenance: TranscriptProvenance = {
    ...args.provenance,
    sharedAt: new Date().toISOString(), // Main Processで信頼できるタイムスタンプ
  };
  return conversationAPI.addMessage({ ..., metadata: { transcriptProvenance: provenance } });
});
```

### OP-1 Composer 競合挙動

composerに既存の入力テキストがある状態でOP-1（選択範囲をチャットへ送る）を実行した場合、**カーソル位置の末尾に改行 + 挿入**する。既存入力を上書きしない。

```typescript
// Composer挿入ロジック
const insertToComposer = (existingText: string, newText: string): string => {
  if (existingText.trim() === "") return newText;
  return `${existingText}\n${newText}`;
};
```

### テスト作成時の注意事項

- `happy-dom` 環境では `userEvent` の代わりに `fireEvent` を使用する（P39対策）
- テストは `apps/desktop/` ディレクトリから実行する（P40対策）
- 既存テストのインポートパスを参照してから新規テストを記述する（P63対策）
- 同ディレクトリの既存テストを確認するコマンド: `grep -n "^import" apps/desktop/src/renderer/hooks/useTranscriptShare.test.ts`
