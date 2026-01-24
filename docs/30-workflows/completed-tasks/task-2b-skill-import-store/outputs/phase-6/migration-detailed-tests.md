# Phase 6 マイグレーション詳細テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 6                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. マイグレーション詳細テスト

### 1.1 マイグレーション動作

| テストID   | テスト名                                         | 目的                                   |
| ---------- | ------------------------------------------------ | -------------------------------------- |
| SIS-MGD-01 | should not run migration when version is current | 現行バージョンではマイグレーション不要 |
| SIS-MGD-02 | should handle migration errors gracefully        | マイグレーションエラーを適切に処理     |
| SIS-MGD-03 | should initialize missing keys during migration  | マイグレーション中に欠落キーを初期化   |

---

## 2. テストケース詳細

### SIS-MGD-01: 現行バージョンでのマイグレーションスキップ

```typescript
it("should not run migration when version is current", () => {
  mockStoreData.schemaVersion = 1; // 現行バージョン

  new SkillImportStore();

  // schemaVersionへのsetが呼ばれないことを確認
  const versionSetCalls = mockStore.set.mock.calls.filter(
    (call) => call[0] === "schemaVersion",
  );
  expect(versionSetCalls.length).toBe(0);
});
```

### SIS-MGD-02: マイグレーションエラーの処理

```typescript
it("should handle migration errors gracefully", () => {
  mockStore.get.mockImplementationOnce(() => {
    throw new Error("Migration failed");
  });

  // エラーが発生してもクラッシュしない
  expect(() => new SkillImportStore()).not.toThrow();
});
```

### SIS-MGD-03: 欠落キーの初期化

```typescript
it("should initialize missing keys during migration", () => {
  mockStore.get.mockImplementation((key: string) => {
    if (key === "schemaVersion") return 0;
    return undefined;
  });
  mockStore.has.mockReturnValue(false);

  new SkillImportStore();

  // importedSkillsとskillSettingsが初期化されることを確認
  expect(mockStore.set).toHaveBeenCalledWith("importedSkills", {});
  expect(mockStore.set).toHaveBeenCalledWith("skillSettings", {});
  expect(mockStore.set).toHaveBeenCalledWith("schemaVersion", 1);
});
```

---

## 3. テストケース数

| カテゴリ             | テスト数 |
| -------------------- | -------- |
| マイグレーション動作 | 3        |
| **合計**             | **3**    |

---

## 4. 完了基準

- [x] 現行バージョンでのスキップテスト
- [x] エラー処理テスト
- [x] 欠落キー初期化テスト
