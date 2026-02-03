# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 6                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- 統合テスト追加: IPC連携テストの追加
- エラーパステスト: 異常系・エラーハンドリングテスト
- モック/スタブ整備: Claude Agent SDK モックの作成

## 参照資料

| 資料名       | パス                                        | 説明          |
| ------------ | ------------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4成果物 |
| 実装コード   | `apps/desktop/src/main/services/skill/*.ts` | Phase 5成果物 |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPCチャネル                  | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. ギャップ分析

以下の観点で不足テストを特定:

| 分析対象        | 確認項目                                                   |
| --------------- | ---------------------------------------------------------- |
| SkillAnalyzer   | collectFiles, staticAnalysis, aiAnalysis分岐               |
| SkillImprover   | 各改善タイプ（prompt, structure, security, documentation） |
| PromptOptimizer | SDK応答バリエーション                                      |
| エラーパス      | SDK障害、FS障害、タイムアウト                              |
| バックアップ    | 作成、復元、エラー時ロールバック                           |

### 3. 追加テスト作成

#### Claude Agent SDK モック

```typescript
// apps/desktop/src/main/services/skill/__tests__/__mocks__/claude-agent-sdk.ts

import { vi } from "vitest";

export const mockQuery = vi.fn();

export const query = mockQuery;

// テスト用ヘルパー
export const mockQueryResponse = (response: { content: string }) => {
  mockQuery.mockResolvedValueOnce(response);
};

export const mockQueryError = (error: Error) => {
  mockQuery.mockRejectedValueOnce(error);
};
```

#### SkillAnalyzer 追加テスト

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillAnalyzer.additional.test.ts

describe("SkillAnalyzer - Additional Coverage", () => {
  describe("collectFiles", () => {
    it("should handle nested directories", async () => {});
    it("should handle empty files", async () => {});
    it("should handle binary files gracefully", async () => {});
  });

  describe("performStaticAnalysis", () => {
    it("should detect missing frontmatter", async () => {});
    it("should detect missing allowed_tools", async () => {});
    it("should calculate metrics correctly", async () => {});
  });

  describe("performAIAnalysis", () => {
    it("should handle SDK timeout", async () => {});
    it("should handle malformed JSON response", async () => {});
    it("should handle rate limiting", async () => {});
  });
});
```

#### SkillImprover 追加テスト

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImprover.additional.test.ts

describe("SkillImprover - Additional Coverage", () => {
  describe("backup operations", () => {
    it("should create timestamped backup", async () => {});
    it("should restore from latest backup", async () => {});
    it("should handle backup directory full", async () => {});
  });

  describe("improvement types", () => {
    it("should apply prompt improvement with currentCode/suggestedCode", async () => {});
    it("should apply prompt improvement via AI", async () => {});
    it("should apply structure improvement", async () => {});
    it("should apply documentation improvement", async () => {});
    it("should apply security improvement", async () => {});
  });

  describe("error handling", () => {
    it("should rollback on partial failure", async () => {});
    it("should preserve applied changes on later failure", async () => {});
  });
});
```

#### IPC統合テスト

```typescript
// apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts

describe("Skill Improvement IPC Handlers", () => {
  describe("skill:analyze", () => {
    it("should return SkillAnalysis for valid skill", async () => {});
    it("should return error for non-existent skill", async () => {});
  });

  describe("skill:improve", () => {
    it("should apply improvements and return result", async () => {});
    it("should respect options.autoFix", async () => {});
    it("should respect options.types filter", async () => {});
    it("should respect options.minPriority filter", async () => {});
  });

  describe("skill:optimize", () => {
    it("should optimize prompt and return result", async () => {});
  });

  describe("skill:optimize:variants", () => {
    it("should generate specified number of variants", async () => {});
  });

  describe("skill:optimize:evaluate", () => {
    it("should evaluate prompt and return score", async () => {});
  });
});
```

### 4. 統合テスト再実行

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                    | 目標 |
| ------------------ | --------------------------- | ---- |
| IPC接続テスト      | 5チャネルの疎通             | 100% |
| データフローテスト | Renderer→IPC→Service→SDK→FS | 100% |
| エラーハンドリング | SDK/FS障害時のエラー伝播    | 80%+ |
| バックアップテスト | 作成・復元・ロールバック    | 100% |

## 成果物

| 成果物             | パス                                                        | 説明               |
| ------------------ | ----------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                        | カバレッジ分析結果 |
| 追加テストファイル | `apps/desktop/src/main/services/skill/__tests__/*.test.ts`  | 追加テストコード   |
| SDKモック          | `apps/desktop/src/main/services/skill/__tests__/__mocks__/` | テストモック       |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] IPC統合テストが全5チャネルをカバー
- [ ] エラーパステストが追加されている
- [ ] Claude Agent SDK モックが整備されている
- [ ] バックアップ/復元テストが追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
