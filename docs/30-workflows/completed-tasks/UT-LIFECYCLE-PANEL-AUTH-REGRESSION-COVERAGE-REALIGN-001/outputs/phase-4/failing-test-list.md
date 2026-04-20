# failing-test-list.md

## Phase 4: Red 状態確認記録

Phase 4 では新規テストケースをスタブとして追加し、Red 状態を確認する工程です。
本タスクでは Phase 4 と Phase 5 を一括実施し、スタブ追加後ただちに実装を行いました。

## スタブ追加後の状態

追加したスタブ（`it(...)` ブロック）はインポートエラー・モック設定エラーなしに実行可能な状態です。
各テストの初回実行時（実装前）の状態:

| テストID                                     | スタブの状態            | 理由               |
| -------------------------------------------- | ----------------------- | ------------------ |
| AUTH-REGRESS-RAPID-CLICK-06（3回）           | 実装済みのため直接 PASS | Phase 4+5 一括実施 |
| AUTH-REGRESS-RAPID-CLICK-06（5回）           | 実装済みのため直接 PASS | Phase 4+5 一括実施 |
| AUTH-REGRESS-RERENDER-07（skillName変更）    | 実装済みのため直接 PASS | Phase 4+5 一括実施 |
| AUTH-REGRESS-RERENDER-07（onOpenWizard変更） | 実装済みのため直接 PASS | Phase 4+5 一括実施 |
| AUTH-REGRESS-RERENDER-07（store状態変化）    | 実装済みのため直接 PASS | Phase 4+5 一括実施 |
| TC-GUARD-01a（onOpenSkillWizard）            | 実装済みのため直接 PASS | Phase 4+5 一括実施 |
| TC-GUARD-01b（onOpenWizard）                 | 実装済みのため直接 PASS | Phase 4+5 一括実施 |

## 既存テスト継続 PASS 確認

| テストID | 状態 |
| -------- | ---- |
| TC-01    | PASS |
| TC-02    | PASS |
| TC-04-1  | PASS |
| TC-04-2  | PASS |
| TC-08    | PASS |
