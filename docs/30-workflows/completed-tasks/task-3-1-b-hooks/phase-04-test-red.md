# Phase 4: テスト作成（TDD Red） - TASK-3-1-B Hooks実装

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成（TDD Red）         |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-25                    |
| 機能名     | TASK-3-1-B Hooks実装          |

---

## 目的

TDDのRedフェーズとして、実装前に失敗するテストを作成する。Phase 1の受け入れ基準（AC-001〜AC-013）をテストケースに変換する。

## 背景

テスト駆動開発（TDD）では、まず失敗するテストを書き、そのテストを通すための最小限の実装を行う。これにより、実装が要件を満たしていることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイルの作成

**目的**: Hooksのユニットテストファイルを作成する

**実行手順**:

1. テストファイルのパスを確認
2. テストファイルの骨格を作成
3. テストユーティリティのインポートを追加

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts`

#### テストファイル骨格

```typescript
// apps/desktop/src/main/services/skill/__tests__/hooks.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";

// モック設定
vi.mock("@repo/shared/constants", () => ({
  isDangerousCommand: vi.fn(),
  isProtectedPath: vi.fn(),
}));

// SkillExecutorのインポート（実装後に有効化）
// import { SkillExecutor } from "../SkillExecutor";

describe("SkillExecutor - Hooks", () => {
  // テストケースをここに追加
});
```

---

### タスク2: PreToolUse テストケース作成

**目的**: PreToolUse Hook のテストケースを作成する（AC-001〜AC-006）

**実行手順**:

1. 危険コマンドブロックのテストを作成
2. 保護パスブロックのテストを作成
3. 安全な操作許可のテストを作成
4. ツール実行開始通知のテストを作成

**期待される成果物**:

- PreToolUse テストケース

#### PreToolUse テストケース

```typescript
describe("PreToolUse", () => {
  describe("危険コマンドブロック (FR-001)", () => {
    it("should block rm -rf commands (AC-001)", async () => {
      // Arrange
      const mockIsDangerous = vi.mocked(isDangerousCommand);
      mockIsDangerous.mockReturnValue(true);

      const input = {
        toolName: "Bash",
        args: { command: "rm -rf /" },
      };

      // Act
      // const result = await executor.createHooks("test-id").PreToolUse(
      //   input, "tool-use-1", { signal: new AbortController().signal }
      // );

      // Assert
      // expect(result.proceed).toBe(false);
      // expect(result.message).toContain("危険なコマンドをブロック");
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should block sudo commands (AC-002)", async () => {
      // Arrange
      const mockIsDangerous = vi.mocked(isDangerousCommand);
      mockIsDangerous.mockReturnValue(true);

      const input = {
        toolName: "Bash",
        args: { command: "sudo apt-get update" },
      };

      // Act & Assert
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should allow safe bash commands (AC-003)", async () => {
      // Arrange
      const mockIsDangerous = vi.mocked(isDangerousCommand);
      mockIsDangerous.mockReturnValue(false);

      const input = {
        toolName: "Bash",
        args: { command: "ls -la" },
      };

      // Act & Assert
      expect(true).toBe(false); // Red: テスト失敗
    });
  });

  describe("保護パスブロック (FR-002)", () => {
    it("should block writes to /etc (AC-004)", async () => {
      // Arrange
      const mockIsProtected = vi.mocked(isProtectedPath);
      mockIsProtected.mockReturnValue(true);

      const input = {
        toolName: "Write",
        args: { path: "/etc/passwd" },
      };

      // Act & Assert
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should block edits to ~/.ssh (AC-005)", async () => {
      // Arrange
      const mockIsProtected = vi.mocked(isProtectedPath);
      mockIsProtected.mockReturnValue(true);

      const input = {
        toolName: "Edit",
        args: { file_path: "~/.ssh/id_rsa" },
      };

      // Act & Assert
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should allow writes to /tmp (AC-006)", async () => {
      // Arrange
      const mockIsProtected = vi.mocked(isProtectedPath);
      mockIsProtected.mockReturnValue(false);

      const input = {
        toolName: "Write",
        args: { path: "/tmp/test.txt" },
      };

      // Act & Assert
      expect(true).toBe(false); // Red: テスト失敗
    });
  });

  describe("ツール実行開始通知 (FR-003)", () => {
    it("should send tool_use message on proceed (AC-007)", async () => {
      // Arrange
      const mockIsDangerous = vi.mocked(isDangerousCommand);
      mockIsDangerous.mockReturnValue(false);

      const input = {
        toolName: "Glob",
        args: { pattern: "**/*.ts" },
      };

      // Act & Assert
      // expect(mockSendStream).toHaveBeenCalledWith(
      //   expect.objectContaining({ type: "tool_use" })
      // );
      expect(true).toBe(false); // Red: テスト失敗
    });
  });
});
```

---

### タスク3: PostToolUse テストケース作成

**目的**: PostToolUse Hook のテストケースを作成する（AC-008〜AC-009）

**実行手順**:

1. ツール結果通知のテストを作成
2. 完了ステータス通知のテストを作成

**期待される成果物**:

- PostToolUse テストケース

#### PostToolUse テストケース

```typescript
describe("PostToolUse", () => {
  describe("ツール結果通知 (FR-004)", () => {
    it("should send tool_result message (AC-008)", async () => {
      // Arrange
      const input = {
        toolName: "Read",
        result: { content: "file content" },
      };

      // Act & Assert
      // expect(mockSendStream).toHaveBeenCalledWith(
      //   expect.objectContaining({ type: "tool_result" })
      // );
      expect(true).toBe(false); // Red: テスト失敗
    });
  });

  describe("完了ステータス通知 (FR-005)", () => {
    it("should send tool_completed status (AC-009)", async () => {
      // Arrange
      const input = {
        toolName: "Read",
        result: { content: "file content" },
      };

      // Act & Assert
      // expect(mockSendStream).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     type: "status",
      //     content: expect.objectContaining({ status: "tool_completed" })
      //   })
      // );
      expect(true).toBe(false); // Red: テスト失敗
    });
  });
});
```

---

### タスク4: エラーハンドリング テストケース作成

**目的**: エラーハンドリングのテストケースを作成する（AC-010〜AC-013）

**実行手順**:

1. エラーカテゴリ判定のテストを作成
2. リトライ可能性判定のテストを作成

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/error.test.ts`

#### エラーハンドリング テストケース

```typescript
// apps/desktop/src/main/services/skill/__tests__/error.test.ts

import { describe, it, expect } from "vitest";

// 実装後にインポート
// import { categorizeError, isRetryable } from "../SkillExecutor";

describe("SkillExecutor - Error handling", () => {
  describe("categorizeError (FR-006)", () => {
    it("should categorize SDK errors (AC-010)", () => {
      // Arrange
      const error = new Error("SDK API call failed");

      // Act & Assert
      // expect(categorizeError(error)).toBe("sdk_error");
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should categorize network errors (AC-011)", () => {
      // Arrange
      const error = new Error("network connection failed");

      // Act & Assert
      // expect(categorizeError(error)).toBe("network");
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should categorize timeout errors", () => {
      // Arrange
      const error = new Error("AbortError");
      error.name = "AbortError";

      // Act & Assert
      // expect(categorizeError(error)).toBe("timeout");
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should categorize permission errors", () => {
      // Arrange
      const error = new Error("permission denied");

      // Act & Assert
      // expect(categorizeError(error)).toBe("permission_denied");
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should categorize unknown errors", () => {
      // Arrange
      const error = new Error("Something went wrong");

      // Act & Assert
      // expect(categorizeError(error)).toBe("unknown");
      expect(true).toBe(false); // Red: テスト失敗
    });
  });

  describe("isRetryable (FR-007)", () => {
    it("should identify network errors as retryable (AC-012)", () => {
      // Arrange
      const error = new Error("network connection failed");

      // Act & Assert
      // expect(isRetryable(error)).toBe(true);
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should identify permission errors as non-retryable (AC-013)", () => {
      // Arrange
      const error = new Error("permission denied");

      // Act & Assert
      // expect(isRetryable(error)).toBe(false);
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should identify timeout errors as retryable", () => {
      // Arrange
      const error = new Error("Request timeout");

      // Act & Assert
      // expect(isRetryable(error)).toBe(true);
      expect(true).toBe(false); // Red: テスト失敗
    });

    it("should identify ECONNRESET as retryable", () => {
      // Arrange
      const error = new Error("ECONNRESET");

      // Act & Assert
      // expect(isRetryable(error)).toBe(true);
      expect(true).toBe(false); // Red: テスト失敗
    });
  });
});
```

---

### タスク5: テスト実行と失敗確認

**目的**: 作成したテストが失敗することを確認する（TDD Red状態）

**実行手順**:

1. テストを実行
2. 全テストが失敗することを確認
3. 失敗理由が「実装なし」であることを確認

**期待される成果物**:

- テスト実行結果（全テスト失敗）

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"
```

---

## 参照資料

| 参照資料           | パス                         | 内容                    |
| ------------------ | ---------------------------- | ----------------------- |
| Phase 1 要件定義   | `./phase-01-requirements.md` | 受け入れ基準AC-001〜013 |
| Phase 2 設計       | `./phase-02-design.md`       | インターフェース定義    |
| Vitestドキュメント | https://vitest.dev/          | テストフレームワーク    |

---

## 成果物

| 成果物                   | パス                                                           | 内容                         |
| ------------------------ | -------------------------------------------------------------- | ---------------------------- |
| Hooksテストファイル      | `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts` | PreToolUse/PostToolUseテスト |
| エラーハンドリングテスト | `apps/desktop/src/main/services/skill/__tests__/error.test.ts` | エラー分類・リトライテスト   |

---

## 統合テスト連携

本Phaseで作成したテストは、Phase 7（テストカバレッジ確認）で統合テストと連携して実行する。

---

## 完了条件

- [ ] `hooks.test.ts` ファイルが作成されている
- [ ] `error.test.ts` ファイルが作成されている
- [ ] AC-001〜AC-013 の全受け入れ基準に対応するテストケースが存在する
- [ ] テストを実行すると全テストが失敗する（Red状態）
- [ ] 失敗理由が「実装なし」または「expect(true).toBe(false)」である

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

```
docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks/phase-05-implementation.md
```
