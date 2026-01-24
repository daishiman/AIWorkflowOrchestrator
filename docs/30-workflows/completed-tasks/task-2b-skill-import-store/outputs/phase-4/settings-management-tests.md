# 設定管理テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 4                                                                   |
| タスク         | 3                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. getSettings テスト

| テストID  | テスト名                                        | 目的                                |
| --------- | ----------------------------------------------- | ----------------------------------- |
| SIS-ST-01 | should return default settings for new skill    | 新規スキルのデフォルト設定を返す    |
| SIS-ST-02 | should return saved settings for existing skill | 既存スキルの保存済み設定を返す      |
| SIS-ST-03 | should return undefined for non-imported skill  | 未インポートスキルはundefinedを返す |

---

## 2. updateSettings テスト

| テストID  | テスト名                                  | 目的                           |
| --------- | ----------------------------------------- | ------------------------------ |
| SIS-ST-04 | should update settings for imported skill | インポート済みスキルの設定更新 |
| SIS-ST-05 | should merge partial settings             | 部分的な設定更新のマージ       |

---

## 3. テストケース数

| カテゴリ       | テスト数 |
| -------------- | -------- |
| getSettings    | 3        |
| updateSettings | 2        |
| **合計**       | **5**    |

---

## 4. テストデータ

```typescript
const TEST_SKILL_NAME = "test-skill";

const DEFAULT_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};

const CUSTOM_SETTINGS: SkillSettings = {
  autoApproveReadOnly: false,
  rememberPermissions: true,
  rememberedPermissions: {
    Read: true,
    Write: false,
  },
};
```

---

## 5. 完了基準

- [x] getSettings テストケース: 3件
- [x] updateSettings テストケース: 2件
- [x] 合計: 5件（要件: 3件以上）
