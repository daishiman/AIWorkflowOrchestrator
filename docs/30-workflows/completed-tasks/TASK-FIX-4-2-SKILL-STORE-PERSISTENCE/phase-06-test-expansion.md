# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| タスク | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 名称   | インポートスキルの永続化消失バグ修正 |
| 分類   | バグ修正                             |
| 作成日 | 2026-02-07                           |

## 目的

Phase 5で実装した修正のカバレッジを向上させ、エッジケース・異常系・回帰を網羅するテストを追加する。

## 実行タスク

- カバレッジ分析: 未カバー箇所の特定
- 境界値テスト追加: エッジケースの網羅
- 異常系テスト追加: エラーパスの検証
- 回帰テスト追加: 既存機能の保護

## 参照資料

| 資料名         | パス                                                                        | 説明           |
| -------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 4成果物  | `tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-04-test-creation.md`      | 初期テスト仕様 |
| Phase 5成果物  | `tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-05-implementation.md`     | 実装仕様       |
| 既存テスト     | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | 既存テスト     |
| カバレッジ基準 | `.claude/rules/02-code-quality.md`                                          | 品質基準       |

## カバレッジ目標

| 指標              | 最低基準 | 目標基準 | 現状（推定） |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | 70%          |
| Branch Coverage   | 60%      | 70%      | 50%          |
| Function Coverage | 80%      | 90%      | 75%          |

## 実行手順

### 1. カバレッジ分析

**未カバー箇所の特定**:

| 関数/ブロック              | カバー状況 | 追加テスト必要 |
| -------------------------- | ---------- | -------------- |
| `validateStoredSkillIds()` | 部分       | 境界値テスト   |
| `constructor` エラーパス   | 未         | 異常系テスト   |
| `persist()` エラーパス     | 未         | 異常系テスト   |
| `debug` フラグ分岐         | 部分       | 設定テスト     |

### 2. 追加テストシナリオ設計

**境界値テスト**:

| シナリオID | カテゴリ | テスト内容                       |
| ---------- | -------- | -------------------------------- |
| BV-01      | 境界値   | 空文字列のスキルID               |
| BV-02      | 境界値   | 非常に長いスキルID（10000文字）  |
| BV-03      | 境界値   | 大量スキル（1000件）の保存・復元 |
| BV-04      | 境界値   | 空配列→追加→空配列の繰り返し     |
| BV-05      | 境界値   | Unicode文字を含むスキルID        |

**異常系テスト**:

| シナリオID | カテゴリ | テスト内容                    |
| ---------- | -------- | ----------------------------- |
| EX-01      | 異常系   | store.set()が例外を投げる場合 |
| EX-02      | 異常系   | store.get()が例外を投げる場合 |
| EX-03      | 異常系   | 循環参照を含むデータ          |
| EX-04      | 異常系   | NaN/Infinityを含む配列        |
| EX-05      | 異常系   | Proxyオブジェクトを含む配列   |

**競合・並行テスト**:

| シナリオID | カテゴリ | テスト内容                         |
| ---------- | -------- | ---------------------------------- |
| CC-01      | 並行     | 同時インポート操作                 |
| CC-02      | 並行     | インポート中の削除                 |
| CC-03      | 並行     | 複数インスタンスからの同時書き込み |

**回帰テスト**:

| シナリオID | カテゴリ | テスト内容                            |
| ---------- | -------- | ------------------------------------- |
| RG-01      | 回帰     | 既存のimportSkillsテストが通る        |
| RG-02      | 回帰     | 既存のremoveSkillテストが通る         |
| RG-03      | 回帰     | 既存のgetImportedSkillIdsテストが通る |
| RG-04      | 回帰     | 既存のisImportedテストが通る          |

### 3. 境界値テスト実装

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImportManager.boundary.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SkillImportManager - Boundary Value Tests (TASK-FIX-4-2)", () => {
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
      path: "/mock/path/skill-imports.json",
    };
  });

  describe("Skill ID Boundary Values", () => {
    it("BV-01: should handle empty string skill ID", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      const result = await manager.importSkills([""]);

      // Assert: Empty string is technically valid but should be handled
      expect(result.success).toBe(true);
      expect(manager.getImportedSkillIds()).toContain("");
    });

    it("BV-02: should handle very long skill ID (10000 chars)", async () => {
      // Arrange
      const longId = "a".repeat(10000);
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      const result = await manager.importSkills([longId]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
      expect(manager.getImportedSkillIds()).toContain(longId);
    });

    it("BV-03: should handle large number of skills (1000)", async () => {
      // Arrange
      const skillIds = Array.from({ length: 1000 }, (_, i) => `skill-${i}`);
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      const result = await manager.importSkills(skillIds);

      // Assert
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1000);

      // Verify persistence
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);
      expect(manager2.getImportedSkillIds()).toHaveLength(1000);
    });

    it("BV-04: should handle empty→add→empty cycle", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Add then remove
      await manager.importSkills(["skill-1"]);
      expect(manager.getImportedSkillIds()).toHaveLength(1);

      await manager.removeSkill("skill-1");
      expect(manager.getImportedSkillIds()).toHaveLength(0);

      // Add again
      await manager.importSkills(["skill-2"]);
      expect(manager.getImportedSkillIds()).toHaveLength(1);

      // Verify persistence after cycle
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);
      expect(manager2.getImportedSkillIds()).toEqual(["skill-2"]);
    });

    it("BV-05: should handle Unicode skill IDs", async () => {
      // Arrange
      const unicodeIds = [
        "スキル-日本語",
        "skill-emoji-🚀",
        "skill-中文",
        "skill-한국어",
        "skill-العربية",
      ];
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      await manager.importSkills(unicodeIds);

      // Assert
      expect(manager.getImportedSkillIds()).toHaveLength(5);

      // Verify persistence
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);
      for (const id of unicodeIds) {
        expect(manager2.getImportedSkillIds()).toContain(id);
      }
    });
  });

  describe("Data Type Edge Cases", () => {
    it("should handle array with mixed valid/invalid types", async () => {
      // Arrange
      mockStore.get.mockReturnValue([
        "valid-1",
        123,
        true,
        false,
        null,
        undefined,
        {},
        [],
        "valid-2",
        Symbol("test"),
        () => {},
        NaN,
        Infinity,
      ]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Only string values should remain
      const ids = manager.getImportedSkillIds();
      expect(ids).toEqual(["valid-1", "valid-2"]);
    });

    it("should handle nested arrays in stored data", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1", ["nested-array"], "skill-2"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      const ids = manager.getImportedSkillIds();
      expect(ids).toEqual(["skill-1", "skill-2"]);
    });
  });
});
```

### 4. 異常系テスト実装

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImportManager.error.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SkillImportManager - Error Handling Tests (TASK-FIX-4-2)", () => {
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
      path: "/mock/path/skill-imports.json",
    };
  });

  describe("Store Error Scenarios", () => {
    it("EX-01: should handle store.set() throwing error", async () => {
      // Arrange
      mockStore.set.mockImplementation(() => {
        throw new Error("Disk full");
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act & Assert: Should not throw, but persist fails silently
      await expect(manager.importSkills(["skill-1"])).resolves.not.toThrow();

      // In-memory state should be updated even if persist fails
      expect(manager.getImportedSkillIds()).toContain("skill-1");
    });

    it("EX-02: should handle store.get() throwing error on init", async () => {
      // Arrange
      mockStore.get.mockImplementation(() => {
        throw new Error("Store corrupted");
      });

      // Act & Assert: Should not throw, falls back to empty
      const { SkillImportManager } = await import("../SkillImportManager");
      expect(() => new SkillImportManager(mockStore as never)).not.toThrow();

      const manager = new SkillImportManager(mockStore as never);
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("EX-03: should handle store returning function", async () => {
      // Arrange
      mockStore.get.mockReturnValue(() => ["skill-1"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Function is not a valid array
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("EX-04: should handle store returning Date object", async () => {
      // Arrange
      mockStore.get.mockReturnValue(new Date());

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("EX-05: should handle store returning number", async () => {
      // Arrange
      mockStore.get.mockReturnValue(42);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });
  });

  describe("Persist Error Recovery", () => {
    it("should continue operation after persist error", async () => {
      // Arrange
      let persistCallCount = 0;
      mockStore.set.mockImplementation(() => {
        persistCallCount++;
        if (persistCallCount === 1) {
          throw new Error("First persist failed");
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: First import fails to persist
      await manager.importSkills(["skill-1"]);

      // Second import should still work
      await manager.importSkills(["skill-2"]);

      // Assert
      expect(manager.getImportedSkillIds()).toContain("skill-1");
      expect(manager.getImportedSkillIds()).toContain("skill-2");
      expect(persistCallCount).toBe(2);
    });

    it("should not corrupt in-memory state on persist error", async () => {
      // Arrange
      mockStore.set.mockImplementation(() => {
        throw new Error("Persist always fails");
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Multiple operations
      await manager.importSkills(["skill-1", "skill-2"]);
      await manager.removeSkill("skill-1");
      await manager.importSkills(["skill-3"]);

      // Assert: In-memory state is correct
      const ids = manager.getImportedSkillIds();
      expect(ids).not.toContain("skill-1");
      expect(ids).toContain("skill-2");
      expect(ids).toContain("skill-3");
    });
  });
});
```

### 5. 並行操作テスト実装

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImportManager.concurrent.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SkillImportManager - Concurrent Operation Tests (TASK-FIX-4-2)", () => {
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };
  let persistedData: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    persistedData = [];
    mockStore = {
      get: vi.fn().mockImplementation(() => [...persistedData]),
      set: vi.fn().mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData = [...value];
        }
      }),
      path: "/mock/path/skill-imports.json",
    };
  });

  describe("Concurrent Operations", () => {
    it("CC-01: should handle concurrent import operations", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Concurrent imports
      const results = await Promise.all([
        manager.importSkills(["skill-1"]),
        manager.importSkills(["skill-2"]),
        manager.importSkills(["skill-3"]),
      ]);

      // Assert: All should succeed
      expect(results.every((r) => r.success)).toBe(true);
      expect(manager.getImportedSkillIds()).toHaveLength(3);
    });

    it("CC-02: should handle import during remove", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);
      await manager.importSkills(["skill-1", "skill-2"]);

      // Act: Concurrent import and remove
      const [removeResult, importResult] = await Promise.all([
        manager.removeSkill("skill-1"),
        manager.importSkills(["skill-3"]),
      ]);

      // Assert
      expect(removeResult.success).toBe(true);
      expect(importResult.success).toBe(true);
      expect(manager.getImportedSkillIds()).not.toContain("skill-1");
      expect(manager.getImportedSkillIds()).toContain("skill-2");
      expect(manager.getImportedSkillIds()).toContain("skill-3");
    });

    it("CC-03: should handle rapid successive operations", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Rapid operations
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          await manager.importSkills([`skill-${i}`]);
        } else {
          await manager.removeSkill(`skill-${i - 1}`);
        }
      }

      // Assert: Even-indexed skills should be removed, only skill-98 remains
      expect(manager.getImportedSkillIds()).toContain("skill-98");
      expect(manager.getImportedSkillIds()).not.toContain("skill-0");
    });
  });
});
```

### 6. 回帰テスト確認

```bash
# 既存テストの実行
pnpm --filter @repo/desktop test -- --grep "SkillImportManager"

# カバレッジレポート生成
pnpm --filter @repo/desktop test -- --coverage --grep "SkillImportManager"
```

## 成果物

| 成果物       | パス                                                                                   | 説明           |
| ------------ | -------------------------------------------------------------------------------------- | -------------- |
| 境界値テスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.boundary.test.ts`   | 境界値検証     |
| 異常系テスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.error.test.ts`      | エラー処理検証 |
| 並行テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.concurrent.test.ts` | 並行処理検証   |

## 完了条件

### カバレッジ要件

- [ ] Line Coverage: 80%以上
- [ ] Branch Coverage: 60%以上
- [ ] Function Coverage: 80%以上

### テスト要件

- [ ] 境界値テスト（BV-01〜BV-05）がすべてパス
- [ ] 異常系テスト（EX-01〜EX-05）がすべてパス
- [ ] 並行テスト（CC-01〜CC-03）がすべてパス
- [ ] 既存テスト（回帰）がすべてパス

### 品質要件

- [ ] 全テストが安定して通過する（flaky testがない）
- [ ] テスト実行時間が合理的（30秒以内）

## TDD検証

```bash
# 拡充テスト実行
pnpm --filter @repo/desktop test -- --grep "TASK-FIX-4-2"

# カバレッジ確認
pnpm --filter @repo/desktop test -- --coverage --reporter=text

# 全テスト実行（回帰確認）
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] 境界値テストがすべてパス
# - [ ] 異常系テストがすべてパス
# - [ ] 並行テストがすべてパス
# - [ ] カバレッジ基準を満たしている
```

## 次のPhase

Phase 7: カバレッジ確認
