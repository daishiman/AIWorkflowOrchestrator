# Phase 12 タスク仕様準拠チェック

## メタ情報

| 項目         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| タスクID     | `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`                                            |
| タスク名     | `aiworkflow-requirements` line budget reform                                                         |
| workflow     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform`                       |
| 実施日       | `2026-03-13`                                                                                         |
| 判定         | `PASS`                                                                                               |
| 対象未タスク | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md` |

## SubAgent分担

| SubAgent | 関心ごと                  | 主担当                                                     | 完了条件                                                     |
| -------- | ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| A        | workflow 状態             | `phase-12-documentation.md` と `outputs/phase-12` 実体突合 | Task 12-1〜12-5 / 進捗100% / completed が一致                |
| B        | implementation guide 品質 | Part 1 / Part 2 の必須要素確認                             | `たとえば`、型、API/CLI、エッジケース、設定が揃う            |
| C        | 未タスク整合              | 配置先、10見出し、監査値の確認                             | `docs/30-workflows/unassigned-task/` + `currentViolations=0` |
| D        | system spec 同期          | task-workflow / lessons / logs への転記                    | 実装内容・苦戦箇所・5分解決カードが同期                      |
| E        | validator 実行            | verify / validate / mirror parity                          | 検証値が outputs と system spec で一致                       |

## 4点突合

### 1. `phase-12-documentation.md` と outputs 実体

- [x] `phase-12-documentation.md` の `ステータス` は `completed`
- [x] Task 12-1〜12-5 はすべて `[x]`
- [x] `Task 100% 実行確認` は `[x]`
- [x] `outputs/phase-12/` に必須成果物が存在する
- [x] `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` が実体化している

### 2. `implementation-guide.md`

- [x] `## Part 1` がある
- [x] `## Part 2` がある
- [x] 理由先行（`なぜ` / `必要`）になっている
- [x] 日常例えがあり、`たとえば` を含む
- [x] `type` または `interface` を含む TypeScript ブロックがある
- [x] API/CLI シグネチャがある
- [x] 使用例がある
- [x] エラーハンドリング説明がある
- [x] エッジケース説明がある
- [x] 設定項目または定数一覧がある

### 3. 未タスク配置監査

- [x] active 未タスクは `docs/30-workflows/unassigned-task/` 配下に物理ファイルがある
- [x] active 未タスク指示書は `## メタ情報 + ## 1..9` の10見出しを持つ
- [x] `verify-unassigned-links` は `missing=0`
- [x] `audit --json --diff-from HEAD --target-file <unassigned-file>` は `currentViolations=0`
- [x] `audit --json --diff-from HEAD` は `currentViolations=0`
- [x] repo 全体 `audit --json` は baseline 参考値として分離記録した
- [x] `baselineViolations=134` の既存 remediation task 参照を `unassigned-task-detection.md` に残した

### 4. system spec / outputs 同期

- [x] `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` に実装内容・苦戦箇所・検証証跡・5分解決カードがある
- [x] `lessons-learned-workflow-quality-line-budget-reform.md` に再発条件付き苦戦箇所と簡潔解決手順がある
- [x] `system-spec-update-summary.md` / `phase12-task-spec-compliance-check.md` / `unassigned-task-detection.md` の値は一致している
- [x] `task-specification-creator` と `skill-creator` の `SKILL.md` / `LOGS.md` に履歴がある
- [x] docs-only task のため Phase 11 UI coverage matrix 必須ではないが、user 要求により branch-level screenshot sanity は実施済み

## Task 12-1〜12-5 準拠確認

| Task                  | 判定 | 根拠                                                                                                 | 証跡                                             |
| --------------------- | ---- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 12-1 実装ガイド       | PASS | Part 1 / Part 2、例え話、型/API/edge case、設定項目を `validate-phase12-implementation-guide` で確認 | `outputs/phase-12/implementation-guide.md`       |
| 12-2 システム仕様更新 | PASS | Step 1-A〜1-G / Step 2、実装内容、苦戦箇所、5分解決カードを system spec と summary へ記録            | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 更新履歴         | PASS | 更新ファイル、skill/template/script 改善、validator 再実行を記録                                     | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 未タスク検出     | PASS | current/baseline 分離、配置監査、既存 remediation task 参照を記録                                    | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 フィードバック   | PASS | 改善した skill / template / script の差分と理由を記録                                                | `outputs/phase-12/skill-feedback-report.md`      |

## Step 1-A〜1-G / Step 2 準拠確認

| Step   | 判定 | 根拠                                                                                                                |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------- |
| 1-A    | PASS | `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` の仕様書、LOGS、SKILL を同一ターンで反映 |
| 1-B    | PASS | workflow 状態は `Phase 1-12 completed / currentPhase=13 / Phase 13 blocked` と記録                                  |
| 1-C    | PASS | `task-workflow` / `lessons` / retrospective / outputs を再同期し、参照整合を再確認                                  |
| 1-D    | PASS | phase graph 自体は不変のため `index.md` 再生成は不要。generated artifact と `artifacts.json` の実測値を更新         |
| 1-E    | PASS | `verify-unassigned-links` と `audit-unassigned-tasks` の current / baseline を記録                                  |
| 1-F    | N/A  | DevOps / product release 系の更新対象はこの task scope 外                                                           |
| 1-G    | PASS | `quick_validate.js` / `validate_all.js` / parity / schema validation を実行した                                     |
| Step 2 | N/A  | product API / IPC / preload 契約変更はなく、更新対象は skill / template / documentation contract のみ               |

## 検証ログ

| コマンド                                                    | 結果                                                                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify-all-specs`                                          | PASS, `13/13`, `error=0`, `warning=0`                                                                                                                                   |
| `validate-phase-output`                                     | PASS, `28項目`, `error=0`, `warning=0`                                                                                                                                  |
| `validate-phase12-implementation-guide`                     | PASS, `10/10`                                                                                                                                                           |
| `verify-unassigned-links`                                   | PASS, `scannedSources=17`, `total=222`, `missing=0`                                                                                                                     |
| `audit-unassigned-tasks --diff-from HEAD --target-file ...` | PASS, `currentViolations=0 / baselineViolations=134 / currentFiles=1`                                                                                                   |
| `audit-unassigned-tasks --diff-from HEAD`                   | PASS, `currentViolations=0 / baselineViolations=134 / currentFiles=0`                                                                                                   |
| `audit-unassigned-tasks --json`                             | baseline 参考値, `format=91 / naming=5 / misplaced=38 / baselineViolations=134`                                                                                         |
| `quick_validate.js`                                         | `aiworkflow-requirements: 12 pass / 0 error / 315 warning`, `task-specification-creator: 18 pass / 0 error / 0 warning`, `skill-creator: 45 pass / 0 error / 0 warning` |
| `validate_all.js`                                           | `aiworkflow-requirements: 0 error / 1 warning`, `task-specification-creator: 0 error / 0 warning`, `skill-creator: 0 error / 26 warning`                                |
| `validate-schema.js`                                        | `aiworkflow workflow: PASS`, `task-spec workflow: PASS`                                                                                                                 |
| `diff -qr`                                                  | `aiworkflow / task-spec / skill-creator` すべて差分 0                                                                                                                   |
| `wc -l indexes/topic-map.md`                                | `3520`                                                                                                                                                                  |

## 未タスク配置監査サマリー

- 今回タスク由来の新規未タスク: `1件`
- 配置先: `docs/30-workflows/unassigned-task/`
- 個別監査: `currentViolations=0 / baselineViolations=134`
- workflow差分監査: `currentViolations=0 / baselineViolations=134`
- repo全体 baseline: `format=91 / naming=5 / misplaced=38 / baselineViolations=134`
- 既存 remediation task:
  - `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`
  - `docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`
  - `docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md`

## 結論

- Phase 12 はタスク仕様書どおりに実行されている
- root evidence、system spec、未タスク、skill 改善、mirror parity、validator 結果は整合している
- 残ブロッカーは generated `topic-map.md` の `3520` 行だけで、active unassigned task へ切り出し済み
