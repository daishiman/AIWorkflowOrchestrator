# スキーマ詳細設計: SkillImportStore

## 概要

electron-store で永続化する SkillImportStore のスキーマ詳細設計。

---

## 1. ストア設定

### 1.1 ストア初期化

```typescript
import Store from "electron-store";

const CURRENT_SCHEMA_VERSION = 1;

const store = new Store<SkillStoreSchema>({
  name: "skill-imports",
  defaults: DEFAULT_STORE_DATA,
  schema: skillStoreJsonSchema,
  migrations: skillStoreMigrations,
});
```

### 1.2 ストレージパス

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| ファイル名 | `skill-imports.json`                                                      |
| macOS      | `~/Library/Application Support/AIWorkflowOrchestrator/skill-imports.json` |
| Windows    | `%APPDATA%/AIWorkflowOrchestrator/skill-imports.json`                     |
| Linux      | `~/.config/AIWorkflowOrchestrator/skill-imports.json`                     |

---

## 2. スキーマ定義

### 2.1 SkillStoreSchema

```typescript
interface SkillStoreSchema {
  /** スキーマバージョン（マイグレーション用） */
  schemaVersion: number;

  /** インポート済みスキル（キー: スキル名） */
  importedSkills: Record<string, ImportedSkillData>;

  /** スキル個別設定（キー: スキル名） */
  skillSettings: Record<string, SkillSettings>;

  /** 最終スキャン日時（ISO 8601文字列） */
  lastScanAt?: string;

  /** メタデータキャッシュ（キー: スキル名） */
  skillCache?: Record<string, SkillCacheEntry>;
}
```

### 2.2 ImportedSkillData

```typescript
interface ImportedSkillData {
  /** スキル名（ディレクトリ名と一致） */
  name: string;

  /** インポート日時（ISO 8601文字列） */
  importedAt: string;

  /** ステータス */
  status: "active" | "disabled";

  /** 最終使用日時（ISO 8601文字列） */
  lastUsedAt?: string;
}
```

| フィールド | 型     | 必須 | デフォルト | 制約                                        |
| ---------- | ------ | ---- | ---------- | ------------------------------------------- |
| name       | string | ✅   | -          | 1-128文字、英数字・ハイフン・アンダースコア |
| importedAt | string | ✅   | -          | ISO 8601形式                                |
| status     | enum   | ✅   | "active"   | "active" または "disabled"                  |
| lastUsedAt | string | ❌   | undefined  | ISO 8601形式                                |

### 2.3 SkillSettings

```typescript
interface SkillSettings {
  /** 読み取り専用ツール（Read, Glob, Grep等）を自動許可 */
  autoApproveReadOnly: boolean;

  /** 権限設定を記憶するか */
  rememberPermissions: boolean;

  /** 記憶された権限設定（キー: ツール名） */
  rememberedPermissions: Record<string, "allow" | "deny">;
}
```

| フィールド            | 型      | 必須 | デフォルト | 制約           |
| --------------------- | ------- | ---- | ---------- | -------------- |
| autoApproveReadOnly   | boolean | ✅   | true       | -              |
| rememberPermissions   | boolean | ✅   | false      | -              |
| rememberedPermissions | Record  | ✅   | {}         | キーはツール名 |

### 2.4 SkillCacheEntry

```typescript
interface SkillCacheEntry {
  /** スキルメタデータ（共通型から参照） */
  metadata: SkillMetadata;

  /** キャッシュ日時（ISO 8601文字列） */
  cachedAt: string;
}
```

| フィールド | 型            | 必須 | 制約                                    |
| ---------- | ------------- | ---- | --------------------------------------- |
| metadata   | SkillMetadata | ✅   | packages/shared/src/types/skill.ts 参照 |
| cachedAt   | string        | ✅   | ISO 8601形式                            |

---

## 3. デフォルト値

### 3.1 ストア全体のデフォルト

```typescript
const DEFAULT_STORE_DATA: SkillStoreSchema = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  importedSkills: {},
  skillSettings: {},
  // lastScanAt: undefined,
  // skillCache: undefined,
};
```

### 3.2 スキル設定のデフォルト

```typescript
const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};
```

---

## 4. JSON Schema バリデーション

### 4.1 electron-store 用スキーマ

```typescript
const skillStoreJsonSchema = {
  schemaVersion: {
    type: "number",
    minimum: 1,
  },
  importedSkills: {
    type: "object",
    additionalProperties: {
      type: "object",
      required: ["name", "importedAt", "status"],
      properties: {
        name: { type: "string", minLength: 1, maxLength: 128 },
        importedAt: { type: "string", format: "date-time" },
        status: { type: "string", enum: ["active", "disabled"] },
        lastUsedAt: { type: "string", format: "date-time" },
      },
    },
  },
  skillSettings: {
    type: "object",
    additionalProperties: {
      type: "object",
      required: [
        "autoApproveReadOnly",
        "rememberPermissions",
        "rememberedPermissions",
      ],
      properties: {
        autoApproveReadOnly: { type: "boolean" },
        rememberPermissions: { type: "boolean" },
        rememberedPermissions: {
          type: "object",
          additionalProperties: {
            type: "string",
            enum: ["allow", "deny"],
          },
        },
      },
    },
  },
  lastScanAt: {
    type: "string",
    format: "date-time",
  },
  skillCache: {
    type: "object",
    additionalProperties: {
      type: "object",
      required: ["metadata", "cachedAt"],
      properties: {
        metadata: { type: "object" }, // SkillMetadata の詳細は省略
        cachedAt: { type: "string", format: "date-time" },
      },
    },
  },
} as const;
```

---

## 5. フィールド制約詳細

### 5.1 スキル名の制約

```typescript
const SKILL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

function validateSkillName(name: string): boolean {
  return SKILL_NAME_PATTERN.test(name);
}
```

| 制約     | 値                                             |
| -------- | ---------------------------------------------- | ----------- |
| 最小長   | 1                                              |
| 最大長   | 128                                            |
| 許可文字 | 英数字、ハイフン、アンダースコア               |
| 禁止文字 | `.`, `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, ` | `, スペース |

### 5.2 日時フォーマット

```typescript
function toISOString(): string {
  return new Date().toISOString(); // "2026-01-24T10:30:00.000Z"
}

function parseISOString(isoString: string): Date {
  return new Date(isoString);
}
```

---

## 6. 型エクスポート

### 6.1 エクスポート対象

```typescript
// skillImportStore.ts からエクスポート

export interface ImportedSkillData { ... }
export interface SkillSettings { ... }
export interface SkillCacheEntry { ... }
export interface SkillStoreSchema { ... }

export const DEFAULT_SKILL_SETTINGS: SkillSettings = { ... };
export const CURRENT_SCHEMA_VERSION = 1;
```

### 6.2 共通型の参照

```typescript
// packages/shared/src/types/skill.ts から参照
import type { SkillMetadata } from "@repo/shared/types";
```

---

## 7. ストレージサイズ見積もり

### 7.1 フィールド別サイズ

| フィールド        | 1スキルあたり | 備考           |
| ----------------- | ------------- | -------------- |
| ImportedSkillData | ~200 bytes    | 4フィールド    |
| SkillSettings     | ~500 bytes    | 権限10件想定   |
| SkillCacheEntry   | ~2 KB         | メタデータ含む |

### 7.2 総サイズ見積もり

| スキル数 | 見積もりサイズ |
| -------- | -------------- |
| 10       | ~30 KB         |
| 50       | ~150 KB        |
| 100      | ~300 KB        |

---

## 8. 設計決定理由

| 決定                 | 理由                       |
| -------------------- | -------------------------- |
| Record型             | 高速なキー検索（O(1)）     |
| ISO 8601文字列       | JSON互換、タイムゾーン明示 |
| 分離されたキャッシュ | キャッシュのみ無効化可能   |
| スキーマバージョン   | マイグレーション対応       |
