# Phase 6 成果物: 拡張テストケース

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 追加済みテスト（TC-01〜TC-05）

| TC-ID | シナリオ                       | 結果 |
| ----- | ------------------------------ | ---- |
| TC-01 | ラジオボタン非表示確認         | PASS |
| TC-02 | generation-mode-selector非存在 | PASS |
| TC-03 | Step 0→Step 1遷移確認          | PASS |
| TC-04 | Step 2直接遷移不可確認         | PASS |
| TC-05 | 正規フロー通過確認             | PASS |

## 既存テスト回帰結果

| テストグループ             | 件数   | 結果       |
| -------------------------- | ------ | ---------- |
| 初期表示                   | 1      | PASS       |
| ステップ遷移               | 3      | PASS       |
| 完了画面                   | 3      | PASS       |
| resolveExternalIntegration | 4      | PASS       |
| IPC 呼び出し               | 3      | PASS       |
| STEPS 配列                 | 2      | PASS       |
| inferSmartDefaults         | 13     | PASS       |
| **合計**                   | **34** | **全PASS** |

## エッジケースカバレッジ状況

| エッジケース                   | カバー状況                          | 備考                     |
| ------------------------------ | ----------------------------------- | ------------------------ |
| ラジオボタン削除後の再マウント | TC-01で確認                         | 毎回beforeEachでリセット |
| generationMode state残骸       | コード検索で確認（0件）             | grep確認済み             |
| Step 0→2直接遷移防止           | TC-04で確認                         | 正規遷移のみ許可         |
| 既存テンプレートモードテスト   | llm-generation.test.tsxにてskip済み | describe.skip            |
