# 仕様書整合性確認: specification.md セクション6.1

## 概要

`docs/30-workflows/skill-import-agent-system/specification.md` のセクション6.1を確認し、SkillImportStore の仕様との整合性を検証する。

---

## 1. SkillStoreSchema 分析

### 1.1 仕様書定義

```typescript
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, { metadata: SkillMetadata; cachedAt: string }>;
}
```

### 1.2 フィールド詳細

| フィールド     | 型                                | 必須 | 説明                                   |
| -------------- | --------------------------------- | ---- | -------------------------------------- |
| schemaVersion  | number                            | ✅   | マイグレーション用バージョン番号       |
| importedSkills | Record<string, ImportedSkillData> | ✅   | インポート済みスキル（キー: スキル名） |
| skillSettings  | Record<string, SkillSettings>     | ✅   | スキル個別設定（キー: スキル名）       |
| lastScanAt     | string                            | ❌   | 最終スキャン日時（ISO文字列）          |
| skillCache     | Record<string, {...}>             | ❌   | メタデータキャッシュ                   |

### 1.3 整合性確認

| 項目           | 仕様書  | タスク仕様書 | 状態    |
| -------------- | ------- | ------------ | ------- |
| schemaVersion  | number  | number       | ✅ 一致 |
| importedSkills | Record  | Record       | ✅ 一致 |
| skillSettings  | Record  | Record       | ✅ 一致 |
| lastScanAt     | string? | string?      | ✅ 一致 |
| skillCache     | Record? | Record?      | ✅ 一致 |

---

## 2. ImportedSkillData 分析

### 2.1 仕様書定義

```typescript
interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO文字列
  status: "active" | "disabled";
  lastUsedAt?: string;
}
```

### 2.2 フィールド詳細

| フィールド | 型                     | 必須 | 説明                        |
| ---------- | ---------------------- | ---- | --------------------------- |
| name       | string                 | ✅   | スキル名                    |
| importedAt | string                 | ✅   | インポート日時（ISO文字列） |
| status     | "active" \| "disabled" | ✅   | ステータス                  |
| lastUsedAt | string                 | ❌   | 最終使用日時（ISO文字列）   |

### 2.3 整合性確認

| 項目       | 仕様書  | タスク仕様書 | 状態    |
| ---------- | ------- | ------------ | ------- |
| name       | string  | string       | ✅ 一致 |
| importedAt | string  | string       | ✅ 一致 |
| status     | union   | union        | ✅ 一致 |
| lastUsedAt | string? | string?      | ✅ 一致 |

---

## 3. SkillSettings 分析

### 3.1 仕様書定義

```typescript
interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}
```

### 3.2 フィールド詳細

| フィールド            | 型                                | 必須 | 説明                       |
| --------------------- | --------------------------------- | ---- | -------------------------- |
| autoApproveReadOnly   | boolean                           | ✅   | 読み取り専用ツール自動許可 |
| rememberPermissions   | boolean                           | ✅   | 権限設定を記憶するか       |
| rememberedPermissions | Record<string, "allow" \| "deny"> | ✅   | 記憶された権限設定         |

### 3.3 整合性確認

✅ **完全一致**: 仕様書とタスク仕様書で同一定義

---

## 4. API 仕様分析

### 4.1 仕様書定義

```typescript
export const skillImportStore = {
  getImported(): ImportedSkillData[] { ... },
  addImport(skillName: string): void { ... },
  removeImport(skillName: string): void { ... },
  getSettings(skillName: string): SkillSettings { ... },
  updateSettings(skillName: string, settings: Partial<SkillSettings>): void { ... },
  rememberPermission(skillName: string, toolName: string, decision: "allow" | "deny"): void { ... },
};
```

### 4.2 タスク仕様書追加API

| メソッド                     | 仕様書 | タスク仕様書 | 差分     |
| ---------------------------- | ------ | ------------ | -------- |
| getImported()                | ✅     | ✅           | -        |
| addImport(skillName)         | ✅     | ✅           | -        |
| removeImport(skillName)      | ✅     | ✅           | -        |
| exists(skillName)            | ❌     | ✅           | **追加** |
| updateLastUsed(skillName)    | ❌     | ✅           | **追加** |
| getSettings(skillName)       | ✅     | ✅           | -        |
| updateSettings(...)          | ✅     | ✅           | -        |
| rememberPermission(...)      | ✅     | ✅           | -        |
| getRememberedPermission(...) | ❌     | ✅           | **追加** |
| setCache(skillName, meta)    | ❌     | ✅           | **追加** |
| getCache(skillName)          | ❌     | ✅           | **追加** |
| invalidateCache(skillName)   | ❌     | ✅           | **追加** |

### 4.3 追加API の必要性

| 追加API                   | 必要性 | 理由                     |
| ------------------------- | ------ | ------------------------ |
| exists()                  | 高     | インポート前の存在確認   |
| updateLastUsed()          | 高     | 最終使用日時の追跡       |
| getRememberedPermission() | 高     | 権限記憶の参照（非対称） |
| setCache()                | 中     | メタデータキャッシュ設定 |
| getCache()                | 中     | メタデータキャッシュ取得 |
| invalidateCache()         | 中     | キャッシュ無効化         |

---

## 5. マイグレーション仕様

### 5.1 仕様書定義

```typescript
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

### 5.2 マイグレーション戦略

| 項目                 | 仕様書                  | 実装計画                |
| -------------------- | ----------------------- | ----------------------- |
| 初期バージョン       | 1                       | 1                       |
| マイグレーション機能 | electron-store組み込み  | electron-store組み込み  |
| バージョン管理       | schemaVersionフィールド | schemaVersionフィールド |

### 5.3 将来のマイグレーション考慮

```typescript
// 将来のマイグレーション例（仕様書コメント）
// '2': (store) => {
//   // v2へのマイグレーション処理
//   store.set('schemaVersion', 2);
// },
```

---

## 6. 差異と対応方針

### 6.1 発見された差異

| 差異          | 内容                     | 対応方針                   |
| ------------- | ------------------------ | -------------------------- |
| 追加API       | exists, updateLastUsed等 | 仕様拡張として実装         |
| キャッシュAPI | setCache, getCache等     | skillCacheフィールドの活用 |

### 6.2 仕様書との整合性維持

1. **コアAPI**: 仕様書のAPIをそのまま実装
2. **追加API**: 仕様書の設計意図に沿った拡張として実装
3. **型定義**: 仕様書の型定義を忠実に再現

---

## 7. 結論

### 7.1 整合性状態

| カテゴリ         | 整合性          |
| ---------------- | --------------- |
| スキーマ定義     | ✅ 完全一致     |
| 型定義           | ✅ 完全一致     |
| コアAPI          | ✅ 完全一致     |
| 追加API          | ⚠️ 拡張（互換） |
| マイグレーション | ✅ 完全一致     |

### 7.2 実装方針

1. 仕様書のスキーマ・型定義をそのまま使用
2. コアAPIは仕様書通りに実装
3. 追加APIは仕様書の設計思想に沿って実装
4. electron-store組み込みマイグレーションを活用

**総合評価**: ✅ 仕様書との整合性は高く、実装可能な状態
