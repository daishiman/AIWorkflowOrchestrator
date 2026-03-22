# Phase 11: 手動テストチェックリスト - Runtime Policy Centralization

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| Phase    | 11                                         |
| 種別     | design walkthrough                         |
| 判定     | PASS                                       |

## チェック項目

- [x] `manual-test-plan.md` に validation-matrix.md シナリオ 1-4 が TC-ID 付きで展開されている
- [x] grep ベース静的確認コマンドが `manual-test-plan.md` に記録されている
- [x] `screenshot-plan.json` に代替証跡方針が記録されている
- [x] `discovered-issues.md` に発見事項 2 件が記録されている
- [x] design task であることと production code 変更なしの前提が明記されている

## 補足

- 本 task は設計タスクのため、実画面キャプチャの代わりに設計文書 diff と grep ログを証跡とする。
- 実 UI のスクリーンショット取得は downstream implementation task で実施する。
