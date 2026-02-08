# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| タスク | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 名称   | インポートスキルの永続化消失バグ修正 |
| 分類   | バグ修正                             |
| 作成日 | 2026-02-07                           |

## 目的

永続化バグを再現・検証するテストを作成し、期待される動作を明確に定義する（Red状態）。

## 実行タスク

- TDD原則適用: バグを再現するテストを先に作成
- ユニットテスト作成: 型バリデーション、ストア初期化のテスト
- 統合テスト作成: アプリ再起動シミュレーションテスト
- 境界値分析: エッジケースのテスト追加

## 参照資料

| 資料名       | パス                                                                                    | 説明                 |
| ------------ | --------------------------------------------------------------------------------------- | -------------------- |
| タスク指示書 | `tasks/01b-task-fix-4-2-skill-store-persistence.md`                                     | 問題点と修正内容     |
| 既存テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`             | 既存のユニットテスト |
| 統合テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts` | 既存の統合テスト     |
| 設計書       | `docs/30-workflows/skill-import-agent-system/technical-decisions.md`                    | 永続化設計           |

## 問題分析

### 根本原因候補

| 候補 | 問題                                    | 影響                                       |
| ---- | --------------------------------------- | ------------------------------------------ |
| C1   | 型キャスト脆弱性（L32: `as string[]`）  | 不正なデータ型でクラッシュまたはデータ消失 |
| C2   | ストア初期化タイミング                  | `app.whenReady()` 前にアクセスで失敗       |
| C3   | スキャンキャッシュとimportedIdsの不整合 | getImportedSkillsが空配列を返す            |
| C4   | ストアパスの設計書との乖離              | 想定外のパスに保存されデータ消失           |

## 実行手順

### 1. テストシナリオ設計

**型バリデーションテスト**:

| シナリオID | カテゴリ | テスト内容                                    |
| ---------- | -------- | --------------------------------------------- |
| TV-01      | 異常系   | store.get()がnullを返した場合のフォールバック |
| TV-02      | 異常系   | store.get()がundefinedを返した場合            |
| TV-03      | 異常系   | store.get()が文字列を返した場合               |
| TV-04      | 異常系   | store.get()がオブジェクトを返した場合         |
| TV-05      | 異常系   | 配列内に非文字列要素が含まれる場合            |
| TV-06      | 正常系   | 正常なstring[]が返される場合                  |

**永続化サイクルテスト（再起動シミュレーション）**:

| シナリオID | カテゴリ | テスト内容                                   |
| ---------- | -------- | -------------------------------------------- |
| PC-01      | 正常系   | インポート→ストア再初期化→データ復元         |
| PC-02      | 正常系   | 複数インポート→再初期化→全データ復元         |
| PC-03      | 正常系   | インポート→削除→再初期化→削除状態維持        |
| PC-04      | 異常系   | ストアファイル破損→再初期化→デフォルト値使用 |
| PC-05      | 境界値   | 0件インポート状態→再初期化→空配列維持        |

**getImportedSkills統合テスト**:

| シナリオID | カテゴリ | テスト内容                                      |
| ---------- | -------- | ----------------------------------------------- |
| GI-01      | 正常系   | キャッシュなし状態でgetImportedSkills呼び出し   |
| GI-02      | 正常系   | キャッシュあり状態でgetImportedSkills呼び出し   |
| GI-03      | 異常系   | importedIdsに存在しないスキルがキャッシュにない |
| GI-04      | 統合     | scanAvailableSkills後のgetImportedSkills        |

### 2. ユニットテスト作成

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImportManager.persistence.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

// Type validation tests for TASK-FIX-4-2
describe("SkillImportManager - Type Validation (TASK-FIX-4-2)", () => {
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      get: vi.fn(),
      set: vi.fn(),
      path: "/mock/path/skill-imports.json",
    };
  });

  describe("Type Validation on Initialization", () => {
    it("TV-01: should fallback to empty array when store returns null", async () => {
      // Arrange
      mockStore.get.mockReturnValue(null);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-02: should fallback to empty array when store returns undefined", async () => {
      // Arrange
      mockStore.get.mockReturnValue(undefined);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-03: should fallback to empty array when store returns string", async () => {
      // Arrange
      mockStore.get.mockReturnValue("invalid-string-data");

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-04: should fallback to empty array when store returns object", async () => {
      // Arrange
      mockStore.get.mockReturnValue({ key: "value" });

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-05: should filter out non-string elements from array", async () => {
      // Arrange
      mockStore.get.mockReturnValue([
        "skill-1",
        123,
        null,
        "skill-2",
        undefined,
        { id: "skill-3" },
      ]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      const ids = manager.getImportedSkillIds();
      expect(ids).toEqual(["skill-1", "skill-2"]);
      expect(ids).toHaveLength(2);
    });

    it("TV-06: should correctly load valid string array", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1", "skill-2", "skill-3"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([
        "skill-1",
        "skill-2",
        "skill-3",
      ]);
    });
  });

  describe("Persistence Cycle (Restart Simulation)", () => {
    it("PC-01: should restore data after store re-initialization", async () => {
      // Arrange: Simulate persistent storage
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: First instance - import
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      await manager1.importSkills(["skill-1"]);

      // Simulate app restart - create new instance with same store state
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).toContain("skill-1");
    });

    it("PC-02: should restore multiple imports after re-initialization", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: Import multiple skills
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      await manager1.importSkills(["skill-1", "skill-2", "skill-3"]);

      // Simulate restart
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).toHaveLength(3);
      expect(manager2.getImportedSkillIds()).toEqual(
        expect.arrayContaining(["skill-1", "skill-2", "skill-3"]),
      );
    });

    it("PC-03: should preserve removal state after re-initialization", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: Import then remove
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      await manager1.importSkills(["skill-1", "skill-2"]);
      await manager1.removeSkill("skill-1");

      // Simulate restart
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).not.toContain("skill-1");
      expect(manager2.getImportedSkillIds()).toContain("skill-2");
    });

    it("PC-04: should use default when store throws on initialization", async () => {
      // Arrange
      mockStore.get.mockImplementation(() => {
        throw new Error("Store read error");
      });

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("PC-05: should maintain empty state after re-initialization", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: Create instance without importing
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      expect(manager1.getImportedSkillIds()).toEqual([]);

      // Simulate restart
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).toEqual([]);
    });
  });
});
```

### 3. 統合テスト作成（SkillService連携）

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillService.persistence.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillService } from "../SkillService";
import { SkillImportManager } from "../SkillImportManager";
import type { Skill } from "@repo/shared";

// Mock SkillScanner and SkillParser
const createMockSkill = (id: string): Skill => ({
  id,
  name: `Skill ${id}`,
  description: `Description for ${id}`,
  path: `/skills/${id}`,
  author: "test-author",
  version: "1.0.0",
  allowedTools: [],
  inputSchema: {},
  outputSchema: {},
  createdAt: new Date(),
  lastModified: new Date(),
});

describe("SkillService - getImportedSkills Integration (TASK-FIX-4-2)", () => {
  let mockScanner: {
    scanDirectory: ReturnType<typeof vi.fn>;
    getBasePath: ReturnType<typeof vi.fn>;
  };
  let mockParser: { parse: ReturnType<typeof vi.fn> };
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };
  let skillService: SkillService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockScanner = {
      scanDirectory: vi
        .fn()
        .mockResolvedValue(["/skills/skill-1", "/skills/skill-2"]),
      getBasePath: vi.fn().mockReturnValue("/skills"),
    };

    mockParser = {
      parse: vi.fn().mockImplementation((path: string) => {
        const id = path.split("/").pop() ?? "unknown";
        return Promise.resolve(createMockSkill(id));
      }),
    };

    mockStore = {
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
      path: "/mock/path/skill-imports.json",
    };
  });

  describe("GI-01: Cache empty state", () => {
    it("should scan and return imported skills when cache is empty", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1"]);
      const importManager = new SkillImportManager(mockStore as never);
      skillService = new SkillService(
        mockScanner as never,
        mockParser as never,
        importManager,
      );

      // Act
      const result = await skillService.getImportedSkills();

      // Assert
      expect(mockScanner.scanDirectory).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("skill-1");
    });
  });

  describe("GI-02: Cache populated state", () => {
    it("should return imported skills from cache without re-scanning", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1"]);
      const importManager = new SkillImportManager(mockStore as never);
      skillService = new SkillService(
        mockScanner as never,
        mockParser as never,
        importManager,
      );

      // Pre-populate cache
      await skillService.scanAvailableSkills();
      mockScanner.scanDirectory.mockClear();

      // Act
      const result = await skillService.getImportedSkills();

      // Assert
      expect(mockScanner.scanDirectory).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe("GI-03: ImportedIds without matching cache entry", () => {
    it("should not return skill when importedId has no cache match", async () => {
      // Arrange: importedIds contains skill not in scan results
      mockStore.get.mockReturnValue(["skill-1", "non-existent-skill"]);
      const importManager = new SkillImportManager(mockStore as never);
      skillService = new SkillService(
        mockScanner as never,
        mockParser as never,
        importManager,
      );

      // Act
      const result = await skillService.getImportedSkills();

      // Assert: Only skill-1 should be returned (non-existent-skill filtered out)
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("skill-1");
    });
  });

  describe("GI-04: Full flow after scanAvailableSkills", () => {
    it("should correctly return imported skills after scan", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-2"]);
      const importManager = new SkillImportManager(mockStore as never);
      skillService = new SkillService(
        mockScanner as never,
        mockParser as never,
        importManager,
      );

      // Act: Scan first, then get imported
      await skillService.scanAvailableSkills();
      const result = await skillService.getImportedSkills();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("skill-2");
    });
  });

  describe("Persistence after app restart simulation", () => {
    it("should return previously imported skills after simulated restart", async () => {
      // Arrange: Simulate persisted data
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // First session: import skill
      const importManager1 = new SkillImportManager(mockStore as never);
      const service1 = new SkillService(
        mockScanner as never,
        mockParser as never,
        importManager1,
      );
      await service1.importSkills(["skill-1"]);

      // Simulate restart: create new instances
      const importManager2 = new SkillImportManager(mockStore as never);
      const service2 = new SkillService(
        {
          ...mockScanner,
          scanDirectory: vi
            .fn()
            .mockResolvedValue(["/skills/skill-1", "/skills/skill-2"]),
        } as never,
        mockParser as never,
        importManager2,
      );

      // Act
      const result = await service2.getImportedSkills();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("skill-1");
    });
  });
});
```

### 4. 境界値テスト

| テストケース         | 入力値                         | 期待結果               |
| -------------------- | ------------------------------ | ---------------------- |
| 空配列ストア         | `[]`                           | 空配列を返す           |
| null値               | `null`                         | 空配列にフォールバック |
| 混合型配列           | `["a", 1, null, "b"]`          | `["a", "b"]` のみ抽出  |
| 大量データ（1000件） | 1000件のスキルID               | 正常に処理             |
| 特殊文字ID           | `["skill/path", "skill:name"]` | 正常に処理             |
| 重複ID               | `["a", "a", "b"]`              | 重複除去 `["a", "b"]`  |

## テストファイル配置

| テストファイル                           | 説明                           |
| ---------------------------------------- | ------------------------------ |
| `SkillImportManager.persistence.test.ts` | 型バリデーション・永続化テスト |
| `SkillService.persistence.test.ts`       | getImportedSkills統合テスト    |

## 成果物

| 成果物             | パス                                                                                    | 説明                   |
| ------------------ | --------------------------------------------------------------------------------------- | ---------------------- |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.persistence.test.ts` | 永続化テスト           |
| 統合テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillService.persistence.test.ts`       | SkillService連携テスト |

## 完了条件

- [ ] 型バリデーションテスト（TV-01〜TV-06）が作成されている
- [ ] 永続化サイクルテスト（PC-01〜PC-05）が作成されている
- [ ] getImportedSkills統合テスト（GI-01〜GI-04）が作成されている
- [ ] 境界値テストが含まれている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+, Function 80%+）

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "TASK-FIX-4-2"

# 確認項目
# - [ ] 型バリデーションテストが失敗する（Red状態）
# - [ ] 永続化サイクルテストが失敗する（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
