# aiworkflow-requirements generate-index.js 手動キーワード保全 - タスク指示書

## メタ情報

```yaml
issue_number: null
task_id: UNASSIGNED-AIWR-GENERATE-INDEX-PRESERVE-MANUAL-KEYWORDS-001
task_name: aiworkflow-requirements/scripts/generate-index.js の手動追加キーワード保全
category: 改善
target_feature: .claude/skills/aiworkflow-requirements/scripts/generate-index.js
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE / Phase 3 検証
created_date: 2026-04-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-aiwr-generate-index-preserve-manual-keywords-001.md
```

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UNASSIGNED-AIWR-GENERATE-INDEX-PRESERVE-MANUAL-KEYWORDS-001        |
| タスク名     | generate-index.js の手動追加キーワード保全                         |
| 分類         | 改善                                                               |
| 対象機能     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` |
| 優先度       | 中                                                                 |
| 見積もり規模 | 小規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 skill反映wave / Phase 3 検証         |
| 発見日       | 2026-04-19                                                         |

## 背景・問題

`generate-index.js` は references/ の本文から自動抽出したキーワードのみを `indexes/keywords.json` に出力する。PROPOSAL-AWR-02 対応で手動追加した13キーワード（`EVALS.json`, `currentLevel`, `current_level`, `levelHistory`, `levels`, `phaseMetrics`, `validator-zero`, `schema-change-guide`, `consumer-audit`, `dual-root-parity`, `evals-field-map` 等）は、本文中に十分な頻度で出現しないため再生成時に**無音で消える**。

実際に本タスクで再実行した結果、3,194 → 3,183 と11キーワードが失われ、`.agents/` 側のコピーから手動復元した。同じ事故が将来誰でも再発可能。

## 受入基準

- AC-1: `generate-index.js` に `--preserve` モード（既定ON）を追加し、既存 `keywords.json` の中で自動抽出では得られないキーワード（`_manual: true` フラグ付き or 別テーブル `manualKeywords`）を merge して出力する
- AC-2: `indexes/keywords.json` のスキーマに `manualKeywords` セクション（13エントリ）を追加し、再生成しても保持する
- AC-3: `validate-structure.js` が `manualKeywords` の存在を必須チェックする
- AC-4: `.claude/` と `.agents/` 両方で generate-index.js 再実行後に bit-for-bit parity が維持される
- AC-5: 手動キーワードは最低でも以下13件を含む: EVALS, EVALS.json, currentLevel, current_level, qualityInsights, levelHistory, levels, phaseMetrics, validator-zero, schema-change-guide, consumer-audit, dual-root-parity, evals-field-map

## 参照

- 発生経緯: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/` 反映wave再検証で発覚
- 関連: `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`（正本）
- 先行タスク: PROPOSAL-AWR-02 本体は完了、本タスクはその保全強化
