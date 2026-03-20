# Phase 5: 実装

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 5                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-4-test-creation.md`              |

## 目的

Phase 2 の設計に従い、`chatSlice.ts` へのエラーstate追加・`sendMessage` のエラー伝搬・`store/index.ts` への個別セレクタ追加・`ChatView` のエラーバナーUIを実装する。Phase 4 で作成したテストが Green になることを目標とする。

## 実行タスク

- Task 1: `chatSlice.ts` に `chatError` state と error 伝搬を実装する。
- Task 2: `store/index.ts` に `useChatError` / `useClearChatError` を追加する。
- Task 3: `ChatView/index.tsx` にインラインエラーバナーを実装する。
- Task 4: Phase 4 の Red テストを Green 化し、Task 2〜4 の変更を持ち込まない。

### Task 1: chatSlice.ts の修正

#### 1-A: 修正前の現状確認

```bash
# chatSlice.ts の全体を確認
cat apps/desktop/src/renderer/store/slices/chatSlice.ts

# callLLMAPI の実装とレスポンス型を確認
grep -n "callLLMAPI\|window.electronAPI\|response.error\|isSending" \
  apps/desktop/src/renderer/store/slices/chatSlice.ts
```

#### 1-B: ChatSlice インターフェースへの chatError 追加

`ChatSlice` インターフェースに以下を追加する:

```typescript
// State
chatError: string | null;

// Actions
clearChatError: () => void;
```

#### 1-C: 初期state に chatError: null を追加

`createChatSlice` の初期state定義に追加:

```typescript
chatError: null,
```

#### 1-D: callLLMAPI の戻り値型拡張

```typescript
// 変更前
Promise<{ success: boolean; message?: string }>;

// 変更後
Promise<{ success: boolean; message?: string; error?: string }>;
```

エラーソース別の `error` フィールド値:

| エラー発生箇所                           | error フィールド値                                     |
| ---------------------------------------- | ------------------------------------------------------ |
| `window.electronAPI` が未定義            | `"AI_UNAVAILABLE"`                                     |
| `response.success === false` でerrorあり | `response.error`（文字列の場合のみ、それ以外は未設定） |
| `response.success === false` でerrorなし | `"UNKNOWN_ERROR"`                                      |
| `catch` ブロックで例外発生               | `"API_CALL_FAILED"`                                    |

#### 1-E: sendMessage のエラーハンドリング実装

```typescript
sendMessage: async (message) => {
  // 前回のエラーをクリア
  set({ chatError: null, isSending: true });

  const result = await callLLMAPI(message);

  if (result.success && result.message) {
    // 成功パス: 既存処理を維持
    set({ isSending: false });
    // ... 既存のメッセージ追加処理 ...
  } else {
    // エラーパス: chatError にエラーコードを設定
    set({
      isSending: false,
      chatError: result.error ?? "UNKNOWN_ERROR",
    });
  }
},

clearChatError: () => set({ chatError: null }),
```

**注意**: `window.electronAPI.ai.chat` のレスポンスで `response.error` が返る場合、`typeof response.error === "string"` でガードしてから代入する（P19対策）。

### Task 2: store/index.ts への個別セレクタ追加

P31対策として個別セレクタを追加する。既存の `useIsSending` セレクタの直後に追加:

```typescript
export const useChatError = () => useAppStore((state) => state.chatError);
export const useClearChatError = () =>
  useAppStore((state) => state.clearChatError);
```

### Task 3: ChatView エラーバナーUI の実装

#### 3-A: ERROR_MESSAGES 定数の定義

`ChatView/index.tsx`（または別ファイルとして `ChatView/errorMessages.ts`）に定義:

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  AI_UNAVAILABLE: "AI機能が利用できません。アプリを再起動してください。",
  API_CALL_FAILED:
    "メッセージの送信に失敗しました。しばらく待ってから再試行してください。",
  UNKNOWN_ERROR: "予期しないエラーが発生しました。",
  API_KEY_MISSING:
    "APIキーが設定されていません。設定画面からAPIキーを入力してください。",
  PROVIDER_NOT_FOUND: "選択されたAIプロバイダーが見つかりません。",
  MODEL_NOT_FOUND: "選択されたモデルが見つかりません。",
  RATE_LIMIT_EXCEEDED:
    "API利用制限に達しました。しばらく待ってから再試行してください。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES["UNKNOWN_ERROR"];
}
```

#### 3-B: ChatView コンポーネントへの統合

P31準拠の個別セレクタを使用:

```typescript
// P31準拠: 個別セレクタを使用
const chatError = useChatError();
const clearChatError = useClearChatError();

// P5対策: useEffect のクリーンアップで clearTimeout
useEffect(() => {
  if (!chatError) return;
  const timer = setTimeout(() => clearChatError(), 5000);
  return () => clearTimeout(timer);
}, [chatError, clearChatError]);
```

#### 3-C: エラーバナーJSX

チャット入力フォームの直上に配置:

```tsx
{
  chatError && (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      <span className="flex-1">{getErrorMessage(chatError)}</span>
      <button
        type="button"
        onClick={clearChatError}
        aria-label="エラーを閉じる"
        className="ml-2 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900"
      >
        ×
      </button>
    </div>
  );
}
```

**カラー**: Apple HIG `systemRed`準拠（ライト: `#FF3B30` / ダーク: `#FF453A`）
Tailwind の `red-700` / `red-300` は近似値。プロジェクトのカラートークンが定義されている場合はそちらを優先する。

### Task 4: 実装確認

```bash
# Phase 4 のテストが Green になることを確認
cd apps/desktop && pnpm vitest run src/renderer/store/slices/chatSlice.test.ts
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/

# TypeScript 型チェック
cd apps/desktop && pnpm typecheck
```

## 参照資料

| 資料名               | パス                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| Phase 2 設計書       | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`        |
| Phase 4 テスト設計   | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-4-test-creation.md` |
| chatSlice 修正対象   | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                  |
| store/index.ts       | `apps/desktop/src/renderer/store/index.ts`                                             |
| ChatView 修正対象    | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                   |
| 状態管理ルール       | `.claude/rules/03-state-management.md`                                                 |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                     |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                   |

## 実行手順

### Step 1: 修正前の現状確認

`chatSlice.ts` と `ChatView/index.tsx` の現在のコードを読んで把握する。

### Step 2: chatSlice.ts の修正

Task 1 の設計に従い `chatSlice.ts` を修正する。

### Step 3: store/index.ts の修正

Task 2 の設計に従い個別セレクタを追加する。

### Step 4: ChatView の修正

Task 3 の設計に従いエラーバナーUIを実装する。

### Step 5: テスト実行（Green 確認）

Phase 4 で作成したテストが全て Green になることを確認する。

## 統合テスト連携

- `chatSlice.test.ts` で `chatError` 初期値、失敗時設定、送信開始時クリア、`isSending` 復帰を Green 化する。
- `ChatView.test.tsx` で alert 表示、×ボタン、5秒タイマーの UI 契約を Green 化する。
- `WorkspaceChatPanel` / `useWorkspaceChatController` の既存テストは回帰確認のみ行い、本 Task の実装ファイルに変更を波及させない。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Phase 5 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md` |
| chatSlice.ts 修正済み        | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                   |
| store/index.ts 修正済み      | `apps/desktop/src/renderer/store/index.ts`                                              |
| ChatView 修正済み            | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                    |

## 完了条件

- [ ] `ChatSlice` インターフェースに `chatError: string | null` と `clearChatError` が追加されている
- [ ] `callLLMAPI` の戻り値型に `error?: string` が追加されている
- [ ] `sendMessage` の冒頭で `chatError: null` がクリアされている
- [ ] エラーパスで `chatError` が設定されている
- [ ] `useChatError` / `useClearChatError` 個別セレクタが `store/index.ts` に追加されている
- [ ] `ChatView` にエラーバナーUIが追加されている
- [ ] エラーバナーの×ボタンに `aria-label="エラーを閉じる"` が設定されている（Phase 3 MINOR指摘対応）
- [ ] 5秒タイマーの `clearTimeout` クリーンアップが実装されている（P5対策）
- [ ] Phase 4 の全テストが Green になっている
- [ ] `pnpm typecheck` が通っている

## 次Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
