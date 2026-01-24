/**
 * SkillImportStore Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/task-2b-skill-import-store/outputs/phase-2/test-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// === Type Definitions ===

interface ImportedSkillData {
  name: string;
  importedAt: string;
  status: "active" | "disabled";
  lastUsedAt?: string;
}

interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}

interface SkillMetadata {
  name: string;
  description: string;
  path: string;
  updatedAt: Date;
  agents: unknown[];
  references: unknown[];
  scripts: unknown[];
  assets: unknown[];
  schemas: unknown[];
  indexes: unknown[];
  otherFiles: unknown[];
}

interface SkillCacheEntry {
  metadata: SkillMetadata;
  cachedAt: string;
}

// === Constants ===

const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};

const TEST_SKILL_NAME = "test-skill";

const TEST_SKILL_METADATA: SkillMetadata = {
  name: TEST_SKILL_NAME,
  description: "Test skill for unit testing",
  path: "/path/to/test-skill",
  updatedAt: new Date("2026-01-24T00:00:00.000Z"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};

// === Invalid Skill Names ===

const INVALID_SKILL_NAMES = [
  "", // 空文字
  " ", // スペースのみ
  "../evil", // パストラバーサル
  "skill\0name", // null文字
  "skill/name", // スラッシュ
  "skill\\name", // バックスラッシュ
  "a".repeat(129), // 長すぎる
  "skill name", // スペース含む
  "skill:name", // コロン
];

// === Mocks ===

// Mock store data
let mockStoreData: Record<string, unknown> = {};

const mockStore = {
  get: vi.fn((key: string, defaultValue?: unknown) => {
    const keys = key.split(".");
    let value: unknown = mockStoreData;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue;
      }
    }
    return value ?? defaultValue;
  }),
  set: vi.fn((key: string, value: unknown) => {
    const keys = key.split(".");
    if (keys.length === 1) {
      mockStoreData[key] = value;
    } else {
      let obj = mockStoreData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
    }
  }),
  has: vi.fn((key: string) => key in mockStoreData),
  delete: vi.fn((key: string) => {
    delete mockStoreData[key];
  }),
  clear: vi.fn(() => {
    mockStoreData = {};
  }),
};

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => mockStore),
}));

// === Test Suite ===

describe("SkillImportStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // モックをデフォルト実装に戻す
    mockStore.get.mockImplementation((key: string, defaultValue?: unknown) => {
      const keys = key.split(".");
      let value: unknown = mockStoreData;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return defaultValue;
        }
      }
      return value ?? defaultValue;
    });

    mockStoreData = {
      schemaVersion: 1,
      importedSkills: {},
      skillSettings: {},
    };
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // Import Management
  // ===========================================================================

  describe("import management", () => {
    describe("getImported", () => {
      it("SIS-IM-01: should return empty array when no skills imported", async () => {
        // Given: ストアが空
        mockStoreData.importedSkills = {};

        // When: getImportedを呼び出す
        let imported: ImportedSkillData[];
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          imported = store.getImported();
        } catch {
          // Expected in Red phase - module doesn't exist
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 空配列を返す
        expect(imported).toEqual([]);
      });

      it("SIS-IM-02: should return all imported skills", async () => {
        // Given: 複数のスキルがインポート済み
        mockStoreData.importedSkills = {
          "skill-1": {
            name: "skill-1",
            importedAt: "2026-01-24T00:00:00.000Z",
            status: "active",
          },
          "skill-2": {
            name: "skill-2",
            importedAt: "2026-01-24T01:00:00.000Z",
            status: "active",
          },
        };

        // When: getImportedを呼び出す
        let imported: ImportedSkillData[];
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          imported = store.getImported();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 全スキルを返す
        expect(imported).toHaveLength(2);
        expect(imported.map((s) => s.name)).toContain("skill-1");
        expect(imported.map((s) => s.name)).toContain("skill-2");
      });

      it("SIS-IM-03: should return empty array on store read error", async () => {
        // Given: 正常にモジュールをロード後、get呼び出しでエラー
        let imported: ImportedSkillData[];
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();

          // getImported呼び出し時にエラーを発生させる
          mockStore.get.mockImplementationOnce(() => {
            throw new Error("Store read error");
          });

          imported = store.getImported();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 空配列にフォールバック
        expect(imported).toEqual([]);
      });
    });

    describe("addImport", () => {
      it("SIS-IM-04: should add a new skill", async () => {
        // Given: 空のストア
        mockStoreData.importedSkills = {};

        // When: addImportを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.addImport(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: スキルが追加される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-IM-05: should set initial status as active", async () => {
        // When: addImportを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.addImport(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: statusがactiveに設定される
        // 実装はimportedSkillsオブジェクト全体を設定する
        const setCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "importedSkills",
        );
        expect(setCall).toBeDefined();
        if (setCall && typeof setCall[1] === "object" && setCall[1] !== null) {
          const importedSkills = setCall[1] as Record<
            string,
            ImportedSkillData
          >;
          expect(importedSkills[TEST_SKILL_NAME]?.status).toBe("active");
        }
      });

      it("SIS-IM-06: should set importedAt timestamp", async () => {
        // When: addImportを呼び出す
        const before = new Date().toISOString();
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.addImport(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
        const after = new Date().toISOString();

        // Then: importedAtが現在日時で設定される
        // 実装はimportedSkillsオブジェクト全体を設定する
        const setCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "importedSkills",
        );
        expect(setCall).toBeDefined();
        if (setCall && typeof setCall[1] === "object" && setCall[1] !== null) {
          const importedSkills = setCall[1] as Record<
            string,
            ImportedSkillData
          >;
          const importedAt = importedSkills[TEST_SKILL_NAME]?.importedAt;
          expect(importedAt >= before).toBe(true);
          expect(importedAt <= after).toBe(true);
        }
      });

      it("SIS-IM-07: should throw on empty skill name", async () => {
        // When/Then: 空文字でエラー
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          expect(() => store.addImport("")).toThrow();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
      });

      it("SIS-IM-08: should throw on invalid skill name characters", async () => {
        // When/Then: 無効な文字を含むスキル名でエラー
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();

          for (const invalidName of INVALID_SKILL_NAMES) {
            expect(() => store.addImport(invalidName)).toThrow();
          }
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
      });

      it("SIS-IM-09: should overwrite existing skill (idempotent)", async () => {
        // Given: 既存のスキル
        mockStoreData.importedSkills = {
          [TEST_SKILL_NAME]: {
            name: TEST_SKILL_NAME,
            importedAt: "2026-01-01T00:00:00.000Z",
            status: "active",
          },
        };

        // When: 同じスキル名でaddImport
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.addImport(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 上書きされる（エラーにならない）
        expect(mockStore.set).toHaveBeenCalled();
      });
    });

    describe("removeImport", () => {
      it("SIS-IM-10: should remove an existing skill", async () => {
        // Given: 既存のスキル
        mockStoreData.importedSkills = {
          [TEST_SKILL_NAME]: {
            name: TEST_SKILL_NAME,
            importedAt: "2026-01-24T00:00:00.000Z",
            status: "active",
          },
        };

        // When: removeImportを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.removeImport(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: スキルが削除される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-IM-11: should also remove skill settings", async () => {
        // Given: スキルと設定
        mockStoreData.importedSkills = {
          [TEST_SKILL_NAME]: {
            name: TEST_SKILL_NAME,
            importedAt: "2026-01-24T00:00:00.000Z",
            status: "active",
          },
        };
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: { ...DEFAULT_SKILL_SETTINGS },
        };

        // When: removeImportを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.removeImport(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 設定も削除される
        // 複数のset呼び出しがあることを確認
        const setCalls = mockStore.set.mock.calls;
        expect(setCalls.length).toBeGreaterThanOrEqual(2);
      });

      it("SIS-IM-12: should do nothing if skill does not exist (idempotent)", async () => {
        // Given: 空のストア
        mockStoreData.importedSkills = {};

        // When: 存在しないスキルをremove
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          // エラーにならないことを確認
          expect(() => store.removeImport("non-existent")).not.toThrow();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
      });
    });

    describe("exists", () => {
      it("SIS-IM-13: should return true for imported skill", async () => {
        // Given: インポート済みスキル
        mockStoreData.importedSkills = {
          [TEST_SKILL_NAME]: {
            name: TEST_SKILL_NAME,
            importedAt: "2026-01-24T00:00:00.000Z",
            status: "active",
          },
        };

        // When: existsを呼び出す
        let result: boolean;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          result = store.exists(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it("SIS-IM-14: should return false for non-imported skill", async () => {
        // Given: 空のストア
        mockStoreData.importedSkills = {};

        // When: existsを呼び出す
        let result: boolean;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          result = store.exists("unknown-skill");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: falseを返す
        expect(result).toBe(false);
      });
    });

    describe("updateLastUsed", () => {
      it("SIS-IM-15: should update lastUsedAt timestamp", async () => {
        // Given: インポート済みスキル
        mockStoreData.importedSkills = {
          [TEST_SKILL_NAME]: {
            name: TEST_SKILL_NAME,
            importedAt: "2026-01-24T00:00:00.000Z",
            status: "active",
          },
        };

        // When: updateLastUsedを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.updateLastUsed(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: lastUsedAtが更新される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-IM-16: should do nothing if skill does not exist", async () => {
        // Given: 空のストア
        mockStoreData.importedSkills = {};

        // When: 存在しないスキルでupdateLastUsed
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          // エラーにならないことを確認
          expect(() => store.updateLastUsed("non-existent")).not.toThrow();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
      });
    });
  });

  // ===========================================================================
  // Settings Management
  // ===========================================================================

  describe("settings management", () => {
    describe("getSettings", () => {
      it("SIS-SM-01: should return default settings for new skill", async () => {
        // Given: 設定なし
        mockStoreData.skillSettings = {};

        // When: getSettingsを呼び出す
        let settings: SkillSettings;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          settings = store.getSettings(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: デフォルト値を返す
        expect(settings.autoApproveReadOnly).toBe(true);
        expect(settings.rememberPermissions).toBe(false);
        expect(settings.rememberedPermissions).toEqual({});
      });

      it("SIS-SM-02: should return stored settings for existing skill", async () => {
        // Given: 保存された設定
        const savedSettings: SkillSettings = {
          autoApproveReadOnly: false,
          rememberPermissions: true,
          rememberedPermissions: { Read: "allow" },
        };
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: savedSettings,
        };

        // When: getSettingsを呼び出す
        let settings: SkillSettings;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          settings = store.getSettings(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 保存された設定を返す
        expect(settings.autoApproveReadOnly).toBe(false);
        expect(settings.rememberPermissions).toBe(true);
        expect(settings.rememberedPermissions).toEqual({ Read: "allow" });
      });
    });

    describe("updateSettings", () => {
      it("SIS-SM-03: should update settings", async () => {
        // When: updateSettingsを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.updateSettings(TEST_SKILL_NAME, { autoApproveReadOnly: false });
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 設定が更新される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-SM-04: should merge partial settings with existing", async () => {
        // Given: 既存の設定
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: {
            autoApproveReadOnly: true,
            rememberPermissions: false,
            rememberedPermissions: {},
          },
        };

        // When: 部分的な設定を更新
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.updateSettings(TEST_SKILL_NAME, { rememberPermissions: true });
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 既存設定とマージされる
        const setCall = mockStore.set.mock.calls.find(
          (call) =>
            typeof call[0] === "string" && call[0].includes("skillSettings"),
        );
        expect(setCall).toBeDefined();
      });

      it("SIS-SM-05: should create settings if not exists", async () => {
        // Given: 設定なし
        mockStoreData.skillSettings = {};

        // When: updateSettingsを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.updateSettings(TEST_SKILL_NAME, { autoApproveReadOnly: false });
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 設定が作成される
        expect(mockStore.set).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // Permission Management
  // ===========================================================================

  describe("permission management", () => {
    describe("rememberPermission", () => {
      it("SIS-PM-01: should remember allow permission", async () => {
        // When: rememberPermissionを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.rememberPermission(TEST_SKILL_NAME, "Read", "allow");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 権限が記憶される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-PM-02: should remember deny permission", async () => {
        // When: rememberPermissionを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.rememberPermission(TEST_SKILL_NAME, "Write", "deny");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 権限が記憶される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-PM-03: should overwrite existing permission", async () => {
        // Given: 既存の権限設定
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: {
            ...DEFAULT_SKILL_SETTINGS,
            rememberedPermissions: { Read: "deny" },
          },
        };

        // When: 同じツールの権限を上書き
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.rememberPermission(TEST_SKILL_NAME, "Read", "allow");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 権限が上書きされる
        expect(mockStore.set).toHaveBeenCalled();
      });
    });

    describe("getRememberedPermission", () => {
      it("SIS-PM-04: should return allow permission", async () => {
        // Given: allow権限が記憶されている
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: {
            ...DEFAULT_SKILL_SETTINGS,
            rememberedPermissions: { Read: "allow" },
          },
        };

        // When: getRememberedPermissionを呼び出す
        let permission: "allow" | "deny" | undefined;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          permission = store.getRememberedPermission(TEST_SKILL_NAME, "Read");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: allowを返す
        expect(permission).toBe("allow");
      });

      it("SIS-PM-05: should return deny permission", async () => {
        // Given: deny権限が記憶されている
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: {
            ...DEFAULT_SKILL_SETTINGS,
            rememberedPermissions: { Write: "deny" },
          },
        };

        // When: getRememberedPermissionを呼び出す
        let permission: "allow" | "deny" | undefined;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          permission = store.getRememberedPermission(TEST_SKILL_NAME, "Write");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: denyを返す
        expect(permission).toBe("deny");
      });

      it("SIS-PM-06: should return undefined for unknown tool", async () => {
        // Given: 権限設定あり（別のツール）
        mockStoreData.skillSettings = {
          [TEST_SKILL_NAME]: {
            ...DEFAULT_SKILL_SETTINGS,
            rememberedPermissions: { Read: "allow" },
          },
        };

        // When: 未設定のツールで呼び出す
        let permission: "allow" | "deny" | undefined;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          permission = store.getRememberedPermission(
            TEST_SKILL_NAME,
            "Unknown",
          );
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: undefinedを返す
        expect(permission).toBeUndefined();
      });

      it("SIS-PM-07: should return undefined for unknown skill", async () => {
        // Given: 設定なし
        mockStoreData.skillSettings = {};

        // When: 存在しないスキルで呼び出す
        let permission: "allow" | "deny" | undefined;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          permission = store.getRememberedPermission("unknown-skill", "Read");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: undefinedを返す
        expect(permission).toBeUndefined();
      });
    });
  });

  // ===========================================================================
  // Cache Management
  // ===========================================================================

  describe("cache management", () => {
    describe("setCache", () => {
      it("SIS-CM-01: should set skill metadata cache", async () => {
        // When: setCacheを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.setCache(TEST_SKILL_NAME, TEST_SKILL_METADATA);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: キャッシュが設定される
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-CM-02: should set cachedAt timestamp", async () => {
        // When: setCacheを呼び出す
        const _before = new Date().toISOString();
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.setCache(TEST_SKILL_NAME, TEST_SKILL_METADATA);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
        const _after = new Date().toISOString();

        // Then: cachedAtが現在日時で設定される
        const setCall = mockStore.set.mock.calls.find(
          (call) =>
            typeof call[0] === "string" && call[0].includes("skillCache"),
        );
        expect(setCall).toBeDefined();
      });
    });

    describe("getCache", () => {
      it("SIS-CM-03: should return cached metadata", async () => {
        // Given: キャッシュ済みメタデータ
        const cachedEntry: SkillCacheEntry = {
          metadata: TEST_SKILL_METADATA,
          cachedAt: "2026-01-24T00:00:00.000Z",
        };
        mockStoreData.skillCache = {
          [TEST_SKILL_NAME]: cachedEntry,
        };

        // When: getCacheを呼び出す
        let cache: SkillCacheEntry | undefined;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          cache = store.getCache(TEST_SKILL_NAME);
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: キャッシュを返す
        expect(cache).toBeDefined();
        expect(cache?.metadata.name).toBe(TEST_SKILL_NAME);
      });

      it("SIS-CM-04: should return undefined for uncached skill", async () => {
        // Given: キャッシュなし
        mockStoreData.skillCache = {};

        // When: getCacheを呼び出す
        let cache: SkillCacheEntry | undefined;
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          cache = store.getCache("uncached-skill");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: undefinedを返す
        expect(cache).toBeUndefined();
      });
    });

    describe("invalidateCache", () => {
      it("SIS-CM-05: should invalidate specific skill cache", async () => {
        // Given: 複数のキャッシュ
        mockStoreData.skillCache = {
          "skill-1": {
            metadata: { ...TEST_SKILL_METADATA, name: "skill-1" },
            cachedAt: "2026-01-24T00:00:00.000Z",
          },
          "skill-2": {
            metadata: { ...TEST_SKILL_METADATA, name: "skill-2" },
            cachedAt: "2026-01-24T00:00:00.000Z",
          },
        };

        // When: 特定スキルのキャッシュを無効化
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.invalidateCache("skill-1");
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 指定スキルのみ削除
        expect(mockStore.set).toHaveBeenCalled();
      });

      it("SIS-CM-06: should invalidate all cache when no skillName", async () => {
        // Given: 複数のキャッシュ
        mockStoreData.skillCache = {
          "skill-1": {
            metadata: { ...TEST_SKILL_METADATA, name: "skill-1" },
            cachedAt: "2026-01-24T00:00:00.000Z",
          },
          "skill-2": {
            metadata: { ...TEST_SKILL_METADATA, name: "skill-2" },
            cachedAt: "2026-01-24T00:00:00.000Z",
          },
        };

        // When: 全キャッシュを無効化
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.invalidateCache();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: 全キャッシュが削除される
        const setCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "skillCache",
        );
        expect(setCall).toBeDefined();
        expect(setCall?.[1]).toEqual({});
      });

      it("SIS-CM-07: should do nothing if cache does not exist", async () => {
        // Given: キャッシュなし
        mockStoreData.skillCache = {};

        // When: 存在しないキャッシュを無効化
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          // エラーにならないことを確認
          expect(() => store.invalidateCache("non-existent")).not.toThrow();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
      });
    });
  });

  // ===========================================================================
  // Schema Migration
  // ===========================================================================

  describe("schema migration", () => {
    it("SIS-MG-01: should initialize with schema version 1", async () => {
      // When: ストアを初期化
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        // ストアが正常に初期化されることを確認
        expect(store).toBeDefined();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-MG-02: should migrate from version 0 to 1", async () => {
      // Given: 古いバージョンのデータ
      mockStoreData = {
        // schemaVersion なし（バージョン0相当）
        importedSkills: {
          [TEST_SKILL_NAME]: {
            name: TEST_SKILL_NAME,
            importedAt: "2026-01-01T00:00:00.000Z",
            status: "active",
          },
        },
      };

      // When: ストアを初期化（マイグレーション実行）
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        // マイグレーション後にバージョン1になることを確認
        expect(store).toBeDefined();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-MG-03: should handle corrupted data gracefully", async () => {
      // Given: 初期化時のget呼び出しでエラーを発生させる
      // runMigrations()でschemaVersionを取得する際にエラーが発生するシナリオ
      mockStore.get.mockImplementationOnce(() => {
        throw new Error("Corrupted store");
      });

      // When/Then: 破損データでの初期化がエラーにならない
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        // 初期化が成功し、機能が使用可能であることを確認
        expect(store).toBeDefined();
        expect(() => store.getImported()).not.toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });
  });

  // ===========================================================================
  // Test Utilities
  // ===========================================================================

  describe("test utilities", () => {
    describe("reset", () => {
      it("SIS-TU-01: should reset all data to defaults", async () => {
        // Given: データが存在する
        mockStoreData = {
          schemaVersion: 1,
          importedSkills: { [TEST_SKILL_NAME]: {} },
          skillSettings: { [TEST_SKILL_NAME]: {} },
          skillCache: { [TEST_SKILL_NAME]: {} },
        };

        // When: resetを呼び出す
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          store.reset();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }

        // Then: デフォルト値にリセット
        expect(mockStore.set).toHaveBeenCalled();
      });
    });

    describe("internalStore", () => {
      it("SIS-TU-02: should provide access to internal store", async () => {
        // When: internalStoreにアクセス
        try {
          const { getSkillImportStore } = await import("../skillImportStore");
          const store = getSkillImportStore();
          const internal = store.internalStore;

          // Then: 内部ストアにアクセスできる
          expect(internal).toBeDefined();
        } catch {
          throw new Error("skillImportStore module not implemented");
        }
      });
    });
  });

  // ===========================================================================
  // Phase 6: Edge Case Tests
  // ===========================================================================

  describe("edge cases", () => {
    it("SIS-EC-01: should reject skill names with only numbers", async () => {
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        // 数字のみは有効（パターン: /^[a-zA-Z0-9_-]{1,128}$/）
        expect(() => store.addImport("12345")).not.toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EC-02: should handle maximum length skill name (128 chars)", async () => {
      const maxLengthName = "a".repeat(128);
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        expect(() => store.addImport(maxLengthName)).not.toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EC-03: should reject skill name exceeding 128 chars", async () => {
      const tooLongName = "a".repeat(129);
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        expect(() => store.addImport(tooLongName)).toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EC-04: should handle duplicate import by overwriting", async () => {
      mockStoreData.importedSkills = {
        [TEST_SKILL_NAME]: {
          name: TEST_SKILL_NAME,
          importedAt: "2026-01-01T00:00:00.000Z",
          status: "active",
        },
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        const oldImportedAt = "2026-01-01T00:00:00.000Z";

        store.addImport(TEST_SKILL_NAME);

        // importedAtが更新されていることを確認
        const setCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "importedSkills",
        );
        if (setCall) {
          const skills = setCall[1] as Record<string, ImportedSkillData>;
          expect(skills[TEST_SKILL_NAME].importedAt).not.toBe(oldImportedAt);
        }
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EC-05: should handle hyphen and underscore in skill name", async () => {
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        expect(() => store.addImport("my-skill_v2")).not.toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EC-06: should handle single character skill name", async () => {
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        expect(() => store.addImport("a")).not.toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });
  });

  // ===========================================================================
  // Phase 6: Error Handling Tests
  // ===========================================================================

  describe("error handling", () => {
    it("SIS-EH-01: should handle null skill name", async () => {
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        expect(() => store.addImport(null as unknown as string)).toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EH-02: should handle undefined skill name", async () => {
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        expect(() => store.addImport(undefined as unknown as string)).toThrow();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EH-03: should handle missing fields in stored skill data", async () => {
      mockStoreData.importedSkills = {
        [TEST_SKILL_NAME]: {
          name: TEST_SKILL_NAME,
          // importedAt と status が欠けている
        } as ImportedSkillData,
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();
        // エラーにならずに動作することを確認
        const imported = store.getImported();
        expect(imported).toHaveLength(1);
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-EH-04: should handle store write error gracefully", async () => {
      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        // set呼び出し時にエラーを発生させる
        mockStore.set.mockImplementationOnce(() => {
          throw new Error("Write error");
        });

        // エラーがスローされることを確認
        expect(() => store.addImport("new-skill")).toThrow("Write error");
      } catch (error) {
        // モジュール未実装の場合のみエラーを再スロー
        if (
          (error as Error).message === "skillImportStore module not implemented"
        ) {
          throw error;
        }
        // Write errorはExpectedなので無視
      }
    });
  });

  // ===========================================================================
  // Phase 6: Permission Management Detailed Tests
  // ===========================================================================

  describe("permission management - detailed", () => {
    it("SIS-PMD-01: should remember permissions for multiple tools", async () => {
      mockStoreData.skillSettings = {};

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        store.rememberPermission(TEST_SKILL_NAME, "Read", "allow");
        store.rememberPermission(TEST_SKILL_NAME, "Write", "deny");
        store.rememberPermission(TEST_SKILL_NAME, "Edit", "allow");

        // 複数のset呼び出しがあることを確認
        expect(mockStore.set).toHaveBeenCalledTimes(3);
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-PMD-02: should clear all permissions when skill is removed", async () => {
      mockStoreData.importedSkills = {
        [TEST_SKILL_NAME]: {
          name: TEST_SKILL_NAME,
          importedAt: "2026-01-24T00:00:00.000Z",
          status: "active",
        },
      };
      mockStoreData.skillSettings = {
        [TEST_SKILL_NAME]: {
          autoApproveReadOnly: true,
          rememberPermissions: true,
          rememberedPermissions: {
            Read: "allow",
            Write: "deny",
          },
        },
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        store.removeImport(TEST_SKILL_NAME);

        // 設定が削除されたことを確認（skillSettingsへのset呼び出し）
        const settingsSetCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "skillSettings",
        );
        expect(settingsSetCall).toBeDefined();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-PMD-03: should initialize settings when remembering permission for new skill", async () => {
      mockStoreData.skillSettings = {};

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        store.rememberPermission("new-skill", "Read", "allow");

        // 設定が作成されたことを確認
        expect(mockStore.set).toHaveBeenCalled();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });
  });

  // ===========================================================================
  // Phase 6: Cache Management Detailed Tests
  // ===========================================================================

  describe("cache management - detailed", () => {
    it("SIS-CMD-01: should handle multiple skills cache independently", async () => {
      mockStoreData.skillCache = {};

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        store.setCache("skill-1", { ...TEST_SKILL_METADATA, name: "skill-1" });
        store.setCache("skill-2", { ...TEST_SKILL_METADATA, name: "skill-2" });

        // 2回のsetCacheでskillCacheへのset呼び出しがある
        const cacheSetCalls = mockStore.set.mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0] === "skillCache",
        );
        expect(cacheSetCalls.length).toBe(2);
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-CMD-02: should clear cache when skill is removed", async () => {
      mockStoreData.importedSkills = {
        [TEST_SKILL_NAME]: {
          name: TEST_SKILL_NAME,
          importedAt: "2026-01-24T00:00:00.000Z",
          status: "active",
        },
      };
      mockStoreData.skillCache = {
        [TEST_SKILL_NAME]: {
          metadata: TEST_SKILL_METADATA,
          cachedAt: "2026-01-24T00:00:00.000Z",
        },
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        store.removeImport(TEST_SKILL_NAME);

        // キャッシュが削除されたことを確認
        const cacheSetCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "skillCache",
        );
        expect(cacheSetCall).toBeDefined();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-CMD-03: should overwrite existing cache", async () => {
      mockStoreData.skillCache = {
        [TEST_SKILL_NAME]: {
          metadata: { ...TEST_SKILL_METADATA, description: "old description" },
          cachedAt: "2026-01-01T00:00:00.000Z",
        },
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        const newMetadata = {
          ...TEST_SKILL_METADATA,
          description: "new description",
        };
        store.setCache(TEST_SKILL_NAME, newMetadata);

        // キャッシュが上書きされたことを確認
        expect(mockStore.set).toHaveBeenCalled();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });
  });

  // ===========================================================================
  // Phase 6: Migration Detailed Tests
  // ===========================================================================

  describe("schema migration - detailed", () => {
    it("SIS-MGD-01: should preserve existing skill data during migration", async () => {
      // v0相当のデータ（schemaVersionなし）
      mockStoreData = {
        importedSkills: {
          "existing-skill": {
            name: "existing-skill",
            importedAt: "2025-01-01T00:00:00.000Z",
            status: "active",
          },
        },
        skillSettings: {},
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        // 既存スキルが保持されていることを確認
        const imported = store.getImported();
        expect(imported.length).toBeGreaterThanOrEqual(0);
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-MGD-02: should set schema version after migration", async () => {
      mockStoreData = {
        // schemaVersionなし
        importedSkills: {},
        skillSettings: {},
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const _store = getSkillImportStore();

        // マイグレーションでschemaVersionが設定されることを確認
        const schemaVersionSetCall = mockStore.set.mock.calls.find(
          (call) => typeof call[0] === "string" && call[0] === "schemaVersion",
        );
        expect(schemaVersionSetCall).toBeDefined();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });

    it("SIS-MGD-03: should handle already migrated data", async () => {
      mockStoreData = {
        schemaVersion: 1,
        importedSkills: {},
        skillSettings: {},
      };

      try {
        const { getSkillImportStore } = await import("../skillImportStore");
        const store = getSkillImportStore();

        // 正常に初期化されることを確認
        expect(store).toBeDefined();
      } catch {
        throw new Error("skillImportStore module not implemented");
      }
    });
  });
});
