# Phase 11 Manual Test Checklist

## 判定方針

- 本タスクは runtime 契約正規化であり UI レイアウト変更はなし
- スクリーンショットは `N/A` とし、代わりに導線非回帰の手動確認を実施

## チェックリスト

| ID       | 観点                    | 手順                                           | 結果 |
| -------- | ----------------------- | ---------------------------------------------- | ---- |
| TC-11-01 | plan error 表示         | `llmAdapter` 未注入条件で plan 実行            | PASS |
| TC-11-02 | execute 成功導線        | 既存の execute → verify 導線を確認             | PASS |
| TC-11-03 | terminal handoff 非回帰 | handoff 分岐で guidance 表示を確認             | PASS |
| TC-11-04 | provenance 表示導線     | workflow snapshot の provenance summary を確認 | PASS |
| TC-11-05 | 失敗時 review 戻し      | execute failure で review へ戻ることを確認     | PASS |

## 補足

- 視覚差分スクリーンショット: N/A
- 根拠: 表示レイアウト/スタイルの変更を含まない
