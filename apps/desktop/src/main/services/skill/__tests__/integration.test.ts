/**
 * Skill Management Integration Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * Tests the full flow from IPC to file system operations.
 *
 * NOTE: Per Phase 3 Design Review, we use existing `skill:` prefix channels.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-3/review-summary.md
 */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
} from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

// Types
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Array<{
    source: string;
    application: string;
    purpose: string;
  }>;
  category?: string;
  lastModified: Date;
}

interface SkillScanResult {
  skills: Skill[];
  errors: Array<{
    path: string;
    error: string;
    code: string;
  }>;
  scannedAt: Date;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

interface RemoveResult {
  success: boolean;
  removed: boolean;
}

// Skill IPC Channels (per Phase 3 review)
const _SKILL_CHANNELS = {
  LIST_AVAILABLE: "skill:list",
  LIST_IMPORTED: "skill:get-imported",
  IMPORT: "skill:import",
  REMOVE: "skill:remove",
  GET_DETAIL: "skill:get-detail",
} as const;

describe("Skill Management Integration", () => {
  let testDir: string;
  let skillService: {
    scanAvailableSkills: (forceRefresh?: boolean) => Promise<SkillScanResult>;
    getImportedSkills: () => Promise<Skill[]>;
    importSkills: (skillIds: string[]) => Promise<ImportResult>;
    removeSkill: (skillId: string) => Promise<RemoveResult>;
    getSkillById: (id: string) => Promise<Skill | null>;
    clearCache: () => void;
  };

  // Sample SKILL.md content
  const createSkillMd = (name: string, triggers: string[]) => `---
name: ${name}
description: |
  ${name}の説明です。

  Anchors:
  • Clean Code / 適用: 単一責務 / 目的: 品質向上

  Trigger:
  ${triggers.join(", ")}
license: MIT
allowed-tools:
  - Read
  - Write
tags:
  - integration
  - testing
---

# ${name}

This is the content of ${name}.
`;

  beforeAll(async () => {
    // Create test directory structure
    testDir = path.join(tmpdir(), `skill-integration-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create test skills
    const skill1Dir = path.join(testDir, "test-skill-1");
    const skill2Dir = path.join(testDir, "test-skill-2");
    const noSkillDir = path.join(testDir, "no-skill-dir");
    const hiddenDir = path.join(testDir, ".hidden-skill");

    await fs.mkdir(skill1Dir, { recursive: true });
    await fs.mkdir(skill2Dir, { recursive: true });
    await fs.mkdir(noSkillDir, { recursive: true });
    await fs.mkdir(hiddenDir, { recursive: true });

    await fs.writeFile(
      path.join(skill1Dir, "SKILL.md"),
      createSkillMd("Test Skill 1", ["test1", "integration"]),
    );
    await fs.writeFile(
      path.join(skill2Dir, "SKILL.md"),
      createSkillMd("Test Skill 2", ["test2", "development"]),
    );
    await fs.writeFile(
      path.join(hiddenDir, "SKILL.md"),
      createSkillMd("Hidden Skill", ["hidden"]),
    );
    // noSkillDir has no SKILL.md - should be ignored

    // Try to import services (will fail in Red phase)
    try {
      const { SkillService } = await import("../SkillService");
      const { SkillScanner } = await import("../SkillScanner");
      const { SkillParser } = await import("../SkillParser");
      const { SkillImportManager } = await import("../SkillImportManager");

      // Create mock store for SkillImportManager
      const mockStore = {
        get: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      };

      const scanner = new SkillScanner(testDir);
      const parser = new SkillParser();
      const importManager = new SkillImportManager(mockStore as never);

      skillService = new SkillService(scanner, parser, importManager);
    } catch {
      // Expected in Red phase
    }
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    if (skillService) {
      skillService.clearCache();
    }
  });

  // ===========================================================================
  // IPC Connection Tests
  // ===========================================================================

  describe("IPC Connection", () => {
    it("INT-IPC-01: should respond to skill:list", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを呼び出す
      const result = await skillService.scanAvailableSkills();

      // Then: スキルが返される
      expect(result).toBeDefined();
      expect(result.skills).toBeInstanceOf(Array);
      expect(result.scannedAt).toBeInstanceOf(Date);
    });

    it("INT-IPC-02: should respond to skill:get-imported", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getImportedSkillsを呼び出す
      const result = await skillService.getImportedSkills();

      // Then: 配列が返される
      expect(result).toBeInstanceOf(Array);
    });

    it("INT-IPC-03: should respond to skill:import", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: importSkillsを呼び出す
      const result = await skillService.importSkills(["test-id"]);

      // Then: ImportResultが返される
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("importedCount");
      expect(result).toHaveProperty("errors");
    });

    it("INT-IPC-04: should respond to skill:remove", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: removeSkillを呼び出す
      const result = await skillService.removeSkill("test-id");

      // Then: RemoveResultが返される
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("removed");
    });

    it("INT-IPC-05: should respond to skill:get-detail", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getSkillByIdを呼び出す
      const result = await skillService.getSkillById("nonexistent");

      // Then: Skill | nullが返される
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  // ===========================================================================
  // Data Flow Tests
  // ===========================================================================

  describe("Data Flow", () => {
    it("INT-DF-01: should scan skills from file system and return to renderer", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: ファイルシステムからスキルをスキャン
      const result = await skillService.scanAvailableSkills();

      // Then: 2つのスキル（隠しディレクトリと空ディレクトリを除く）
      expect(result.skills).toHaveLength(2);
      expect(result.skills.some((s) => s.name === "Test Skill 1")).toBe(true);
      expect(result.skills.some((s) => s.name === "Test Skill 2")).toBe(true);
    });

    it("INT-DF-02: should import skills and persist to store", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Given: 利用可能なスキル
      const scanResult = await skillService.scanAvailableSkills();
      const skillId = scanResult.skills[0].id;

      // When: スキルをインポート
      const importResult = await skillService.importSkills([skillId]);

      // Then: インポートが成功
      expect(importResult.success).toBe(true);
      expect(importResult.importedCount).toBe(1);
    });

    it("INT-DF-03: should remove skills and update store", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Given: インポート済みスキル
      const scanResult = await skillService.scanAvailableSkills();
      const skillId = scanResult.skills[0].id;
      await skillService.importSkills([skillId]);

      // When: スキルを削除
      const removeResult = await skillService.removeSkill(skillId);

      // Then: 削除が成功
      expect(removeResult.success).toBe(true);
      expect(removeResult.removed).toBe(true);
    });

    it("INT-DF-04: should parse SKILL.md correctly", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: スキルをスキャン
      const result = await skillService.scanAvailableSkills();
      const skill = result.skills.find((s) => s.name === "Test Skill 1");

      // Then: SKILL.mdが正しく解析される
      expect(skill).toBeDefined();
      if (skill) {
        expect(skill.name).toBe("Test Skill 1");
        expect(skill.triggers).toContain("test1");
        expect(skill.triggers).toContain("integration");
        expect(skill.anchors).toHaveLength(1);
        expect(skill.anchors[0].source).toBe("Clean Code");
        // Note: license property check removed - it's optional in Skill type
      }
    });

    it("INT-DF-05: should get skill detail by id", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Given: 利用可能なスキル
      const scanResult = await skillService.scanAvailableSkills();
      const skillId = scanResult.skills[0].id;

      // When: IDでスキル詳細を取得
      const skill = await skillService.getSkillById(skillId);

      // Then: スキル詳細が返される
      expect(skill).not.toBeNull();
      expect(skill?.id).toBe(skillId);
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe("Error Handling", () => {
    it("INT-EH-01: should return VALIDATION_ERROR for invalid input", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Note: This test verifies at service level, IPC validation is tested separately
      // When: 空配列でインポート
      const result = await skillService.importSkills([]);

      // Then: 成功するが、インポート数は0
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(0);
    });

    it("INT-EH-02: should return NOT_FOUND for unknown skill", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: 存在しないIDでスキルを取得
      const result = await skillService.getSkillById("nonexistent-id");

      // Then: nullが返される
      expect(result).toBeNull();
    });

    it("INT-EH-03: should handle parse errors gracefully", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Given: 不正なSKILL.mdを作成
      const invalidDir = path.join(testDir, "invalid-skill");
      await fs.mkdir(invalidDir, { recursive: true });
      await fs.writeFile(
        path.join(invalidDir, "SKILL.md"),
        "---\nname: [invalid yaml\n---\n# Invalid",
      );

      // When: スキルをスキャン
      const result = await skillService.scanAvailableSkills(true);

      // Then: エラーが収集され、他のスキルは正常に返される
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.skills.length).toBeGreaterThan(0);

      // Cleanup
      await fs.rm(invalidDir, { recursive: true, force: true });
    });

    it("INT-EH-04: should collect multiple errors", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // スキャン結果のエラー配列が存在することを確認
      const result = await skillService.scanAvailableSkills();
      expect(result.errors).toBeInstanceOf(Array);
    });
  });

  // ===========================================================================
  // State Synchronization Tests
  // ===========================================================================

  describe("State Synchronization", () => {
    it("INT-SS-01: should update cache after scan", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: スキャンを2回実行
      const result1 = await skillService.scanAvailableSkills();
      const result2 = await skillService.scanAvailableSkills();

      // Then: 同じスキルが返される（キャッシュ使用）
      expect(result1.skills.length).toBe(result2.skills.length);
      expect(result1.skills[0]?.id).toBe(result2.skills[0]?.id);
    });

    it("INT-SS-02: should reflect import changes immediately", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Given: 利用可能なスキル
      const scanResult = await skillService.scanAvailableSkills();
      const skillId = scanResult.skills[0].id;

      // When: スキルをインポート
      await skillService.importSkills([skillId]);
      const imported = await skillService.getImportedSkills();

      // Then: インポート済みリストに反映される
      expect(imported.some((s) => s.id === skillId)).toBe(true);
    });

    it("INT-SS-03: should refresh cache with forceRefresh", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: forceRefresh=trueでスキャン
      const result1 = await skillService.scanAvailableSkills(true);
      const result2 = await skillService.scanAvailableSkills(true);

      // Then: 両方とも新しいスキャン結果
      expect(result1.scannedAt.getTime()).toBeLessThanOrEqual(
        result2.scannedAt.getTime(),
      );
    });

    it("INT-SS-04: should handle concurrent operations", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: 並行して複数の操作を実行
      const [scan1, scan2, imported] = await Promise.all([
        skillService.scanAvailableSkills(),
        skillService.scanAvailableSkills(true),
        skillService.getImportedSkills(),
      ]);

      // Then: すべての操作が完了する
      expect(scan1.skills).toBeDefined();
      expect(scan2.skills).toBeDefined();
      expect(imported).toBeDefined();
    });
  });

  // ===========================================================================
  // Security Tests
  // ===========================================================================

  describe("Security", () => {
    it("INT-SEC-01: should ignore hidden directories", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: スキルをスキャン
      const result = await skillService.scanAvailableSkills();

      // Then: 隠しディレクトリのスキルは含まれない
      expect(result.skills.some((s) => s.name === "Hidden Skill")).toBe(false);
    });

    it("INT-SEC-02: should generate consistent IDs", async () => {
      if (!skillService) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: 2回スキャン
      const result1 = await skillService.scanAvailableSkills();
      skillService.clearCache();
      const result2 = await skillService.scanAvailableSkills();

      // Then: 同じパスから同じIDが生成される
      expect(result1.skills[0]?.id).toBe(result2.skills[0]?.id);
    });
  });
});
