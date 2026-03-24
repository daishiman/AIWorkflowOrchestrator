# スキルフィードバックレポート

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| Phase    | 12                                              |
| 作成日   | 2026-03-23                                      |

## 対象スキル

- task-specification-creator
- aiworkflow-requirements

## 改善提案

### 1. 設計タスク（type: design）向けテンプレート分岐

**現状**: Phase 4-9 のテンプレートは implementation（コード実装）前提で書かれており、設計タスクでは「テスト作成」「実装」「テスト拡充」「カバレッジ確認」が planning document の作成に読み替えられる。この読み替えが暗黙的であり、実行者が混乱する可能性がある。

**提案**: `type: design` の場合、Phase 4-9 のテンプレートを「設計検証計画」「設計文書作成」「設計拡充」「カバレッジ（設計網羅性）確認」「設計整理」「設計品質検証」に自動変換する分岐を追加する。

### 2. 参照テーブルの DRY 原則強化

**現状**: 各 Phase の参照資料テーブルに共通参照が重複していた（最大19行 × 13ファイル = 247行の冗長）。

**提案**: テンプレート生成時に共通参照を index.md に集約し、各 Phase には `index.md#参照ファイル` へのポインタのみ記載するパターンをデフォルトにする。

### 3. Phase 12 Task 5（skill-feedback-report）の必須化

**現状**: Phase 12 のテンプレートに skill-feedback-report が含まれていない場合がある。

**提案**: Phase 12 のタスクリストに skill-feedback-report を必須項目として含め、artifacts.json 生成時にも自動追加する。

## 教訓

| ID  | 教訓                                                                                             |
| --- | ------------------------------------------------------------------------------------------------ |
| L-1 | 設計タスクの Phase 4-9 は「実装」ではなく「設計文書作成」として読み替える必要がある              |
| L-2 | 共通参照テーブルの重複は Progressive Disclosure 原則に反し、保守コストを増大させる               |
| L-3 | ステータスフィールドの不整合（not_started vs completed）は artifacts.json との同期不備で発生する |

## 未タスク化状況

| 改善提案 | 未タスクID                               | 指示書パス                                                                      |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| 提案1    | UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001   | `docs/30-workflows/unassigned-task/UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001.md`   |
| 提案2    | UT-TASKSPEC-DRY-REFERENCE-TABLE-001      | `docs/30-workflows/unassigned-task/UT-TASKSPEC-DRY-REFERENCE-TABLE-001.md`      |
| 提案3    | UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001 | `docs/30-workflows/unassigned-task/UT-TASKSPEC-SKILL-FEEDBACK-MANDATORY-001.md` |
