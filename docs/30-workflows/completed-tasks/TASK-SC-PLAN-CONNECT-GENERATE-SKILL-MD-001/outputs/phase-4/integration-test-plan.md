# 統合テスト計画 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## テストシナリオ全体計画

### 正常系（Phase 4 作成）

| TC-ID            | シナリオ           | 期待結果                      |
| ---------------- | ------------------ | ----------------------------- |
| TC-SC-CONNECT-01 | structurePlan あり | generateSkillMd が1回呼ばれる |

### 異常系（Phase 4 作成）

| TC-ID            | シナリオ           | 期待結果                               |
| ---------------- | ------------------ | -------------------------------------- |
| TC-SC-CONNECT-02 | structurePlan null | generateSkillMd が呼ばれない           |
| TC-SC-CONNECT-03 | structurePlan null | console.error でエラーログが出力される |

### エッジケース（Phase 6 追加予定）

| TC-ID            | シナリオ                                | 期待結果                                  |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| TC-SC-CONNECT-04 | generateSkillMd が例外を投げる          | エラーハンドリングが動作する              |
| TC-SC-CONNECT-05 | runCreateWorkflow が例外を投げる        | null として扱われる（既存実装で保証済み） |
| TC-SC-CONNECT-06 | 連続呼び出し（structurePlan あり/なし） | それぞれ正しく動作する                    |

## カバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| 接続コード Line   | 100% |
| null ブランチ     | 100% |
| non-null ブランチ | 100% |
