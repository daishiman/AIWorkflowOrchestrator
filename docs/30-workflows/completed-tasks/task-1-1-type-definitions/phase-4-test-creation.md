# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| フェーズ     | 4                              |
| フェーズ名   | テスト作成                     |
| 目的         | TDD: Red（失敗するテスト作成） |
| 前提フェーズ | Phase 3: 設計レビューゲート    |
| 次フェーズ   | Phase 5: 実装                  |
| 想定成果物   | 型テストファイル               |

---

## 1. 目的

型定義の正確性を検証するためのテストを作成する。型定義のタスクでは実行時テストは不要だが、型レベルのテストを作成して型の整合性を確保する。

---

## 2. テスト戦略

### 2.1 テスト対象

| カテゴリ            | テスト内容                           |
| ------------------- | ------------------------------------ |
| 型の存在確認        | 全ての型がエクスポートされているか   |
| 型の互換性          | 仕様書の例と実際の型が互換性を持つか |
| Discriminated Union | 型ガードが正しく動作するか           |
| 型のインポート      | 他パッケージからインポート可能か     |

### 2.2 テストファイル構成

```
packages/shared/src/types/__tests__/
├── skill.test.ts              # 型テスト
└── skill-type-guards.test.ts  # 型ガードテスト（オプション）
```

---

## 3. 実行タスク

### Task 4-1: 型存在テスト作成

**目的**: 全ての型がエクスポートされていることを確認するテストを作成

**ファイル**: `packages/shared/src/types/__tests__/skill.test.ts`

```typescript
import { describe, it, expect } from "vitest";

// 型のインポートテスト
// 型定義のみなので実行時テストは最小限
describe("Skill Types - Export Check", () => {
  it("should export all skill metadata types", async () => {
    // 動的インポートで型ファイルの存在を確認
    const module = await import("../skill");

    // 型はランタイムに存在しないため、
    // 定数・ユーティリティがあればそれをテスト
    expect(module).toBeDefined();
  });
});

// 型の互換性テスト（コンパイル時チェック）
describe("Skill Types - Type Compatibility", () => {
  it("should have correct SkillMetadata structure", () => {
    // 型レベルのテスト - コンパイルが通ればOK
    const metadata: import("../skill").SkillMetadata = {
      name: "test-skill",
      description: "Test skill description",
      path: "/path/to/skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(metadata.name).toBe("test-skill");
  });

  it("should have correct SkillSubResource structure", () => {
    const resource: import("../skill").SkillSubResource = {
      filename: "agent.md",
      relativePath: "agents/agent.md",
      size: 1024,
    };

    expect(resource.filename).toBe("agent.md");
  });

  it("should have correct SkillOtherFile structure", () => {
    const file: import("../skill").SkillOtherFile = {
      filename: "EVALS.json",
      type: "evals",
      size: 512,
    };

    expect(file.type).toBe("evals");
  });

  it("should have correct ImportedSkill structure", () => {
    const imported: import("../skill").ImportedSkill = {
      name: "imported-skill",
      description: "Imported skill",
      path: "/path/to/skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      importedAt: new Date(),
      status: "active",
    };

    expect(imported.status).toBe("active");
  });
});
```

### Task 4-2: 実行関連型テスト作成

**目的**: 実行関連の型が正しく定義されていることを確認

```typescript
describe("Skill Execution Types", () => {
  it("should have correct SkillExecutionRequest structure", () => {
    const request: import("../skill").SkillExecutionRequest = {
      skillName: "test-skill",
      prompt: "Execute this task",
    };

    expect(request.skillName).toBe("test-skill");
  });

  it("should have correct SkillExecutionResponse structure", () => {
    const response: import("../skill").SkillExecutionResponse = {
      executionId: "exec-123",
      success: true,
    };

    expect(response.success).toBe(true);
  });

  it("should have valid SkillExecutionStatus values", () => {
    const statuses: import("../skill").SkillExecutionStatus[] = [
      "idle",
      "running",
      "permission_pending",
      "completed",
      "cancelled",
      "error",
    ];

    expect(statuses).toHaveLength(6);
  });
});
```

### Task 4-3: ストリーミングメッセージ型テスト作成

**目的**: Discriminated Union型が正しく定義されていることを確認

```typescript
describe("Skill Stream Message Types", () => {
  it("should have correct assistant message structure", () => {
    const message: import("../skill").SkillStreamMessage = {
      executionId: "exec-123",
      type: "assistant",
      content: {
        text: "Hello",
        isPartial: false,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("assistant");
  });

  it("should have correct tool_use message structure", () => {
    const message: import("../skill").SkillStreamMessage = {
      executionId: "exec-123",
      type: "tool_use",
      content: {
        toolName: "read_file",
        args: { path: "/test" },
        toolUseId: "tool-123",
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("tool_use");
  });

  it("should have correct tool_result message structure", () => {
    const message: import("../skill").SkillStreamMessage = {
      executionId: "exec-123",
      type: "tool_result",
      content: {
        toolUseId: "tool-123",
        success: true,
        result: "file content",
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("tool_result");
  });

  it("should have correct status message structure", () => {
    const message: import("../skill").SkillStreamMessage = {
      executionId: "exec-123",
      type: "status",
      content: {
        status: "started",
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("status");
  });

  it("should have correct error message structure", () => {
    const message: import("../skill").SkillStreamMessage = {
      executionId: "exec-123",
      type: "error",
      content: {
        code: "sdk_error",
        message: "An error occurred",
        retryable: true,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe("error");
  });
});
```

### Task 4-4: 権限確認型テスト作成

**目的**: 権限確認関連の型が正しく定義されていることを確認

```typescript
describe("Permission Types", () => {
  it("should have correct PermissionRequest structure", () => {
    const request: import("../skill").PermissionRequest = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "write_file",
      args: { path: "/test", content: "data" },
    };

    expect(request.requestId).toBe("req-456");
  });

  it("should have correct PermissionResponse structure", () => {
    const response: import("../skill").PermissionResponse = {
      requestId: "req-456",
      approved: true,
      rememberChoice: false,
    };

    expect(response.approved).toBe(true);
  });
});
```

---

## 4. テスト実行コマンド

```bash
# 型テストを実行
pnpm --filter @repo/shared test -- --run

# 特定のテストファイルのみ実行
pnpm --filter @repo/shared test -- --run skill.test.ts

# ウォッチモードで実行
pnpm --filter @repo/shared test -- skill.test.ts
```

---

## 5. 期待する結果

### 5.1 Phase 4 終了時点

| 期待結果                           | 状態        |
| ---------------------------------- | ----------- |
| テストファイルが作成されている     | ○           |
| テストが型未定義でコンパイルエラー | Red（失敗） |
| 全テストケースが網羅されている     | ○           |

### 5.2 Phase 5 終了後

| 期待結果         | 状態          |
| ---------------- | ------------- |
| テストが全てパス | Green（成功） |
| 型チェックがパス | Green（成功） |

---

## 6. 参照資料

| 資料名     | パス                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| 設計書     | `./phase-2-design.md`                                                       |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md`              |
| 品質基準   | `.claude/skills/task-specification-creator/references/quality-standards.md` |

---

## 7. 完了条件

- [ ] Task 4-1 完了: 型存在テスト作成
- [ ] Task 4-2 完了: 実行関連型テスト作成
- [ ] Task 4-3 完了: ストリーミングメッセージ型テスト作成
- [ ] Task 4-4 完了: 権限確認型テスト作成
- [ ] テストファイルがコンパイル可能（型は未定義でも）

---

## 8. 統合テスト連携【必須】

> **N/A**: 本タスクは型定義のみのため、統合テスト連携は対象外です。
>
> 型定義テストは静的型チェックであり、以下の統合テストシナリオは適用されません：
>
> - API 接続テスト: 該当なし
> - データフローテスト: 該当なし
> - 認証連携テスト: 該当なし

---

## 9. 成果物

| 成果物           | パス                                                | 状態     |
| ---------------- | --------------------------------------------------- | -------- |
| 型テストファイル | `packages/shared/src/types/__tests__/skill.test.ts` | 作成待ち |

---

## 10. TDD 検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 11. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 12. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 4-1: 型存在テスト作成
3. Task 4-2: 実行関連型テスト作成
4. Task 4-3: ストリーミングメッセージ型テスト作成
5. Task 4-4: 権限確認型テスト作成
6. TDD 検証（Red 状態確認）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
