# TASK-SC-LLM-PURPOSE-WIRE-001 手動テストチェックリスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| タスク種別 | NON_VISUAL                   |
| 状態       | 未実施                       |

## チェックリスト

| TC-ID    | 観点           | 実施内容                                                                | 記録先                  |
| -------- | -------------- | ----------------------------------------------------------------------- | ----------------------- |
| MT-11-01 | purpose 抽出   | `loadAgent("extract-purpose")` の戻り値が LLM 入力へ渡ることを確認する  | `manual-test-result.md` |
| MT-11-02 | フォールバック | LLM 未設定時に `options.description` へフォールバックすることを確認する | `manual-test-result.md` |
| MT-11-03 | 非回帰         | collaborative / orchestrate モードへ影響しないことを確認する            | `manual-test-result.md` |

## 補足

- 本タスクは NON_VISUAL のため、画面スクリーンショットは要求しない。
- 実施結果は `manual-test-result.md` と `discovered-issues.md` に集約する。
