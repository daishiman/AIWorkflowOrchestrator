# Phase 1 成果物: 要件分析結果

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 1                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |

## P50チェック結果（既実装調査）

### 調査対象ファイルと調査結果

| ファイル                                              | 調査内容                                           | 結果       |
| ----------------------------------------------------- | -------------------------------------------------- | ---------- |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts` | `chatError` state・`clearChatError` actionの有無   | **未実装** |
| `apps/desktop/src/renderer/store/index.ts`            | `useChatError`・`useClearChatError` セレクタの有無 | **未実装** |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`  | エラーバナーUIの有無                               | **未実装** |

### 現状コードの確認事項

**chatSlice.ts の `ChatSlice` インターフェース（L119-170）:**

- `streamingError: StreamingError | null` は存在する（ストリーミング専用の詳細型）
- `chatError: string | null` は**存在しない**
- `clearChatError` アクションは**存在しない**

**ChatView/index.tsx（L127）:**

```typescript
const [error] = useState<string | null>(null);
```

- ローカルstateとして `const [error] = useState(null)` が宣言されているが、セッターが存在せず、常に `null` のまま
- L163-165の `if (error) { return <ErrorDisplay message={error} ... /> }` は到達不能コード
- Store連携のエラー表示機能は**未実装**

**結論:** 既実装なし。通常の実装モードで Phase 2 設計へ進む。

## callLLMAPI レスポンス構造の確認結果

**対象:** `apps/desktop/src/renderer/store/slices/chatSlice.ts` L66-104

### 現状の戻り値型

```typescript
async function callLLMAPI(
  message: string,
  systemPrompt: string,
  ragEnabled: boolean,
  selectedProviderId?: LLMProviderId | null,
  selectedModelId?: string | null,
): Promise<{ success: boolean; message?: string; error?: string }>;
```

**注:** 実装を確認したところ、`error?: string` フィールドは既に戻り値型に含まれており、各エラーパスでも適切にコードが設定されている。

### 各エラーパスのレスポンス

| 状況                                     | 返却値                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `window.electronAPI?.ai?.chat` が未定義  | `{ success: false, error: "AI_UNAVAILABLE" }`                                                      |
| `response.success && response.data` が真 | `{ success: true, message: response.data.message }`                                                |
| レスポンスのsuccess=false                | `{ success: false, error: typeof response.error === "string" ? response.error : "UNKNOWN_ERROR" }` |
| `catch` ブロックで例外発生               | `{ success: false, error: "API_CALL_FAILED" }`                                                     |

**重要な発見:** `callLLMAPI` の戻り値型と実装は既に `error?: string` を返す設計になっている。しかし `sendMessage` のエラーパス（L298-300）では `response.error` を無視して `set({ isSending: false })` のみ実行しており、エラー情報がUIに伝達されていない。

### sendMessage の問題箇所（L292-300）

```typescript
// Handle response
if (response.success && response.message) {
  const aiMessage = createAIMessage(response.message);
  set((state) => ({
    chatMessages: [...state.chatMessages, aiMessage],
    isSending: false,
  }));
} else {
  set({ isSending: false }); // エラー情報を握りつぶしている
}
```

## 機能要件

### FR-1: chatError state の追加

- `ChatSlice` インターフェースに `chatError: string | null` stateを追加する
- 初期値は `null`
- `streamingError: StreamingError | null`（ストリーミング専用）とは独立して管理する

### FR-2: clearChatError アクションの追加

- `ChatSlice` インターフェースに `clearChatError: () => void` アクションを追加する
- 実装: `set({ chatError: null })`

### FR-3: sendMessage のエラーパス修正

- `sendMessage` の else ブロックで `response.error` を `chatError` に設定する
- 次のメッセージ送信時に `chatError` をクリアする（`set({ chatError: null })`）

### FR-4: store/index.ts 個別セレクタ追加

- `useChatError` セレクタを追加する（P31対策）
- `useClearChatError` セレクタを追加する（P31対策）
- 追加位置: `useIsSending` の直後

### FR-5: ChatView エラーバナーUI追加

- `useChatError` と `useClearChatError` を個別セレクタで取得する
- チャット入力フォームの直上にインラインエラーバナーを表示する
- バナーは `chatError` が `null` 以外の場合に表示する

## 非機能要件

### NFR-1: エラーバナー自動消去

- バナー表示から5秒後に `clearChatError()` を呼び出して自動消去する
- `useEffect` で5秒タイマーを設定し、`chatError` 変化でタイマーをリセットする
- クリーンアップで `clearTimeout` を呼び出し、タイマーリークを防止する（P5対策）

### NFR-2: 手動消去

- バナーに「×」ボタンを設置し、クリックで `clearChatError()` を呼び出す
- `aria-label="エラーを閉じる"` を付与する（WCAG 2.1 AA準拠）

### NFR-3: 送信時クリア

- 次のメッセージ送信時（`sendMessage` 呼び出し時）に `chatError` をクリアする
- ユーザーが再試行する際に古いエラーが残らないようにする

### NFR-4: Apple HIG準拠カラー設計

- エラーカラー: `systemRed`
  - ライトモード: `#FF3B30`
  - ダークモード: `#FF453A`
- バナー背景: `systemRed` の10%透過
- テキストコントラスト: WCAG 2.1 AA（4.5:1以上）を確保する

### NFR-5: エラーメッセージの日本語表示

- エラーコード（`string`）を日本語メッセージに変換する `ERROR_MESSAGES` Record定数を用意する
- 未知のエラーコードには `UNKNOWN_ERROR` のメッセージでフォールバックする

## 受入基準

1. `callLLMAPI` が `{ success: false }` を返した際に `chatError` が設定される
2. `chatError` が設定された時点でChatViewのエラーバナーが表示される
3. エラーバナーには日本語のエラーメッセージが含まれる（エラーコードから変換）
4. 次のメッセージ送信時またはバナーの×ボタンクリックでバナーが消える
5. バナー表示から5秒後に自動消去される
6. エラー発生時も `isSending: false` に正しく戻る（既存動作を維持）

## 修正スコープ

| ファイル                                              | 修正種別 | 変更内容                                                                   |
| ----------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts` | 修正     | `chatError` state追加、`clearChatError` 追加、`sendMessage` エラーパス修正 |
| `apps/desktop/src/renderer/store/index.ts`            | 修正     | `useChatError`・`useClearChatError` 個別セレクタ追加                       |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`  | 修正     | エラーバナーUI追加、ローカルstate削除                                      |

## 完了確認チェックリスト

- [x] P50チェックを実施し、既実装の有無を確認した（未実装、通常モードで進行）
- [x] `callLLMAPI` のレスポンス構造（`response.error` の有無）を確認した
- [x] 機能要件・非機能要件が明文化されている
- [x] 受入基準がチェックリスト形式で明文化されている
- [x] エラーメッセージの自動消去方式（5秒タイムアウト + 手動クリア + 送信時クリア）を決定した
