# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 前提Phase  | Phase 3                     |
| 後続Phase  | Phase 5                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

TDD Red フェーズとして、実装前に失敗するテストを作成する。

## 背景

設計レビューが完了し、実装の準備が整った。
TDD の原則に従い、まず失敗するテストを作成してから実装に進む。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: PermissionRequest Hook テスト作成

**目的**: PermissionRequest Hook の単体テストを作成する

**実行手順**:

1. テストファイルを作成する
2. 各テストケースを実装する
3. テストが失敗することを確認する（Red 状態）

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`

**テストケース**:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SkillExecutor } from "../SkillExecutor";
import { PermissionResolver } from "../PermissionResolver";

// モック設定
vi.mock("../PermissionResolver");
vi.mock("@anthropic-ai/claude-agent-sdk");

describe("SkillExecutor - PermissionRequest Hook", () => {
  let executor: SkillExecutor;
  let mockMainWindow: any;
  let mockPermissionResolver: any;

  beforeEach(() => {
    mockMainWindow = {
      webContents: {
        send: vi.fn(),
      },
    };
    mockPermissionResolver = {
      waitForResponse: vi.fn(),
      resolve: vi.fn(),
    };
    vi.mocked(PermissionResolver).mockImplementation(
      () => mockPermissionResolver,
    );
    executor = new SkillExecutor(mockMainWindow);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("権限リクエスト送信", () => {
    it("should send permission request to renderer via IPC", async () => {
      // 準備
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-request-id",
        approved: true,
      });

      // 実行
      // PermissionRequest Hook が呼び出される状況を作成
      // ...

      // 検証
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          toolName: expect.any(String),
          args: expect.any(Object),
          reason: expect.any(String),
        }),
      );
    });
  });

  describe("ユーザー応答待機", () => {
    it("should wait for user response using PermissionResolver", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // 実行と検証
      // ...

      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object), // AbortSignal
        30000, // タイムアウト
      );
    });
  });

  describe("承認時の動作", () => {
    it("should return proceed: true when user approves", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // Hook の戻り値を検証
      // expect(result).toEqual({ proceed: true });
    });

    it("should send approval status notification", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // ステータス通知の検証
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "status",
          content: expect.objectContaining({
            status: "tool_executing",
            detail: expect.stringContaining("許可されました"),
          }),
        }),
      );
    });
  });

  describe("拒否時の動作", () => {
    it("should return proceed: false when user rejects", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: false,
        rejectReason: "ユーザーにより拒否されました",
      });

      // Hook の戻り値を検証
      // expect(result).toEqual({
      //   proceed: false,
      //   message: "ユーザーにより拒否されました",
      // });
    });

    it("should send rejection status notification", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: false,
      });

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "status",
          content: expect.objectContaining({
            status: "tool_completed",
            detail: expect.stringContaining("拒否されました"),
          }),
        }),
      );
    });
  });

  describe("タイムアウト処理", () => {
    it("should return proceed: false on timeout", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request timed out"),
      );

      // Hook の戻り値を検証
      // expect(result).toEqual({
      //   proceed: false,
      //   message: "権限確認がタイムアウトしました",
      // });
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`

---

### タスク2: 引数サニタイズテスト作成

**目的**: sanitizeArgs メソッドのテストを作成する

**実行手順**:

1. サニタイズ機能のテストケースを作成する
2. エッジケースを網羅する

**テストケース**:

```typescript
describe("SkillExecutor - sanitizeArgs", () => {
  describe("長文省略", () => {
    it("should truncate strings longer than 500 characters", () => {
      const longString = "a".repeat(600);
      const args = { content: longString };

      const result = executor.sanitizeArgs(args);

      expect(result.content).toBe("a".repeat(500) + "... (省略)");
    });

    it("should not truncate strings shorter than 500 characters", () => {
      const shortString = "a".repeat(100);
      const args = { content: shortString };

      const result = executor.sanitizeArgs(args);

      expect(result.content).toBe(shortString);
    });
  });

  describe("機密情報除去", () => {
    it("should redact password fields", () => {
      const args = { password: "secret123" };

      const result = executor.sanitizeArgs(args);

      expect(result.password).toBe("[REDACTED]");
    });

    it("should redact token fields", () => {
      const args = { apiToken: "abc123" };

      const result = executor.sanitizeArgs(args);

      expect(result.apiToken).toBe("[REDACTED]");
    });

    it("should redact secret fields", () => {
      const args = { clientSecret: "xyz789" };

      const result = executor.sanitizeArgs(args);

      expect(result.clientSecret).toBe("[REDACTED]");
    });

    it("should redact nested sensitive fields", () => {
      const args = {
        config: {
          password: "nested-secret",
        },
      };

      const result = executor.sanitizeArgs(args);

      expect(result.config.password).toBe("[REDACTED]");
    });
  });

  describe("通常フィールド", () => {
    it("should preserve non-sensitive fields", () => {
      const args = {
        file_path: "/path/to/file.ts",
        command: "npm install",
      };

      const result = executor.sanitizeArgs(args);

      expect(result.file_path).toBe("/path/to/file.ts");
      expect(result.command).toBe("npm install");
    });
  });
});
```

**期待される成果物**:

- サニタイズテストが上記ファイルに追加される

---

### タスク3: 権限理由生成テスト作成

**目的**: getPermissionReason メソッドのテストを作成する

**実行手順**:

1. 各ツールタイプの理由生成テストを作成する
2. デフォルトケースのテストを作成する

**テストケース**:

```typescript
describe("SkillExecutor - getPermissionReason", () => {
  describe("Bash ツール", () => {
    it("should generate reason with command", () => {
      const reason = executor.getPermissionReason("Bash", {
        command: "npm install express",
      });

      expect(reason).toBe("コマンドを実行: npm install express");
    });

    it("should truncate long commands to 100 characters", () => {
      const longCommand = "npm install " + "package".repeat(50);
      const reason = executor.getPermissionReason("Bash", {
        command: longCommand,
      });

      expect(reason.length).toBeLessThanOrEqual(
        100 + "コマンドを実行: ".length,
      );
    });
  });

  describe("Write ツール", () => {
    it("should generate reason with file_path", () => {
      const reason = executor.getPermissionReason("Write", {
        file_path: "src/index.ts",
      });

      expect(reason).toBe("ファイルを作成: src/index.ts");
    });

    it("should support path as alternative key", () => {
      const reason = executor.getPermissionReason("Write", {
        path: "src/utils.ts",
      });

      expect(reason).toBe("ファイルを作成: src/utils.ts");
    });
  });

  describe("Edit ツール", () => {
    it("should generate reason with file_path", () => {
      const reason = executor.getPermissionReason("Edit", {
        file_path: "src/app.ts",
      });

      expect(reason).toBe("ファイルを編集: src/app.ts");
    });
  });

  describe("デフォルトケース", () => {
    it("should generate generic reason for unknown tools", () => {
      const reason = executor.getPermissionReason("WebSearch", {});

      expect(reason).toBe("WebSearch を実行");
    });
  });
});
```

**期待される成果物**:

- 理由生成テストが上記ファイルに追加される

---

### タスク4: handlePermissionResponse テスト作成

**目的**: handlePermissionResponse メソッドのテストを作成する

**実行手順**:

1. 権限応答処理のテストケースを作成する

**テストケース**:

```typescript
describe("SkillExecutor - handlePermissionResponse", () => {
  it("should resolve pending request with approval", () => {
    executor.handlePermissionResponse("request-id", true);

    expect(mockPermissionResolver.resolve).toHaveBeenCalledWith("request-id", {
      requestId: "request-id",
      approved: true,
      rememberChoice: undefined,
      rejectReason: undefined,
    });
  });

  it("should resolve pending request with rejection", () => {
    executor.handlePermissionResponse(
      "request-id",
      false,
      false,
      "Not allowed",
    );

    expect(mockPermissionResolver.resolve).toHaveBeenCalledWith("request-id", {
      requestId: "request-id",
      approved: false,
      rememberChoice: false,
      rejectReason: "Not allowed",
    });
  });

  it("should pass rememberChoice flag", () => {
    executor.handlePermissionResponse("request-id", true, true);

    expect(mockPermissionResolver.resolve).toHaveBeenCalledWith("request-id", {
      requestId: "request-id",
      approved: true,
      rememberChoice: true,
      rejectReason: undefined,
    });
  });
});
```

**期待される成果物**:

- handlePermissionResponse テストが上記ファイルに追加される

---

### タスク5: テスト失敗確認（Red 状態）

**目的**: 作成したテストが失敗することを確認する

**実行手順**:

1. テストを実行する
2. 全てのテストが失敗することを確認する
3. 失敗理由が「未実装」であることを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
```

**期待される結果**:

- 全てのテストが FAIL となる
- 失敗理由: メソッドが未実装、または期待と異なる動作

---

## 参照資料

| 参照資料            | パス                                                                                | 内容                    |
| ------------------- | ----------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 設計        | `outputs/phase-02/`                                                                 | 設計成果物              |
| TASK-3-2 仕様       | `docs/30-workflows/skill-import-agent-system/tasks/task-3-2-permission-resolver.md` | PermissionResolver 仕様 |
| Vitest ドキュメント | 公式サイト                                                                          | テストフレームワーク    |

---

## 成果物

| 成果物                   | パス                                                                              | 内容                |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------- |
| PermissionRequest テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts` | Hook のテストケース |
| テスト実行結果           | `outputs/phase-04/test-results.md`                                                | Red 状態の確認結果  |

---

## 統合テスト連携（Phase 1〜11は必須）

本 Phase では単体テストを作成。統合テストは Phase 6 で追加する。

---

## 完了条件

- [ ] PermissionRequest Hook のテストが作成されている
- [ ] sanitizeArgs のテストが作成されている
- [ ] getPermissionReason のテストが作成されている
- [ ] handlePermissionResponse のテストが作成されている
- [ ] 全てのテストが失敗する（Red 状態）
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- --run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-05-implementation.md`
