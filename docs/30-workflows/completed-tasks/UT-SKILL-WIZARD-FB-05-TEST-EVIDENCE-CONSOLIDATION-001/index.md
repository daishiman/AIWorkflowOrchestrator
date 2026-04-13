# UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001: Phase 11 テスト証跡の一本化テンプレート整備（edge case一覧表）

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                           |
| タスク名     | Phase 11 テスト証跡の一本化テンプレート整備（edge case一覧表）                  |
| 優先度       | 低                                                                              |
| 規模         | 小                                                                              |
| タイプ       | 改善（docs-only task）                                                          |
| 検出元       | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 12 フィードバック（FB-05） |
| GitHub Issue | #2033（CLOSED）                                                                 |
| 作成日       | 2026-04-13                                                                      |
| ステータス   | spec_created                                                                    |

## プロジェクト概要

| 項目           | 内容                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| プロジェクトID | `ut-skill-wizard-fb-05-test-evidence`                                                                                             |
| 最上位目的     | Phase 11 manual-test-result.md テンプレートにedge case一覧表を標準化し、テスト証跡を一本化する                                    |
| 背景           | テスト件数・edge case判断が複数ファイルに分散し、Phase 12レビュー時に全体像把握が困難だった                                       |
| 期待される成果 | Phase 11テンプレートの標準化・テスト証跡の一本化・仕様判断根拠の明示                                                              |
| 成功基準       | task-specification-creator スキルのPhase 11テンプレートにedge case一覧表・テスト件数集約・仕様判断根拠が含まれること              |
| スコープ       | 含む: Phase 11テンプレート更新、task-specification-creator skill更新 / 含まない: コード実装、コミット、PR作成（ユーザー指示なし） |

## 問題の背景

UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 の Phase 12 フィードバック（FB-05）として検出された課題。

| 問題番号 | 問題内容                                                            | 影響                                                        |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| FB-05-1  | テスト件数・edge case判断が複数ファイルに分散している               | Phase 12レビュー時に全体像の把握が困難                      |
| FB-05-2  | Phase 11 manual-test-result.md にedge case一覧表が存在しない        | テスト観点の網羅性確認ができない                            |
| FB-05-3  | 仕様判断（空白→空文字扱い等）の根拠が証跡ファイルに明示されていない | 同じ判断を実装・テスト・ドキュメントで3回記録する羽目になる |
| FB-05-4  | テスト件数と内訳が1箇所に集約されるテンプレートが存在しない         | レビュー確認時間の長期化                                    |

## 受け入れ基準（AC一覧）

| ID   | 基準内容                                                                          | 検証方法                       |
| ---- | --------------------------------------------------------------------------------- | ------------------------------ |
| AC-1 | Phase 11 manual-test-result.md テンプレートに「edge case 一覧表」が含まれている   | テンプレートファイルの目視確認 |
| AC-2 | 「テスト件数と内訳」が1箇所に集約されるテンプレートが整備されている               | テンプレートファイルの目視確認 |
| AC-3 | 仕様判断（空白→空文字扱い等）の根拠が証跡ファイルに明示される構造が含まれている   | テンプレートファイルの目視確認 |
| AC-4 | task-specification-creator スキルのPhase 11テンプレートにこの構造が反映されている | skillファイルの確認            |
| AC-5 | 既存のPhase 11実例と新テンプレートの互換性が確認されている                        | 差分比較・レビュー             |

## オーケストレーション

| Agent   | 役割                         | 並列可否            | 主な入力                                     | 主な出力                             |
| ------- | ---------------------------- | ------------------- | -------------------------------------------- | ------------------------------------ |
| Agent 1 | 要件・設計分析エージェント   | -                   | GitHub Issue #2033、既存Phase 11テンプレート | 要件定義書・設計書                   |
| Agent 2 | テンプレート設計エージェント | 可（Agent 1完了後） | 設計書、edge case一覧表フォーマット案        | Phase 11テンプレート更新案           |
| Agent 3 | skill更新エージェント        | 可（Agent 2と並列） | テンプレート更新案、既存skillテンプレート    | task-specification-creator skill更新 |

### 並列実行原則

- Phase 1-3 は Agent 1 が直列で実行する
- Phase 4-7 の一部はファイル別に並列実行可能
- Phase 12 の implementation-guide Part 1/2 は並列作成可能

## Phaseリスト

| Phase | 名前             | 概要                                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | 問題分析・スコープ確定・受け入れ基準定義                                   | completed  |
| 2     | 設計             | edge case一覧表フォーマット設計・テンプレート構造設計                      | completed  |
| 3     | 設計レビュー     | 設計の矛盾・漏れチェック・Phase 4進行判定                                  | completed  |
| 4     | テスト作成       | テンプレートの検証基準・expected structure定義                             | completed  |
| 5     | 実装             | Phase 11テンプレート更新・task-specification-creator skill更新             | completed  |
| 6     | テスト拡充       | エッジケース・回帰確認（既存Phase 11実例との互換性）                       | completed  |
| 7     | カバレッジ確認   | テンプレート網羅性確認（AC-1〜5の全項目カバー）                            | completed  |
| 8     | リファクタリング | テンプレート構造の簡潔化・重複排除                                         | completed  |
| 9     | 品質保証         | テンプレートの品質基準確認・リンク・mirror parity確認                      | completed  |
| 10    | 最終レビュー     | AC-1〜5全件確認・blocker判定                                               | completed  |
| 11    | 手動テスト       | 新テンプレートを用いたPhase 11証跡の試作確認（Semantic評価）               | completed  |
| 12    | ドキュメント更新 | 実装ガイド作成（Part 1/2）・システム仕様更新・未タスク検出・フィードバック | completed  |
| 13    | PR作成           | ユーザー明示承認後のみ実施                                                 | blocked    |

## 苦戦箇所記録

purpose空白ケースの扱いについて、実装・テスト・ドキュメントで3回同じ判断を記録していたが、最後の証跡確認時まで全体像が把握しにくかった。証跡の一本化が早い段階でできていれば、Phase 12のレビューで確認時間が大幅に短縮できた。

## 参照

| ドキュメント                        | パス                                                                                         | 用途                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| task-specification-creator SKILL.md | `.claude/skills/task-specification-creator/SKILL.md`                                         | Phase 11テンプレート参照     |
| Phase 11テンプレート参照            | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`             | 現行Phase 11テンプレート     |
| Phase 11詳細ガイド                  | `.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md`      | Phase 11詳細フォーマット     |
| Phase 11ガイド                      | `.claude/skills/task-specification-creator/references/phase-11-guide.md`                     | Phase 11実行ガイド           |
| Phase 11テストレポートテンプレート  | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`      | テスト証跡テンプレート現行版 |
| unassigned-task元ファイル           | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001.md` | Issue #2033 元仕様書         |
| aiworkflow-requirements SKILL.md    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                            | システム仕様整合確認         |
