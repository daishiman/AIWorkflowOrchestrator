# インポート管理テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 4                                                                   |
| タスク         | 2                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. getImported テスト

| テストID  | テスト名                                          | 目的                             |
| --------- | ------------------------------------------------- | -------------------------------- |
| SIS-IM-01 | should return empty array when no skills imported | 空のストア時に空配列を返す       |
| SIS-IM-02 | should return all imported skills                 | 全インポート済みスキルを返す     |
| SIS-IM-03 | should return empty array on store read error     | 読み込みエラー時のフォールバック |

---

## 2. addImport テスト

| テストID  | テスト名                                      | 目的                         |
| --------- | --------------------------------------------- | ---------------------------- |
| SIS-IM-04 | should add a new skill                        | 新規スキルの追加             |
| SIS-IM-05 | should set initial status as active           | 初期ステータスがactive       |
| SIS-IM-06 | should set importedAt timestamp               | インポート日時の設定         |
| SIS-IM-07 | should throw on empty skill name              | 空文字でエラー               |
| SIS-IM-08 | should throw on invalid skill name characters | 無効な文字でエラー           |
| SIS-IM-09 | should overwrite existing skill (idempotent)  | 既存スキルの上書き（冪等性） |

---

## 3. removeImport テスト

| テストID  | テスト名                                  | 目的                               |
| --------- | ----------------------------------------- | ---------------------------------- |
| SIS-IM-10 | should remove an existing skill           | 既存スキルの削除                   |
| SIS-IM-11 | should also remove skill settings         | 関連設定も削除                     |
| SIS-IM-12 | should do nothing if skill does not exist | 存在しない場合は何もしない（冪等） |

---

## 4. exists テスト

| テストID  | テスト名                                   | 目的                 |
| --------- | ------------------------------------------ | -------------------- |
| SIS-IM-13 | should return true for imported skill      | インポート済みでtrue |
| SIS-IM-14 | should return false for non-imported skill | 未インポートでfalse  |

---

## 5. updateLastUsed テスト

| テストID  | テスト名                                  | 目的                       |
| --------- | ----------------------------------------- | -------------------------- |
| SIS-IM-15 | should update lastUsedAt timestamp        | 最終使用日時の更新         |
| SIS-IM-16 | should do nothing if skill does not exist | 存在しない場合は何もしない |

---

## 6. テストケース数

| カテゴリ       | テスト数 |
| -------------- | -------- |
| getImported    | 3        |
| addImport      | 6        |
| removeImport   | 3        |
| exists         | 2        |
| updateLastUsed | 2        |
| **合計**       | **16**   |

---

## 7. テストデータ

```typescript
const TEST_SKILL_NAME = "test-skill";
const TEST_SKILL_NAME_2 = "another-skill";

const INVALID_SKILL_NAMES = [
  "", // 空文字
  " ", // スペースのみ
  "../evil", // パストラバーサル
  "skill\0name", // null文字
  "skill/name", // スラッシュ
  "skill\\name", // バックスラッシュ
  "a".repeat(129), // 長すぎる
  "skill name", // スペース含む
  "skill:name", // コロン
];
```

---

## 8. 完了基準

- [x] getImported テストケース: 3件
- [x] addImport テストケース: 6件
- [x] removeImport テストケース: 3件
- [x] exists テストケース: 2件
- [x] updateLastUsed テストケース: 2件
- [x] 合計: 16件（要件: 5件以上）
