# TASK-RALLY-002 Manual Test Report

## Primary Evidence

UI/UX変更なしのため Phase 11 スクリーンショット不要

## 実施内容

| シナリオ        | 結果 | 根拠                                              |
| --------------- | ---- | ------------------------------------------------- |
| 通常フロー      | PASS | snapshot の質問が表示される                       |
| 復元フロー      | PASS | undo 後に restored request を優先                 |
| 切替確認        | PASS | requestId 変化で restored state を clear          |
| submit 後 clear | PASS | awaitingUserInput=null へ戻したとき待機表示へ遷移 |

## 補足

- task 固有 path を primary evidence とする
- root `outputs/phase-11` は参照しない
