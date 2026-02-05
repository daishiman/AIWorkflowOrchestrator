/**
 * skillHandlers Integration Tests
 *
 * Phase 4: TDD Red Phase
 * IPC経由でのスキルインポート永続化をテストする。
 * 実際のelectron-storeとSkillServiceを使用して統合検証を行う。
 *
 * @see docs/30-workflows/skill-import-store-persistence/outputs/phase-02/test-strategy.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Store from "electron-store";
import { SkillImportManager } from "../../services/skill/SkillImportManager";
import { SkillService } from "../../services/skill/SkillService";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * electron-store用のスキーマ定義
 */
interface SkillStoreSchema {
  importedSkillIds: string[];
}

/**
 * Skill型定義
 */
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

/**
 * サンプルスキルデータ
 */
const sampleSkill1: Skill = {
  id: "skill-1",
  name: "Test Skill 1",
  slug: "test-skill-1",
  description: "A test skill",
  path: "/test/skills/test-skill-1/SKILL.md",
  triggers: ["test"],
  anchors: [],
  category: "testing",
  lastModified: new Date("2026-01-22T00:00:00Z"),
};

const sampleSkill2: Skill = {
  id: "skill-2",
  name: "Test Skill 2",
  slug: "test-skill-2",
  description: "Another test skill",
  path: "/test/skills/test-skill-2/SKILL.md",
  triggers: ["test2"],
  anchors: [],
  category: "testing",
  lastModified: new Date("2026-01-22T00:00:00Z"),
};

/**
 * モックSkillScanner
 * scanDirectory() でスキルファイルパスの配列を返す
 */
const createMockSkillScanner = () => ({
  scanDirectory: vi
    .fn()
    .mockResolvedValue([
      "/test/skills/test-skill-1/SKILL.md",
      "/test/skills/test-skill-2/SKILL.md",
    ]),
  setBasePath: vi.fn(),
  getBasePath: vi.fn().mockReturnValue("/test/skills"),
});

/**
 * モックSkillParser
 * parse() でSkillオブジェクトを返す
 */
const createMockSkillParser = () => ({
  parse: vi.fn().mockImplementation((filePath: string) => {
    if (filePath.includes("test-skill-1")) return Promise.resolve(sampleSkill1);
    if (filePath.includes("test-skill-2")) return Promise.resolve(sampleSkill2);
    return Promise.reject(new Error("Unknown skill"));
  }),
});

describe("skillHandlers Integration Tests", () => {
  let testStorePath: string;
  let store: Store<SkillStoreSchema>;
  let skillImportManager: SkillImportManager;
  let skillService: SkillService;
  let mockSkillScanner: ReturnType<typeof createMockSkillScanner>;
  let mockSkillParser: ReturnType<typeof createMockSkillParser>;

  beforeEach(() => {
    // テスト用の一時ディレクトリを作成
    testStorePath = path.join(os.tmpdir(), `skill-ipc-test-${Date.now()}`);
    fs.mkdirSync(testStorePath, { recursive: true });

    // 実際のelectron-storeインスタンスを作成
    store = new Store<SkillStoreSchema>({
      name: "skills-ipc-test",
      cwd: testStorePath,
      defaults: { importedSkillIds: [] },
    });

    // SkillImportManagerを実ストアで作成
    skillImportManager = new SkillImportManager(store);

    // モックのスキャナーとパーサーを作成
    mockSkillScanner = createMockSkillScanner();
    mockSkillParser = createMockSkillParser();

    // 実際のSkillServiceを作成（SkillImportManagerは実ストア使用）
    skillService = new SkillService(
      mockSkillScanner as never,
      mockSkillParser as never,
      skillImportManager,
    );
  });

  afterEach(() => {
    // クリーンアップ
    try {
      fs.rmSync(testStorePath, { recursive: true, force: true });
    } catch {
      // クリーンアップ失敗は無視
    }
  });

  // ===========================================================================
  // IPC経由の永続化テスト
  // ===========================================================================

  describe("IPC Persistence Flow", () => {
    it("IPC-INT-01: skill:import should persist skills and skill:get-imported should return them", async () => {
      // Act: スキルをインポート
      const importResult = await skillService.importSkills(["skill-1"]);

      // Assert: インポート成功
      expect(importResult.success).toBe(true);
      expect(importResult.importedCount).toBe(1);

      // Assert: インポートしたスキルが取得できる
      const importedSkills = await skillService.getImportedSkills();
      expect(importedSkills.map((s) => s.id)).toContain("skill-1");
    });

    it("IPC-INT-02: imported skills should persist across service instances", async () => {
      // Arrange: 最初のサービスインスタンスでインポート
      await skillService.importSkills(["skill-1", "skill-2"]);

      // Act: 新しいサービスインスタンスを作成
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-ipc-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newImportManager = new SkillImportManager(newStore);
      const newService = new SkillService(
        mockSkillScanner as never,
        mockSkillParser as never,
        newImportManager,
      );

      // Assert: 新しいインスタンスでもスキルが取得できる
      const importedSkills = await newService.getImportedSkills();
      expect(importedSkills.map((s) => s.id)).toContain("skill-1");
      expect(importedSkills.map((s) => s.id)).toContain("skill-2");
    });

    it("IPC-INT-03: skill:remove should persist removal across instances", async () => {
      // Arrange: インポート
      await skillService.importSkills(["skill-1", "skill-2"]);

      // Act: 削除
      await skillService.removeSkill("skill-1");

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-ipc-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newImportManager = new SkillImportManager(newStore);
      const newService = new SkillService(
        mockSkillScanner as never,
        mockSkillParser as never,
        newImportManager,
      );

      const importedSkills = await newService.getImportedSkills();
      expect(importedSkills.map((s) => s.id)).not.toContain("skill-1");
      expect(importedSkills.map((s) => s.id)).toContain("skill-2");
    });
  });

  // ===========================================================================
  // エラーハンドリングテスト
  // ===========================================================================

  describe("Error Handling", () => {
    it("IPC-INT-04: should handle import of non-existent skill gracefully", async () => {
      // Act: 存在しないスキルをインポート
      const result = await skillService.importSkills(["nonexistent-skill"]);

      // Assert: エラーにならずに処理完了
      expect(result.success).toBe(true);
    });

    it("IPC-INT-05: should handle double import gracefully", async () => {
      // Arrange: 最初のインポート
      await skillService.importSkills(["skill-1"]);

      // Act: 同じスキルを再度インポート
      const result = await skillService.importSkills(["skill-1"]);

      // Assert: 重複はカウントされない
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(0);
    });

    it("IPC-INT-06: should handle remove of non-imported skill gracefully", async () => {
      // Act: インポートしていないスキルを削除
      const result = await skillService.removeSkill("nonexistent");

      // Assert: エラーにならない
      expect(result.success).toBe(true);
      expect(result.removed).toBe(false);
    });
  });

  // ===========================================================================
  // 状態同期テスト
  // ===========================================================================

  describe("State Synchronization", () => {
    it("IPC-INT-07: skill:get-imported should return 0 skills initially", async () => {
      // Act: 初期状態でインポート済みスキルを取得
      const importedSkills = await skillService.getImportedSkills();

      // Assert: 空配列
      expect(importedSkills).toEqual([]);
    });

    it("IPC-INT-08: skill count should match import operations", async () => {
      // Act: 複数回のインポート操作
      await skillService.importSkills(["skill-1"]);
      let count = (await skillService.getImportedSkills()).length;
      expect(count).toBe(1);

      await skillService.importSkills(["skill-2"]);
      count = (await skillService.getImportedSkills()).length;
      expect(count).toBe(2);

      await skillService.removeSkill("skill-1");
      count = (await skillService.getImportedSkills()).length;
      expect(count).toBe(1);
    });
  });
});
