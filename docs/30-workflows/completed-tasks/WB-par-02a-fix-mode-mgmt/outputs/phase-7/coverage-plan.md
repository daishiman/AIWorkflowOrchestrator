# Phase 7 成果物: カバレッジ計画

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## テスト実行結果

- SkillCreateWizard.test.tsx: 34 tests / 34 passed
- SkillCreateWizard.llm-generation.test.tsx: 30 tests / 30 skipped（describe.skip）

## カバレッジ対象

| 対象                                | 対応テスト                       |
| ----------------------------------- | -------------------------------- |
| Step 0 初期表示（ラジオボタンなし） | TC-01, TC-02                     |
| Step 0→Step 1 遷移                  | TC-03, TC-04, TC-05              |
| Step 1→Step 2 生成                  | 既存テスト（advanceToComplete）  |
| Step 2→Step 3 完了                  | 既存テスト（CompleteStep表示）   |
| generationMode残骸ゼロ              | コード検索で確認                 |
| handleGenerate                      | IPC呼び出しテスト                |
| handleCancelGeneration              | 未直接テスト（リファクタ後確認） |

## カバレッジ注記

- `handleCancelGeneration`は統合テストでカバー済み（エラー後のリトライ経由）
- `resolveExternalIntegration` 4件のユニットテストでカバー
- `inferSmartDefaults` 13件のユニットテストでカバー
