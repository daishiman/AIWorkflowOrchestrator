---
name: .claude/skills/vitest-advanced/SKILL.md
description: |
  Vitestの高度な機能と最適化パターンを専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/vitest-advanced/resources/async-testing.md`: Async Testingリソース
  - `.claude/skills/vitest-advanced/resources/coverage-optimization.md`: Coverage Optimizationリソース
  - `.claude/skills/vitest-advanced/resources/mocking-patterns.md`: Mocking Patternsリソース
  - `.claude/skills/vitest-advanced/resources/performance-tips.md`: Performance Tipsリソース
  - `.claude/skills/vitest-advanced/resources/test-structure.md`: Test Structureリソース

  - `.claude/skills/vitest-advanced/templates/test-file-template.ts`: Test Fileテンプレート

  - `.claude/skills/vitest-advanced/scripts/coverage-analyzer.mjs`: Coverage Analyzerスクリプト

version: 1.0.0
---

# Vitest Advanced

## 概要

Vitest は Vite-native の高速なテストフレームワークです。
このスキルでは Vitest の高度な機能と実践的なパターンを提供します。

**核心原則**:

- 高速なフィードバックループ
- シンプルで読みやすいテスト
- 効果的なモッキング戦略

**対象ユーザー**:

- ユニットテスター（.claude/agents/unit-tester.md）
- ビジネスロジック実装エージェント（.claude/agents/logic-dev.md）
- フロントエンドアーキテクト（@frontend-architect）

## リソース構造

```
vitest-advanced/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── test-structure.md                 # テスト構造とライフサイクル
│   ├── mocking-patterns.md               # モッキングパターン
│   ├── async-testing.md                  # 非同期テスト
│   ├── coverage-optimization.md          # カバレッジ最適化
│   └── performance-tips.md               # パフォーマンス改善
├── scripts/
│   └── coverage-analyzer.mjs             # カバレッジ分析スクリプト
└── templates/
    └── test-file-template.ts             # テストファイルテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# テスト構造
cat .claude/skills/vitest-advanced/resources/test-structure.md

# モッキングパターン
cat .claude/skills/vitest-advanced/resources/mocking-patterns.md

# 非同期テスト
cat .claude/skills/vitest-advanced/resources/async-testing.md

# カバレッジ最適化
cat .claude/skills/vitest-advanced/resources/coverage-optimization.md

# パフォーマンス改善
cat .claude/skills/vitest-advanced/resources/performance-tips.md
```

### スクリプト実行

```bash
# カバレッジ分析
# カバレッジ実行→分析→閾値チェック→改善提案を一括実行
node .claude/skills/vitest-advanced/scripts/coverage-analyzer.mjs

# オプション
node .claude/skills/vitest-advanced/scripts/coverage-analyzer.mjs --threshold 90
node .claude/skills/vitest-advanced/scripts/coverage-analyzer.mjs --analyze-file coverage/coverage-summary.json
node .claude/skills/vitest-advanced/scripts/coverage-analyzer.mjs --coverage-dir ./coverage --threshold 80
```

## クイックリファレンス

### テスト構造

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("UserService", () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Teardown
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUser", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser = { id: "1", name: "Test" };

      // Act
      const result = await service.getUser("1");

      // Assert
      expect(result).toEqual(mockUser);
    });
  });
});
```

**詳細**: `resources/test-structure.md`

### モッキング基本

```typescript
// 関数のMock
const mockFn = vi.fn().mockReturnValue("result");

// モジュールのMock
vi.mock("./module", () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}));

// Spy
vi.spyOn(object, "method").mockImplementation(() => "mocked");
```

**詳細**: `resources/mocking-patterns.md`

### 非同期テスト

```typescript
// async/await
it("should fetch data", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// rejects/resolves
it("should reject on error", async () => {
  await expect(failingFn()).rejects.toThrow("Error");
});

// タイマー
it("should handle timeout", async () => {
  vi.useFakeTimers();
  const promise = delayedFn();
  vi.advanceTimersByTime(1000);
  await expect(promise).resolves.toBe("done");
  vi.useRealTimers();
});
```

**詳細**: `resources/async-testing.md`

## ベストプラクティス

### テスト構造

1. **Arrange-Act-Assert**: 明確な 3 部構成
2. **1 テスト 1 検証**: 単一の振る舞いを検証
3. **説明的な名前**: should + 動詞で記述
4. **独立したテスト**: テスト間の依存を排除

### モッキング

1. **最小限のモック**: 必要な依存のみ
2. **適切なリセット**: beforeEach/afterEach でクリア
3. **型安全**: vi.MockedFunction で型付け
4. **実装より振る舞い**: 内部詳細に依存しない

### パフォーマンス

1. **並行実行**: テストの独立性を確保
2. **適切なタイムアウト**: 長すぎないタイムアウト
3. **重いセットアップの共有**: beforeAll の活用
4. **不要なモックの排除**: シンプルに保つ

## 設定例

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // テスト環境
    environment: "node", // または 'jsdom'

    // グローバル設定
    globals: true,

    // カバレッジ
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },

    // タイムアウト
    testTimeout: 10000,

    // 並行実行
    threads: true,
    maxThreads: 4,
    minThreads: 1,
  },
});
```

## マッチャー一覧

### 基本マッチャー

| マッチャー        | 説明               |
| ----------------- | ------------------ |
| `toBe(value)`     | 厳密等価（===）    |
| `toEqual(value)`  | 深い等価           |
| `toBeNull()`      | null チェック      |
| `toBeUndefined()` | undefined チェック |
| `toBeDefined()`   | defined チェック   |
| `toBeTruthy()`    | truthy チェック    |
| `toBeFalsy()`     | falsy チェック     |

### 数値マッチャー

| マッチャー               | 説明       |
| ------------------------ | ---------- |
| `toBeGreaterThan(n)`     | より大きい |
| `toBeLessThan(n)`        | より小さい |
| `toBeCloseTo(n, digits)` | 近似値     |

### 文字列マッチャー

| マッチャー       | 説明           |
| ---------------- | -------------- |
| `toMatch(regex)` | 正規表現マッチ |
| `toContain(str)` | 部分文字列     |

### 配列・オブジェクトマッチャー

| マッチャー             | 説明             |
| ---------------------- | ---------------- |
| `toContain(item)`      | 要素を含む       |
| `toContainEqual(item)` | 等価な要素を含む |
| `toHaveLength(n)`      | 長さ             |
| `toHaveProperty(key)`  | プロパティ存在   |

### 例外マッチャー

| マッチャー       | 説明         |
| ---------------- | ------------ |
| `toThrow()`      | 例外をスロー |
| `toThrow(error)` | 特定の例外   |

### Mock 関連マッチャー

| マッチャー                          | 説明                     |
| ----------------------------------- | ------------------------ |
| `toHaveBeenCalled()`                | 呼び出された             |
| `toHaveBeenCalledTimes(n)`          | n 回呼び出された         |
| `toHaveBeenCalledWith(...args)`     | 特定の引数で呼び出された |
| `toHaveBeenLastCalledWith(...args)` | 最後の呼び出しの引数     |
| `toHaveReturnedWith(value)`         | 特定の値を返した         |

## 関連スキル

- **.claude/skills/tdd-principles/SKILL.md** (`.claude/skills/tdd-principles/SKILL.md`): TDD の基本原則
- **.claude/skills/test-doubles/SKILL.md** (`.claude/skills/test-doubles/SKILL.md`): テストダブル
- **.claude/skills/test-naming-conventions/SKILL.md** (`.claude/skills/test-naming-conventions/SKILL.md`): テスト命名規約
- **.claude/skills/boundary-value-analysis/SKILL.md** (`.claude/skills/boundary-value-analysis/SKILL.md`): 境界値分析

## 参考文献

- **Vitest 公式ドキュメント**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/

---

## 使用上の注意

### このスキルが得意なこと

- Vitest のテスト構造（describe/it/test）の設計
- vi.fn()、vi.mock()、vi.spyOn()によるモッキング
- 非同期テストと Fake Timers の活用
- カバレッジ設定と最適化
- テスト実行パフォーマンスの改善

### このスキルが行わないこと

- テストダブルの概念的な使い分け（→ .claude/skills/test-doubles/SKILL.md）
- TDD サイクルの設計原則（→ .claude/skills/tdd-principles/SKILL.md）
- テストケースの設計手法（→ .claude/skills/boundary-value-analysis/SKILL.md）
- E2E/Playwright テスト

---

## 変更履歴

| バージョン | 日付       | 変更内容                         |
| ---------- | ---------- | -------------------------------- |
| 1.0.0      | 2025-11-26 | 初版作成 - Vitest 高度なパターン |
