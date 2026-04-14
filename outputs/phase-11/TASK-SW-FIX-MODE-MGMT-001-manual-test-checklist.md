# Phase 11 成果物: 手動テストチェックリスト

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 手動確認項目

| TC-ID | 確認内容                                                                  | 確認方法             |
| ----- | ------------------------------------------------------------------------- | -------------------- |
| TC-01 | Step 0 にラジオボタン（テンプレートから作成/LLMで生成）が表示されていない | 目視確認             |
| TC-02 | generation-mode-selector が DOM に存在しない                              | DevTools で確認      |
| TC-03 | Step 0 の「次へ」クリックで Step 1（Q1〜Q6）に遷移する                    | 操作確認             |
| TC-04 | Step 0 次へ後に Step 2 が直接表示されない                                 | 画面遷移確認         |
| TC-05 | Step 1 で Q1〜Q6 インタビューが表示されスキップできない                   | 操作確認             |
| TC-06 | 正規フロー Step 0→1→2→3 が完了できる                                      | エンドツーエンド確認 |

## スクリーンショット計画

| シーン                     | ファイル名                          |
| -------------------------- | ----------------------------------- |
| Step 0（ラジオボタンなし） | screenshots/step-0-no-radio.png     |
| Step 0→1 遷移後            | screenshots/step-1-conversation.png |
| Step 1 Q1〜Q6 表示         | screenshots/step-1-questions.png    |
| Step 2 生成中              | screenshots/step-2-generating.png   |
| Step 3 完了                | screenshots/step-3-complete.png     |
