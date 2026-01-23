---
id: TASK-3-1-C
tier: 1
title: PermissionRequest Hook 統合
phase: 3
depends_on: [TASK-3-1-B, TASK-3-2]
parallel_with: []
blocks: [TASK-4-2]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, service, sdk-integration, permission]
---

# PermissionRequest Hook 統合

## 概要

Claude Agent SDK の PermissionRequest Hook を使用して、ユーザー権限確認フローを実装する。
Renderer Process への権限リクエスト送信と、ユーザー応答の待機・処理を含む。

## 入力

- TASK-3-1-B で作成した Hooks 実装
- TASK-3-2 で作成した PermissionResolver

## 出力

- `SkillExecutor.ts` への PermissionRequest Hook 追加

## 実装詳細

### PermissionRequest Hook

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts に追加

import { SKILL_CHANNELS } from "../../../shared/ipc/channels";
import { PermissionResolver } from "./PermissionResolver";

export class SkillExecutor {
  private permissionResolver: PermissionResolver;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.permissionResolver = new PermissionResolver();
  }

  // Hooksを作成（PermissionRequest追加）
  private createHooks(executionId: string) {
    return {
      PreToolUse: async (input, _toolUseId, _context) => {
        // ... 既存のコード ...
      },

      PostToolUse: async (input, toolUseId, _context) => {
        // ... 既存のコード ...
      },

      PermissionRequest: async (
        input: { toolName: string; args: Record<string, unknown> },
        toolUseId: string,
        context: { signal: AbortSignal },
      ) => {
        const requestId = uuidv4();

        // 権限確認待機中を通知
        this.sendStream({
          executionId,
          type: "status",
          content: {
            status: "tool_executing",
            detail: `${input.toolName} の実行に権限が必要です`,
          },
          timestamp: Date.now(),
        });

        // Renderer に権限リクエストを送信
        this.mainWindow.webContents.send(
          SKILL_CHANNELS.SKILL_PERMISSION_REQUEST,
          {
            executionId,
            requestId,
            toolName: input.toolName,
            args: this.sanitizeArgs(input.args),
            reason: this.getPermissionReason(input.toolName, input.args),
          },
        );

        try {
          // ユーザー応答を待機
          const response = await this.permissionResolver.waitForResponse(
            requestId,
            context.signal,
            30000, // 30秒タイムアウト
          );

          if (response.approved) {
            this.sendStream({
              executionId,
              type: "status",
              content: {
                status: "tool_executing",
                detail: `${input.toolName} の実行が許可されました`,
              },
              timestamp: Date.now(),
            });
            return { proceed: true };
          } else {
            this.sendStream({
              executionId,
              type: "status",
              content: {
                status: "tool_completed",
                detail: `${input.toolName} の実行が拒否されました`,
              },
              timestamp: Date.now(),
            });
            return {
              proceed: false,
              message: response.rejectReason || "ユーザーにより拒否されました",
            };
          }
        } catch (error) {
          // タイムアウトまたはキャンセル
          return {
            proceed: false,
            message: "権限確認がタイムアウトしました",
          };
        }
      },
    };
  }

  // 権限応答を処理
  handlePermissionResponse(
    requestId: string,
    approved: boolean,
    rememberChoice?: boolean,
    rejectReason?: string,
  ): void {
    this.permissionResolver.resolve(requestId, {
      requestId,
      approved,
      rememberChoice,
      rejectReason,
    });
  }

  // 引数をサニタイズ（機密情報を除去）
  private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...args };

    // 長すぎるコンテンツを省略
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === "string" && value.length > 500) {
        sanitized[key] = value.substring(0, 500) + "... (省略)";
      }
    }

    return sanitized;
  }

  // 権限リクエストの理由を生成
  private getPermissionReason(
    toolName: string,
    args: Record<string, unknown>,
  ): string {
    switch (toolName) {
      case "Bash": {
        const command = (args.command as string) || "";
        return `コマンドを実行: ${command.substring(0, 100)}`;
      }
      case "Write": {
        const path = (args.file_path as string) || (args.path as string) || "";
        return `ファイルを作成: ${path}`;
      }
      case "Edit": {
        const path = (args.file_path as string) || (args.path as string) || "";
        return `ファイルを編集: ${path}`;
      }
      default:
        return `${toolName} を実行`;
    }
  }
}
```

### IPCチャネル定義（追加）

```typescript
// packages/shared/src/ipc/channels.ts に追加

export const SKILL_CHANNELS = {
  SKILL_LIST: "skill:list",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_EXECUTE: "skill:execute",
  SKILL_ABORT: "skill:abort",
  SKILL_STREAM: "skill:stream",
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;
```

## ファイル

| 操作 | パス                                                    |
| ---- | ------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| 修正 | `packages/shared/src/ipc/channels.ts`                   |

## 完了条件

- [ ] PermissionRequest Hook が実装されている
- [ ] 権限リクエストが Renderer に送信される
- [ ] ユーザー応答を待機できる
- [ ] 承認時に実行が続行される
- [ ] 拒否時に実行が停止される
- [ ] タイムアウト処理が機能する
- [ ] 機密情報がサニタイズされる

## テスト要件

```typescript
describe("SkillExecutor - PermissionRequest", () => {
  it("should send permission request to renderer");
  it("should wait for user response");
  it("should proceed when approved");
  it("should stop when rejected");
  it("should handle timeout");
  it("should sanitize sensitive args");
  it("should generate appropriate reason messages");
});
```

## 参考資料

- SDK Reference: `~/.claude/skills/claude-agent-sdk/references/permission-control.md`
