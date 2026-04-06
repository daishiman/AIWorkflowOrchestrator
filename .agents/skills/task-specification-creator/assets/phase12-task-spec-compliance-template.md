# Phase 12 タスク仕様準拠チェック テンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 12 再監査時
> - 読み込み条件: Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の準拠状況を root evidence 1ファイルへ集約したいとき
> - 推奨配置先: `outputs/phase-12/phase12-task-spec-compliance-check.md`

このテンプレートは、Phase 12 がタスク仕様書どおりに実行されたかを
「成果物の存在」だけで終わらせず、
implementation guide 品質、未タスク配置、system spec 同期、検証値の同値転記まで
1ファイルで確認するための補助成果物テンプレートである。

```markdown
# Phase 12 タスク仕様準拠チェック

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | {{TASK_ID}} |
| タスク名 | {{TASK_NAME}} |
| workflow | {{WORKFLOW_PATH}} |
| 実施日 | {{DATE}} |
| 判定 | {{PASS/FAIL}} |
| 対象未タスク | {{UNASSIGNED_PATH or なし}} |

## SubAgent分担

| SubAgent | 関心ごと | 主担当 | 完了条件 |
| --- | --- | --- | --- |
| A | workflow 状態 | `phase-12-documentation.md` と `outputs/phase-12` 実体突合 | Task 12-1〜12-5 / 進捗100% / `task-workflow-completed.md` / `task-workflow-backlog.md` / completed が一致 |
| B | implementation guide 品質 | Part 1 / Part 2 の必須要素確認 | `たとえば`、型、API/CLI、エッジケース、設定が揃う |
| C | 未タスク整合 | 配置先、10見出し、監査値の確認 | `docs/30-workflows/unassigned-task/` + `currentViolations=0` |
| D | system spec 同期 | task-workflow / lessons / logs への転記 | 実装内容・苦戦箇所・5分解決カードが同期 |
| E | validator 実行 | verify / validate / mirror parity | 検証値が outputs と system spec で一致 |

## 4点突合

### 1. `phase-12-documentation.md` と outputs 実体

- [ ] `phase-12-documentation.md` の `ステータス` が `completed`
- [ ] Task 12-1〜12-5 がすべて `[x]`
- [ ] `Task 100% 実行確認` が `[x]`
- [ ] `outputs/phase-12/` に最低5成果物が存在
- [ ] `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` が実体化

### 2. implementation-guide.md

- [ ] `## Part 1` がある
- [ ] `## Part 2` がある
- [ ] 理由先行（`なぜ` / `必要`）になっている
- [ ] 日常例えがあり、`たとえば` を含む
- [ ] `type` または `interface` を含む TypeScript ブロックがある
- [ ] API/CLI シグネチャがある
- [ ] 使用例がある
- [ ] エラーハンドリング説明がある
- [ ] エッジケース説明がある
- [ ] 設定項目または定数一覧がある

### 3. 未タスク配置監査

- [ ] 新規未タスクがある場合、`docs/30-workflows/unassigned-task/` 配下に物理ファイルがある
- [ ] 未タスク指示書が `## メタ情報 + ## 1..9` の10見出しを持つ
- [ ] `verify-unassigned-links` が `missing=0`
- [ ] `audit --json --diff-from HEAD --target-file <unassigned-file>` が `currentViolations=0`
- [ ] `audit --json --diff-from HEAD` が `currentViolations=0`
- [ ] repo 全体 `audit --json` は baseline 参考値として分離記録されている
- [ ] `baselineViolations>0` の場合、既存 remediation task 参照が `unassigned-task-detection.md` にある

### 4. system spec / outputs 同期

- [ ] `task-workflow-completed.md` / `task-workflow-backlog.md` に Phase 12 close-out と `spec_created` 状態が記録されている
- [ ] `task-workflow-completed.md` / `task-workflow-backlog.md` の ledger parity が root evidence から直接検証できる
- [ ] `task-workflow.md` に実装内容・苦戦箇所・検証証跡・5分解決カードがある
- [ ] `lessons-learned.md` に再発条件付き苦戦箇所と簡潔解決手順がある
- [ ] `system-spec-update-summary.md` / `phase12-task-spec-compliance-check.md` / `unassigned-task-detection.md` の値が一致している
- [ ] `manual-test-checklist.md` に TC-ID / evidence / 判定 の対応がある
- [ ] スキル改善を行った場合、対象 skill の `SKILL.md` / `LOGS.md` に履歴がある
- [ ] UI task では `phase-11-manual-test.md` の screen coverage 要件が満たされている

## Task 12-1〜12-5 準拠確認

| Task | 判定 | 根拠 | 証跡 |
| --- | --- | --- | --- |
| 12-1 実装ガイド | {{PASS/FAIL}} | Part 1 / Part 2、例え話、型/API/edge case、設定項目を確認 | `outputs/phase-12/implementation-guide.md` |
| 12-2 システム仕様更新 | {{PASS/FAIL}} | Step 1-A〜1-G / Step 2、実装内容、苦戦箇所、5分解決カードが記録済み | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 更新履歴 | {{PASS/FAIL}} | 更新ファイル、更新なし判定、台帳同期、validator 再実行を記録 | `outputs/phase-12/documentation-changelog.md` |
| 12-4 未タスク検出 | {{PASS/FAIL}} | current/baseline 分離、配置監査、既存 remediation task 参照を記録 | `outputs/phase-12/unassigned-task-detection.md` |
| 12-5 フィードバック | {{PASS/FAIL}} | 改善した skill / template / script の差分と理由を記録 | `outputs/phase-12/skill-feedback-report.md` |

## Step 1-A〜1-G / Step 2 準拠確認

| Step | 判定 | 根拠 |
| --- | --- | --- |
| 1-A | {{PASS/FAIL}} | 仕様書、LOGS、必要な skill 更新を同一ターンで反映 |
| 1-B | {{PASS/FAIL}} | `completed` / `spec_created` の判断結果を記録 |
| 1-C | {{PASS/FAIL}} | 参照grep と関連台帳の再同期結果を記録 |
| 1-D | {{PASS/FAIL}} | index 再生成または不要理由を記録 |
| 1-E | {{PASS/FAIL}} | `verify-unassigned-links` / `audit-unassigned-tasks` を記録 |
| 1-F | {{PASS/N/A}} | DevOps 更新または N/A 理由を記録 |
| 1-G | {{PASS/FAIL}} | `quick_validate.js` / `validate_all.js` / parity を記録 |
| Step 2 | {{PASS/N/A}} | I/F 変更ありなら反映、なしなら N/A 理由を明記 |

## Ledger Parity

| 対象 | 判定 | 根拠 |
| --- | --- | --- |
| `task-workflow-completed.md` / `task-workflow-backlog.md` | {{PASS/FAIL}} | completed / backlog の ledger を root evidence から直接照合 |

## 検証ログ

| コマンド | 結果 |
| --- | --- |
| `verify-all-specs` | {{RESULT}} |
| `validate-phase-output` | {{RESULT}} |
| `validate-phase12-implementation-guide` | {{RESULT}} |
| `verify-unassigned-links` | {{RESULT}} |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` | {{RESULT}} |
| `audit-unassigned-tasks --json --diff-from HEAD` | {{RESULT}} |
| `audit-unassigned-tasks --json` | {{RESULT}} |
| `quick_validate.js` / `validate_all.js` / `diff -qr` | {{RESULT}} |

## 未タスク配置監査サマリー

- 今回タスク由来の新規未タスク: {{0件 / N件}}
- 配置先: `docs/30-workflows/unassigned-task/`
- 個別監査: {{currentViolations / baselineViolations}}
- workflow差分監査: {{currentViolations / baselineViolations}}
- repo全体 baseline: {{baselineViolations}}
- 既存 remediation task: {{なし / docs/30-workflows/unassigned-task/...}}

## 結論

- {{総合結論}}
```
