# Phase 2 設計サマリー - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| Phase      | 2                                           |
| 成果物種別 | 設計サマリー                                |
| 作成日     | 2026-03-14                                  |
| 前提       | Phase 1 要件定義・スコープ定義              |
| 前提       | Task01 design-summary.md                    |
| 後続       | Phase 3（設計レビュー）                     |

---

## 1. 責務境界の明文化

### 1-A. Renderer 層の責務

| 責務                      | 内容                                                                                         | 制約                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Monaco selection の保持   | Monaco Editor の現在の選択範囲（startLine / endLine / selectedText）を chatEditSlice に保持  | selection の authority は Renderer 側にある           |
| selection の IPC 送信     | `chat-edit:send-with-context` リクエストの `selection` フィールドに store の値を設定して送信 | Main Process に「selection を問い合わせる」経路は禁止 |
| capability 値に基づく表示 | Main Process から IPC で受信した `AIAccessCapability` 値に基づき CTA および guidance を制御  | 独自の capability 算出・独自 fallback 判定は禁止      |
| 書き込み結果の承認        | `approveResult` 内で `window.chatEditAPI.writeFile` を型安全な Preload API 経由で呼び出す    | `window as unknown as` キャストは使用禁止             |
| handoff CTA 表示          | capability に `terminalSurface` が含まれる場合、context summary と handoff CTA を表示する    | handoff CTA 表示は表示だけ。自動送信・自動遷移は禁止  |

### 1-B. Preload 層の責務

| 責務           | 内容                                                                                                    | 制約                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| IPC ブリッジ   | `ipcRenderer.invoke` を `chatEditAPI` として `contextBridge.exposeInMainWorld` で公開                   | `ipcRenderer` を Renderer に直接公開しない             |
| チャンネル管理 | チャンネル名は `CHANNELS` 定数で管理し、文字列リテラルでの直接指定を禁止する                            | P27 対策（safeInvoke/safeOn 使用時のハードコード禁止） |
| 型定義の公開   | `FileReadResult` / `FileWriteResult` / `TextSelection` / `SendWithContextResponse` を Renderer 側に公開 | 実装は Main Process に委譲する                         |
| sender 境界    | `contextIsolation: true` 環境で安全な API ブリッジを提供する                                            | Preload は IPC の橋渡しのみを担う                      |

### 1-C. Main Process 層の責務

| 責務                               | 内容                                                                                                          | 制約                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| capability 判定（final authority） | `AIAccessCapabilityResolver` を呼び出して surface 別 capability を判定する                                    | Renderer に判定を委譲しない                                         |
| LLM 実行                           | `AIRuntimeResolver` で provider / model / adapter を解決してから `ChatEditService.sendWithContext` を呼び出す | stub adapter を本番環境で使用しない（ipc/index.ts L836-842 を除去） |
| credential 管理                    | `CredentialProvider` 経由で SecureStorage から API key を取得する                                             | credential を Renderer に渡さない                                   |
| パス検証                           | `isWithinWorkspace()` / `hasPathTraversal()` でファイルアクセスを制限する                                     | workspacePath 制約は capability 判定とは独立して実施する            |
| error sanitization                 | 内部エラーをサニタイズして Renderer に返す                                                                    | システムパスやスタックトレースを漏洩させない                        |
| capability 変更通知                | `ai:capability-changed` イベントで Renderer に broadcast する                                                 | capability 変更は即座に通知する                                     |

---

## 2. 経路設計

### 2-A. selection 取得経路（Monaco → Preload → Main）

現状の `handleGetSelection` は Main Process 側が selection を持とうとしている設計だが、selection の authority は Renderer（Monaco Editor）側にある。以下の設計に変更する。

```
[設計変更後の経路]

Monaco Editor (Renderer)
  |
  | ユーザーがテキストを選択すると onSelectionChange イベント発火
  v
chatEditSlice.setSelection(selection)
  |
  | store に { startLine, endLine, selectedText } を保持
  v
SendWithContextRequest.selection フィールドに設定
  |
  | chat-edit:send-with-context IPC 呼び出し時に同梱
  v
handleSendWithContext (Main Process)
  |
  | request.selection を context 構築に使用
  v
ContextBuilder.build(contexts, selection)
```

**設計方針**:

- `chat-edit:get-selection` IPC チャンネルは `handleGetSelection` が `null` を返すのみであり、削除または非推奨化する
- selection 情報は Renderer が `SendWithContextRequest` に含めて Main Process に送る「push 型」設計とする
- `null` 返却は「未選択」を意味し、エラーとは区別する（AC-1 準拠）

### 2-B. LLM 実行経路（Main → resolver → integratedRuntime または terminalHandoff）

```
[integratedRuntime 経路]

handleSendWithContext (Main Process)
  |
  | Step 1: capability チェック
  v
AIAccessCapabilityResolver.resolve('chat-edit')
  |
  | integratedRuntime または both → 継続
  | none → CAPABILITY_UNAVAILABLE エラーを返す（fail-fast）
  | terminalSurface → terminal handoff 情報を返す（fail-fast）
  v
  | Step 2: provider / model 解決
AIRuntimeResolver.resolve({ providerId?, modelId?, selectedConfig })
  |
  | 解決失敗 → PROVIDER_UNKNOWN エラーを返す（fail-fast）
  v
  | Step 3: credential 取得
CredentialProvider.get(providerId)
  |
  | key 不在 → CREDENTIAL_MISSING エラーを返す（fail-fast）
  v
  | Step 4: adapter 生成
LLMAdapterFactory.create(providerId, credential)
  |
  v
  | Step 5: ChatEditService 実行
ChatEditService.sendWithContext(request, adapter)
  |
  v
SendWithContextResponse { success: true, result: GeneratedResult }

[terminalHandoff 経路]

AIAccessCapabilityResolver → terminalSurface のみ
  |
  v
context summary を生成（ContextSummaryBuilder）
  |
  v
SendWithContextResponse {
  success: false,
  error: {
    code: 'CAPABILITY_UNAVAILABLE',
    reason: 'integrated_runtime_unavailable',
    guidance: '...',
    handoff: {
      contextSummary: '...',
      suggestedCommand: 'claude --context ...'
    }
  }
}
  |
  v
Renderer: handoff CTA を表示（auto-send 禁止）
```

---

## 3. runtime 注入設計

### 3-A. handler 入口での AIRuntimeResolver DI 設計

`chatEditHandlers.ts` の `handleSendWithContext` に `AIRuntimeResolver` を DI するパターンを採用する。

**設計方針**:

```
[依存関係の注入]

registerAllIpcHandlers（ipc/index.ts）
  |
  | AIRuntimeResolver インスタンスを生成
  | AIAccessCapabilityResolver インスタンスを生成
  | ContextBuilder インスタンスを生成
  |
  v
registerChatEditHandlers(mainWindow, chatEditService, fileService, {
  runtimeResolver: AIRuntimeResolver,
  capabilityResolver: AIAccessCapabilityResolver,
})
  |
  v
handleSendWithContext クロージャが runtimeResolver / capabilityResolver を参照
```

**具体的な DI インターフェース**:

| パラメータ名         | 型                           | 責務                              |
| -------------------- | ---------------------------- | --------------------------------- |
| `capabilityResolver` | `AIAccessCapabilityResolver` | surface 別 capability の最終判定  |
| `runtimeResolver`    | `AIRuntimeResolver`          | provider / model / adapter の解決 |

### 3-B. stub adapter 除去方針（ipc/index.ts L836-842）

現状の `ipc/index.ts` L836-842 には以下の stub が存在する:

```typescript
// 除去対象（現状）
const stubLLMAdapter = {
  sendMessage: async () => ({
    success: false,
    error: { message: "LLM adapter not configured for chat-edit" },
  }),
};
const chatEditService = new ChatEditService(stubLLMAdapter, contextBuilder);
```

**除去後の設計**:

```
[除去後の ipc/index.ts 設計]

--- 12. Chat Edit handlers ---
track("registerChatEditHandlers", () => {
  const contextBuilder = new ContextBuilder();
  const capabilityResolver = getOrCreateCapabilityResolver();  // 共有インスタンス
  const runtimeResolver = getOrCreateRuntimeResolver();        // 共有インスタンス
  registerChatEditHandlers(mainWindow, contextBuilder, {
    capabilityResolver,
    runtimeResolver,
  });
});
```

**注意事項**:

- `ChatEditService` は `LLMAdapter` を constructor injection していたが、capability 判定を handler 層で先に行い、adapter は `runtimeResolver` から都度取得する設計に変更する
- `ChatEditService` 自体は `ContextBuilder` と `parseResponse` / `buildPrompt` の責務に限定する

---

## 4. error policy 設計

### 4-A. timeout

| エラー種別       | timeout 値    | 対応                   |
| ---------------- | ------------- | ---------------------- |
| LLM API 呼び出し | **30,000 ms** | retryable エラーを返す |
| capability 解決  | **5,000 ms**  | fail-fast エラーを返す |
| credential 取得  | **3,000 ms**  | fail-fast エラーを返す |
| ファイル書き込み | **10,000 ms** | retryable エラーを返す |

### 4-B. rate limit

| 対応                        | 内容                                                          |
| --------------------------- | ------------------------------------------------------------- |
| retry 上限                  | **3 回**（exponential backoff: 1s → 2s → 4s）                 |
| エラーコード                | `RATE_LIMIT`（retryable: true）                               |
| Renderer へのフィードバック | 残 retry 回数と次回実行可能時刻を `error.retryAfter` に含める |
| 上限超過時                  | retryable: false として guidance 付きエラーを返す             |

### 4-C. permission denied（failFast → terminal handoff）

| 判定条件                                 | 対応                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `AIAccessCapabilityResolver` → `none`    | `CAPABILITY_UNAVAILABLE` エラー + guidance を返す |
| capability が `terminalSurface` のみ     | handoff 情報付きエラーを返す（auto-send 禁止）    |
| ファイルアクセス権限なし（EACCES/EPERM） | `PERMISSION_DENIED` エラーを返す                  |
| workspacePath 外アクセス                 | `PERMISSION_DENIED` エラーを返す                  |
| パストラバーサル検出                     | `PERMISSION_DENIED` エラーを返す（即座に拒否）    |

### 4-D. API key missing（failFast → terminal handoff guidance）

| 判定条件                      | 対応                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `CredentialProvider.get` 失敗 | `CREDENTIAL_MISSING` エラー + 設定画面への guidance を返す                       |
| guidance 内容                 | 「Settings > API Key で [providerName] のキーを設定してください」を含める        |
| terminal handoff 可否         | capability に `terminalSurface` が含まれる場合、handoff CTA も guidance に含める |
| silent fallback               | 禁止（stub adapter への自動切替、terminal への自動遷移は発生させない）           |

---

## 5. 状態遷移

### 5-A. chatEditSlice の状態フィールド設計

| フィールド名         | 型                           | 初期値  | 説明                                                      |
| -------------------- | ---------------------------- | ------- | --------------------------------------------------------- |
| `fileContexts`       | `FileContext[]`              | `[]`    | 添付されたファイルコンテキスト一覧                        |
| `activeContextId`    | `string \| null`             | `null`  | アクティブなコンテキストの ID                             |
| `currentSelection`   | `TextSelection \| null`      | `null`  | Monaco Editor の現在の選択範囲（新規追加フィールド）      |
| `generatedResults`   | `GeneratedResult[]`          | `[]`    | LLM が生成した結果一覧                                    |
| `currentResultId`    | `string \| null`             | `null`  | 現在表示中の結果 ID                                       |
| `isLoading`          | `boolean`                    | `false` | LLM 実行中フラグ                                          |
| `isDiffPreviewOpen`  | `boolean`                    | `false` | diff プレビュー表示中フラグ                               |
| `error`              | `string \| null`             | `null`  | エラーコード                                              |
| `isDragging`         | `boolean`                    | `false` | ファイルドラッグ中フラグ                                  |
| `chatEditCapability` | `AIAccessCapability \| null` | `null`  | 現在の capability 値（新規追加フィールド）                |
| `handoffContext`     | `HandoffContext \| null`     | `null`  | terminal handoff 用コンテキスト情報（新規追加フィールド） |

### 5-B. 状態遷移図

```
[Workspace Chat Edit 状態遷移]

initial
  |
  v
selection-ready（chatEditCapability 解決済み、selection あり）
  |── fileContexts.length > 0 && currentSelection != null
  |
  v
generating（LLM 実行中）
  |── sendWithContext 呼び出し → isLoading = true
  |
  +──[success]──→ diff-ready（generatedResults に追加）
  |                 |── isDiffPreviewOpen = true
  |                 |
  |                 +──[approveResult]──→ applied（ファイル書き込み完了）
  |                 |
  |                 +──[rejectResult]──→ selection-ready（結果をリセット）
  |
  +──[CAPABILITY_UNAVAILABLE / terminalSurface]──→ handoff
  |     |── handoffContext に contextSummary + suggestedCommand を設定
  |     |── handoff CTA を表示（auto-send 禁止）
  |
  +──[CAPABILITY_UNAVAILABLE / none]──→ blocked
  |     |── guidance ブロックを表示
  |
  +──[CREDENTIAL_MISSING]──→ blocked（設定誘導の guidance を表示）
  |
  +──[CONTEXT_TOO_LARGE]──→ selection-ready（エラーメッセージ表示）
  |
  +──[LLM_ERROR / retryable]──→ selection-ready（エラー + retry ガイダンス）
  |
  +──[timeout]──→ selection-ready（timeout エラー + retry ガイダンス）

blocked（fileContexts.length === 0 または currentSelection === null）
  |── 「選択範囲を決めてから続ける」メッセージを表示
```

---

## 6. Task01 契約継承

### 6-A. AIAccessCapabilityResolver の適用

Task01 で確定した `AIAccessCapabilityResolver` を Chat Edit に適用する。

| surface ID  | 想定 capability     | 判定条件                                            |
| ----------- | ------------------- | --------------------------------------------------- |
| `chat-edit` | `integratedRuntime` | API key 存在 + integrated surface 対応              |
| `chat-edit` | `both`              | API key 存在 + terminal も可用                      |
| `chat-edit` | `terminalSurface`   | API key 不在 + terminal 可用（legacy subscription） |
| `chat-edit` | `none`              | API key 不在 + terminal 不可用                      |

**適用タイミング**:

1. `handleSendWithContext` 呼び出し時（main 実行前の preflight チェック）
2. `ai:capability-changed` イベント受信時に chatEditSlice の `chatEditCapability` を更新

### 6-B. integratedRuntime / terminalSurface 判定の Chat Edit への適用

| capability 判定結果 | Chat Edit での動作                                         | UI 状態      |
| ------------------- | ---------------------------------------------------------- | ------------ |
| `integratedRuntime` | LLM 実行を proceed する                                    | `generating` |
| `both`              | `integratedRuntime` 経路を優先して LLM 実行を proceed する | `generating` |
| `terminalSurface`   | LLM 実行をしない。handoff 情報を返す                       | `handoff`    |
| `none`              | LLM 実行をしない。guidance 付きエラーを返す                | `blocked`    |

### 6-C. ai:capability-changed イベント購読

Renderer 側の chatEditSlice は `ai:capability-changed` イベントを購読し、capability 変更時に `chatEditCapability` フィールドを更新する。

```
[購読設計]

preload: chatEditAPI.onCapabilityChanged(callback)
  |
  v
chatEditSlice: setCapability(newCapability)
  |
  v
UI: capability 値に基づき CTA を再描画
```

### 6-D. fail-fast ルールの適用

| fail-fast 条件        | エラーコード              | Renderer への返却                              |
| --------------------- | ------------------------- | ---------------------------------------------- |
| capability = none     | `CAPABILITY_UNAVAILABLE`  | reason + guidance（設定画面への誘導）          |
| capability = terminal | `CAPABILITY_UNAVAILABLE`  | reason + guidance + handoff context            |
| credential 不在       | `CREDENTIAL_MISSING`      | reason + guidance + 設定画面 URL               |
| provider 解決不能     | `PROVIDER_UNKNOWN`        | reason + guidance（provider 設定の確認を促す） |
| adapter 生成失敗      | `ADAPTER_CREATION_FAILED` | reason + guidance（再試行の促し）              |

---

## 7. handoff context 設計

### 7-A. ContextSummaryBuilder

terminal handoff 時に Renderer へ渡す context summary の形式を定義する。

| フィールド         | 型               | 内容                                                           |
| ------------------ | ---------------- | -------------------------------------------------------------- |
| `contextSummary`   | `string`         | 「N ファイル、合計 X KB」形式のサマリーテキスト                |
| `suggestedCommand` | `string`         | `claude --context "<file1>:<lang>:<lines>"` 形式の提案コマンド |
| `fileList`         | `string[]`       | handoff に含まれるファイルパスの一覧                           |
| `selectionInfo`    | `string \| null` | 選択範囲がある場合の説明テキスト（例: "src/App.tsx L10-25"）   |

### 7-B. terminal boundary の遵守

| 禁止事項                | 内容                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| auto-send 禁止          | `suggestedCommand` は表示・コピーのみ。terminal へ自動送信しない |
| hidden prompt injection | 暗黙のプロンプトを terminal に注入しない                         |
| silent fallback 禁止    | integrated runtime 失敗時に自動で terminal へ切り替えない        |
| auto-retry 禁止         | handoff 後に再度 integrated 実行を自動的に試みない               |

---

## 8. chatEditSlice の window 直接参照 除去設計

現状の `chatEditSlice.ts` L190-204 の `window as unknown as {...}` キャストを除去し、型安全な Preload API 経由に変更する。

### 8-A. 現状の問題

```typescript
// 現状（除去対象）
const chatEditAPI = (
  window as unknown as {
    chatEditAPI?: { writeFile: ... };
  }
).chatEditAPI;
```

### 8-B. 変更後の設計

chatEditSlice は Zustand slice であり、直接 window オブジェクトを参照すべきではない。

**設計方針**:

1. `chatEditSlice` から `writeFile` の直接呼び出しロジックを除去する
2. `approveResult` アクションは「承認意図を記録する」だけに責務を限定する
3. 実際の `writeFile` 呼び出しはコンポーネント層（`useChatEdit` カスタムフック）で行う
4. コンポーネント層は `window.chatEditAPI` を `ChatEditAPI` 型として正しく取得する

```
[変更後の設計]

DiffPreviewPanel（コンポーネント）
  |
  | approveAndWrite(resultId) を呼び出す
  v
useChatEdit フック
  |
  | window.chatEditAPI.writeFile を呼び出す（型安全）
  | 書き込み成功後に chatEditSlice.approveResult(resultId) を呼び出す
  v
chatEditSlice.approveResult
  |
  | generatedResults の status を 'approved' に更新
  | isDiffPreviewOpen = false, currentResultId = null
```

### 8-C. 型安全な参照の設計

Preload 側に `window.chatEditAPI` の型定義を追加し、Renderer 側で型安全に参照できるようにする。

```
[型定義設計]

apps/desktop/src/preload/chatEditApi.ts
  - ChatEditAPI インターフェースを export する（既存）

apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useChatEdit.ts
  - window.chatEditAPI を ChatEditAPI 型として参照する
  - 型定義は chatEditApi.ts の ChatEditAPI を使用する

global.d.ts または window.d.ts（既存の定義に追加）
  - interface Window { chatEditAPI: ChatEditAPI }
```

---

## 9. 設計方針の根拠

| 設計方針                                                 | 根拠                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| selection は Renderer 側が authority を持つ              | Monaco Editor の state は Renderer プロセスにあり、Main Process からは直接アクセス不可        |
| capability 判定は handler 入口で行う                     | capability は AI 実行前の preflight として必ず確認が必要。サービス層での判定は責務過多        |
| stub adapter は handler 層の DI 置換で除去する           | `ChatEditService` の constructor DI から handler DI に変更することで、stub 注入箇所を集約     |
| chatEditSlice の window 直接参照をコンポーネント層に移す | Zustand slice は UI 状態の管理に集中すべき。副作用（IPC 呼び出し）はフック層の責務            |
| handoff は情報提供のみ（auto-send 禁止）                 | terminal boundary を維持しユーザー操作の主体性を保護するため（Task01 terminal boundary 継承） |
| fail-fast + guidance 返却                                | silent fallback はデバッグを困難にし、ユーザーの信頼を損なうため                              |
| workspacePath 制約は capability と独立させる             | パスセキュリティは AI 権限とは無関係の基本セキュリティ要件であるため                          |
