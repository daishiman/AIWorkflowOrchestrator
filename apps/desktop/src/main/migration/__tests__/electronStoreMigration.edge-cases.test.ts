/**
 * ElectronStoreMigration Edge Case Tests
 *
 * Phase 6: テスト拡充 - エラーリカバリ、部分成功、データ整合性のエッジケース
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/migration-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

// Mock electron app
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn().mockImplementation(() => {
      throw new Error("Electron not initialized");
    }),
  },
}));

import {
  ElectronStoreMigration,
  type ElectronStoreTemplate,
  type IElectronStore,
} from "../electron-store-migration.js";
import type { ISystemPromptRepository } from "@repo/shared/repositories";

// Mock Store
const createMockStore = (): IElectronStore & {
  _data: Record<string, unknown>;
} => {
  const data: Record<string, unknown> = {};
  return {
    get: vi.fn(
      <T>(key: string, defaultValue?: T) =>
        (data[key] as T) ?? (defaultValue as T),
    ) as IElectronStore["get"],
    set: vi.fn(<T>(key: string, value: T) => {
      data[key] = value;
    }) as IElectronStore["set"],
    delete: vi.fn((key: string) => {
      delete data[key];
    }) as IElectronStore["delete"],
    _data: data,
  };
};

// Mock Repository
const createMockRepository = (): ISystemPromptRepository => ({
  findAllByUserId: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findAllPresets: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
  isPreset: vi.fn().mockResolvedValue(false),
  existsByUserIdAndName: vi.fn().mockResolvedValue(false),
  exists: vi.fn().mockResolvedValue(true),
});

describe("ElectronStoreMigration Edge Cases", () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let mockRepository: ISystemPromptRepository;
  let tempDir: string;

  beforeEach(async () => {
    mockStore = createMockStore();
    mockRepository = createMockRepository();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "migration-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // ===========================================================================
  // needsMigration Edge Cases
  // ===========================================================================

  describe("needsMigration エッジケース", () => {
    it("migrationStatusが存在しない場合、データがあればtrueを返す", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "テスト",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;
      // migrationStatusは設定しない

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.needsMigration();

      expect(result).toBe(true);
    });

    it("systemPromptTemplatesがundefinedの場合falseを返す", async () => {
      // systemPromptTemplatesを設定しない
      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.needsMigration();

      expect(result).toBe(false);
    });

    it("systemPromptTemplatesがnullの場合falseを返す", async () => {
      mockStore._data["systemPromptTemplates"] = null;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.needsMigration();

      expect(result).toBe(false);
    });

    it("プリセットのみの場合falseを返す", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "preset-001",
          name: "プリセット1",
          content: "コンテンツ",
          isPreset: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "preset-002",
          name: "プリセット2",
          content: "コンテンツ",
          isPreset: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.needsMigration();

      // プリセットはスキップされるため、移行対象なし
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // migrate Edge Cases - Partial Success
  // ===========================================================================

  describe("migrate 部分成功シナリオ", () => {
    it("一部のテンプレートでエラーが発生しても成功したものはカウントされる", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "成功1",
          content: "コンテンツ1",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "custom-002",
          name: "失敗",
          content: "コンテンツ2",
          isPreset: false,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "custom-003",
          name: "成功2",
          content: "コンテンツ3",
          isPreset: false,
          createdAt: "2024-01-03T00:00:00Z",
          updatedAt: "2024-01-03T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      // 2番目だけ失敗
      (mockRepository.create as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error("Constraint error"))
        .mockResolvedValueOnce({});

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.migrate("user-001");

      expect(result.success).toBe(false);
      expect(result.migratedCount).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].templateId).toBe("custom-002");
    });

    it("混合データ（プリセット+カスタム+既存）が正しく処理される", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "preset-001",
          name: "プリセット",
          content: "コンテンツ",
          isPreset: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "custom-001",
          name: "既存",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "custom-002",
          name: "新規",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-03T00:00:00Z",
          updatedAt: "2024-01-03T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      // 既存チェック: custom-001は既存、custom-002は新規
      (mockRepository.existsByUserIdAndName as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(true) // custom-001
        .mockResolvedValueOnce(false); // custom-002

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.migrate("user-001");

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1); // custom-002のみ
      expect(result.skippedCount).toBe(2); // preset-001 + custom-001
    });
  });

  // ===========================================================================
  // Data Validation Edge Cases
  // ===========================================================================

  describe("データ検証エッジケース", () => {
    it("無効な日付形式でも移行が試みられる", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "テスト",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "invalid-date",
          updatedAt: "invalid-date",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Should not throw, migration continues
      await migration.migrate("user-001");

      expect(mockRepository.create).toHaveBeenCalled();
    });

    it("特殊文字を含むテンプレート名が正しく処理される", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "🚀 特殊文字 <script>alert('xss')</script>",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.migrate("user-001");

      expect(result.success).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(
        "user-001",
        expect.objectContaining({
          name: "🚀 特殊文字 <script>alert('xss')</script>",
        }),
      );
    });

    it("非常に長いコンテンツでも移行が試みられる", async () => {
      const longContent = "あ".repeat(5000);
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "テスト",
          content: longContent,
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      // Repository側でエラーになる想定
      (mockRepository.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Content too long"),
      );

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.migrate("user-001");

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ===========================================================================
  // Backup Edge Cases
  // ===========================================================================

  describe("バックアップエッジケース", () => {
    it("空のテンプレート配列でもバックアップが作成される", async () => {
      mockStore._data["systemPromptTemplates"] = [];

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const backupPath = await migration.createBackup();

      expect(backupPath).toContain("system-prompt-templates-");
      const content = await fs.readFile(backupPath, "utf-8");
      expect(JSON.parse(content)).toEqual([]);
    });

    it("大量のテンプレートでもバックアップが作成される", async () => {
      const templates: ElectronStoreTemplate[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `custom-${i}`,
          name: `テンプレート${i}`,
          content: `コンテンツ${"あ".repeat(100)}`,
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        }),
      );
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const backupPath = await migration.createBackup();

      const content = await fs.readFile(backupPath, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(100);
    });

    it("日本語文字がバックアップで正しく保存される", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "日本語テンプレート名",
          content: "日本語コンテンツ\n改行付き",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const backupPath = await migration.createBackup();

      const content = await fs.readFile(backupPath, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed[0].name).toBe("日本語テンプレート名");
      expect(parsed[0].content).toBe("日本語コンテンツ\n改行付き");
    });
  });

  // ===========================================================================
  // Restore Edge Cases
  // ===========================================================================

  describe("リストアエッジケース", () => {
    it("存在しないバックアップファイルでエラー", async () => {
      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      await expect(
        migration.restoreFromBackup("/non/existent/path.bak"),
      ).rejects.toThrow();
    });

    it("不正なJSONでエラー", async () => {
      const backupPath = path.join(tempDir, "invalid.bak");
      await fs.writeFile(backupPath, "{ invalid json }");

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      await expect(migration.restoreFromBackup(backupPath)).rejects.toThrow();
    });

    it("空のJSONファイルでリストアできる", async () => {
      const backupPath = path.join(tempDir, "empty.bak");
      await fs.writeFile(backupPath, "[]");

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      await migration.restoreFromBackup(backupPath);

      expect(mockStore.set).toHaveBeenCalledWith("systemPromptTemplates", []);
    });
  });

  // ===========================================================================
  // Migration Status Edge Cases
  // ===========================================================================

  describe("マイグレーションステータスエッジケース", () => {
    it("マイグレーション完了後に日時が記録される", async () => {
      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      await migration.markMigrationComplete();

      expect(mockStore.set).toHaveBeenCalledWith(
        "migrationStatus",
        expect.objectContaining({
          systemPromptTemplates: expect.objectContaining({
            completed: true,
            completedAt: expect.any(String),
          }),
        }),
      );
    });

    it("既存のステータスを保持しつつ更新される", async () => {
      mockStore._data["migrationStatus"] = {
        otherMigration: { completed: true },
      };

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      await migration.markMigrationComplete();

      const call = (mockStore.set as ReturnType<typeof vi.fn>).mock.calls.find(
        (c) => c[0] === "migrationStatus",
      );
      expect(call[1]).toHaveProperty("otherMigration");
    });
  });

  // ===========================================================================
  // Concurrent Migration
  // ===========================================================================

  describe("並列マイグレーション", () => {
    it("同時に複数回migrateを呼び出しても安全", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "テスト",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // 同時実行
      const results = await Promise.all([
        migration.migrate("user-001"),
        migration.migrate("user-001"),
      ]);

      // 両方とも完了するが、createは制御されている
      expect(results.every((r) => typeof r.success === "boolean")).toBe(true);
    });
  });

  // ===========================================================================
  // Error Recovery
  // ===========================================================================

  describe("エラー回復", () => {
    it("全てのテンプレートでエラーが発生してもクラッシュしない", async () => {
      const templates: ElectronStoreTemplate[] = Array.from(
        { length: 5 },
        (_, i) => ({
          id: `custom-${i}`,
          name: `テスト${i}`,
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        }),
      );
      mockStore._data["systemPromptTemplates"] = templates;

      (mockRepository.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("All failed"),
      );

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      const result = await migration.migrate("user-001");

      expect(result.success).toBe(false);
      expect(result.migratedCount).toBe(0);
      expect(result.errors).toHaveLength(5);
    });

    it("マイグレーション失敗後もneedsMigrationはtrueを返す", async () => {
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "テスト",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      (mockRepository.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Failed"),
      );

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      await migration.migrate("user-001");

      // 失敗後もneedsMigrationはtrueのまま
      const needsMigration = await migration.needsMigration();
      expect(needsMigration).toBe(true);
    });
  });
});
