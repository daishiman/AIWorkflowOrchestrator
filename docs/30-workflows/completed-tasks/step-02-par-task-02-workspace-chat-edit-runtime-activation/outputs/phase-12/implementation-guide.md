# Task02 実装ガイド - Workspace Chat Edit Runtime

## Part 1: 中学生向けの説明（なぜ必要か）

### なぜ必要か

この機能は、コード編集を AI に頼むときに「使える状態」と「使えない状態」を間違えないために必要です。  
使えないのに黙って失敗すると、ユーザーは何が悪いか分かりません。だから最初に状態を確認して、使えなければ「次に何をするか」を案内します。

### 何をするか

- 使えるとき: そのまま AI で編集案を作る
- 使えないとき: 設定を確認するか、terminal へ引き継ぐ
- 危ない操作を防ぐ: ワークスペース外ファイルへのアクセスを拒否する

### 日常の例え

図書室で本を借りる流れに似ています。

- 司書に本を頼む前に「貸出カードがあるか」を確認する
- カードがなければ「カードを作る窓口」を案内する
- 閉館中なら「明日来る」か「別の窓口へ行く」を案内する

この機能でも同じで、実行前に状態をチェックして、次の行動を必ず示します。

## Part 2: 開発者向けの詳細

### 1. TypeScript 型定義

```typescript
export type AIAccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

export interface HandoffContext {
  contextSummary: string;
  suggestedCommand: string;
  fileList: string[];
  selectionInfo: string | null;
}

export interface SendError {
  code:
    | "CONTEXT_TOO_LARGE"
    | "INVALID_COMMAND"
    | "INVALID_SELECTION"
    | "CAPABILITY_UNAVAILABLE"
    | "CREDENTIAL_MISSING"
    | "PROVIDER_UNKNOWN"
    | "ADAPTER_CREATION_FAILED"
    | "PERMISSION_DENIED"
    | "LLM_ERROR";
  message: string;
  retryable: boolean;
  guidance?: string;
  handoffContext?: HandoffContext;
}
```

### 2. APIシグネチャ

```typescript
// Main handler registration
registerChatEditHandlers(
  mainWindow: BrowserWindow,
  contextBuilder: ContextBuilder,
  resolvers?: {
    capabilityResolver?: AIAccessCapabilityResolver;
    runtimeResolver?: AIRuntimeResolver;
  }
): void

// Service
sendWithContext(
  request: SendWithContextRequest,
  adapter: LLMAdapter
): Promise<SendWithContextResponse>

// Preload bridge
window.chatEditAPI.sendWithContext(
  request: SendWithContextRequest
): Promise<SendWithContextResponse>
```

### 3. 使用例

```ts
const response = await window.chatEditAPI.sendWithContext({
  contexts: [
    {
      filePath: "/workspace/src/app.ts",
      content: "export const app = true;",
      language: "typescript",
    },
  ],
  command: {
    type: "refactor",
    targetContextId: "/workspace/src/app.ts",
  },
  message: "型安全にリファクタして",
  selection: {
    startLine: 1,
    startColumn: 1,
    endLine: 1,
    endColumn: 20,
    selectedText: "export const app = true;",
  },
  workspacePath: "/workspace",
});

if (!response.success && response.error?.code === "CAPABILITY_UNAVAILABLE") {
  console.log(response.error.handoffContext?.suggestedCommand);
}
```

```bash
# Phase 11 screenshot capture
node apps/desktop/scripts/capture-task-ai-runtime-chat-edit-phase11.mjs
```

### 4. エラーハンドリング

- sender 検証失敗時は `PERMISSION_DENIED` を返す。
- runtime 未解決時は `PROVIDER_UNKNOWN` / `CREDENTIAL_MISSING` / `ADAPTER_CREATION_FAILED` を返す。
- capability が `none` / `terminalSurface` の場合は `CAPABILITY_UNAVAILABLE` + `handoffContext` を返す。
- 例外メッセージは `sanitizeErrorMessage` でホームパスや API key をマスクする。

### 5. エッジケース

- `contexts` が空配列: `CONTEXT_TOO_LARGE`（入力不正扱い）
- `refactor` / `generate-test` で selection なし: `INVALID_SELECTION`
- 絶対パスでない filePath: `PERMISSION_DENIED`
- `workspacePath` 外アクセス: `PERMISSION_DENIED`
- Task01 resolver 未接続: fallback により `CAPABILITY_UNAVAILABLE` または `PROVIDER_UNKNOWN`

### 6. 設定項目または定数一覧

| 定数                | 値    | 役割                   |
| ------------------- | ----- | ---------------------- |
| `MAX_FILE_SIZE`     | 10MB  | read-file 上限         |
| `MAX_CONTEXT_SIZE`  | 100KB | send-with-context 上限 |
| `MAX_FILE_CONTEXTS` | 10    | 添付可能ファイル数     |

| 設定項目        | 役割                                  |
| --------------- | ------------------------------------- |
| `workspacePath` | path 境界の検証対象                   |
| `modelId`       | runtime resolver で使用するモデル指定 |
| `createBackup`  | write-file 時のバックアップ作成フラグ |
