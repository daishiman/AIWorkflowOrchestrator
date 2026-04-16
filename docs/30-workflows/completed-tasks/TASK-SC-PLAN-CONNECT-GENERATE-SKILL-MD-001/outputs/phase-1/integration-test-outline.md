# 統合テスト概要 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## テスト対象パイプライン

```
runCreateWorkflow(options) → StructurePlanJson | null
                                    ↓
                         null チェック
                           ↙          ↘
              generateSkillMd()    console.error()
              (SKILL.md生成)       (エラーログ)
```

## 統合テストシナリオ

### 正常系

| TC-ID | シナリオ                                          | 期待結果                        |
| ----- | ------------------------------------------------- | ------------------------------- |
| TC-01 | `runCreateWorkflow` が `StructurePlanJson` を返す | `generateSkillMd` が1回呼ばれる |
| TC-02 | `runCreateWorkflow` が `null` を返す              | `generateSkillMd` が呼ばれない  |

### 異常系

| TC-ID | シナリオ                                     | 期待結果                     |
| ----- | -------------------------------------------- | ---------------------------- |
| TC-03 | `runCreateWorkflow` が `null` を返す         | エラーログが出力される       |
| TC-04 | `generateSkillMd` が例外を投げる             | エラーハンドリングが動作する |
| TC-05 | `runCreateWorkflow` が例外を投げる           | エラーハンドリングが動作する |
| TC-06 | 連続呼び出し（structurePlan あり・なし交互） | それぞれ正しく動作する       |

## テストファイル

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

## カバレッジ目標

| 指標                | 目標 |
| ------------------- | ---- |
| Line Coverage       | 90%+ |
| Branch Coverage     | 70%+ |
| null パスカバレッジ | 100% |
