# キャッシュ・マイグレーションテスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 4                                                                   |
| タスク         | 5                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. キャッシュ管理テスト

### 1.1 getCachedMetadata テスト

| テストID  | テスト名                                    | 目的                           |
| --------- | ------------------------------------------- | ------------------------------ |
| SIS-CA-01 | should return undefined when cache is empty | 空キャッシュでundefinedを返す  |
| SIS-CA-02 | should return cached metadata               | キャッシュ済みメタデータを返す |
| SIS-CA-03 | should return undefined for expired cache   | 期限切れキャッシュは無効       |

### 1.2 setCachedMetadata テスト

| テストID  | テスト名                     | 目的                   |
| --------- | ---------------------------- | ---------------------- |
| SIS-CA-04 | should cache skill metadata  | メタデータをキャッシュ |
| SIS-CA-05 | should update existing cache | 既存キャッシュを更新   |

### 1.3 clearCache テスト

| テストID  | テスト名                                       | 目的                       |
| --------- | ---------------------------------------------- | -------------------------- |
| SIS-CA-06 | should clear cache for specific skill          | 特定スキルのキャッシュ削除 |
| SIS-CA-07 | should clear all cache when no skill specified | 全キャッシュ削除           |

---

## 2. スキーママイグレーションテスト

| テストID  | テスト名                                                | 目的                               |
| --------- | ------------------------------------------------------- | ---------------------------------- |
| SIS-MG-01 | should initialize new store with current schema version | 新規ストアは最新バージョンで初期化 |
| SIS-MG-02 | should migrate from schema version 0 (unversioned)      | バージョン0からのマイグレーション  |
| SIS-MG-03 | should preserve data during migration                   | マイグレーション時のデータ保持     |

---

## 3. テストケース数

| カテゴリ          | テスト数 |
| ----------------- | -------- |
| getCachedMetadata | 3        |
| setCachedMetadata | 2        |
| clearCache        | 2        |
| schema migration  | 3        |
| **合計**          | **10**   |

---

## 4. テストデータ

```typescript
const TEST_SKILL_NAME = "test-skill";

const TEST_SKILL_METADATA: SkillMetadata = {
  name: "test-skill",
  version: "1.0.0",
  description: "Test skill description",
  path: "/path/to/skill",
  tools: ["Read", "Write"],
};

const EXPIRED_CACHE_ENTRY: SkillCacheEntry = {
  metadata: TEST_SKILL_METADATA,
  cachedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
};

const VALID_CACHE_ENTRY: SkillCacheEntry = {
  metadata: TEST_SKILL_METADATA,
  cachedAt: new Date().toISOString(),
};
```

---

## 5. 完了基準

- [x] getCachedMetadata テストケース: 3件
- [x] setCachedMetadata テストケース: 2件
- [x] clearCache テストケース: 2件
- [x] schema migration テストケース: 3件
- [x] 合計: 10件（キャッシュ3件以上、マイグレーション2件以上）
