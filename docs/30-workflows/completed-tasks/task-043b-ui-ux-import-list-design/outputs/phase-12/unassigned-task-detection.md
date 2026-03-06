# Phase 12 未タスク検出レポート

## 検出結果サマリー

| ソース                                            | 検出数  | 備考                                                                                  |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| Phase 11 manual test result                       | 0件     | 総合判定 PASS                                                                         |
| `discovered-issues.md` の open issue              | 0件     | FIX-11-01 / FIX-11-02 はこのターンで解消済み                                          |
| アクセシビリティ違反                              | 0件     | blocking / minor ともに新規未タスク化なし                                             |
| 実装苦戦箇所の横展開                              | 1件     | `importSkill` non-throw 契約を `SkillCenterView` など他導線へ展開する改善タスクを追加 |
| `audit-unassigned-tasks --diff-from HEAD` current | 0件     | 今回差分起因の violation なし                                                         |
| repository baseline debt                          | 1件     | legacy 未タスク仕様書正規化を運用改善タスクとして分離                                 |
| **合計**                                          | **2件** | **blocking 0件 + 横展開改善 1件 + 運用改善 1件**                                      |

## 検出タスク一覧

| タスクID                                          | タスク名                                        | 種別       | 配置先                                                                                                                                    |
| ------------------------------------------------- | ----------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `UT-IMP-SKILL-IMPORT-RESULT-CONTRACT-GUARD-001`   | skill import 成功判定・error surface 共通ガード | 横展開改善 | `docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/unassigned-task/task-imp-skill-import-result-contract-guard-001.md` |
| `UT-IMP-UNASSIGNED-TASK-LEGACY-NORMALIZATION-001` | legacy 未タスク仕様書正規化ガード               | 運用改善   | `docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`                                                  |

Phase 11 のスクリーンショット検証、manual result、発見課題、a11y チェックを再確認した結果、TASK-043B の blocking バグとして追加すべき未タスクはありませんでした。一方で、今回の実装で確定した `importSkill` non-throw 契約と error surface 一元化を他導線へ横展開する改善タスクを 1 件追加し、さらに `audit-unassigned-tasks --json` が示した repository 全体の legacy 負債も継続改善対象として切り出しました。

## 参考監査

| 項目                                                                                                                                              | 結果                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `verify-unassigned-links.js`                                                                                                                      | PASS (`104/104`)                                              |
| `audit-unassigned-tasks.js --json`                                                                                                                | repository total 93 (`format=66`, `naming=5`, `misplaced=22`) |
| `audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                               | `currentViolations=0`, `baselineViolations=93`                |
| `test -f docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/unassigned-task/task-imp-skill-import-result-contract-guard-001.md` | PASS（完了タスク配下へ移管済み未タスク仕様書の実体存在確認）  |
| `audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`           | PASS (`currentViolations=0`, `scope.currentFiles=1`)          |

## 補足

- `baselineViolations=93` は repository 全体の既存負債です
- Phase 12 実行中に `task-workflow.md` の未タスクリンク切れ 1 件を修正しました
- これは既存整合の是正であり、TASK-043B から派生した新規未タスクではありません
- 親仕様参照 guard と Phase 12準拠チェック不足は `task-specification-creator` へこのターンで in-place 反映しました
- 今回追加した未タスクは「feature の blocking bug」ではなく、「skill import 契約の横展開改善」と「legacy 未タスク仕様書の正規化」を分離した改善タスクです
- completed workflow 配下へ移管した UT は `audit --target-file` の対象外なので、実体存在確認と `verify-unassigned-links` / `audit --diff-from HEAD` の組み合わせで監査しています
