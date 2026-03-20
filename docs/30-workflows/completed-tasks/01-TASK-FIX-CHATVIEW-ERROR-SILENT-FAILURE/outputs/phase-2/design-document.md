# Phase 2 成果物: 設計書

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase番号 | 2                                          |
| 機能名    | ChatView エラーサイレント握りつぶし修正    |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE     |
| 作成日    | 2026-03-20                                 |
| 前Phase   | `outputs/phase-1/requirements-analysis.md` |

## 1. chatSlice.ts 設計

### 1-A: ChatSlice インターフェース拡張

`apps/desktop/src/renderer/store/slices/chatSlice.ts` の `ChatSlice` インターフェースに以下を追加する。

**追加位置:** `// Streaming State` セクションの直前（`isSending: boolean;` の次行）

```typescript
export interface ChatSlice {
  // State
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  chatError: string | null; // 追加: sendMessageエラー情報
  ragConnectionStatus: RagConnectionStatus;

  // ...（既存コード）...

  // Actions
  // ...（既存アクション）...
  clearChatError: () => void; // 追加: chatErrorクリア
}
```

**設計根拠:**

- `streamingError: StreamingError | null` はストリーミング専用の詳細型オブジェクトであり、`sendMessage` で発生するエラーとは独立して管理する
- `chatError` は `string | null` で十分（エラーコード文字列をUIでメッセージ変換する）

### 1-B: callLLMAPI 戻り値型の確認

コード調査の結果、`callLLMAPI` の戻り値型は既に `Promise<{ success: boolean; message?: string; error?: string }>` となっており、変更不要。

各エラーパスでも適切にエラーコードが設定されていることを確認済み:

| エラーパス                               | error フィールド値                                       |
| ---------------------------------------- | -------------------------------------------------------- |
| `window.electronAPI?.ai?.chat` が未定義  | `"AI_UNAVAILABLE"`                                       |
| `response.success` が false でエラーあり | `response.error`（stringの場合）または `"UNKNOWN_ERROR"` |
| `catch` ブロックで例外発生               | `"API_CALL_FAILED"`                                      |

### 1-C: sendMessage のエラーハンドリング設計

**修正箇所:** `apps/desktop/src/renderer/store/slices/chatSlice.ts` L266-300

```typescript
sendMessage: async (message) => {
  const state = get();
  // ...（既存のselectedProviderId/selectedModelId取得）...

  // 前回のエラーをクリア（送信時クリア: NFR-3）
  const userMessage = createUserMessage(message);
  set((state) => ({
    chatMessages: [...state.chatMessages, userMessage],
    isSending: true,
    chatError: null, // 追加: 送信時に前回エラーをクリア
  }));

  // Call LLM API
  const response = await callLLMAPI(
    message,
    state.systemPrompt,
    state.ragConnectionStatus === "connected",
    selectedProviderId,
    selectedModelId,
  );

  // Handle response
  if (response.success && response.message) {
    const aiMessage = createAIMessage(response.message);
    set((state) => ({
      chatMessages: [...state.chatMessages, aiMessage],
      isSending: false,
    }));
  } else {
    // エラーパス修正: response.error を chatError に設定
    const errorCode = response.error ?? "UNKNOWN_ERROR";
    set({ isSending: false, chatError: errorCode }); // 修正
  }
},
```

### 1-D: clearChatError アクション設計

```typescript
clearChatError: () => set({ chatError: null }),
```

### 1-E: 初期state

```typescript
// Initial state への追加
chatError: null,
```

## 2. store/index.ts 設計（個別セレクタ追加）

**修正箇所:** `apps/desktop/src/renderer/store/index.ts`

**追加位置:** L189 の `export const useIsSending` の直後

```typescript
export const useIsSending = () => useAppStore((state) => state.isSending);

// 追加: chatError個別セレクタ（P31対策）
export const useChatError = () => useAppStore((state) => state.chatError);
export const useClearChatError = () =>
  useAppStore((state) => state.clearChatError);
```

**P31対策の根拠:**

- `useChatError` は `string | null` のプリミティブ値を返すため、`useShallow` は不要（P48対象外）
- `useClearChatError` はZustandアクション参照を返す。Zustandアクション参照は安定しているため、`useEffect` の依存配列に含めても無限ループは発生しない（P31対策済み）
- `useAppStore` 合成Hookを直接使用しないことでP31違反を回避する

## 3. ChatView エラーバナーUI設計

### 3-A: エラーコードと日本語メッセージのマッピング

`ChatView/index.tsx` 内のモジュールスコープ定数として定義する。

```typescript
// モジュールスコープ定数（P47対策: テストからimport可能）
const ERROR_MESSAGES: Record<string, string> = {
  AI_UNAVAILABLE: "AI機能が利用できません。アプリを再起動してください。",
  API_CALL_FAILED:
    "メッセージの送信に失敗しました。しばらく待ってから再試行してください。",
  UNKNOWN_ERROR: "予期しないエラーが発生しました。",
  // IPC経由で返ってくる可能性があるエラーコード（ai.chatハンドラから）
  API_KEY_MISSING:
    "APIキーが設定されていません。設定画面からAPIキーを入力してください。",
  PROVIDER_NOT_FOUND: "選択されたAIプロバイダーが見つかりません。",
  MODEL_NOT_FOUND: "選択されたモデルが見つかりません。",
  RATE_LIMIT_EXCEEDED:
    "API利用制限に達しました。しばらく待ってから再試行してください。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
} as const;

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

### 3-B: エラーバナーコンポーネント設計

**バナーのレイアウト（概念図）:**

```
┌─────────────────────────────────────────────────────────┐
│  [!]  エラーメッセージテキスト                     [×] │
└─────────────────────────────────────────────────────────┘
```

**仕様:**

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 位置       | チャット入力フォーム（`<footer>`）の直上                               |
| 背景色     | `rgba(255, 59, 48, 0.1)`（ライト）/ `rgba(255, 69, 58, 0.1)`（ダーク） |
| ボーダー色 | `#FF3B30`（ライト）/ `#FF453A`（ダーク）                               |
| テキスト色 | `#FF3B30`（ライト）/ `#FF453A`（ダーク）                               |
| 角丸       | `8px`（プロジェクト標準に準拠）                                        |
| padding    | `12px 16px`                                                            |

**JSX設計（概要）:**

```tsx
{
  /* エラーバナー: チャット入力フォームの直上 */
}
{
  chatError && (
    <div
      role="alert"
      aria-live="polite"
      data-testid="chat-error-banner"
      className="mx-4 mb-2 flex items-center gap-2 rounded-lg border px-4 py-3
               border-red-500/50 bg-red-500/10 text-red-500
               dark:border-[#FF453A]/50 dark:bg-[#FF453A]/10 dark:text-[#FF453A]"
    >
      <span aria-hidden="true" className="text-base">
        !
      </span>
      <span className="flex-1 text-sm">{getErrorMessage(chatError)}</span>
      <button
        type="button"
        aria-label="エラーを閉じる"
        onClick={clearChatError}
        className="ml-auto shrink-0 p-1 rounded hover:bg-red-500/10
                 dark:hover:bg-[#FF453A]/10 transition-colors"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
```

### 3-C: ChatView への統合方針

**ローカルstateの削除:**

`const [error] = useState<string | null>(null);` を削除する。セッターなしのローカルstateは常に `null` のままであり、L163-165の `if (error)` ブロックは到達不能コード。削除後は `if (error)` ブロックも削除する。

**個別セレクタの取得（P31準拠）:**

```typescript
// P31準拠: 個別セレクタを使用（useAppStore合成Hookの直接利用は禁止）
const chatError = useChatError();
const clearChatError = useClearChatError();
```

**5秒自動消去タイマー（P5対策）:**

```typescript
// 5秒後自動消去（NFR-1）+ タイマーリーク防止（P5対策）
useEffect(() => {
  if (!chatError) return;
  const timer = setTimeout(() => clearChatError(), 5000);
  return () => clearTimeout(timer); // クリーンアップで確実に解除
}, [chatError, clearChatError]);
```

**`useEffect` 依存配列の根拠:**

- `chatError`: stringまたはnull。値変化のたびにタイマーをリセットする
- `clearChatError`: Zustandアクション参照。P31で確認済みの安定した参照であり、含めても無限ループは発生しない

## 4. アーキテクチャ依存方向の確認

```
callLLMAPI（chatSlice内部関数）
    ↓ error フィールド（既存）を sendMessage のエラーパスで活用
ChatSlice（chatError state 追加）
    ↓ 個別セレクタ経由（useChatError / useClearChatError）
ChatView（エラーバナーUI追加）
```

- Store → View の一方向依存を維持する
- `ChatView` は `useChatError` / `useClearChatError` のみを参照し、`chatSlice` の内部実装には依存しない
- `chatSlice` は `ChatView` を参照しない（循環依存なし）

## 5. SubAgent lane と validation path の設計

### SubAgent lane

| Lane   | 主責務                                   | 対象ファイル                                       | 並列可否        |
| ------ | ---------------------------------------- | -------------------------------------------------- | --------------- |
| Lane A | store / contract 修正                    | `chatSlice.ts`、`store/index.ts`                   | Lane Bと並列可  |
| Lane B | ChatView error surface 修正              | `ChatView/index.tsx`                               | Lane Aと並列可  |
| Lane C | validation（テスト作成・拡充・品質検証） | `chatSlice.test.ts`、`ChatView.test.tsx`           | A/B確定後に合流 |
| Lane D | spec sync（Phase 12相当）                | workflow phase docs、aiworkflow-requirements更新先 | C完了後に実施   |

### validation path

1. `chatSlice` 単体テスト: `chatError` state・`clearChatError` action・`sendMessage` エラーパスの契約検証
2. `ChatView` テスト: エラーバナー表示/非表示・5秒タイマークリーンアップ・×ボタンのaria-label検証
3. TypeScript型チェック（`pnpm typecheck`）: `ChatSlice` インターフェースと実装の整合確認
4. ESLint（`pnpm lint`）: 不要importの削除（削除したローカルstateのimport整理）
5. Phase 12: system spec と workflow docs の同期結果を証跡化する

## 完了確認チェックリスト

- [x] `ChatSlice` インターフェースの `chatError` state と `clearChatError` アクションが設計されている
- [x] `callLLMAPI` の戻り値型は変更不要（既に `error?: string` フィールドが存在）であることを確認した
- [x] `sendMessage` のエラーパスで `chatError` を設定する設計が明文化されている
- [x] `useChatError` / `useClearChatError` 個別セレクタが設計されている（P31対策）
- [x] エラーコードと日本語メッセージのマッピングが設計されている
- [x] エラーバナーのUIデザイン（位置、カラー、自動消去タイミング）が明文化されている
- [x] Store → View の一方向依存が設計で保たれている
- [x] SubAgent lane と validation path が明文化されている
