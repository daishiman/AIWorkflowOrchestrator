# two-workflow-audit-summary

## 目的

移管前に current/completed の 2workflow で実施した再監査結果を保持しつつ、Phase 12 完了確認後に成果物を `completed-tasks` 側へ統合したことを記録する。

## 移管後の正本

| Workflow                   | パス                                                           | 役割                                                                 | 判定     |
| -------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| unified completed workflow | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/` | 移管前 current workflow の成果物と baseline 正規化結果を統合した正本 | official |

## 実行結果

| チェック                                  | 結果                                    |
| ----------------------------------------- | --------------------------------------- |
| `verify-all-specs --strict`               | PASS                                    |
| `validate-phase-output`                   | PASS                                    |
| `artifacts.json / outputs/artifacts.json` | PASS（Phase 1-12 台帳と移管結果を同期） |

## 解消した legacy ドリフト

| 区分            | 内容                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase 7 命名    | `phase-7-coverage-verification.md` を `phase-7-coverage-check.md` へ正規化                                                          |
| Phase 11 重複   | `phase-11-manual-testing.md` を削除し、`phase-11-manual-test.md` を正本化                                                           |
| Phase 11 構造   | `目的` / `実行タスク` / `参照資料` / `完了条件` / `統合テスト連携` を補完し、`screenshot-plan.json` / `discovered-issues.md` を追加 |
| artifact 台帳   | `artifacts.json` / `outputs/artifacts.json` を実在成果物へ同期し、Phase 11 artifact を拡張                                          |
| screenshot tool | wizard capture script の error 待機を UI 実文言へ合わせ、scenario 単位の失敗診断を追加                                              |

## 判断

- 移管前 2workflow 監査で確定した差分は、本 workflow に統合して保持する
- baseline に使った completed workflow は比較専用で終わらせず、同ターンで validator PASS 状態まで正規化する
- Phase 12 完了後は `completed-tasks/store-driven-lifecycle-ui` を唯一の参照先にし、旧 current workflow への参照は残さない

## 結論

今回のエレガントな解決策は、移管前に 2workflow で再監査し、完了条件を満たした時点で `completed-tasks` 正本へ統合すること。その結果、仕様・証跡・artifact 台帳・validator 結果の参照先が一本化され、以後の再確認で current/completed の二重管理を持ち込まずに済む。
