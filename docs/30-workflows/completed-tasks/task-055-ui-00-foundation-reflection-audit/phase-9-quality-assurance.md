# Phase 9: 品質保証

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 9                                          |
| Phase名   | 品質保証                                   |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 8                                    |
| 後続Phase | Phase 10                                   |

## 目的

監査成果物の再現性、完全性、説明責務を検証し、Phase 10 の最終レビューに提出できる品質へ到達させる。

## 実行タスク

- 品質検証: 監査マトリクス、指摘ログ、回帰記録の完全性を検証する。
- リスク評価: 判定漏れ、証跡欠落、参照切れのリスクを評価する。
- 是正計画: 高リスク項目の是正手順と担当を定義する。

## 参照資料

| 参照資料               | パス                                                                        | 内容           |
| ---------------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5 監査マトリクス | `outputs/phase-5/reflection-matrix.md`                                      | 品質検証入力   |
| Phase 8 リファクタ計画 | `outputs/phase-8/matrix-refactor-plan.md`                                   | 品質検証入力   |
| Phase 8 リファクタ結果 | `outputs/phase-8/matrix-refactor-result.md`                                 | 品質検証入力   |
| Phase 8 回帰検証記録   | `outputs/phase-8/regression-validation.md`                                  | 品質検証入力   |
| 品質基準               | `.claude/skills/task-specification-creator/references/quality-standards.md` | 判定基準       |
| セクションリンクマップ | `outputs/phase-5/section-link-map.md`                                       | Phase 5 成果物 |
| 指摘ログ               | `outputs/phase-5/finding-log.md`                                            | Phase 5 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                        | このPhaseでの適用観点 |
| ------------------ | --------------------------------------------------------------------------- | --------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準              |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 判定不備対応          |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 既知リスク照合        |

## 統合テスト連携

| 連携観点   | 実施内容                                           | 出力先                                |
| ---------- | -------------------------------------------------- | ------------------------------------- |
| 品質監査   | マトリクス、指摘ログ、回帰記録の完全性を監査する。 | `outputs/phase-9/qa-report.md`        |
| リスク評価 | 判定漏れ、証跡欠落、参照切れの優先度を定義する。   | `outputs/phase-9/qa-risk-register.md` |
| 是正計画   | 高優先度課題の是正手順と担当を確定する。           | `outputs/phase-9/qa-checklist.md`     |

## 実行順序（直列/並列）

| 作業           | 実行方式 | 理由                           |
| -------------- | -------- | ------------------------------ |
| 品質基準確認   | 直列     | 判定軸を固定するため           |
| 成果物品質監査 | 並列     | 文書ごとの監査は独立できるため |
| リスク統合     | 直列     | 優先度を統一するため           |

## SubAgent Team分担

| SubAgent           | 関心ごと   | 担当成果物                            |
| ------------------ | ---------- | ------------------------------------- |
| SubAgent-QA-CHECK  | 品質監査   | `outputs/phase-9/qa-report.md`        |
| SubAgent-QA-RISK   | リスク評価 | `outputs/phase-9/qa-risk-register.md` |
| SubAgent-QA-ACTION | 是正計画   | `outputs/phase-9/qa-checklist.md`     |

## 成果物

| 成果物           | パス                                  | 内容         |
| ---------------- | ------------------------------------- | ------------ |
| QAレポート       | `outputs/phase-9/qa-report.md`        | 監査品質判定 |
| リスク台帳       | `outputs/phase-9/qa-risk-register.md` | リスク一覧   |
| QAチェックリスト | `outputs/phase-9/qa-checklist.md`     | 是正項目     |

## 完了条件

- [x] 品質基準に対する判定が記録されている。
- [x] リスクが優先度付きで記録されている。
- [x] 是正アクションが担当付きで記録されている。
- [x] Phase 10 提出資料が確定している。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 品質基準を再確認する。
2. SubAgentごとに品質監査を実行する。
3. リスク優先度を統合して確定する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 10 レビュー資料を確定した。

## 依存関係

- 前提: Phase 8
- 後続: Phase 10
- 参照依存: Phase 5 / 8

## 次のPhase

- Phase 10: 最終レビューゲート
