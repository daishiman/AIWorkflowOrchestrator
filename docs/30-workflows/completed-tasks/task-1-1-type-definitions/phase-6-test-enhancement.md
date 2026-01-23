# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| フェーズ     | 6                                    |
| フェーズ名   | テスト拡充                           |
| 目的         | カバレッジ目標達成に向けた追加テスト |
| 前提フェーズ | Phase 5: 実装                        |
| 次フェーズ   | Phase 7: テストカバレッジ確認        |
| 想定成果物   | 追加テストファイル                   |

---

## 1. 目的

Phase 5 で実装した型定義に対して、エッジケースやインポートテストを追加し、型の品質を確保する。

---

## 2. テスト拡充方針

### 2.1 型定義タスクにおけるテスト拡充

型定義は実行時コードではないため、以下に焦点を当てる：

| テスト種別             | 内容                                       |
| ---------------------- | ------------------------------------------ |
| インポート確認テスト   | 他パッケージからの型インポートが機能するか |
| オプショナルプロパティ | 省略可能なプロパティの挙動確認             |
| Discriminated Union    | 型ガードの動作確認                         |
| エッジケース           | 空配列、undefined 等の境界値               |

---

## 3. 実行タスク

### Task 6-1: インポート確認テスト追加

**目的**: 他パッケージからの型インポートが正しく機能することを確認

**ファイル**: `packages/shared/src/types/__tests__/skill-import.test.ts`

```typescript
import { describe, it, expect } from "vitest";

// packages/shared の index.ts からインポート
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
  ImportedSkill,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillStreamMessageType,
  AssistantMessageContent,
  ToolUseMessageContent,
  ToolResultMessageContent,
  StatusMessageContent,
  ErrorMessageContent,
  PermissionRequest,
  PermissionResponse,
} from "@repo/shared";

describe("Skill Types - Import from @repo/shared", () => {
  it("should import SkillMetadata type", () => {
    const metadata: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };
    expect(metadata).toBeDefined();
  });

  it("should import all stream message types", () => {
    // 型のみのテスト - コンパイルが通ればOK
    const types: SkillStreamMessageType[] = [
      "assistant",
      "tool_use",
      "tool_result",
      "status",
      "error",
    ];
    expect(types).toHaveLength(5);
  });
});
```

### Task 6-2: オプショナルプロパティテスト追加

**目的**: オプショナルプロパティが正しく省略可能であることを確認

```typescript
describe("Skill Types - Optional Properties", () => {
  it("should allow optional allowedTools in SkillMetadata", () => {
    const withTools: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      allowedTools: ["Read", "Write"],
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    const withoutTools: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(withTools.allowedTools).toBeDefined();
    expect(withoutTools.allowedTools).toBeUndefined();
  });

  it("should allow optional description in SkillSubResource", () => {
    const withDesc: SkillSubResource = {
      filename: "test.md",
      relativePath: "agents/test.md",
      description: "Test description",
      size: 100,
    };

    const withoutDesc: SkillSubResource = {
      filename: "test.md",
      relativePath: "agents/test.md",
      size: 100,
    };

    expect(withDesc.description).toBeDefined();
    expect(withoutDesc.description).toBeUndefined();
  });

  it("should allow optional content in ImportedSkill", () => {
    const base: SkillMetadata = {
      name: "test",
      description: "test",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    const withContent: ImportedSkill = {
      ...base,
      importedAt: new Date(),
      status: "active",
      content: "# SKILL.md content",
    };

    const withoutContent: ImportedSkill = {
      ...base,
      importedAt: new Date(),
      status: "active",
    };

    expect(withContent.content).toBeDefined();
    expect(withoutContent.content).toBeUndefined();
  });
});
```

### Task 6-3: Discriminated Union 型ガードテスト追加

**目的**: Discriminated Union の型ガードが正しく機能することを確認

```typescript
describe("Skill Types - Discriminated Union Type Guards", () => {
  it("should narrow type based on type property", () => {
    const messages: SkillStreamMessage[] = [
      {
        executionId: "1",
        type: "assistant",
        content: { text: "Hello" },
        timestamp: Date.now(),
      },
      {
        executionId: "2",
        type: "tool_use",
        content: { toolName: "read", args: {}, toolUseId: "t1" },
        timestamp: Date.now(),
      },
    ];

    messages.forEach((msg) => {
      switch (msg.type) {
        case "assistant":
          // TypeScript should narrow to AssistantMessageContent
          expect(msg.content.text).toBeDefined();
          break;
        case "tool_use":
          // TypeScript should narrow to ToolUseMessageContent
          expect(msg.content.toolName).toBeDefined();
          break;
        case "tool_result":
          expect(msg.content.toolUseId).toBeDefined();
          break;
        case "status":
          expect(msg.content.status).toBeDefined();
          break;
        case "error":
          expect(msg.content.code).toBeDefined();
          break;
      }
    });
  });
});
```

### Task 6-4: エッジケーステスト追加

**目的**: 境界値や特殊なケースでの型の挙動を確認

```typescript
describe("Skill Types - Edge Cases", () => {
  it("should handle empty arrays in SkillMetadata", () => {
    const metadata: SkillMetadata = {
      name: "",
      description: "",
      path: "",
      updatedAt: new Date(0),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    expect(metadata.agents).toHaveLength(0);
    expect(metadata.references).toHaveLength(0);
  });

  it("should handle all SkillOtherFile types", () => {
    const types: SkillOtherFile["type"][] = [
      "evals",
      "logs",
      "package",
      "other",
    ];

    types.forEach((type) => {
      const file: SkillOtherFile = {
        filename: "test",
        type,
        size: 0,
      };
      expect(file.type).toBe(type);
    });
  });

  it("should handle all error codes in ErrorMessageContent", () => {
    const codes: ErrorMessageContent["code"][] = [
      "sdk_error",
      "permission_denied",
      "timeout",
      "network",
      "unknown",
    ];

    codes.forEach((code) => {
      const content: ErrorMessageContent = {
        code,
        message: "Error",
        retryable: false,
      };
      expect(content.code).toBe(code);
    });
  });

  it("should handle all status values in StatusMessageContent", () => {
    const statuses: StatusMessageContent["status"][] = [
      "started",
      "tool_executing",
      "tool_completed",
      "completed",
    ];

    statuses.forEach((status) => {
      const content: StatusMessageContent = { status };
      expect(content.status).toBe(status);
    });
  });
});
```

---

## 4. テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test -- --run

# カバレッジ付きで実行
pnpm --filter @repo/shared test -- --run --coverage

# 特定ファイルのみ
pnpm --filter @repo/shared test -- --run skill-import.test.ts
```

---

## 5. 参照資料

| 資料名         | パス                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| Phase 4 テスト | `./phase-4-test-creation.md`                                                |
| 実装           | `./phase-5-implementation.md`                                               |
| 品質基準       | `.claude/skills/task-specification-creator/references/quality-standards.md` |

---

## 6. 完了条件

- [ ] Task 6-1 完了: インポート確認テスト追加
- [ ] Task 6-2 完了: オプショナルプロパティテスト追加
- [ ] Task 6-3 完了: Discriminated Union 型ガードテスト追加
- [ ] Task 6-4 完了: エッジケーステスト追加
- [ ] 全テストがパス

---

## 7. 統合テスト連携【必須】

> **N/A**: 本タスクは型定義のみのため、統合テスト連携は対象外です。
>
> 型定義テストの拡充は静的型チェックであり、以下のカテゴリは適用されません：
>
> - API 接続テスト: 該当なし
> - データフローテスト: 該当なし
> - エラーハンドリング: 該当なし
> - 認証連携テスト: 該当なし
> - 状態同期テスト: 該当なし

---

## 8. 成果物

| 成果物           | パス                                                       | 状態     |
| ---------------- | ---------------------------------------------------------- | -------- |
| インポートテスト | `packages/shared/src/types/__tests__/skill-import.test.ts` | 作成待ち |

---

## 9. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 10. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 6-1: インポート確認テスト追加
3. Task 6-2: オプショナルプロパティテスト追加
4. Task 6-3: Discriminated Union 型ガードテスト追加
5. Task 6-4: エッジケーステスト追加
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
