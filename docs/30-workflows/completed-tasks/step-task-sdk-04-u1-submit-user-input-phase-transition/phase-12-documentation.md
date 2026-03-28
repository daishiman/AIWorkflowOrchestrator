# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 12                                                  |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

implementation guide、same-wave spec sync、unassigned detection、feedback、compliance check を 6 成果物で閉じる。

## 実行タスク

- 実装ガイド作成
- system spec update summary 作成
- documentation changelog 作成
- unassigned detection 実施
- skill feedback 記録
- compliance check 実施

## 参照資料

| 資料名                     | パス                                                     | 説明              |
| -------------------------- | -------------------------------------------------------- | ----------------- |
| phase 2 design             | `outputs/phase-2/design.md`                              | 設計根拠          |
| phase 5 implementation     | `outputs/phase-5/implementation.md`                      | 実装対象          |
| phase 6 test expansion     | `outputs/phase-6/test-expansion.md`                      | regression 観点   |
| phase 7 coverage           | `outputs/phase-7/coverage-check.md`                      | coverage 観点     |
| phase 8 refactoring        | `outputs/phase-8/refactoring.md`                         | 構造整理          |
| phase 9 QA                 | `outputs/phase-9/quality-assurance.md`                   | 実測結果          |
| phase 10 review            | `outputs/phase-10/final-review.md`                       | gate 判定         |
| phase 11 result            | `outputs/phase-11/manual-test-result.md`                 | 手動検証結果      |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 2パート実装ガイド |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜2 判定  |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新一覧          |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク有無      |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill への所見    |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終 PASS/FAIL    |

## 実行手順

### ステップ1: 6 成果物を揃える

Part 1 / Part 2 を含む `implementation-guide.md` を起点に、Step 1-A〜2、unassigned、feedback、compliance を個別成果物で閉じる。

### ステップ2: same-wave sync 先を具体化する

`task-workflow-backlog.md`、`task-workflow-completed.md`、`lessons-learned-phase12-workflow-lifecycle.md`、`LOGS.md x2`、`SKILL.md x2`、`topic-map.md` の更新要否をファイル単位で判定する。

### ステップ3: 将来表現を残さず締める

Phase 12 成果物内に保留表現が残っていないことを compliance check で確認する。

## 成果物

| 成果物               | パス                                                     | 説明                   |
| -------------------- | -------------------------------------------------------- | ---------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 を含む |
| spec update summary  | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜2            |
| changelog            | `outputs/phase-12/documentation-changelog.md`            | 更新一覧               |
| unassigned detection | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク有無           |
| skill feedback       | `outputs/phase-12/skill-feedback-report.md`              | skill 所見             |
| compliance check     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終確認               |

## 完了条件

- [ ] Phase 12 の 6 必須成果物が揃っている
- [ ] same-wave sync 先がファイル単位で記録されている
- [ ] 保留表現が残っていない
- [ ] 本Phase内の全タスクを100%実行完了
