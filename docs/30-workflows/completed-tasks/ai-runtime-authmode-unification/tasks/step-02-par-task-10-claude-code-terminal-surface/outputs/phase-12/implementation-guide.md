# 実装ガイド: Claude Code Terminal Surface

## Part 1

### なぜ必要か

この機能が必要なのは、アプリ内で自動実行する AI と、ユーザーが terminal で手動実行する Claude Code を混ぜると、
「勝手にコマンドが送られるのでは」という不信感とセキュリティリスクが同時に増えるためです。

日常の例えで言うと、
「店員が勝手に注文を確定するレジ」と「自分で確認してから注文するレジ」が混在している状態です。
どちらのレジかが曖昧だと、ユーザーは安心して操作できません。

このタスクでは、Claude Code を「ユーザーが操作する manual terminal surface」と定義し、
`no auto-send` と `credential 非中継` を必須境界として固定します。

### 何をするか

1. terminal launch / transcript / unavailable guidance / manual share の状態を明文化する
2. screen evidence（TC-11-01〜06）を current workflow 配下へ残す
3. system spec に runtime/auth-mode 契約と task ledger を同期する

## Part 2

### TypeScript 型定義

```ts
export type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };

export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

export interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
  handoff?: boolean;
  guidance?: HandoffGuidance;
}
```

### APIシグネチャ

```ts
// Main IPC handler registration
registerChatEditHandlers(
  mainWindow: BrowserWindow,
  contextBuilder: ContextBuilder,
  fileService: FileService,
  runtimeResolver: RuntimeResolver,
): void

// Runtime resolution
runtimeResolver.resolve(): Promise<RuntimeResolution>
```

### 使用例

```ts
const response = await window.chatEditAPI.sendWithContext({
  contexts,
  command: { type: "refactor", targetContextId: "ctx-1" },
  workspacePath,
});

if (response.handoff && response.guidance) {
  // terminal で続行（アプリは自動送信しない）
  console.log(response.guidance.terminalCommand);
}
```

### エラーハンドリング

- `PERMISSION_DENIED`: `workspacePath` 外のファイルを contexts に含めた場合
- `ACCESS_NOT_CONFIGURED`: API key 未設定で integrated 実行できない場合（handoff へ遷移）
- `SELECTION_REQUIRED`: 選択範囲必須の command に selection が無い場合
- sender 検証失敗時は `toIPCValidationError` を throw して fail-fast

### エッジケース

- `message` が未指定でも default prompt を組み立てて handoff guidance を返す
- `workspacePath` 未指定時はパス制約検証をスキップし後方互換を維持する
- `authMode=subscription` では integrated 実行せず常に handoff
- `authMode=api-key` でも key 未設定なら handoff

### 設定項目または定数一覧

| 項目              | 値/型                   | 用途                            |
| ----------------- | ----------------------- | ------------------------------- |
| model             | `claude-sonnet-4-6`     | integrated 実行時の既定モデル   |
| max_tokens        | `4096`                  | Anthropic 呼び出し上限          |
| MAX_CONTEXT_SIZE  | `100KB`                 | context 過大入力防止            |
| MAX_FILE_CONTEXTS | `10`                    | 添付ファイル上限                |
| captureMode       | `fallback-review-board` | Phase 11証跡の代替 capture 方式 |
