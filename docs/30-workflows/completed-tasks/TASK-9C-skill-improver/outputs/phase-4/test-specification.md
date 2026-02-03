# TASK-9C テスト仕様書

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| Phase  | 4                                |

---

## テスト戦略

### TDD原則

1. **Red**: テストを先に書く（本フェーズ）
2. **Green**: テストを通す最小限の実装（Phase 5）
3. **Refactor**: コード品質改善（Phase 8）

### カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## テストカテゴリ

| カテゴリ       | 説明                          | ファイル配置                      |
| -------------- | ----------------------------- | --------------------------------- |
| ユニットテスト | 各サービスの単体テスト        | `__tests__/*.test.ts`             |
| 統合テスト     | IPC連携・サービス間連携テスト | `__tests__/*.integration.test.ts` |
| 境界値テスト   | エッジケース・限界値テスト    | 各テストファイル内                |

---

## テスト対象サービス

### 1. SkillAnalyzer

| メソッド                | 責務                 | テスト観点                       |
| ----------------------- | -------------------- | -------------------------------- |
| analyze()               | スキル分析実行       | 正常系、異常系（存在しない等）   |
| collectFiles()          | ファイル収集（内部） | ディレクトリ構造、空ディレクトリ |
| performStaticAnalysis() | 静的分析（内部）     | SKILL.md検証、issues検出         |
| performAIAnalysis()     | AI分析（内部）       | SDK呼び出し、JSON応答パース      |
| mergeAnalysis()         | 結果統合（内部）     | スコア計算、提案マージ           |

### 2. SkillImprover

| メソッド            | 責務                     | テスト観点                       |
| ------------------- | ------------------------ | -------------------------------- |
| applyImprovements() | 改善適用                 | 正常系、部分失敗、完全失敗       |
| restoreFromBackup() | バックアップ復元         | 正常復元、存在しないバックアップ |
| createBackup()      | バックアップ作成（内部） | タイムスタンプ、ディレクトリ作成 |
| applySuggestion()   | 個別適用（内部）         | 各改善タイプ                     |
| improvePrompt()     | プロンプト改善（内部）   | 直接置換、AI改善                 |
| improveStructure()  | 構造改善（内部）         | ファイル作成/修正/削除           |

### 3. PromptOptimizer

| メソッド           | 責務             | テスト観点           |
| ------------------ | ---------------- | -------------------- |
| optimize()         | プロンプト最適化 | 正常系、空プロンプト |
| generateVariants() | バリアント生成   | 正常系、count検証    |
| evaluate()         | プロンプト評価   | 正常系、スコア範囲   |

---

## モック戦略

### Claude Agent SDK モック

```typescript
// __mocks__/claude-agent-sdk.ts
export const mockQuery = vi.fn();

export const query = mockQuery;

// ヘルパー関数
export const mockQueryResponse = (content: string) => {
  mockQuery.mockResolvedValueOnce({ content });
};

export const mockQueryError = (error: Error) => {
  mockQuery.mockRejectedValueOnce(error);
};
```

### ファイルシステムモック

```typescript
// Vitestのvi.mockでfs/promisesをモック
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  mkdir: vi.fn(),
  unlink: vi.fn(),
  cp: vi.fn(),
}));
```

---

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定テストファイル
pnpm --filter @repo/desktop test -- SkillAnalyzer.test.ts

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage

# ウォッチモード
pnpm --filter @repo/desktop test:watch
```

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 4 自動生成)
