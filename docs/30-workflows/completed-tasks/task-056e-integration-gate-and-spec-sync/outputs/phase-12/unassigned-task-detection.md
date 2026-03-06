# Phase 12 未タスク検出レポート

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| タスクID   | TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC |
| 判定日     | 2026-03-06                              |
| ステータス | completed                               |

## 検出ソース

| ソース                           | 方式                                             | raw件数 | 精査後件数 | 備考                                                                                     |
| -------------------------------- | ------------------------------------------------ | ------- | ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --- | ----------------------------------- | ------------------------------------------------------------------ |
| Phase 3 レビュー結果             | `review-findings.md` 目視確認                    | 1       | 0          | `DG-01` は current scope で是正済み                                                      |
| Phase 10 レビュー結果            | `rework-decision-log.md` 目視確認                | 0       | 0          | `MAJOR` / `CRITICAL` なし                                                                |
| Phase 11 手動テスト              | `discovered-issues.md` / `manual-test-result.md` | 0       | 0          | representative screenshots 6件を確認し、未解決 issue は 0                                |
| current workflow 生成物          | `rg -n "TODO                                     | FIXME   | 将来対応   | later                                                                                    | TBD" ... -g '!outputs/phase-12/unassigned-task-detection.md'` | 0   | 0                                   | self-reference を除外し、current workflow 配下に要対応コメントなし |
| 関連コードベース                 | `rg -n "TODO                                     | FIXME   | HACK       | XXX" <parent-docs> <spec-update-workflow>`                                               | 0                                                             | 0   | task 影響範囲に新規未タスク候補なし |
| documentation-changelog 苦戦箇所 | 手動精査                                         | 2       | 1          | 既存未タスクの誤配置 1件を是正し、専用 recheck テンプレート採用強制 gap を新規未タスク化 |

## 検出内容

### raw候補

1. `DG-01`
   - 理由: parent docs が旧 nested workflow path を参照し、current workflow の canonical path とズレていた
   - 判定: **新規未タスクではない**
   - 対応: parent task / 統合 index / current workflow / verification-report を同一ターンで current path へ正規化した

2. `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001`
   - 理由: `verify-unassigned-links` 実行時に、未実施タスクの物理ファイルが `completed-tasks/` 側へ誤配置されていることを検出
   - 判定: **新規未タスクではない**
   - 対応: 既存指示書を `docs/30-workflows/unassigned-task/` へ戻し、参照正本と一致させた

3. `UT-IMP-PHASE12-TASK-SPEC-RECHECK-ADOPTION-001`
   - 理由: `phase12-task-spec-recheck-template.md` を追加済みでも、`task-specification-creator` 側の採用強制と 4点突合監査は手動依存が残っていた
   - 判定: **新規未タスク**
   - 対応: いったん起票後、Phase 12 完了に合わせて `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-task-spec-recheck-adoption-001.md` へ移管し、`task-workflow.md` / `lessons-learned.md` / current workflow `outputs/phase-12` へ同一IDを同期した

### 精査後の判定

- 新規に作成すべき未タスク指示書: **1件**
- 既存未タスクの是正: **1件**

## 配置確認

| 確認項目                                                                                                                                   | 結果   | 備考                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------- | -------------------------- |
| `docs/30-workflows/unassigned-task/` に継続管理ファイルが存在                                                                              | PASS   | `task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` の物理ファイルを確認 |
| `docs/30-workflows/completed-tasks/unassigned-task/` に移管ファイルが存在                                                                  | PASS   | `task-imp-phase12-task-spec-recheck-adoption-001.md` の物理ファイルを確認                       |
| `## メタ情報 + ## 1..9` の10見出し                                                                                                         | PASS   | 新規1件 + 既存1件の `rg -n '^## メタ情報$                                                       | ^## [1-9]\\. ' ...` を確認 |
| `docs/30-workflows/completed-tasks/unassigned-task/` baseline 監視                                                                         | 要監視 | 全体監査では `misplacedFiles=22` の baseline が残るが、今回差分の `currentViolations` は 0      |
| `verify-unassigned-links.js`                                                                                                               | PASS   | 106/106, missing=0, `ALL_LINKS_EXIST`                                                           |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file ...task-imp-phase12-task-spec-recheck-adoption-001.md`                       | PASS   | 新規指示書の今回差分は `currentViolations=0`, `baselineViolations=93`                           |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file ...task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | PASS   | 対象指示書の今回差分は `currentViolations=0`, `baselineViolations=93`                           |
| `audit-unassigned-tasks --json --diff-from HEAD`                                                                                           | PASS   | 合否判定値 `currentViolations=0`, `baselineViolations=93`                                       |
| `audit-unassigned-tasks --json`                                                                                                            | 参考値 | repo 全体監視値 `currentViolations=93`, `baselineViolations=0`。今回合否には不採用              |

## 結論

- current workflow の再確認から、新規未タスク `UT-IMP-PHASE12-TASK-SPEC-RECHECK-ADOPTION-001` を 1件追加した。
- 親タスクの Phase 12 完了後、同未タスクは `completed-tasks/unassigned-task/` へ移管した。
- 既存の未実施タスク1件に誤配置を検出したため、正本位置へ戻して Phase 12 のリンク監査を成立させた。
- repo 全体監査では 93件の既存違反が残るため、今回差分 `currentViolations=0` と切り分けて監視する。
