# Phase 5: 実装（TDD Green） - TASK-3-1-B Hooks実装

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装（TDD Green）     |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-25            |
| 機能名     | TASK-3-1-B Hooks実装  |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

TASK-3-1-Aで作成した`SkillExecutor`クラスに、Hooks機能（`createHooks`、`categorizeError`、`isRetryable`）を追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: セキュリティ関数のインポート追加

**目的**: TASK-2Cで実装したセキュリティ関数をインポートする

**実行手順**:

1. `SkillExecutor.ts` を開く
2. `@repo/shared/constants` からセキュリティ関数をインポート
3. インポートエラーがないことを確認

**期待される成果物**:

- インポート文の追加

#### 実装コード

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

// 既存のインポートに追加
import { isDangerousCommand, isProtectedPath } from "@repo/shared/constants";
```

---

### タスク2: createHooks メソッドの実装

**目的**: PreToolUse / PostToolUse Hooks を生成するメソッドを実装する

**実行手順**:

1. `createHooks` メソッドのシグネチャを追加
2. PreToolUse Hook の実装を追加
3. PostToolUse Hook の実装を追加

**期待される成果物**:

- `createHooks` メソッドの実装

#### 実装コード

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

export class SkillExecutor {
  // ... 既存のプロパティとメソッド ...

  /**
   * Hooksを作成
   * @param executionId 実行ID
   * @returns PreToolUse / PostToolUse Hooks オブジェクト
   */
  private createHooks(executionId: string) {
    return {
      PreToolUse: async (
        input: { toolName: string; args: Record<string, unknown> },
        toolUseId: string,
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
            toolUseId,
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
}
```

---

### タスク3: execute メソッドの更新

**目的**: execute メソッドで Hooks を使用するように更新する

**実行手順**:

1. `execute` メソッド内で `createHooks` を呼び出す
2. SDK `query()` に hooks オプションを追加
3. 開始/完了通知を追加
4. エラー通知を追加

**期待される成果物**:

- `execute` メソッドの更新

#### 実装コード

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

export class SkillExecutor {
  // ... 既存のコード ...

  /**
   * スキルを実行
   */
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
}
```

---

### タスク4: categorizeError メソッドの実装

**目的**: エラーをカテゴリ別に分類するメソッドを実装する

**実行手順**:

1. `categorizeError` メソッドのシグネチャを追加
2. エラーカテゴリ判定ロジックを実装

**期待される成果物**:

- `categorizeError` メソッドの実装

#### 実装コード

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

export class SkillExecutor {
  // ... 既存のコード ...

  /**
   * エラーカテゴリを判定
   */
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
}
```

---

### タスク5: isRetryable メソッドの実装

**目的**: エラーがリトライ可能かどうかを判定するメソッドを実装する

**実行手順**:

1. `isRetryable` メソッドのシグネチャを追加
2. リトライ可能性判定ロジックを実装

**期待される成果物**:

- `isRetryable` メソッドの実装

#### 実装コード

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

export class SkillExecutor {
  // ... 既存のコード ...

  /**
   * リトライ可能かどうかを判定
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
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

---

### タスク6: テスト実行と成功確認

**目的**: Phase 4で作成したテストが成功することを確認する（TDD Green状態）

**実行手順**:

1. テストコードのコメントアウトを解除
2. テストを実行
3. 全テストが成功することを確認

**期待される成果物**:

- テスト実行結果（全テスト成功）

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"
```

---

## 参照資料

| 参照資料                 | パス                                                                            | 内容         |
| ------------------------ | ------------------------------------------------------------------------------- | ------------ |
| Phase 2 設計             | `./phase-02-design.md`                                                          | 詳細設計     |
| Phase 4 テスト           | `./phase-04-test-red.md`                                                        | テストケース |
| セキュリティパターン定義 | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | API仕様      |
| 既存タスク仕様           | `docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks.md`         | 元のコード例 |

---

## 成果物

| 成果物                | パス                                                    | 内容                          |
| --------------------- | ------------------------------------------------------- | ----------------------------- |
| SkillExecutor（更新） | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | Hooks追加・エラーハンドリング |

---

## 統合テスト連携

本Phaseで実装したコードは、Phase 7（テストカバレッジ確認）で統合テストと連携して検証する。

---

## 完了条件

- [ ] セキュリティ関数（`isDangerousCommand`、`isProtectedPath`）がインポートされている
- [ ] `createHooks` メソッドが実装されている
- [ ] `execute` メソッドで Hooks が使用されている
- [ ] `categorizeError` メソッドが実装されている
- [ ] `isRetryable` メソッドが実装されている
- [ ] 全テストが成功する（Green状態）

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

```
docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks/phase-06-test-expansion.md
```
