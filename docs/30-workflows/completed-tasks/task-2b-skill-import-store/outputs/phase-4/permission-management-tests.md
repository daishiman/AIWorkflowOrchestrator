# 権限管理テスト一覧

## メタ情報

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| Phase          | 4                                                                   |
| タスク         | 4                                                                   |
| 作成日         | 2026-01-24                                                          |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |

---

## 1. getRememberedPermission テスト

| テストID  | テスト名                                               | 目的                          |
| --------- | ------------------------------------------------------ | ----------------------------- |
| SIS-PM-01 | should return undefined for skill without settings     | 設定なしでundefinedを返す     |
| SIS-PM-02 | should return undefined when rememberPermissions=false | 記憶無効時はundefinedを返す   |
| SIS-PM-03 | should return undefined for non-remembered tool        | 未記憶ツールはundefinedを返す |
| SIS-PM-04 | should return remembered permission                    | 記憶済み権限を返す            |

---

## 2. setRememberedPermission テスト

| テストID  | テスト名                                              | 目的                   |
| --------- | ----------------------------------------------------- | ---------------------- |
| SIS-PM-05 | should store permission when rememberPermissions=true | 記憶有効時に権限を保存 |
| SIS-PM-06 | should do nothing when rememberPermissions=false      | 記憶無効時は何もしない |
| SIS-PM-07 | should overwrite existing permission                  | 既存権限を上書き       |

---

## 3. テストケース数

| カテゴリ                | テスト数 |
| ----------------------- | -------- |
| getRememberedPermission | 4        |
| setRememberedPermission | 3        |
| **合計**                | **7**    |

---

## 4. テストデータ

```typescript
const TEST_SKILL_NAME = "test-skill";

const SETTINGS_WITH_REMEMBER: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: true,
  rememberedPermissions: {
    Read: true,
    "Bash(npm *)": false,
  },
};

const SETTINGS_WITHOUT_REMEMBER: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};
```

---

## 5. 完了基準

- [x] getRememberedPermission テストケース: 4件
- [x] setRememberedPermission テストケース: 3件
- [x] 合計: 7件（要件: 3件以上）
