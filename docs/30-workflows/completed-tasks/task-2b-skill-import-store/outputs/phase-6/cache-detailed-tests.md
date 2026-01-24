# Phase 6 キャッシュ詳細テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 6                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. キャッシュ詳細テスト

### 1.1 キャッシュ操作

| テストID   | テスト名                                   | 目的                           |
| ---------- | ------------------------------------------ | ------------------------------ |
| SIS-CMD-01 | should cache multiple skills independently | 複数スキルを独立してキャッシュ |
| SIS-CMD-02 | should preserve other caches when clearing | 特定スキル削除時に他を保持     |
| SIS-CMD-03 | should include cachedAt timestamp          | cachedAtタイムスタンプを含める |

---

## 2. テストケース詳細

### SIS-CMD-01: 複数スキルの独立キャッシュ

```typescript
it("should cache multiple skills independently", () => {
  const metadata1: SkillMetadata = {
    name: "skill-1",
    description: "First skill",
    path: "/path/to/skill-1",
    updatedAt: new Date(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };

  const metadata2: SkillMetadata = {
    name: "skill-2",
    description: "Second skill",
    path: "/path/to/skill-2",
    updatedAt: new Date(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };

  store.setCache("skill-1", metadata1);
  store.setCache("skill-2", metadata2);

  // 両方のスキルがキャッシュされていることを確認
  const calls = mockStore.set.mock.calls.filter(
    (call) => call[0] === "skillCache",
  );
  const lastCache = calls[calls.length - 1][1] as Record<
    string,
    SkillCacheEntry
  >;

  expect(lastCache["skill-1"]?.metadata.name).toBe("skill-1");
  expect(lastCache["skill-2"]?.metadata.name).toBe("skill-2");
});
```

### SIS-CMD-02: 特定スキル削除時の他キャッシュ保持

```typescript
it("should preserve other caches when clearing specific skill", () => {
  mockStoreData.skillCache = {
    "skill-a": {
      metadata: { name: "skill-a" } as SkillMetadata,
      cachedAt: new Date().toISOString(),
    },
    "skill-b": {
      metadata: { name: "skill-b" } as SkillMetadata,
      cachedAt: new Date().toISOString(),
    },
  };

  store.invalidateCache("skill-a");

  const lastCall = mockStore.set.mock.calls.find(
    (call) => call[0] === "skillCache",
  );
  const cache = lastCall[1] as Record<string, SkillCacheEntry>;

  expect(cache["skill-a"]).toBeUndefined();
  expect(cache["skill-b"]).toBeDefined();
});
```

### SIS-CMD-03: cachedAtタイムスタンプ

```typescript
it("should include cachedAt timestamp in cache entry", () => {
  const beforeCache = new Date().toISOString();

  const metadata: SkillMetadata = {
    name: "test-skill",
    description: "Test",
    path: "/path",
    updatedAt: new Date(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };

  store.setCache("test-skill", metadata);

  const afterCache = new Date().toISOString();

  const lastCall = mockStore.set.mock.calls.find(
    (call) => call[0] === "skillCache",
  );
  const cache = lastCall[1] as Record<string, SkillCacheEntry>;
  const cachedAt = cache["test-skill"]?.cachedAt;

  expect(cachedAt).toBeDefined();
  expect(cachedAt >= beforeCache).toBe(true);
  expect(cachedAt <= afterCache).toBe(true);
});
```

---

## 3. テストケース数

| カテゴリ             | テスト数 |
| -------------------- | -------- |
| 複数スキルキャッシュ | 1        |
| 選択的削除           | 1        |
| タイムスタンプ       | 1        |
| **合計**             | **3**    |

---

## 4. 完了基準

- [x] 複数スキルの独立キャッシュテスト
- [x] 特定スキル削除時の保持テスト
- [x] cachedAtタイムスタンプテスト
