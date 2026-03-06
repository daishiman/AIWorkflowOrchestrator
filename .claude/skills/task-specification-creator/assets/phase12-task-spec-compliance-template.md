# Phase 12 タスク仕様準拠チェック テンプレート

> **Progressive Disclosure**
> - 読み込みタイミング: Phase 12 再監査時
> - 読み込み条件: Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の準拠状況を 1 ファイルへ集約したいとき
> - 推奨配置先: `outputs/phase-12/phase12-task-spec-compliance-check.md`

このテンプレートは、Phase 12 がタスク仕様書どおりに実行されたかを
1ファイルで確認するための補助成果物テンプレートである。

```markdown
# Phase 12 タスク仕様準拠チェック

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | {{TASK_ID}} |
| タスク名 | {{TASK_NAME}} |
| 実施日 | {{DATE}} |
| 判定 | {{PASS/FAIL}} |

## Task 12-1〜12-5 準拠確認

| Task | 判定 | 根拠 | 証跡 |
| --- | --- | --- | --- |
| 12-1 実装ガイド | PASS | Part 1 / Part 2 構成、例え話、型/API/edge case を確認 | `outputs/phase-12/implementation-guide.md` |
| 12-2 システム仕様更新 | PASS | Step 1-A〜1-G / Step 2 の結果が記録されている | `outputs/phase-12/spec-update-summary.md` |
| 12-3 更新履歴 | PASS | 更新ファイル、更新なし判定、台帳同期が記録されている | `outputs/phase-12/documentation-changelog.md` |
| 12-4 未タスク検出 | PASS | 0件でもレポート出力、配置監査結果を記録 | `outputs/phase-12/unassigned-task-detection.md` |
| 12-5 フィードバック | PASS | 改善不要時もレポート出力 | `outputs/phase-12/skill-feedback-report.md` |

## Step 1-A〜1-G / Step 2 準拠確認

| Step | 判定 | 根拠 |
| --- | --- | --- |
| 1-A | PASS | 仕様書、LOGS、SKILL、必要なら skill 更新を同一ターンで反映 |
| 1-B | PASS | `completed` / `spec_created` の判断結果を記録 |
| 1-C | PASS | `grep` と関連台帳の再同期結果を記録 |
| 1-D | PASS | index 再生成または不要理由を記録 |
| 1-E | PASS | `verify-unassigned-links` / `audit-unassigned-tasks` を記録 |
| 1-F | PASS/N/A | DevOps 更新または N/A 理由を記録 |
| 1-G | PASS | `quick_validate.js` 3件と warning 分類を記録 |
| Step 2 | PASS/N/A | I/F 変更ありなら更新、なしなら N/A 理由を記録 |

## 検証ログ

| コマンド | 結果 |
| --- | --- |
| `verify-all-specs` | {{RESULT}} |
| `validate-phase-output` | {{RESULT}} |
| `verify-unassigned-links` | {{RESULT}} |
| `audit-unassigned-tasks --diff-from HEAD` | {{RESULT}} |
| `quick_validate.js` 3件 | {{RESULT}} |

## 未タスク配置監査

- 新規未タスク: {{0件 / N件}}
- 配置先: `docs/30-workflows/unassigned-task/`
- 判定根拠: {{currentViolations=0 など}}

## 結論

- {{総合結論}}
```
