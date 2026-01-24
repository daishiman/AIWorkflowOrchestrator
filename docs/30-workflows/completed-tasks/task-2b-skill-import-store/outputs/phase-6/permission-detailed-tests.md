# Phase 6 権限管理詳細テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 6                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. 権限管理詳細テスト

### 1.1 複数ツール権限

| テストID   | テスト名                                          | 目的                     |
| ---------- | ------------------------------------------------- | ------------------------ |
| SIS-PMD-01 | should remember permissions for multiple tools    | 複数ツールの権限を記憶   |
| SIS-PMD-02 | should override existing permission for same tool | 同一ツールの権限を上書き |
| SIS-PMD-03 | should isolate permissions between skills         | スキル間で権限を分離     |

---

## 2. テストケース詳細

### SIS-PMD-01: 複数ツールの権限記憶

```typescript
it("should remember permissions for multiple tools", () => {
  mockStoreData.skillSettings = {
    "test-skill": {
      autoApproveReadOnly: true,
      rememberPermissions: true,
      rememberedPermissions: {},
    },
  };

  store.rememberPermission("test-skill", "Read", "allow");
  store.rememberPermission("test-skill", "Write", "deny");
  store.rememberPermission("test-skill", "Edit", "allow");

  // 各ツールの権限が正しく設定されていることを確認
  const lastCall =
    mockStore.set.mock.calls[mockStore.set.mock.calls.length - 1];
  const settings = lastCall[1] as Record<string, SkillSettings>;
  expect(settings["test-skill"].rememberedPermissions).toEqual({
    Read: "allow",
    Write: "deny",
    Edit: "allow",
  });
});
```

### SIS-PMD-02: 同一ツールの権限上書き

```typescript
it("should override existing permission for same tool", () => {
  mockStoreData.skillSettings = {
    "test-skill": {
      autoApproveReadOnly: true,
      rememberPermissions: true,
      rememberedPermissions: { Read: "deny" },
    },
  };

  store.rememberPermission("test-skill", "Read", "allow");

  const lastCall =
    mockStore.set.mock.calls[mockStore.set.mock.calls.length - 1];
  const settings = lastCall[1] as Record<string, SkillSettings>;
  expect(settings["test-skill"].rememberedPermissions.Read).toBe("allow");
});
```

### SIS-PMD-03: スキル間の権限分離

```typescript
it("should isolate permissions between skills", () => {
  mockStoreData.skillSettings = {
    "skill-a": {
      autoApproveReadOnly: true,
      rememberPermissions: true,
      rememberedPermissions: { Read: "allow" },
    },
    "skill-b": {
      autoApproveReadOnly: true,
      rememberPermissions: true,
      rememberedPermissions: { Read: "deny" },
    },
  };

  const permA = store.getRememberedPermission("skill-a", "Read");
  const permB = store.getRememberedPermission("skill-b", "Read");

  expect(permA).toBe("allow");
  expect(permB).toBe("deny");
});
```

---

## 3. テストケース数

| カテゴリ   | テスト数 |
| ---------- | -------- |
| 複数ツール | 1        |
| 権限上書き | 1        |
| スキル分離 | 1        |
| **合計**   | **3**    |

---

## 4. 完了基準

- [x] 複数ツールの権限記憶テスト
- [x] 同一ツールの権限上書きテスト
- [x] スキル間の権限分離テスト
