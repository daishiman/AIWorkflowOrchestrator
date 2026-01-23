---
id: TASK-3-1-A
tier: 1
title: SDK query() 基本実装
phase: 3
depends_on: [TASK-2A, TASK-2C]
parallel_with: []
blocks: [TASK-3-1-B]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, service, sdk-integration]
---

# SDK query() 基本実装

## 概要

Claude Agent SDK の `query()` API を使用してスキルを実行する基本構造を実装する。
ストリーミング処理とAbort機能を含む。

## 入力

- TASK-1-1 の型定義
- TASK-2A の SkillScanner
- TASK-2C のセキュリティパターン
- Claude Agent SDK v0.1.73+

## 出力

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` (基本構造)

## 実装詳細

### クラス基本構造

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

import { query } from "@anthropic-ai/claude-agent-sdk";
import { v4 as uuidv4 } from "uuid";
import type { BrowserWindow } from "electron";
import type {
  SkillMetadata,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillStreamMessage,
} from "@repo/shared";

export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, AbortController> = new Map();

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  // スキルを実行
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse> {
    const executionId = uuidv4();
    const abortController = new AbortController();

    this.activeExecutions.set(executionId, abortController);

    try {
      // プロンプト構築
      const prompt = await this.buildPrompt(request.prompt, skill);

      // SDK query() 呼び出し
      const conversation = query({
        prompt,
        options: {
          tools: skill.allowedTools || ["Read", "Edit", "Bash", "Glob", "Grep"],
          permissionMode: "default",
          signal: abortController.signal,
        },
      });

      // ストリーミング処理
      for await (const message of conversation.stream()) {
        if (abortController.signal.aborted) break;
        await this.handleStreamMessage(executionId, message);
      }

      return { executionId, success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { executionId, success: false, error: errorMessage };
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  // 実行を中止
  abort(executionId: string): boolean {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort();
      this.activeExecutions.delete(executionId);
      return true;
    }
    return false;
  }

  // スキルプロンプトを構築
  private async buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string> {
    const contextInfo = this.buildContextInfo(skill);
    return `${contextInfo}\n\n## ユーザーリクエスト\n\n${userPrompt}`;
  }

  // コンテキスト情報を構築
  private buildContextInfo(skill: SkillMetadata): string {
    const lines = [
      `# スキル: ${skill.name}`,
      `## 説明: ${skill.description}`,
      "",
      "## 利用可能なリソース",
    ];

    if (skill.agents.length > 0) {
      lines.push(`- サブエージェント: ${skill.agents.length}個`);
    }
    if (skill.references.length > 0) {
      lines.push(`- 参照資料: ${skill.references.length}個`);
    }

    return lines.join("\n");
  }

  // ストリームメッセージを処理（基本実装）
  private async handleStreamMessage(
    executionId: string,
    message: unknown,
  ): Promise<void> {
    // 型に応じてメッセージを変換・送信
    const streamMessage = this.convertToStreamMessage(executionId, message);
    if (streamMessage) {
      this.sendStream(streamMessage);
    }
  }

  // SDKメッセージをStreamMessageに変換
  private convertToStreamMessage(
    executionId: string,
    message: unknown,
  ): SkillStreamMessage | null {
    // 基本的な変換ロジック（詳細は後続タスクで拡張）
    const msg = message as {
      type?: string;
      message?: unknown;
      event?: unknown;
    };

    if (msg.type === "assistant" && msg.message) {
      return {
        executionId,
        type: "assistant",
        content: { text: String(msg.message) },
        timestamp: Date.now(),
      };
    }

    return null;
  }

  // ストリームメッセージを送信
  private sendStream(message: SkillStreamMessage): void {
    this.mainWindow.webContents.send("skill:stream", message);
  }
}
```

## ファイル

| 操作 | パス                                                    |
| ---- | ------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

## 依存パッケージ

```bash
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk uuid
pnpm --filter @repo/desktop add -D @types/uuid
```

## 完了条件

- [ ] `SkillExecutor` クラスの基本構造が実装されている
- [ ] `execute()` がスキルを実行できる
- [ ] `abort()` が実行を中止できる
- [ ] Claude Agent SDK の `query()` API が統合されている
- [ ] `stream()` メソッドでストリーミング処理が実装されている
- [ ] AbortController によるキャンセルが機能する

## テスト要件

```typescript
describe("SkillExecutor - 基本機能", () => {
  it("should execute skill and return execution ID");
  it("should abort execution when abort() is called");
  it("should clean up after execution completes");
  it("should handle SDK errors gracefully");
});
```

## 参考資料

- SDK Reference（以下の両パスをスキャン）:
  - `~/.aiworkflow/skills/claude-agent-sdk/references/query-api.md` （アプリ独自、読み書き）
  - `~/.claude/skills/claude-agent-sdk/references/query-api.md` （Claude CLI、読み取り専用）
