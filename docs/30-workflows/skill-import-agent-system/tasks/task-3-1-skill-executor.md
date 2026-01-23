---
id: TASK-3-1
tier: 1
title: SkillExecutor 実装
phase: 3
depends_on: [TASK-2A, TASK-2C]
parallel_with: [TASK-3-2]
blocks: [TASK-4-2]
status: split
priority: high
estimated_complexity: large
tags: [backend, main-process, service, sdk-integration]
---

# SkillExecutor 実装

> **⚠️ このタスクは分割されました**
>
> 実行粒度を細かくするため、以下のサブタスクに分割されています：
>
> - [TASK-3-1-A: SDK query()基本実装](./task-3-1-a-sdk-query.md) - SkillExecutorクラスの基本構造
> - [TASK-3-1-B: Hooks実装](./task-3-1-b-hooks.md) - PreToolUse/PostToolUseフック
> - [TASK-3-1-C: PermissionRequest Hook](./task-3-1-c-permission-request.md) - 権限確認UI連携
>
> 以下は参照用の元仕様です。

---

## 概要

Claude Agent SDK を使用してスキルを実行するサービスクラスを実装する。
ストリーミング処理、権限確認、セキュリティチェックを含む。

## 入力

- TASK-1-1 の型定義
- TASK-2A の SkillScanner
- TASK-2C のセキュリティパターン
- Claude Agent SDK v0.1.73+

## 出力

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- 単体テストファイル

## 実装詳細

### クラス構造

```typescript
export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private permissionResolver: PermissionResolver;
  private activeExecutions: Map<string, AbortController> = new Map();

  constructor(mainWindow: BrowserWindow);

  // スキルを実行
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse>;

  // 実行を中止
  abort(executionId: string): void;

  // 権限応答を処理
  handlePermissionResponse(response: PermissionResponse): void;

  // スキルプロンプトを構築
  private async buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string>;

  // コンテキスト情報を構築
  private buildContextInfo(skill: SkillMetadata): string;

  // Hooksを作成
  private createHooks(executionId: string): SDKHooks;

  // ストリームメッセージを処理
  private async handleStreamMessage(
    executionId: string,
    message: SDKMessage,
  ): Promise<void>;

  // ストリームメッセージを送信
  private sendStream(message: SkillStreamMessage): void;

  // 保護パスかどうかを判定
  private isProtectedPath(filePath: string): boolean;

  // エラーカテゴリを判定
  private categorizeError(error: unknown): ErrorMessageContent["code"];

  // リトライ可能かどうかを判定
  private isRetryable(error: unknown): boolean;
}
```

### SDK統合仕様

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const conversation = query({
  prompt: buildSkillPrompt(skill, userInput),
  options: {
    tools: skill.allowedTools || ["Read", "Edit", "Bash", "Glob", "Grep"],
    hooks: createHooks(),
    permissionMode: "default",
  },
});

// v0.1.72以降: stream() メソッドを使用
for await (const message of conversation.stream()) {
  if (abortController.signal.aborted) break;

  switch (message.type) {
    case "assistant":
      handleAssistantMessage(message.message);
      break;
    case "result":
      handleToolResult(message.message);
      break;
    case "stream_event":
      handleStreamEvent(message.event);
      break;
  }
}
```

### Hooks実装

```typescript
private createHooks(executionId: string): SDKHooks {
  return {
    PreToolUse: async (input, _toolUseId, _context) => {
      // 危険コマンドチェック
      if (input.toolName === "Bash") {
        const command = (input.args.command as string) || "";
        if (isDangerousCommand(command)) {
          return {
            proceed: false,
            message: `危険なコマンドをブロック: ${command}`,
          };
        }
      }

      // 保護パスチェック
      if (input.toolName === "Write" || input.toolName === "Edit") {
        const filePath = (input.args.path as string) || "";
        if (isProtectedPath(filePath)) {
          return {
            proceed: false,
            message: `保護されたパスへの書き込みをブロック: ${filePath}`,
          };
        }
      }

      return { proceed: true };
    },

    PostToolUse: async (input, _toolUseId, _context) => {
      this.sendStream({
        executionId,
        type: "status",
        content: { status: "tool_completed", detail: input.toolName },
        timestamp: Date.now(),
      });
      return {};
    },

    PermissionRequest: async (input, _toolUseId, context) => {
      const requestId = uuidv4();

      this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, {
        executionId,
        requestId,
        toolName: input.toolName,
        args: input.args,
      });

      const response = await this.permissionResolver.waitForResponse(
        requestId,
        context.signal
      );

      return {
        proceed: response.approved,
        message: response.rejectReason,
      };
    },
  };
}
```

## ファイル

| 操作 | パス                                                                   |
| ---- | ---------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` |
| 修正 | `apps/desktop/src/main/services/skill/index.ts`                        |

## 依存パッケージ

```bash
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk uuid
pnpm --filter @repo/desktop add -D @types/uuid
```

## 完了条件

- [ ] `SkillExecutor` クラスが実装されている
- [ ] `execute()` がスキルを実行しストリーミングを返す
- [ ] `abort()` が実行を中止する
- [ ] Claude Agent SDK の `query()` API が統合されている
- [ ] `stream()` メソッドでストリーミング処理が実装されている
- [ ] PreToolUse Hook で危険コマンド・保護パスがブロックされる
- [ ] PostToolUse Hook でツール完了が通知される
- [ ] PermissionRequest Hook で権限確認がUIに連携される
- [ ] エラーハンドリングが実装されている
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("SkillExecutor", () => {
  describe("execute", () => {
    it("should execute skill and return streaming messages");
    it("should abort execution when abort() is called");
    it("should handle SDK errors gracefully");
  });

  describe("createHooks", () => {
    describe("PreToolUse", () => {
      it("should block dangerous bash commands");
      it("should block protected path writes");
      it("should allow safe operations");
    });

    describe("PostToolUse", () => {
      it("should send tool completion notification");
    });

    describe("PermissionRequest", () => {
      it("should send permission request to renderer");
      it("should wait for user response");
      it("should handle timeout");
    });
  });

  describe("buildPrompt", () => {
    it("should include SKILL.md content");
    it("should include context info");
    it("should include user prompt");
  });
});
```

### モック

- Claude Agent SDK をモック化
- BrowserWindow をモック化

## 参考資料

- [specification.md - 5.7 SkillExecutor実装仕様](../specification.md)
- [specification.md - 5.2 Claude Agent SDK統合仕様](../specification.md)
- SDK Reference（以下の両パスをスキャン）:
  - `~/.aiworkflow/skills/claude-agent-sdk/references/query-api.md` （アプリ独自、読み書き）
  - `~/.claude/skills/claude-agent-sdk/references/query-api.md` （Claude CLI、読み取り専用）
