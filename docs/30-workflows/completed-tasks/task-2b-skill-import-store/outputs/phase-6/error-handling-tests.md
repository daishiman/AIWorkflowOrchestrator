# Phase 6 異常系テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 6                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. 異常系テスト

### 1.1 ストア読み込みエラー

| テストID  | テスト名                                       | 目的                           |
| --------- | ---------------------------------------------- | ------------------------------ |
| SIS-EH-01 | should handle corrupted store data gracefully  | 破損データを適切に処理         |
| SIS-EH-02 | should return empty array when store.get fails | store.get失敗時は空配列を返す  |
| SIS-EH-03 | should return default settings on error        | エラー時はデフォルト設定を返す |
| SIS-EH-04 | should handle missing schemaVersion gracefully | schemaVersion不在を適切に処理  |

---

## 2. テストケース詳細

### SIS-EH-01: 破損データの処理

```typescript
it("should handle corrupted store data gracefully", () => {
  mockStore.get.mockImplementationOnce(() => {
    throw new Error("Corrupted data");
  });

  // コンストラクタでエラーが発生してもクラッシュしない
  expect(() => new SkillImportStore()).not.toThrow();
});
```

### SIS-EH-02: store.get失敗時の空配列

```typescript
it("should return empty array when store.get fails in getImported", () => {
  mockStore.get.mockImplementationOnce(() => {
    throw new Error("Read error");
  });

  const result = store.getImported();
  expect(result).toEqual([]);
});
```

### SIS-EH-03: エラー時のデフォルト設定

```typescript
it("should return default settings when store.get fails", () => {
  mockStore.get.mockImplementationOnce(() => {
    throw new Error("Read error");
  });

  const settings = store.getSettings("any-skill");
  expect(settings).toEqual({
    autoApproveReadOnly: true,
    rememberPermissions: false,
    rememberedPermissions: {},
  });
});
```

### SIS-EH-04: schemaVersion不在の処理

```typescript
it("should handle missing schemaVersion gracefully", () => {
  mockStore.get.mockImplementation((key: string, defaultValue?: unknown) => {
    if (key === "schemaVersion") return undefined;
    return defaultValue;
  });

  // マイグレーションが実行される
  expect(() => new SkillImportStore()).not.toThrow();
  expect(mockStore.set).toHaveBeenCalledWith("schemaVersion", 1);
});
```

---

## 3. テストケース数

| カテゴリ             | テスト数 |
| -------------------- | -------- |
| ストア読み込みエラー | 4        |
| **合計**             | **4**    |

---

## 4. 完了基準

- [x] 破損データ処理テスト
- [x] store.get失敗時のフォールバックテスト
- [x] デフォルト設定返却テスト
- [x] schemaVersion不在時のマイグレーションテスト
