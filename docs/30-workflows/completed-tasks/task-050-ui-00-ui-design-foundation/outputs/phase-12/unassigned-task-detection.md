# 未タスク検出レポート（Phase 12）

## 結論

- 新規未タスク: **3件**

## 調査対象

| 観点                 | 入力ソース                                                     | 結果                           |
| -------------------- | -------------------------------------------------------------- | ------------------------------ |
| 手動試験発見事項     | `outputs/phase-11/discovered-issues.md`                        | 2件（Phase 11 MINOR）          |
| 画面証跡運用課題     | `phase-11-manual-test.md` + screenshot coverage warning        | 1件（TC一覧/マトリクス節不足） |
| TODO/FIXME           | 追加したUI基盤コンポーネント群 + workflow配下                  | 新規検出なし                   |
| 台帳リンク整合       | `verify-unassigned-links.js`                                   | `92/92` で欠落0                |
| 個別フォーマット整合 | `audit-unassigned-tasks --target-file`（UT-UI-00-001/002/003） | 3件とも `currentViolations=0`  |
| 差分監査             | `audit-unassigned-tasks --json --diff-from HEAD`               | `currentViolations.total=0`    |

## 判定詳細

### 1. Phase 11発見課題の扱い

| ID              | 内容                                                                                    | 判定                            |
| --------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| ISSUE-UI-11-001 | Lightテーマで境界線が弱く見える                                                         | `UT-UI-00-001` として未タスク化 |
| ISSUE-UI-11-002 | 390px幅で二次情報が詰まって見える                                                       | `UT-UI-00-002` として未タスク化 |
| ISSUE-UI-11-003 | `phase-11-manual-test.md` の TC一覧/画面カバレッジマトリクス節不足により warning が残留 | `UT-UI-00-003` として未タスク化 |

### 2. 作成した未タスク指示書

| 未タスクID   | 指示書                                                                                                                   | ステータス |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-UI-00-001 | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-light-border-contrast-improvement.md`       | 未実施     |
| UT-UI-00-002 | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-mobile-density-optimization.md`             | 未実施     |
| UT-UI-00-003 | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-phase11-coverage-matrix-standardization.md` | 未実施     |

### 3. TODO/FIXME 調査

- コマンド: `rg -n "TODO|FIXME" <対象ディレクトリ>`
- 結果: 新規実装ファイルで該当なし

## 監査ログ

- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
  - `total: 92, existing: 92, missing: 0`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-light-border-contrast-improvement.md`
  - `currentViolations.total: 0`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-mobile-density-optimization.md`
  - `currentViolations.total: 0`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-phase11-coverage-matrix-standardization.md`
  - `currentViolations.total: 0`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
  - `currentViolations.total: 0`
  - `baselineViolations.total: 98`（既存負債、今回差分対象外）

## 備考

- Phase 11 MINOR 指摘に加えて、Phase 11 証跡運用の warning 残留も未タスク化して追跡する方針に統一した。
