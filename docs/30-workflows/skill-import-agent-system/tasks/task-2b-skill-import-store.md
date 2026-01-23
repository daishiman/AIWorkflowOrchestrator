---
id: TASK-2B
tier: 1
title: SkillImportStore 実装
phase: 2
depends_on: [TASK-1-1]
parallel_with: [TASK-2A, TASK-2C]
blocks: [TASK-4-2]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, persistence]
---

# SkillImportStore 実装

## 概要

インポート済みスキルの情報を `electron-store` で永続化するストアを実装する。
スキーマバージョン管理とマイグレーション機能を含む。

## 保存先ディレクトリ

electron-store の設定ファイルは `~/.aiworkflow/config/` 配下に保存される。

| 保存先                                    | 説明                     |
| ----------------------------------------- | ------------------------ |
| `~/.aiworkflow/config/skill-imports.json` | インポート済みスキル情報 |

## 入力

- TASK-1-1 で作成した型定義
- 既存の electron-store パターン（`slideSettingsStore.ts`）

## 出力

- `apps/desktop/src/main/settings/skillImportStore.ts`
- 単体テストファイル

## 実装詳細

### スキーマ定義

```typescript
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, { metadata: SkillMetadata; cachedAt: string }>;
}

interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO文字列
  status: "active" | "disabled";
  lastUsedAt?: string;
}

interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}
```

### API

```typescript
export const skillImportStore = {
  // インポート済みスキル一覧を取得
  getImported(): ImportedSkillData[];

  // スキルをインポート
  addImport(skillName: string): void;

  // スキルを削除
  removeImport(skillName: string): void;

  // スキルが存在するか確認
  exists(skillName: string): boolean;

  // 最終使用日時を更新
  updateLastUsed(skillName: string): void;

  // スキル設定を取得
  getSettings(skillName: string): SkillSettings;

  // スキル設定を更新
  updateSettings(skillName: string, settings: Partial<SkillSettings>): void;

  // 権限を記憶
  rememberPermission(skillName: string, toolName: string, decision: "allow" | "deny"): void;

  // 記憶された権限を取得
  getRememberedPermission(skillName: string, toolName: string): "allow" | "deny" | undefined;

  // キャッシュ管理
  setCache(skillName: string, metadata: SkillMetadata): void;
  getCache(skillName: string): { metadata: SkillMetadata; cachedAt: string } | undefined;
  invalidateCache(skillName?: string): void;
};
```

### マイグレーション

```typescript
const CURRENT_SCHEMA_VERSION = 1;

const store = new Store<SkillStoreSchema>({
  name: "skill-imports",
  defaults: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    importedSkills: {},
    skillSettings: {},
  },
  migrations: {
    "1": (store) => {
      store.set("schemaVersion", 1);
    },
  },
});
```

## ファイル

| 操作 | パス                                                                |
| ---- | ------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/settings/skillImportStore.ts`                |
| 作成 | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

## 依存パッケージ

- `electron-store` - 既存インストール済み

## 完了条件

- [ ] `skillImportStore` が実装されている
- [ ] CRUD操作（get, add, remove, exists）が動作する
- [ ] スキル設定の取得・更新が動作する
- [ ] 権限記憶機能が動作する
- [ ] スキーマバージョン管理が実装されている
- [ ] キャッシュ管理機能が動作する
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("skillImportStore", () => {
  beforeEach(() => {
    // テスト用にストアをリセット
  });

  describe("import management", () => {
    it("should add a new import");
    it("should remove an import");
    it("should return all imported skills");
    it("should check if skill exists");
  });

  describe("settings management", () => {
    it("should return default settings for new skill");
    it("should update settings");
    it("should remember permission");
    it("should return remembered permission");
  });

  describe("cache management", () => {
    it("should set and get cache");
    it("should invalidate specific skill cache");
    it("should invalidate all cache");
  });

  describe("schema migration", () => {
    it("should migrate from version 0 to 1");
  });
});
```

## 参考資料

- [specification.md - 6.1 インポート済みスキル保存](../specification.md)
- [execution-plan.md - Appendix A](../execution-plan.md)
- 既存パターン: `apps/desktop/src/main/settings/slideSettingsStore.ts`
