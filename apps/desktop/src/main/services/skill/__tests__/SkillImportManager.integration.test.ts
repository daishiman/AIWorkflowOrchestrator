/**
 * SkillImportManager Integration Tests
 *
 * Phase 4: TDD Red Phase
 * これらのテストは実際のelectron-storeを使用して永続化を検証する。
 *
 * @see docs/30-workflows/skill-import-store-persistence/outputs/phase-02/test-strategy.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Store from "electron-store";
import { SkillImportManager } from "../SkillImportManager";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * electron-store用のスキーマ定義
 */
interface SkillStoreSchema {
  importedSkillIds: string[];
}

describe("SkillImportManager Integration Tests", () => {
  let testStorePath: string;
  let store: Store<SkillStoreSchema>;
  let manager: SkillImportManager;

  beforeEach(() => {
    // テスト用の一時ディレクトリを作成
    testStorePath = path.join(os.tmpdir(), `skill-test-${Date.now()}`);
    fs.mkdirSync(testStorePath, { recursive: true });

    // 実際のelectron-storeインスタンスを作成
    store = new Store<SkillStoreSchema>({
      name: "skills-test",
      cwd: testStorePath,
      defaults: { importedSkillIds: [] },
    });

    manager = new SkillImportManager(store);
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
  // カテゴリA: ストアファイルI/O
  // ===========================================================================

  describe("Store File I/O", () => {
    it("INT-01: should create store file on first write", async () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Act
      await manager.importSkills(["skill-1"]);

      // Assert
      expect(fs.existsSync(storeFilePath)).toBe(true);
    });

    it("INT-02: should persist imported skills to actual store file", async () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Act
      await manager.importSkills(["skill-1", "skill-2"]);

      // Assert - ストアファイルの内容を直接確認
      const fileContent = JSON.parse(fs.readFileSync(storeFilePath, "utf-8"));
      expect(fileContent.importedSkillIds).toEqual(
        expect.arrayContaining(["skill-1", "skill-2"]),
      );
    });

    it("INT-03: should read existing data from store file", () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Arrange: 直接ファイルにデータを書き込む
      fs.writeFileSync(
        storeFilePath,
        JSON.stringify({ importedSkillIds: ["pre-existing-skill"] }),
      );

      // Act: 新しいインスタンスを作成
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);

      // Assert
      expect(newManager.getImportedSkillIds()).toContain("pre-existing-skill");
    });
  });

  // ===========================================================================
  // カテゴリB: インスタンス間永続化
  // ===========================================================================

  describe("Cross-instance Persistence", () => {
    it("INT-04: should restore imported skills across instances", async () => {
      // Arrange: 最初のインスタンスでインポート
      await manager.importSkills(["skill-1"]);

      // Act: 新しいインスタンスを作成
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);

      // Assert
      expect(newManager.getImportedSkillIds()).toContain("skill-1");
    });

    it("INT-05: should accumulate imports across instances", async () => {
      // Arrange: 最初のインスタンスでインポート
      await manager.importSkills(["skill-1"]);

      // Act: 2番目のインスタンスで追加インポート
      const store2 = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const manager2 = new SkillImportManager(store2);
      await manager2.importSkills(["skill-2"]);

      // Assert: 3番目のインスタンスで両方確認
      const store3 = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const manager3 = new SkillImportManager(store3);
      expect(manager3.getImportedSkillIds()).toEqual(
        expect.arrayContaining(["skill-1", "skill-2"]),
      );
    });
  });

  // ===========================================================================
  // カテゴリC: エラーリカバリー
  // ===========================================================================

  describe("Error Recovery", () => {
    it("INT-06: should handle corrupted store file gracefully", () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Arrange: 破損したJSONを書き込む
      fs.writeFileSync(storeFilePath, "{ invalid json }");

      // Act & Assert: エラーにならないこと
      expect(() => {
        new Store<SkillStoreSchema>({
          name: "skills-test",
          cwd: testStorePath,
          defaults: { importedSkillIds: [] },
          clearInvalidConfig: true,
        });
      }).not.toThrow();
    });

    it("INT-07: should use defaults when store file is missing", () => {
      // Arrange: 新しい一時ディレクトリ（ファイルなし）
      const emptyPath = path.join(os.tmpdir(), `skill-empty-${Date.now()}`);
      fs.mkdirSync(emptyPath, { recursive: true });

      try {
        // Act: ファイルがない状態でストアを作成
        const emptyStore = new Store<SkillStoreSchema>({
          name: "skills-empty",
          cwd: emptyPath,
          defaults: { importedSkillIds: [] },
        });
        const emptyManager = new SkillImportManager(emptyStore);

        // Assert
        expect(emptyManager.getImportedSkillIds()).toEqual([]);
      } finally {
        // クリーンアップ
        fs.rmSync(emptyPath, { recursive: true, force: true });
      }
    });
  });

  // ===========================================================================
  // カテゴリD: データフロー完全性
  // ===========================================================================

  describe("Data Flow Integrity", () => {
    it("INT-08: should persist removal across instances", async () => {
      // Arrange: インポート
      await manager.importSkills(["skill-1", "skill-2"]);

      // Act: 削除
      await manager.removeSkill("skill-1");

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      expect(newManager.getImportedSkillIds()).not.toContain("skill-1");
      expect(newManager.getImportedSkillIds()).toContain("skill-2");
    });

    it("INT-09: should maintain data integrity after multiple operations", async () => {
      // Act: 複数の操作を実行
      await manager.importSkills(["skill-1", "skill-2"]);
      await manager.importSkills(["skill-3"]);
      await manager.removeSkill("skill-2");
      await manager.importSkills(["skill-4"]);

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      const ids = newManager.getImportedSkillIds();
      expect(ids).toContain("skill-1");
      expect(ids).not.toContain("skill-2");
      expect(ids).toContain("skill-3");
      expect(ids).toContain("skill-4");
    });
  });

  // ===========================================================================
  // カテゴリE: エッジケーステスト（Phase 6追加）
  // ===========================================================================

  describe("Edge Cases", () => {
    it("INT-10: should handle import→remove→re-import flow correctly", async () => {
      // Act: インポート→削除→再インポート
      await manager.importSkills(["skill-1"]);
      await manager.removeSkill("skill-1");
      const result = await manager.importSkills(["skill-1"]);

      // Assert
      expect(result.importedCount).toBe(1);

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      expect(newManager.getImportedSkillIds()).toContain("skill-1");
    });

    it("INT-11: should handle large number of skills (100+)", async () => {
      // Arrange: 100件のスキルIDを生成
      const skillIds = Array.from({ length: 100 }, (_, i) => `skill-${i}`);

      // Act: 100件をインポート
      const result = await manager.importSkills(skillIds);

      // Assert
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(100);

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      expect(newManager.getImportedSkillIds()).toHaveLength(100);
    });

    it("INT-12: should handle special characters in skillId", async () => {
      // Arrange: 特殊文字を含むスキルID
      const specialIds = [
        "skill-with-dash",
        "skill_with_underscore",
        "skill/with/slash",
        "skill.with.dot",
      ];

      // Act
      await manager.importSkills(specialIds);

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      for (const id of specialIds) {
        expect(newManager.getImportedSkillIds()).toContain(id);
      }
    });

    it("INT-13: should handle duplicate imports correctly", async () => {
      // Act: 同じスキルを複数回インポート
      await manager.importSkills(["skill-1", "skill-1", "skill-2"]);
      await manager.importSkills(["skill-1", "skill-3"]);

      // Assert: 重複なく保存される
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      const ids = newManager.getImportedSkillIds();
      expect(ids.filter((id) => id === "skill-1")).toHaveLength(1);
      expect(ids).toHaveLength(3);
    });

    it("INT-14: should handle empty array import", async () => {
      // Act: 空配列でインポート
      const result = await manager.importSkills([]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(0);
    });
  });

  // ===========================================================================
  // カテゴリF: 複雑なフローテスト（Phase 6追加）
  // ===========================================================================

  describe("Complex Flow", () => {
    it("INT-15: should handle alternating import and remove operations", async () => {
      // Act: 交互に追加と削除
      await manager.importSkills(["skill-1"]);
      await manager.importSkills(["skill-2"]);
      await manager.removeSkill("skill-1");
      await manager.importSkills(["skill-3"]);
      await manager.removeSkill("skill-2");
      await manager.importSkills(["skill-1"]); // 再インポート

      // Assert: 新しいインスタンスで確認
      const newStore = new Store<SkillStoreSchema>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);
      const ids = newManager.getImportedSkillIds();
      expect(ids).toContain("skill-1");
      expect(ids).not.toContain("skill-2");
      expect(ids).toContain("skill-3");
    });
  });
});
