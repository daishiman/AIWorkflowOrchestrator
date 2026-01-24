# 型定義整合性確認: TASK-1-1 共通型定義

## 概要

`packages/shared/src/types/skill.ts` で定義された共通型定義と SkillImportStore のスキーマ定義の整合性を確認する。

---

## 1. 共通型定義の確認

### 1.1 ImportedSkill（共通型）

```typescript
export interface ImportedSkill extends SkillMetadata {
  importedAt: Date;
  status: "active" | "disabled";
  content?: string;
}
```

### 1.2 SkillMetadata（共通型）

```typescript
export interface SkillMetadata {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
}
```

---

## 2. ストアスキーマとの比較

### 2.1 ImportedSkillData（ストア内部型）

```typescript
// specification.md セクション6.1 定義
interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO文字列
  status: "active" | "disabled";
  lastUsedAt?: string;
}
```

### 2.2 型の対応関係

| 共通型（ImportedSkill） | ストア型（ImportedSkillData） | 対応            |
| ----------------------- | ----------------------------- | --------------- |
| name                    | name                          | ✅ 直接対応     |
| importedAt: Date        | importedAt: string            | ⚠️ 型変換必要   |
| status                  | status                        | ✅ 直接対応     |
| -                       | lastUsedAt: string            | ➕ ストア固有   |
| description             | -                             | ❌ ストア未保持 |
| path                    | -                             | ❌ ストア未保持 |
| updatedAt: Date         | -                             | ❌ ストア未保持 |
| agents/references/etc.  | -                             | ❌ ストア未保持 |
| content                 | -                             | ❌ ストア未保持 |

### 2.3 設計意図の分析

**ImportedSkillData（ストア型）の役割**:

- 軽量な永続化データ
- スキルの「インポート状態」のみを管理
- メタデータはキャッシュで別管理

**ImportedSkill（共通型）の役割**:

- 完全なスキル情報
- SkillMetadata を継承
- UI表示用の完全なデータ

---

## 3. 型再利用方針

### 3.1 ストア内部での型定義

```typescript
// skillImportStore.ts で定義（ローカル型）
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
```

**理由**:

- ストア固有の永続化形式（ISO文字列など）
- 共通型とは責務が異なる
- electron-store のシリアライズ要件

### 3.2 共通型の参照

```typescript
// SkillMetadata は共通型を使用
import type { SkillMetadata } from "@repo/shared/types";

interface SkillStoreSchema {
  // ...
  skillCache?: Record<
    string,
    {
      metadata: SkillMetadata; // 共通型を使用
      cachedAt: string;
    }
  >;
}
```

**理由**:

- キャッシュには完全なメタデータを保存
- 共通型との一貫性を確保
- UI表示時の変換を最小化

### 3.3 型変換ユーティリティ

```typescript
// 実装時に定義（Phase 5）
function toImportedSkill(
  data: ImportedSkillData,
  metadata: SkillMetadata,
): ImportedSkill {
  return {
    ...metadata,
    importedAt: new Date(data.importedAt),
    status: data.status,
  };
}

function fromImportedSkill(skill: ImportedSkill): ImportedSkillData {
  return {
    name: skill.name,
    importedAt: skill.importedAt.toISOString(),
    status: skill.status,
  };
}
```

---

## 4. skillCache の型設計

### 4.1 キャッシュ構造

```typescript
skillCache?: Record<string, {
  metadata: SkillMetadata;  // 共通型を使用
  cachedAt: string;         // ISO文字列
}>;
```

### 4.2 SkillMetadata のシリアライズ

| フィールド  | 型                 | シリアライズ    |
| ----------- | ------------------ | --------------- |
| name        | string             | そのまま        |
| description | string             | そのまま        |
| path        | string             | そのまま        |
| updatedAt   | Date               | ISO文字列に変換 |
| agents      | SkillSubResource[] | そのまま        |
| references  | SkillSubResource[] | そのまま        |
| scripts     | SkillSubResource[] | そのまま        |
| assets      | SkillSubResource[] | そのまま        |
| schemas     | SkillSubResource[] | そのまま        |
| indexes     | SkillSubResource[] | そのまま        |
| otherFiles  | SkillOtherFile[]   | そのまま        |

**注意**: `updatedAt: Date` は JSON シリアライズ時に文字列になるため、読み込み時に `new Date()` で復元が必要。

---

## 5. 型階層図

```
packages/shared/src/types/skill.ts
├── SkillMetadata（基本型）
│   ├── name: string
│   ├── description: string
│   ├── path: string
│   ├── updatedAt: Date
│   └── agents/references/scripts/...
│
└── ImportedSkill extends SkillMetadata
    ├── importedAt: Date
    ├── status: "active" | "disabled"
    └── content?: string

apps/desktop/src/main/settings/skillImportStore.ts
├── ImportedSkillData（ストア専用型）
│   ├── name: string
│   ├── importedAt: string（ISO）
│   ├── status: "active" | "disabled"
│   └── lastUsedAt?: string（ISO）
│
├── SkillSettings（ストア専用型）
│   ├── autoApproveReadOnly: boolean
│   ├── rememberPermissions: boolean
│   └── rememberedPermissions: Record<...>
│
└── SkillStoreSchema
    ├── schemaVersion: number
    ├── importedSkills: Record<string, ImportedSkillData>
    ├── skillSettings: Record<string, SkillSettings>
    ├── lastScanAt?: string
    └── skillCache?: Record<string, { metadata: SkillMetadata; cachedAt: string }>
```

---

## 6. 型エクスポート方針

### 6.1 エクスポートする型

| 型                | エクスポート先            | 理由           |
| ----------------- | ------------------------- | -------------- |
| ImportedSkillData | skillImportStore.ts 内部  | ストア専用     |
| SkillSettings     | skillImportStore.ts + IPC | 設定管理に必要 |
| SkillStoreSchema  | skillImportStore.ts 内部  | ストア専用     |

### 6.2 再エクスポート

```typescript
// apps/desktop/src/main/settings/skillImportStore.ts

// 共通型を再エクスポート（IPC用）
export type { SkillMetadata } from "@repo/shared/types";

// ストア固有型をエクスポート
export interface ImportedSkillData { ... }
export interface SkillSettings { ... }
```

---

## 7. 結論

### 7.1 型整合性まとめ

| 項目              | 状態        | 対応               |
| ----------------- | ----------- | ------------------ |
| SkillMetadata     | ✅ 再利用   | キャッシュで使用   |
| ImportedSkill     | ⚠️ 部分利用 | UI層で変換して使用 |
| ImportedSkillData | 🆕 新規定義 | ストア専用         |
| SkillSettings     | 🆕 新規定義 | ストア専用         |

### 7.2 実装方針

1. **共通型の再利用**: `SkillMetadata` をキャッシュで使用
2. **ストア専用型の定義**: `ImportedSkillData`, `SkillSettings` はローカル定義
3. **型変換ユーティリティ**: 共通型とストア型の相互変換を提供
4. **Date ↔ string 変換**: ISO文字列形式で永続化

### 7.3 注意点

- `Date` 型は electron-store で自動的に文字列化される
- 読み込み時に `new Date()` で復元が必要
- 型安全性のため、変換関数を必ず使用すること
