/**
 * ElectronStoreMigration Unit Tests
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

describe("ElectronStoreMigration", () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let mockRepository: ISystemPromptRepository;
  let tempDir: string;

  beforeEach(async () => {
    mockStore = createMockStore();
    mockRepository = createMockRepository();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "migration-test-"));
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // ===========================================================================
  // needsMigration
  // ===========================================================================

  describe("needsMigration", () => {
    it("未完了・データありでtrueを返す", async () => {
      // Arrange
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
      mockStore._data["migrationStatus"] = {
        systemPromptTemplates: { completed: false },
      };

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.needsMigration();

      // Assert
      expect(result).toBe(true);
    });

    it("完了済みでfalseを返す", async () => {
      // Arrange
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
      mockStore._data["migrationStatus"] = {
        systemPromptTemplates: { completed: true },
      };

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.needsMigration();

      // Assert
      expect(result).toBe(false);
    });

    it("データなしでfalseを返す", async () => {
      // Arrange
      mockStore._data["systemPromptTemplates"] = [];

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.needsMigration();

      // Assert
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // migrate
  // ===========================================================================

  describe("migrate", () => {
    it("全テンプレートを正常に移行", async () => {
      // Arrange
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "テスト1",
          content: "コンテンツ1",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "custom-002",
          name: "テスト2",
          content: "コンテンツ2",
          isPreset: false,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.migrate("user-001");

      // Assert
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(2);
      expect(result.skippedCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
    });

    it("重複データはスキップされる", async () => {
      // Arrange
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "既存テンプレート",
          content: "コンテンツ",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;
      (
        mockRepository.existsByUserIdAndName as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.migrate("user-001");

      // Assert
      expect(result.migratedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("プリセットはスキップされる", async () => {
      // Arrange
      const templates: ElectronStoreTemplate[] = [
        {
          id: "preset-001",
          name: "プリセット",
          content: "コンテンツ",
          isPreset: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.migrate("user-001");

      // Assert
      expect(result.migratedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("エラー発生時も他のテンプレートを処理する", async () => {
      // Arrange
      const templates: ElectronStoreTemplate[] = [
        {
          id: "custom-001",
          name: "エラーテンプレート",
          content: "コンテンツ1",
          isPreset: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "custom-002",
          name: "正常テンプレート",
          content: "コンテンツ2",
          isPreset: false,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
      ];
      mockStore._data["systemPromptTemplates"] = templates;
      (mockRepository.create as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error("DB Error"))
        .mockResolvedValueOnce({});

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      const result = await migration.migrate("user-001");

      // Assert
      expect(result.success).toBe(false);
      expect(result.migratedCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].templateId).toBe("custom-001");
    });
  });

  // ===========================================================================
  // createBackup
  // ===========================================================================

  describe("createBackup", () => {
    it("バックアップファイルが作成される", async () => {
      // Arrange
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

      // Act
      const backupPath = await migration.createBackup();

      // Assert
      expect(backupPath).toContain("system-prompt-templates-");
      const content = await fs.readFile(backupPath, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("テスト");
    });
  });

  // ===========================================================================
  // restoreFromBackup
  // ===========================================================================

  describe("restoreFromBackup", () => {
    it("バックアップから正しく復元される", async () => {
      // Arrange
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
      const backupPath = path.join(tempDir, "backup.bak");
      await fs.writeFile(backupPath, JSON.stringify(templates));

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      await migration.restoreFromBackup(backupPath);

      // Assert
      expect(mockStore.set).toHaveBeenCalledWith(
        "systemPromptTemplates",
        templates,
      );
    });
  });

  // ===========================================================================
  // markMigrationComplete
  // ===========================================================================

  describe("markMigrationComplete", () => {
    it("完了フラグが設定される", async () => {
      // Arrange
      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      await migration.markMigrationComplete();

      // Assert
      expect(mockStore.set).toHaveBeenCalledWith(
        "migrationStatus",
        expect.objectContaining({
          systemPromptTemplates: expect.objectContaining({
            completed: true,
          }),
        }),
      );
    });
  });

  // ===========================================================================
  // resetMigrationStatus
  // ===========================================================================

  describe("resetMigrationStatus", () => {
    it("完了フラグがリセットされる", async () => {
      // Arrange
      mockStore._data["migrationStatus"] = {
        systemPromptTemplates: {
          completed: true,
          completedAt: "2024-01-01T00:00:00Z",
        },
      };

      const migration = new ElectronStoreMigration(mockRepository, mockStore);

      // Act
      await migration.resetMigrationStatus();

      // Assert
      expect(mockStore.set).toHaveBeenCalledWith(
        "migrationStatus",
        expect.objectContaining({
          systemPromptTemplates: expect.objectContaining({
            completed: false,
          }),
        }),
      );
    });
  });

  // ===========================================================================
  // Full workflow
  // ===========================================================================

  describe("Full workflow", () => {
    it("バックアップ → 移行 → 完了マークの一連の流れ", async () => {
      // Arrange
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

      // Act
      const needsMigration = await migration.needsMigration();
      expect(needsMigration).toBe(true);

      const backupPath = await migration.createBackup();
      expect(backupPath).toBeDefined();

      const result = await migration.migrate("user-001");
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);

      await migration.markMigrationComplete();

      const needsMigrationAfter = await migration.needsMigration();
      expect(needsMigrationAfter).toBe(false);
    });
  });
});
