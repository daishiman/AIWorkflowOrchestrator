---
id: TASK-3-1-B
tier: 1
title: Hooks実装（PreToolUse/PostToolUse）
phase: 3
depends_on: [TASK-3-1-A]
parallel_with: []
blocks: [TASK-3-1-C]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, service, sdk-integration, hooks]
---

# Hooks実装（PreToolUse/PostToolUse）

## 概要

Claude Agent SDK の Hooks システムを使用して、ツール実行前後の処理を実装する。
危険コマンドのブロック、保護パスへのアクセス制限、ツール完了通知を含む。

## 入力

- TASK-3-1-A で作成した SkillExecutor 基本構造
- TASK-2C のセキュリティパターン

## 出力

- `SkillExecutor.ts` への Hooks 追加

## 実装詳細

### Hooks作成メソッド

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts に追加

import { isDangerousCommand, isProtectedPath } from "./SecurityPatterns";

// 既存のクラスに追加
export class SkillExecutor {
  // ... 既存のコード ...

  // Hooksを作成
  private createHooks(executionId: string) {
    return {
      PreToolUse: async (
        input: { toolName: string; args: Record<string, unknown> },
        _toolUseId: string,
        _context: { signal: AbortSignal },
      ) => {
        // 危険コマンドチェック
        if (input.toolName === "Bash") {
          const command = (input.args.command as string) || "";
          if (isDangerousCommand(command)) {
            this.sendStream({
              executionId,
              type: "status",
              content: {
                status: "tool_completed",
                detail: `危険なコマンドをブロック: ${command.substring(0, 50)}...`,
              },
              timestamp: Date.now(),
            });
            return {
              proceed: false,
              message: `危険なコマンドをブロックしました: ${command}`,
            };
          }
        }

        // 保護パスチェック
        if (input.toolName === "Write" || input.toolName === "Edit") {
          const filePath =
            (input.args.path as string) ||
            (input.args.file_path as string) ||
            "";
          if (isProtectedPath(filePath)) {
            this.sendStream({
              executionId,
              type: "status",
              content: {
                status: "tool_completed",
                detail: `保護パスへの書き込みをブロック: ${filePath}`,
              },
              timestamp: Date.now(),
            });
            return {
              proceed: false,
              message: `保護されたパスへの書き込みをブロックしました: ${filePath}`,
            };
          }
        }

        // ツール実行開始を通知
        this.sendStream({
          executionId,
          type: "tool_use",
          content: {
            toolName: input.toolName,
            args: input.args,
            toolUseId: _toolUseId,
          },
          timestamp: Date.now(),
        });

        return { proceed: true };
      },

      PostToolUse: async (
        input: { toolName: string; result?: unknown },
        toolUseId: string,
        _context: { signal: AbortSignal },
      ) => {
        // ツール完了を通知
        this.sendStream({
          executionId,
          type: "tool_result",
          content: {
            toolUseId,
            success: true,
            result: input.result,
          },
          timestamp: Date.now(),
        });

        this.sendStream({
          executionId,
          type: "status",
          content: {
            status: "tool_completed",
            detail: input.toolName,
          },
          timestamp: Date.now(),
        });

        return {};
      },
    };
  }

  // execute() を更新してhooksを使用
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse> {
    const executionId = uuidv4();
    const abortController = new AbortController();

    this.activeExecutions.set(executionId, abortController);

    try {
      const prompt = await this.buildPrompt(request.prompt, skill);
      const hooks = this.createHooks(executionId);

      const conversation = query({
        prompt,
        options: {
          tools: skill.allowedTools || ["Read", "Edit", "Bash", "Glob", "Grep"],
          hooks, // Hooks を追加
          permissionMode: "default",
          signal: abortController.signal,
        },
      });

      // 開始通知
      this.sendStream({
        executionId,
        type: "status",
        content: { status: "started" },
        timestamp: Date.now(),
      });

      for await (const message of conversation.stream()) {
        if (abortController.signal.aborted) break;
        await this.handleStreamMessage(executionId, message);
      }

      // 完了通知
      this.sendStream({
        executionId,
        type: "status",
        content: { status: "completed" },
        timestamp: Date.now(),
      });

      return { executionId, success: true };
    } catch (error) {
      // エラー通知
      this.sendStream({
        executionId,
        type: "error",
        content: {
          code: this.categorizeError(error),
          message: error instanceof Error ? error.message : String(error),
          retryable: this.isRetryable(error),
        },
        timestamp: Date.now(),
      });

      return {
        executionId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  // エラーカテゴリを判定
  private categorizeError(
    error: unknown,
  ): "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown" {
    if (error instanceof Error) {
      if (error.name === "AbortError") return "timeout";
      if (error.message.includes("permission")) return "permission_denied";
      if (error.message.includes("network") || error.message.includes("fetch"))
        return "network";
      if (error.message.includes("SDK") || error.message.includes("API"))
        return "sdk_error";
    }
    return "unknown";
  }

  // リトライ可能かどうかを判定
  private isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      // ネットワークエラーやタイムアウトはリトライ可能
      if (
        error.message.includes("network") ||
        error.message.includes("timeout") ||
        error.message.includes("ECONNRESET")
      ) {
        return true;
      }
    }
    return false;
  }
}
```

## ファイル

| 操作 | パス                                                    |
| ---- | ------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

## 完了条件

- [ ] PreToolUse Hook で危険コマンドがブロックされる
- [ ] PreToolUse Hook で保護パスへの書き込みがブロックされる
- [ ] PostToolUse Hook でツール完了が通知される
- [ ] ツール実行開始/完了がストリームに送信される
- [ ] エラーカテゴリが正しく判定される

## テスト要件

```typescript
describe("SkillExecutor - Hooks", () => {
  describe("PreToolUse", () => {
    it("should block dangerous bash commands");
    it("should block rm -rf commands");
    it("should block protected path writes");
    it("should allow safe operations");
    it("should send tool_use message on proceed");
  });

  describe("PostToolUse", () => {
    it("should send tool_result message");
    it("should send tool_completed status");
  });

  describe("Error handling", () => {
    it("should categorize network errors");
    it("should categorize timeout errors");
    it("should identify retryable errors");
  });
});
```

## 参考資料

- SDK Reference: `~/.claude/skills/claude-agent-sdk/references/hooks-system.md`
