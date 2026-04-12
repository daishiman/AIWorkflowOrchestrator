# UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001

## メタ情報

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001                              |
| タスク名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化                   |
| タスク種別   | docs-only（仕様書テンプレート更新 + テストケース追加）                             |
| 検出元       | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 4〜11 フィードバック（FB-03） |
| GitHub Issue | #2032（CLOSED）                                                                    |
| 優先度       | medium                                                                             |
| 規模         | small                                                                              |
| 作成日       | 2026-04-11                                                                         |
| ステータス   | spec_created（Phase 1-12 complete / Phase 13 blocked）                             |

## 概要

purpose空でもcategoryが有効な場合のformat推論独立性が仕様書内で一度揺れた問題を解決する。
各フィールド（purpose / category / format 等）は**独立して**推論されるという原則を、
task-specification-creator スキルテンプレートのAC-4定義に明示し、フォールバック仕様書テンプレートにも
「フィールド間独立性」の記述を追加する。また、同様の仕様揺れを検出するテストケースを追加する。

## 問題の背景

`UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` のPhase 4〜11実行時に、
フックが自動的にテストの入力値を変更したため、「purposeが空でもformatが推論される」という
テストケースが一時的に作られた。元の仕様（purpose空→format null）との矛盾を手動で発見するまで
数回のテスト実行が必要だった（苦戦箇所）。

この揺れの根本原因は、フィールド間独立性（各フィールドは独立して推論される）がAC-4仕様に
明文化されていなかったことにある。

## 真の論点

- **主問題**: SmartDefault AC-4のフィールド独立推論性が仕様書に明記されていないため、
  実装者・テスト作成者が「purpose空→全推論不可」と誤解しやすい
- **why now**: FB-03フィードバックが発生し、同様の仕様揺れを他タスクでも繰り返すリスクがある
- **why this way**: テンプレートへの明示追加は最小変更で最大予防効果が得られる

## 完了条件

- [ ] 各フィールドの独立推論性が task-specification-creator スキルテンプレートのAC-4定義に明示されている
- [ ] フォールバック仕様書テンプレートに「フィールド間独立性」の記述が追加されている
- [ ] 同様の仕様揺れを検出するテストケース（purpose空でもcategory有効ケース）が追加されている

## Phaseリスト

| Phase | 名前             | 概要                                                               | タスク種別 |
| ----- | ---------------- | ------------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | スコープ確定・AC-4定義・フィールド独立性の明文化要件整理           | docs-only  |
| 2     | 設計             | 変更対象ファイル特定・フィールド独立性記述設計                     | docs-only  |
| 3     | 設計レビュー     | 設計の矛盾・漏れチェック・フェーズゲート判定                       | docs-only  |
| 4     | テスト作成       | 仕様揺れ検出テストケース定義（TDD Red段階）                        | docs-only  |
| 5     | 実装             | AC-4定義への明示・テンプレート記述追加                             | docs-only  |
| 6     | テスト拡充       | エッジケース・回帰テスト追加                                       | docs-only  |
| 7     | カバレッジ確認   | テストカバレッジ計測・未到達分析                                   | docs-only  |
| 8     | リファクタリング | 重複・ドリフト除去                                                 | docs-only  |
| 9     | 品質保証         | 静的解析・リスク評価・品質ゲート                                   | docs-only  |
| 10    | 最終レビュー     | Phase 1-9の成果物統合レビュー・承認判定                            | docs-only  |
| 11    | 手動テスト       | NON_VISUAL（docs-only）・手動テストチェックリスト / 結果記録       | NON_VISUAL |
| 12    | ドキュメント更新 | 実装ガイド・仕様書更新・未タスク検出・フィードバック・準拠チェック | docs-only  |
| 13    | PR作成           | ユーザー明示承認後のみ実施                                         | -          |

## 参照資料

| 資料名                           | パス                                                                                         | 用途                   |
| -------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| task-specification-creator SKILL | `.claude/skills/task-specification-creator/SKILL.md`                                         | AC-4定義の参照元       |
| aiworkflow-requirements SKILL    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                            | システム仕様確認       |
| 検出元タスク仕様書               | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001.md` | 原票                   |
| SmartDefault関連仕様             | `.claude/skills/aiworkflow-requirements/references/`                                         | フォールバック仕様参照 |
