# テスト設計: SkillImportStore

## 概要

SkillImportStore の単体テスト設計。
Vitest を使用し、テストカバレッジ 80% 以上を目標とする。

---

## 1. テスト環境

### 1.1 テストフレームワーク

| 項目           | 技術                                                                |
| -------------- | ------------------------------------------------------------------- |
| フレームワーク | Vitest                                                              |
| 配置先         | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |
| モック         | vitest mock                                                         |

### 1.2 テストデータディレクトリ

```typescript
import { beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

let testDir: string;

beforeEach(() => {
  // テスト用一時ディレクトリを作成
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-store-test-"));
  process.env.ELECTRON_USER_DATA = testDir;
});

afterEach(() => {
  // テスト後にクリーンアップ
  fs.rmSync(testDir, { recursive: true, force: true });
  resetSkillImportStore();
});
```

---

## 2. テストケース一覧

### 2.1 インポート管理

```typescript
describe("SkillImportStore", () => {
  describe("import management", () => {
    describe("getImported", () => {
      it("should return empty array when no skills imported");
      it("should return all imported skills");
      it("should return empty array on store read error");
    });

    describe("addImport", () => {
      it("should add a new skill");
      it("should set initial status as active");
      it("should set importedAt timestamp");
      it("should throw on empty skill name");
      it("should throw on invalid skill name characters");
      it("should overwrite existing skill (idempotent)");
    });

    describe("removeImport", () => {
      it("should remove an existing skill");
      it("should also remove skill settings");
      it("should also remove skill cache");
      it("should do nothing if skill does not exist (idempotent)");
    });

    describe("exists", () => {
      it("should return true for imported skill");
      it("should return false for non-imported skill");
    });

    describe("updateLastUsed", () => {
      it("should update lastUsedAt timestamp");
      it("should do nothing if skill does not exist");
    });
  });
});
```

### 2.2 設定管理

```typescript
describe("settings management", () => {
  describe("getSettings", () => {
    it("should return default settings for new skill");
    it("should return stored settings for existing skill");
    it("should include all required fields in default settings");
  });

  describe("updateSettings", () => {
    it("should update settings");
    it("should merge partial settings with existing");
    it("should create settings if not exists");
    it("should preserve unmodified fields");
  });
});
```

### 2.3 権限管理

```typescript
describe("permission management", () => {
  describe("rememberPermission", () => {
    it("should remember allow permission");
    it("should remember deny permission");
    it("should overwrite existing permission");
    it("should create settings if not exists");
  });

  describe("getRememberedPermission", () => {
    it("should return allow permission");
    it("should return deny permission");
    it("should return undefined for unknown tool");
    it("should return undefined for unknown skill");
  });
});
```

### 2.4 キャッシュ管理

```typescript
describe("cache management", () => {
  describe("setCache", () => {
    it("should set skill metadata cache");
    it("should set cachedAt timestamp");
    it("should overwrite existing cache");
  });

  describe("getCache", () => {
    it("should return cached metadata");
    it("should return undefined for uncached skill");
  });

  describe("invalidateCache", () => {
    it("should invalidate specific skill cache");
    it("should invalidate all cache when no skillName");
    it("should do nothing if cache does not exist");
  });
});
```

### 2.5 スキーママイグレーション

```typescript
describe("schema migration", () => {
  it("should initialize with schema version 1");
  it("should migrate from version 0 to 1");
  it("should preserve existing data during migration");
  it("should handle corrupted data gracefully");
  it("should reset to defaults on unrecoverable corruption");
});
```

### 2.6 テスト支援

```typescript
describe("test utilities", () => {
  describe("reset", () => {
    it("should reset all data to defaults");
    it("should clear imported skills");
    it("should clear skill settings");
    it("should clear cache");
  });

  describe("internalStore", () => {
    it("should provide access to internal store");
  });
});
```

---

## 3. テストデータ

### 3.1 スキルデータ

```typescript
const TEST_SKILL_NAME = "test-skill";
const TEST_SKILL_NAME_2 = "another-skill";

const TEST_IMPORTED_SKILL: ImportedSkillData = {
  name: TEST_SKILL_NAME,
  importedAt: "2026-01-24T00:00:00.000Z",
  status: "active",
};

const TEST_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: true,
  rememberedPermissions: {
    Read: "allow",
    Write: "deny",
  },
};
```

### 3.2 メタデータ

```typescript
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
```

### 3.3 無効なスキル名

```typescript
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
```

---

## 4. モック/スタブ

### 4.1 electron-store のモック

```typescript
import { vi } from "vitest";

// 必要に応じて electron-store をモック
vi.mock("electron-store", () => {
  return {
    default: class MockStore {
      private data: Record<string, unknown> = {};

      constructor(options: { defaults: unknown }) {
        this.data = { ...(options.defaults as Record<string, unknown>) };
      }

      get(key: string, defaultValue?: unknown): unknown {
        return this.data[key] ?? defaultValue;
      }

      set(key: string, value: unknown): void {
        this.data[key] = value;
      }

      has(key: string): boolean {
        return key in this.data;
      }

      delete(key: string): void {
        delete this.data[key];
      }

      clear(): void {
        this.data = {};
      }
    },
  };
});
```

### 4.2 実ファイル I/O テスト

```typescript
// 実際の electron-store を使用するテスト
describe("with real electron-store", () => {
  it("should persist data to file", async () => {
    const store = getSkillImportStore();
    store.addImport("persist-test");

    // ファイルが存在することを確認
    const storePath = path.join(testDir, "skill-imports.json");
    expect(fs.existsSync(storePath)).toBe(true);

    // ファイル内容を確認
    const content = JSON.parse(fs.readFileSync(storePath, "utf-8"));
    expect(content.importedSkills["persist-test"]).toBeDefined();
  });
});
```

---

## 5. カバレッジ目標

### 5.1 目標値

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 5.2 カバレッジ確認コマンド

```bash
pnpm --filter @repo/desktop test:coverage -- --run src/main/settings/__tests__/skillImportStore.test.ts
```

---

## 6. テスト実行順序

### 6.1 推奨順序

1. 基本的な CRUD 操作
2. デフォルト値の確認
3. エラーケース
4. マイグレーション
5. 永続化確認

### 6.2 依存関係

```typescript
// 各テストは独立して実行可能
// beforeEach で状態をリセット
beforeEach(() => {
  resetSkillImportStore();
});
```

---

## 7. エッジケーステスト

### 7.1 境界値テスト

```typescript
describe("edge cases", () => {
  it("should handle maximum skill name length (128)");
  it("should handle minimum skill name length (1)");
  it("should handle many imported skills (100+)");
  it("should handle deep permission structure");
});
```

### 7.2 並行アクセステスト

```typescript
describe("concurrent access", () => {
  it("should handle rapid successive writes");
  it("should maintain data consistency");
});
```

---

## 8. 統合テスト観点

### 8.1 IPC 連携テスト（別ファイル）

```typescript
// apps/desktop/src/__tests__/skill-ipc.integration.test.ts

describe("Skill IPC Integration", () => {
  it("should call store.addImport from IPC handler");
  it("should return correct response format");
  it("should handle store errors in IPC response");
});
```

---

## 9. テストファイル構成

```
apps/desktop/src/main/settings/
├── skillImportStore.ts
└── __tests__/
    ├── skillImportStore.test.ts    # 本ファイル
    ├── fixtures/
    │   ├── testSkillData.ts        # テストデータ
    │   └── corruptedStore.json     # 破損ストアデータ
    └── helpers/
        └── storeTestUtils.ts       # テストユーティリティ
```
