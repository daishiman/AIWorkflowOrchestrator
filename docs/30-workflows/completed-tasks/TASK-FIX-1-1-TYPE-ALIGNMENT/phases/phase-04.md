# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 4                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

型統合の正当性を検証するテストを作成する（Red状態）。

## 実行タスク

### Task 1: 型ガードテスト作成

Discriminated Union の型ガードテストを作成する。

```typescript
// packages/shared/src/types/__tests__/skill-stream-message.test.ts

describe("SkillStreamMessage Type Guards", () => {
  describe("isAssistantMessage", () => {
    it("should return true for assistant type", () => {
      const message: SkillStreamMessage = {
        executionId: "test-id",
        type: "assistant",
        content: { text: "Hello", isPartial: false },
        timestamp: Date.now(),
      };
      expect(message.type).toBe("assistant");
    });
  });

  describe("isToolUseMessage", () => {
    it("should return true for tool_use type", () => {
      // テストケース
    });
  });

  // 他の型ガードテスト
});
```

### Task 2: 型エクスポートテスト作成

型が正しくエクスポートされていることを確認するテスト。

```typescript
// packages/shared/src/types/__tests__/skill-exports.test.ts

describe("Skill Type Exports", () => {
  it("should export SkillStreamMessage from skill.ts", () => {
    const skillTypes = require("../skill");
    expect(skillTypes).toHaveProperty("SkillStreamMessage");
  });

  it("should NOT export SkillStreamMessage from skill-execution.ts", () => {
    // 削除後にこのテストが失敗→成功になる
  });
});
```

### Task 3: import パス検証テスト

正しい import パスが使用されていることを確認するテスト。

```typescript
describe("Import Path Validation", () => {
  it("should import SkillStreamMessage from @repo/shared", () => {
    // import { SkillStreamMessage } from "@repo/shared";
    // 型チェックが通ることを確認
  });
});
```

## 参照資料

| 資料名               | パス                                                                              | 説明                   |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                      | Phase 1成果物          |
| 型統合設計書         | `outputs/phase-2/type-integration-design.md`                                      | Phase 2成果物          |
| 設計レビュー         | `outputs/phase-3/design-review-result.md`                                         | Phase 3成果物          |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル型定義仕様       |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト戦略・カバレッジ |

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ    | 検証内容                                | テストファイル          |
| ------------------- | --------------------------------------- | ----------------------- |
| IPC型整合性テスト   | Main-Renderer間のSkillStreamMessage伝播 | `*.ipc.test.ts`         |
| Store型整合性テスト | skillSliceでの型使用                    | `skillSlice.test.ts`    |
| 型インポートテスト  | 正しいモジュールからのインポート        | `skill-exports.test.ts` |

## アーキテクチャ層別テスト

| 層           | テスト観点                | テストファイル配置                       |
| ------------ | ------------------------- | ---------------------------------------- |
| Shared       | 型定義・エクスポート      | `packages/shared/src/types/__tests__/`   |
| Main Process | IPCハンドラーでの型使用   | `apps/desktop/src/main/**/*.test.ts`     |
| Renderer     | Component/Hooksでの型使用 | `apps/desktop/src/renderer/**/*.test.ts` |

## 成果物

| 成果物         | パス                                       | 説明               |
| -------------- | ------------------------------------------ | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テスト設計         |
| テストケース   | `outputs/phase-4/test-cases.md`            | ケース一覧         |
| 型ガードテスト | `packages/shared/src/types/__tests__/*.ts` | 実際のテストコード |

## 完了条件

- [ ] 型ガードテストが作成されている
- [ ] 型エクスポートテストが作成されている
- [ ] importパス検証テストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test

# 確認項目
# - [ ] 新規作成テストが失敗することを確認（Red状態）
# - [ ] 既存テストは成功していることを確認
```

## 次のPhase

Phase 5: 実装（TDD: Green）
