# Phase 6 エッジケーステスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 6                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. エッジケーステスト

### 1.1 スキル名バリデーション

| テストID  | テスト名                                          | 目的                                 |
| --------- | ------------------------------------------------- | ------------------------------------ |
| SIS-EC-01 | should accept maximum length skill name (128)     | 最大長スキル名を受け入れる           |
| SIS-EC-02 | should reject skill name exceeding maximum length | 最大長超過スキル名を拒否             |
| SIS-EC-03 | should accept skill name with valid characters    | 有効な文字のスキル名を許可           |
| SIS-EC-04 | should reject skill name with invalid characters  | 無効な文字のスキル名を拒否           |
| SIS-EC-05 | should handle empty string skill name             | 空文字列スキル名を適切に処理         |
| SIS-EC-06 | should truncate long names in error messages      | エラーメッセージで長い名前を切り詰め |

---

## 2. テストケース詳細

### SIS-EC-01: 最大長スキル名

```typescript
it("should accept maximum length skill name (128 chars)", () => {
  const maxLengthName = "a".repeat(128);
  expect(() => store.addImport(maxLengthName)).not.toThrow();
});
```

### SIS-EC-02: 最大長超過スキル名

```typescript
it("should reject skill name exceeding maximum length", () => {
  const tooLongName = "a".repeat(129);
  expect(() => store.addImport(tooLongName)).toThrow("Invalid skill name");
});
```

### SIS-EC-03: 有効な文字

```typescript
it("should accept skill name with valid characters", () => {
  const validNames = ["test-skill", "test_skill", "TestSkill123", "a1-b2_c3"];
  validNames.forEach((name) => {
    mockStoreData.importedSkills = {};
    expect(() => store.addImport(name)).not.toThrow();
  });
});
```

### SIS-EC-04: 無効な文字

```typescript
it("should reject skill name with invalid characters", () => {
  const invalidNames = ["test.skill", "test skill", "test@skill", "日本語"];
  invalidNames.forEach((name) => {
    expect(() => store.addImport(name)).toThrow("Invalid skill name");
  });
});
```

### SIS-EC-05: 空文字列

```typescript
it("should handle empty string skill name", () => {
  expect(() => store.addImport("")).toThrow("Invalid skill name: (empty)");
});
```

### SIS-EC-06: エラーメッセージ切り詰め（SEC-01対応）

```typescript
it("should truncate long names in error messages (SEC-01)", () => {
  const longInvalidName = "invalid.name." + "x".repeat(100);
  expect(() => store.addImport(longInvalidName)).toThrow(
    "Invalid skill name: invalid.name.xxxxxxx...",
  );
});
```

---

## 3. テストケース数

| カテゴリ               | テスト数 |
| ---------------------- | -------- |
| スキル名バリデーション | 6        |
| **合計**               | **6**    |

---

## 4. 完了基準

- [x] 最大長スキル名のテスト
- [x] 最大長超過スキル名のテスト
- [x] 有効な文字のテスト
- [x] 無効な文字のテスト
- [x] 空文字列のテスト
- [x] SEC-01対応エラーメッセージ切り詰めのテスト
