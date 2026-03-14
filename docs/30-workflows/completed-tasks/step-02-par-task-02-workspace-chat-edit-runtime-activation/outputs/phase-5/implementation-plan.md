# Phase 5 実装計画書 - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001  |
| Phase      | 5                                            |
| 成果物種別 | 実装計画書                                   |
| 作成日     | 2026-03-14                                   |
| 前提       | Phase 1-3 成果物（要件定義・設計・レビュー） |
| 後続       | Phase 5 実装作業・Phase 6 テスト拡充         |

---

## 1. 実装対象ファイル一覧

変更が必要なファイルを実装優先度順に列挙する。

### 優先度 1: 型定義（すべての実装の基盤）

| #   | ファイルパス                                                            | 変更種別 | 変更内容の要約                                                                                                                                                                                                                                                                                                                                                                             | 依存するファイル |
| --- | ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1   | `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` | 修正     | `SendWithContextRequest` に `selection?: TextSelection \| null` フィールドを追加。`SendError.code` に `CAPABILITY_UNAVAILABLE` / `CREDENTIAL_MISSING` / `PROVIDER_UNKNOWN` / `ADAPTER_CREATION_FAILED` / `INVALID_SELECTION` / `PERMISSION_DENIED` を追加。`ChatEditState` に `currentSelection`, `chatEditCapability`, `handoffContext` フィールドを追加。`HandoffContext` 型を新規定義。 | なし             |
| 2   | `apps/desktop/src/main/services/chat-edit/types.ts`                     | 修正     | Renderer 側型定義の re-export に新規追加型（`HandoffContext`, `ChatEditErrorCode` 等）を追加。`ChatEditErrorCode` 型エイリアスを追加（`SendError['code']` の拡張後の値をユニオン化）。                                                                                                                                                                                                     | `types/index.ts` |

### 優先度 2: Main Process ハンドラー（中核実装）

| #   | ファイルパス                                         | 変更種別 | 変更内容の要約                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 依存するファイル                                                                      |
| --- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 3   | `apps/desktop/src/main/handlers/chatEditHandlers.ts` | 修正     | (A) `registerChatEditHandlers` シグネチャを `(mainWindow, contextBuilder, { capabilityResolver, runtimeResolver })` に変更。(B) 全ハンドラーに `validateIpcSender` を追加（MINOR-05 対応）。(C) `handleSendWithContext` に capability チェック → runtime 解決 → credential 取得 → adapter 生成 → LLM 実行の 5 ステップを実装。(D) `handleGetSelection` を非推奨化（`null` 返却のまま、TODO コメントを設計説明に差し替え）。(E) `buildPrompt` のデッドコードを除去（`ChatEditService.buildPrompt` に委譲済みのため）。(F) `INVALID_SELECTION` エラー返却ロジックを追加（MINOR-01 対応）。(G) `HandoffContext` 生成ロジック（`ContextSummaryBuilder` 相当の処理）を追加。 | Task01 の `AIAccessCapabilityResolver`, `AIRuntimeResolver`（後述フォールバック参照） |
| 4   | `apps/desktop/src/main/ipc/index.ts`                 | 修正     | L836-842 の `stubLLMAdapter` および `ChatEditService` のコンストラクタ DI を除去。`registerChatEditHandlers` の呼び出しシグネチャを新設計に変更（`capabilityResolver`, `runtimeResolver` を渡す）。`FileService` への参照も削除（ハンドラーシグネチャ変更により不要化）。                                                                                                                                                                                                                                                                                                                                                                                               | `chatEditHandlers.ts`（変更後シグネチャ）                                             |

### 優先度 3: Preload 層（IPC ブリッジ）

| #   | ファイルパス                              | 変更種別 | 変更内容の要約                                                                                                                                                                                                                                                                                                                                                                                                                                       | 依存するファイル                                |
| --- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 5   | `apps/desktop/src/preload/chatEditApi.ts` | 修正     | (A) `ChatEditAPI` インターフェースに `onCapabilityChanged(callback)` メソッドを追加。(B) `readFile` / `writeFile` の引数に `workspacePath?: string \| null` を追加（MINOR-02 対応、または「現時点では渡さない」方針を明示したコメントで補完）。(C) `exposeChatEditAPI` が `contextBridge.exposeInMainWorld` を使うように変更（現状の `window` 直接代入を廃止）。(D) `CHANNELS` オブジェクトに `CAPABILITY_CHANGED: 'ai:capability-changed'` を追加。 | `types/index.ts`（`HandoffContext` 等の新規型） |

### 優先度 4: Renderer Slice（状態管理）

| #   | ファイルパス                                                                    | 変更種別 | 変更内容の要約                                                                                                                                                                                                                                                                                                                                                                                                             | 依存するファイル                                                                |
| --- | ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 6   | `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | 修正     | (A) `initialState` に `currentSelection: null`, `chatEditCapability: null`, `handoffContext: null` を追加。(B) `approveResult` アクションから `window as unknown as {...}` キャストを除去し、「承認意図の記録のみ」に責務を限定する。(C) `setSelection`, `setCapability`, `setHandoffContext` アクションを追加。(D) `ai:capability-changed` イベント購読の初期化ロジックを追加（`onCapabilityChanged` コールバック登録）。 | `types/index.ts`（新規フィールド型）, `chatEditApi.ts`（`onCapabilityChanged`） |

### 優先度 5: コンポーネント層（writeFile 呼び出し移動）

| #   | ファイルパス                                                                               | 変更種別       | 変更内容の要約                                                                                                                                                                    | 依存するファイル                                   |
| --- | ------------------------------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 7   | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useDiffApply.ts`             | 修正または新規 | `approveResult` の呼び出し時に `window.chatEditAPI.writeFile` を型安全に呼び出す責務をフック層に移動。書き込み成功後に `chatEditSlice.approveResult(resultId)` を dispatch する。 | `chatEditApi.ts`（`ChatEditAPI` 型）               |
| 8   | グローバル型定義（`apps/desktop/src/renderer/window.d.ts` 等、既存ファイルを確認して追記） | 修正または新規 | `interface Window { chatEditAPI: ChatEditAPI }` を追加して型安全な参照を確立する。                                                                                                | `chatEditApi.ts`（`ChatEditAPI` インターフェース） |

### 優先度 6: ChatEditService のリファクタリング

| #   | ファイルパス                                                  | 変更種別 | 変更内容の要約                                                                                                                                                                                                                                                                                                        | 依存するファイル                                  |
| --- | ------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 9   | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` | 修正     | (A) `constructor` から `llmAdapter` の DI を除去。(B) `sendWithContext` メソッドのシグネチャを `sendWithContext(request, adapter)` に変更（adapter を引数として受け取る）。(C) capability チェックロジックは handler 層に移管済みのため、Service 層では純粋なプロンプト生成・LLM 呼び出し・レスポンス解析に集中する。 | `types/index.ts`（`LLMAdapter` インターフェース） |

---

## 2. 実装順序（ステップ by ステップ）

### フェーズ A: エラーコード追加（MINOR-01 対応）

#### Step A-1: `INVALID_SELECTION` エラーコードの追加

**対象ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`

**変更箇所**: `SendError` インターフェースの `code` フィールド

**変更内容**:

現状の `SendError.code` は以下のユニオン型:

```
"CONTEXT_TOO_LARGE" | "LLM_ERROR" | "TIMEOUT" | "RATE_LIMIT" | "INVALID_COMMAND"
```

これに以下のコードを追加する:

```
"CAPABILITY_UNAVAILABLE"   // integratedRuntime capability なし（fail-fast）
"CREDENTIAL_MISSING"       // API key 未設定（fail-fast）
"PROVIDER_UNKNOWN"         // provider 解決不能（fail-fast）
"ADAPTER_CREATION_FAILED"  // adapter 生成失敗
"INVALID_SELECTION"        // selection 必須コマンドで selection が null（MINOR-01）
"PERMISSION_DENIED"        // sender 検証失敗 / workspacePath 外アクセス
```

**追加が必要な新規型**:

`HandoffContext` 型を新規追加する（terminal handoff 時に Renderer へ渡す情報）:

```
interface HandoffContext {
  contextSummary: string          // "N ファイル、合計 X KB" 形式
  suggestedCommand: string        // "claude --context ..." 形式
  fileList: string[]              // handoff 対象ファイルパス一覧
  selectionInfo: string | null    // 選択範囲説明テキスト（例: "src/App.tsx L10-25"）
}
```

**追加が必要な State フィールド**（`ChatEditState` インターフェース）:

```
currentSelection: TextSelection | null    // Monaco 選択範囲（Renderer が authority）
chatEditCapability: AIAccessCapability | null  // Main から受信した capability 値
handoffContext: HandoffContext | null     // terminal handoff 情報
```

ただし `AIAccessCapability` 型は Task01 の実装次第で import パスが確定する。Task01 未実装の場合は文字列リテラルユニオン型で仮定義する（後述フォールバック参照）。

**`ChatEditActions` に追加するアクション**:

```
setSelection: (selection: TextSelection | null) => void
setCapability: (capability: AIAccessCapability | null) => void
setHandoffContext: (context: HandoffContext | null) => void
```

---

### フェーズ B: IPC 契約修正（MINOR-02 / MINOR-05 対応）

#### Step B-1: `chatEditApi.ts` への workspacePath 引数追加と `onCapabilityChanged` 追加

**対象ファイル**: `apps/desktop/src/preload/chatEditApi.ts`

**MINOR-02 対応**: `readFile` / `writeFile` の現状シグネチャは `workspacePath` を渡さない設計になっている。Phase 5 では以下のいずれかの方針で対応する:

- **方針 A（推奨）**: `readFile(filePath, workspacePath?)` および `writeFile(filePath, content, workspacePath?, options?)` に引数を追加し、`ipcRenderer.invoke` に渡す。
- **方針 B**: 「現時点では Preload 経由で workspacePath を渡さない設計」として明示的なコメントを追記し、MINOR-02 を未タスクとして記録する。

本計画では方針 A を推奨する（workspacePath が今後ワークスペース連動機能で使用される可能性があるため）。

**`onCapabilityChanged` の追加**:

```
ChatEditAPI インターフェースに追加:
  onCapabilityChanged: (callback: (capability: AIAccessCapability) => void) => () => void

実装:
  ipcRenderer.on('ai:capability-changed', handler)
  return () => ipcRenderer.removeListener('ai:capability-changed', handler)
```

**`contextBridge` 対応**:

現状の `exposeChatEditAPI` は `window` オブジェクトに直接代入している。Electron の `contextIsolation: true` 環境では `contextBridge.exposeInMainWorld` を使うべき。Preload entry point（`apps/desktop/src/preload/index.ts`）の既存パターンに合わせて修正する。

#### Step B-2: 全ハンドラーへの sender validation 追加（MINOR-05 対応）

**対象ファイル**: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

**対象ハンドラー**: `handleReadFile`, `handleWriteFile`, `handleGetSelection`, `handleSendWithContext`, `handleDetectLanguage`

**実装パターン（既存の他ハンドラーに合わせる）**:

各ハンドラーの先頭で `validateIpcSender(event, 'chat-edit:xxx', { getAllowedWindows: () => [mainWindow] })` を呼び出す。

`mainWindow` は `registerChatEditHandlers` に引数として渡されるため、クロージャ経由でハンドラーが参照できる。

| ハンドラー              | sender 検証失敗時の動作                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `handleReadFile`        | `PERMISSION_DENIED` エラーを返す                                       |
| `handleWriteFile`       | `PERMISSION_DENIED` エラーを返す                                       |
| `handleGetSelection`    | `null` を返す（エラー扱いしない、設計上 Renderer が authority のため） |
| `handleSendWithContext` | `PERMISSION_DENIED` エラーを返す                                       |
| `handleDetectLanguage`  | `PERMISSION_DENIED` エラーを返す                                       |

---

### フェーズ C: stub adapter 除去 + DI 設計（中核実装）

#### Step C-1: `ipc/index.ts` L836-842 の stubLLMAdapter を削除

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

**削除対象コード**（L836-842 相当）:

```typescript
// 削除対象
const stubLLMAdapter = {
  sendMessage: async () => ({
    success: false,
    error: { message: "LLM adapter not configured for chat-edit" },
  }),
};
const chatEditService = new ChatEditService(stubLLMAdapter, contextBuilder);
registerChatEditHandlers(mainWindow, chatEditService, fileService);
```

**削除後の設計**:

```
--- 12. Chat Edit handlers ---
track("registerChatEditHandlers", () => {
  const contextBuilder = new ContextBuilder();
  const capabilityResolver = getOrCreateCapabilityResolver();  // 共有インスタンス（下記参照）
  const runtimeResolver = getOrCreateRuntimeResolver();        // 共有インスタンス（下記参照）
  registerChatEditHandlers(mainWindow, contextBuilder, {
    capabilityResolver,
    runtimeResolver,
  });
});
```

`FileService` は handler シグネチャ変更後は不要になる（`handleReadFile` / `handleWriteFile` が直接 fs を使用しているため）。ただし `FileService` クラスを import している他のコードがないか grep で確認してから削除判断を行う。

#### Step C-2: `getOrCreateCapabilityResolver` / `getOrCreateRuntimeResolver` の実装位置

**前提**: Task01（TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001）が `AIAccessCapabilityResolver` と `AIRuntimeResolver` を `apps/desktop/src/main/services/ai/` に実装済みである場合、`ipc/index.ts` で import してインスタンス化する。

**Task01 未実装の場合のフォールバック**（後述「5. 実装の前提条件」参照）。

#### Step C-3: `ChatEditService` に `LLMAdapter` を constructor から除去

**対象ファイル**: `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`

**変更後のシグネチャ**:

```
constructor(
  private readonly contextBuilder: ContextBuilder,  // LLMAdapter を除去
) {}

async sendWithContext(
  request: SendWithContextRequest,
  adapter: LLMAdapter,  // handler 層から都度注入
): Promise<SendWithContextResponse>
```

これにより `ChatEditService` の責務が「コンテキスト構築・プロンプト生成・レスポンス解析」に限定される。capability チェックは handler 層が担う。

---

### フェーズ D: handler の TODO 実装

#### Step D-1: `handleGetSelection` → push 型への移行（非推奨化）

**対象ファイル**: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

**現状の `handleGetSelection`**: 常に `null` を返す（TODO コメントあり）。

**変更後の設計**:

- `null` 返却は維持する（設計上、Main Process は selection の authority を持たない）
- TODO コメントを以下の設計説明コメントに差し替える:
  ```
  // 設計上、selection の authority は Renderer（Monaco Editor）側にある。
  // Main Process が selection を持つ設計は採用しない（push 型設計）。
  // Renderer は SendWithContextRequest.selection フィールドに selection を設定して送信する。
  // このハンドラーは後方互換のために残すが、将来的に削除予定（非推奨）。
  ```
- `ipcMain.handle` 登録は維持するが、将来の削除に向けて `@deprecated` を明記する。

#### Step D-2: `handleSendWithContext` の本実装

**対象ファイル**: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

**実装する 5 ステップのロジック**（疑似コードレベル、フェーズ D の中核）:

```
Step 1: sender 検証（validateIpcSender）
  失敗 → PERMISSION_DENIED エラーを返す

Step 2: リクエストバリデーション
  contexts が空 → CONTEXT_TOO_LARGE に類するバリデーションエラーを返す
  selection が null かつ selection 必須コマンド（refactor / generate-test）→ INVALID_SELECTION エラーを返す（MINOR-01）

Step 3: capability チェック（preflight）
  capabilityResolver.resolve('chat-edit') を呼び出す
  結果が 'none' → CAPABILITY_UNAVAILABLE エラー + guidance を返す（fail-fast）
  結果が 'terminalSurface' のみ → CAPABILITY_UNAVAILABLE エラー + HandoffContext を生成して返す

Step 4: runtime 解決（integratedRuntime / both の場合のみ到達）
  runtimeResolver.resolve(options) で provider / model を解決する
  解決失敗 → PROVIDER_UNKNOWN エラーを返す（fail-fast）
  credential 取得失敗 → CREDENTIAL_MISSING エラーを返す（fail-fast）
  adapter 生成失敗 → ADAPTER_CREATION_FAILED エラーを返す（fail-fast）

Step 5: ChatEditService.sendWithContext(request, adapter) を呼び出す
  コンテキストサイズ超過 → CONTEXT_TOO_LARGE エラーを返す
  LLM エラー → LLM_ERROR（retryable: true）を返す
  成功 → { success: true, result: GeneratedResult } を返す
```

**HandoffContext 生成ロジック（Step 3 で terminalSurface の場合）**:

```
contextSummary: `${request.contexts.length} ファイル、合計 ${totalSizeKB} KB`
suggestedCommand: `claude --context ${fileList.join(' ')}`
fileList: request.contexts.map(ctx => ctx.filePath)
selectionInfo: request.selection
  ? `${request.contexts[0]?.filePath} L${request.selection.startLine}-${request.selection.endLine}`
  : null
```

---

### フェーズ E: chatEditSlice 修正

#### Step E-1: `window as unknown as {...}` キャストの除去

**対象ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts`

**現状の問題箇所**（L190-204 相当）:

```typescript
// 除去対象
const chatEditAPI = (window as unknown as { chatEditAPI?: { writeFile: ... } }).chatEditAPI;
const writeResult = await chatEditAPI?.writeFile(...);
```

**変更後の設計**:

`approveResult` アクションから `writeFile` の直接呼び出しを除去する。アクションは「承認意図の記録のみ」に責務を限定する。

変更後の `approveResult` の責務:

```
1. 結果が存在するか確認する
2. generatedResults の status を 'approved' に更新する
3. isDiffPreviewOpen = false, currentResultId = null に設定する
4. { success: true, filePath, appliedAt } を返す（writeFile は呼び出さない）
```

実際の `writeFile` 呼び出しは `useDiffApply.ts` フック層で行う（フェーズ F 参照）。

#### Step E-2: 新規フィールドとアクションの追加

**`initialState` に追加するフィールド**:

```
currentSelection: null,
chatEditCapability: null,
handoffContext: null,
```

**追加するアクション**:

```
setSelection: (selection: TextSelection | null) => void
  → set({ currentSelection: selection })

setCapability: (capability: AIAccessCapability | null) => void
  → set({ chatEditCapability: capability })

setHandoffContext: (context: HandoffContext | null) => void
  → set({ handoffContext: context })
```

**`ai:capability-changed` イベント購読の設計**:

購読は `chatEditSlice` 内部ではなく、コンポーネントの初期化（`useEffect`）または `useChatEdit` フックで行う（slice は純粋な状態管理に集中させる）。

購読パターン（P31 対策として useRef + 一度だけ登録）:

```
useEffect(() => {
  const unsubscribe = window.chatEditAPI.onCapabilityChanged((capability) => {
    setCapability(capability);
  });
  return unsubscribe;
}, []); // 空依存配列（一度だけ登録）
```

---

### フェーズ F: コンポーネント層への writeFile 移動

#### Step F-1: `useDiffApply.ts` での writeFile 呼び出し実装

**対象ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useDiffApply.ts`

**変更内容**:

```
approveAndWrite(resultId) の実装:
  1. window.chatEditAPI.writeFile(result.targetFilePath, result.generatedContent, { createBackup: true }) を呼び出す
  2. 成功時: chatEditSlice.approveResult(resultId) を dispatch する
  3. 失敗時: chatEditSlice.setError(errorCode) を dispatch する
```

**型安全な `window.chatEditAPI` の参照**:

`global.d.ts` または `window.d.ts`（既存ファイルを確認して追記）に以下を追加する:

```typescript
interface Window {
  chatEditAPI: import("@/preload/chatEditApi").ChatEditAPI;
}
```

#### Step F-2: surface ID 登録（MINOR-04 対応）

Task01 foundation の `AIAccessCapabilityResolver` に `chat-edit` surface ID を登録する必要がある。

Phase 5 実装時に以下の対応を行う:

- Task01 の surface ID 定義ファイル（未実装の場合は設計ドキュメント）に `chat-edit` を追記する
- Task03 / Task04 等の並列タスクと surface ID の命名衝突がないことを確認する
- surface ID の命名規則（小文字・ハイフン区切り）に従う

---

## 3. stub 除去チェックリスト

実装完了後に以下を全て確認すること。

- [ ] `apps/desktop/src/main/ipc/index.ts` の `stubLLMAdapter` が削除されている
- [ ] `apps/desktop/src/main/ipc/index.ts` の `ChatEditService(stubLLMAdapter, ...)` コンストラクタ呼び出しが削除されている
- [ ] `apps/desktop/src/main/handlers/chatEditHandlers.ts` の `handleSendWithContext` 内の `// TODO: 実際のLLM連携を実装` コメントが削除されている
- [ ] `apps/desktop/src/main/handlers/chatEditHandlers.ts` の `handleGetSelection` 内の `// TODO: Monaco Editorとの連携を実装` が設計説明コメントに差し替えられている
- [ ] `apps/desktop/src/main/handlers/chatEditHandlers.ts` の `buildPrompt` 関数（ハンドラー層のもの）のデッドコードが削除されている（`ChatEditService.buildPrompt` に委譲）
- [ ] `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` の `window as unknown as {...}` キャストが除去されている
- [ ] `handleSendWithContext` が LLM API を実際に呼び出している（stub や仮実装ではない）
- [ ] `ChatEditService.sendWithContext(request)` が `sendWithContext(request, adapter)` に変更されている
- [ ] 全ハンドラーに `validateIpcSender` が追加されている（MINOR-05 対応）

---

## 4. DI 注入ポイントの詳細設計

以下は疑似コードレベルの設計（実際のコードは書かない）。

### 4-A. main プロセス起動時の resolver 初期化タイミング

```
[main.ts のウィンドウ作成後]

mainWindow = new BrowserWindow(...)
mainWindow.loadURL(...)

↓

registerAllIpcHandlers(mainWindow)  // ipc/index.ts
  内部で:
    capabilityResolver = getOrCreateCapabilityResolver()  // 遅延シングルトン
    runtimeResolver = getOrCreateRuntimeResolver()         // 遅延シングルトン
    registerChatEditHandlers(mainWindow, contextBuilder, {
      capabilityResolver,
      runtimeResolver,
    })
```

`getOrCreateCapabilityResolver` / `getOrCreateRuntimeResolver` は `ipc/index.ts` のモジュールスコープ変数として保持する（他のハンドラーグループ（Task03-08）も同一インスタンスを共有する前提）。

### 4-B. `ChatEditService` へのコンストラクタ DI の変更方式

**変更前**（Constructor Injection）:

```
new ChatEditService(llmAdapter, contextBuilder)
  → adapter をコンストラクタで受け取り、sendWithContext で使用する
```

**変更後**（引数 Injection）:

```
new ChatEditService(contextBuilder)
  → adapter は sendWithContext(request, adapter) の引数で受け取る
  → handler 層が都度 runtimeResolver から adapter を取得して渡す
```

**この設計を選択した理由**:

- adapter は capability に応じて変更される（capability 変更時に invalidate される）
- コンストラクタ時点では adapter が確定しない（P34 パターンの応用）
- handler 層でリクエストごとに adapter を解決することで、stale adapter の使用を防止できる

### 4-C. Setter Injection が不要な理由

`ChatEditService` は `BrowserWindow` 等の外部リソースに依存しない。`ContextBuilder` はコンストラクタ時点で生成可能なため、Setter Injection（P34 パターン）は不要。

引数 Injection（sendWithContext に adapter を渡す）で十分な理由:

- adapter のライフサイクルは request ごとに管理される
- capability 変更時のキャッシュクリアは `LLMAdapterFactory`（runtimeResolver 内部）が担う
- `ChatEditService` はステートレスな処理（コンテキスト構築・プロンプト生成）のみを担う

---

## 5. 実装の前提条件

### 5-A. Task01 の実装状況確認

本タスクの中核実装（フェーズ C・D）は、Task01（TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001）が以下のファイルを実装済みであることを前提とする。

| 期待する実装                 | 期待パス                                                          | 状態（実装前確認必須）     |
| ---------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `AIAccessCapabilityResolver` | `apps/desktop/src/main/services/ai/AIAccessCapabilityResolver.ts` | 要確認（現時点では未確認） |
| `AIRuntimeResolver`          | `apps/desktop/src/main/services/ai/AIRuntimeResolver.ts`          | 要確認（現時点では未確認） |
| `CredentialProvider`         | `apps/desktop/src/main/services/ai/CredentialProvider.ts`         | 要確認（現時点では未確認） |
| `LLMAdapterFactory`          | `apps/desktop/src/main/services/ai/LLMAdapterFactory.ts`          | 要確認（現時点では未確認） |

**実装前に必ず実行すること**:

```bash
ls apps/desktop/src/main/services/ai/
```

上記パスが存在しない場合、Task01 が未実装と判断し、フォールバック戦略（5-B）を採用する。

### 5-B. Task01 未実装時のフォールバック戦略

Task01 が未実装の場合、以下の暫定インターフェースで代替する（実装本体は Task01 完了後に置換）。

**暫定 `AIAccessCapabilityResolver` インターフェース（仮定義）**:

```typescript
// apps/desktop/src/main/handlers/chatEditHandlers.ts 内にローカル仮定義
type AIAccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

interface AIAccessCapabilityResolver {
  resolve(surfaceId: string): Promise<AIAccessCapability>;
}

// 暫定実装（常に CAPABILITY_UNAVAILABLE を返す）
const fallbackCapabilityResolver: AIAccessCapabilityResolver = {
  resolve: async () => "none",
};
```

**暫定 `AIRuntimeResolver` インターフェース（仮定義）**:

```typescript
interface ResolvedRuntime {
  adapter: LLMAdapter;
  providerId: string;
  modelId: string;
}

interface AIRuntimeResolver {
  resolve(options?: {
    providerId?: string;
    modelId?: string;
  }): Promise<
    | { success: true; data: ResolvedRuntime }
    | { success: false; error: { code: string; message: string } }
  >;
}

// 暫定実装（常に PROVIDER_UNKNOWN を返す）
const fallbackRuntimeResolver: AIRuntimeResolver = {
  resolve: async () => ({
    success: false,
    error: {
      code: "PROVIDER_UNKNOWN",
      message: "AIRuntimeResolver is not yet implemented (Task01 pending)",
    },
  }),
};
```

フォールバック戦略採用時は、`registerChatEditHandlers` の `{ capabilityResolver, runtimeResolver }` に上記暫定実装を渡す。stub とは異なり、fail-fast エラーを返す設計なので「silent stub fallback 禁止」ルールに準拠している。

---

## 6. 実装リスクと対策

### リスク 1: Task01 未実装によるブロッキング

| 項目   | 内容                                                                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | `AIRuntimeResolver` / `AIAccessCapabilityResolver` が Task01 で未実装のため、本タスクがブロックされる                                                             |
| 影響度 | 高（フェーズ C・D の中核実装が依存）                                                                                                                              |
| 緩和策 | 5-B のフォールバック戦略を採用し、暫定インターフェースで実装を進める。Task01 完了後に import 先を切り替えるだけで動作するよう、インターフェース契約を先に確立する |

### リスク 2: P31 パターン（Zustand 無限ループ）

| 項目   | 内容                                                                                                                                                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | `setCapability` / `setSelection` / `setHandoffContext` アクションを `useEffect` の依存配列に含めると P31 パターンの無限ループが発生する                                                                                                |
| 影響度 | 中（Settings 画面無限ローディングと同種の問題）                                                                                                                                                                                        |
| 緩和策 | `setCapability` 等は Zustand の個別アクションセレクタ（`useSetCapability()` 相当）として取得する。`ai:capability-changed` の購読は空依存配列の `useEffect` で一度だけ登録し、cleanup で unsubscribe する（P31 対策コメント付きで実装） |

### リスク 3: P48 パターン（non-null assertion）

| 項目   | 内容                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | `runtimeResolver.resolve()` の戻り値や `capabilityResolver.resolve()` の結果に non-null assertion（`!`）を使うと、実行時エラーが発生する                            |
| 影響度 | 中（デバッグが困難）                                                                                                                                                |
| 緩和策 | Task01 の resolver を呼び出す箇所では必ず戻り値を `success` / `data` / `error` パターンでガードする。`Array.isArray()` / `optional chaining` を使用する（P48 対策） |

### リスク 4: IPC 契約ドリフト（P44 / P45 パターン）

| 項目   | 内容                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | `handleSendWithContext` のシグネチャ変更後に Preload 側の `sendWithContext` 呼び出し形式と乖離する                                                                                            |
| 影響度 | 高（ランタイムで初めて顕在化する）                                                                                                                                                            |
| 緩和策 | `chatEditApi.ts` の `sendWithContext` と `handleSendWithContext` の引数形式が一致していることを実装直後に `ipc-contract-checklist.md` の Phase 1-6 で確認する（04-electron-security.md 準拠） |

### リスク 5: `exposeChatEditAPI` の contextBridge 未対応

| 項目   | 内容                                                                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | 現状の `exposeChatEditAPI` は `window` に直接代入しており、`contextIsolation: true` 環境で意図通りに動作しない可能性がある                                           |
| 影響度 | 高（Renderer から `window.chatEditAPI` が undefined になる）                                                                                                         |
| 緩和策 | Preload entry point（`apps/desktop/src/preload/index.ts`）の既存 `contextBridge.exposeInMainWorld` 呼び出しパターンを確認し、同一パターンで `chatEditAPI` を公開する |

### リスク 6: `buildPrompt` デッドコードの重複

| 項目   | 内容                                                                                                                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | `chatEditHandlers.ts` の `buildPrompt` 関数（handler 層）と `ChatEditService.buildPrompt` が重複しており、どちらを削除すべきか混乱する                                                                                             |
| 影響度 | 低（型エラーは発生しないが、保守性が下がる）                                                                                                                                                                                       |
| 緩和策 | handler 層の `buildPrompt`（フリー関数）を削除し、`ChatEditService.buildPrompt` に一本化する。`ChatEditService.sendWithContext` が adapter を引数として受け取るようになるため、handler から `buildPrompt` を直接呼ぶ必要がなくなる |

### リスク 7: error sanitization の実装漏れ（P55 パターン）

| 項目   | 内容                                                                                                                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | LLM API エラーメッセージや credential 関連エラーにファイルパスや API key が含まれ、Renderer に漏洩する                                                                                                                                                           |
| 影響度 | 高（セキュリティリスク）                                                                                                                                                                                                                                         |
| 緩和策 | `handleSendWithContext` のエラーを Renderer に返す前に sanitize する。`escapeRegExp()` でパスをマスクする（P55 対策）。Renderer への返却は `{ code, message, retryable, reason, guidance }` のみとし、スタックトレースを含めない（04-electron-security.md 準拠） |

---

## 付録: 変更影響サマリー

| ファイルパス                                                                    | 変更種別       | 変更規模                              | MINOR 対応         |
| ------------------------------------------------------------------------------- | -------------- | ------------------------------------- | ------------------ |
| `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`         | 修正           | 中（型追加・フィールド追加）          | MINOR-01           |
| `apps/desktop/src/main/services/chat-edit/types.ts`                             | 修正           | 小（re-export 追加）                  | -                  |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | 修正           | 大（中核実装）                        | MINOR-01, MINOR-05 |
| `apps/desktop/src/main/ipc/index.ts`                                            | 修正           | 小（stub 削除・シグネチャ変更）       | -                  |
| `apps/desktop/src/preload/chatEditApi.ts`                                       | 修正           | 中（メソッド追加・引数追加）          | MINOR-02           |
| `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | 修正           | 中（フィールド追加・window 参照除去） | -                  |
| `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useDiffApply.ts`  | 修正           | 中（writeFile 移動）                  | -                  |
| グローバル型定義（window.d.ts 等）                                              | 修正または新規 | 小（Window 拡張）                     | -                  |
| `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`                   | 修正           | 小（constructor DI 変更）             | -                  |
