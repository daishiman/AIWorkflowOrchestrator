# Skill Feedback Report

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 12                                    |
| 機能名   | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日   | 2026-03-31                            |
| タスクID | TASK-UIUX-FEEDBACK-001                |

## 主要フィードバック

### 1. path drift guard が必要

workflow 文書は `scripts/ui-ux-eval/*` を参照していたが、branch 上の実体は `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux*` に存在していた。
literal path がずれると、実装があっても close-out 文書が stale guidance になる。

### 2. spec_created と completed の混同を禁止する

`artifacts.json` と close-out 文書が Phase 4-12 を completed 相当で扱うと、placeholder evidence を完了証跡と誤認する。
`spec_created` workflow は「Phase 1-3 完了、4-12 pending、13 blocked」を current facts として固定する必要がある。

### 3. mirror sync は same-wave で閉じる

`.claude` に新規 agent / script / test を追加した turn では、`.agents` を PR 前提に後回ししない。
branch レビュー時点で stale mirror を残さないことが重要。

## 改善提案

| 提案                  | 内容                                                                         | 優先度 |
| --------------------- | ---------------------------------------------------------------------------- | ------ |
| literal path 監査     | Phase 12 で実在パスと文書中パスを grep 照合する                              | 中     |
| spec_created 台帳監査 | `artifacts.json` の top-level status/currentPhase を index.md と機械照合する | 高     |
| mirror parity         | canonical 更新後の `.agents` 差分確認を same-wave 完了条件へ昇格する         | 高     |
