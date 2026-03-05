# Phase 2: 設計

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 2                                          |
| Phase名   | 設計                                       |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 1                                    |
| 後続Phase | Phase 3                                    |

## 目的

監査マトリクス、証跡収集フロー、SubAgent分業フローを設計し、Phase 5で迷わず監査を実行できる状態を作る。

## 実行タスク

- マトリクス設計: `反映元セクション -> 反映先仕様 -> 証跡 -> 判定` の列構成を設計する。
- 監査フロー設計: 直列ステップと並列ステップを工程表へ落とし込む。
- 証跡設計: 参照リンク、行位置、監査時刻、担当SubAgentを記録する規約を定義する。
- 例外設計: 対象外判定を出す条件と再判定条件を明文化する。

## 参照資料

| 参照資料             | パス                                                                                                                                 | 内容                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Phase 1 要件定義書   | `outputs/phase-1/requirements-definition.md`                                                                                         | 監査項目定義         |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                                                                             | 判定基準             |
| Phase 1 スコープ定義 | `outputs/phase-1/scope-definition.md`                                                                                                | 対象範囲             |
| 監査対象画面仕様     | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-057-ui-02-global-nav-core.md`        | 後続画面の反映確認先 |
| 監査対象画面仕様     | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058d-ui-07-dashboard-enhancement.md` | 後続画面の反映確認先 |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                            | このPhaseでの適用観点           |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| 機能別UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 画面横断反映の確認軸            |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | 状態責務分離と P31 再発防止観点 |
| タスクワークフロー     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 監査フロー記録形式              |
| 教訓集                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 監査漏れ再発防止                |
| 仕様ガイドライン       | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`          | 記述様式統一                    |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | 判定不能時の処理                |

## 統合テスト連携

| 連携観点         | 実施内容                                                                    | 出力先                                   |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| 監査マトリクスIF | 列定義（反映元/反映先/証跡/判定/修正案）を固定し、Phase 4以降で再利用する。 | `outputs/phase-2/audit-matrix-design.md` |
| 証跡フォーマット | 参照リンク、行位置、監査時刻、担当SubAgentを必須項目として定義する。        | `outputs/phase-2/evidence-plan.md`       |
| SubAgent責務分離 | 仕様書単位で関心ごとを分割し、並列監査→直列統合の手順を固定する。           | `outputs/phase-2/subagent-plan.md`       |

## 実行順序（直列/並列）

| 作業                 | 実行方式 | 理由                                         |
| -------------------- | -------- | -------------------------------------------- |
| マトリクス列設計     | 直列     | 全員が同じ記録形式を使うため                 |
| 反映先カテゴリ別設計 | 並列     | 分割仕様群と画面仕様群は独立に設計できるため |
| 例外処理設計の統合   | 直列     | 判定ロジックを一本化するため                 |

## SubAgent Team分担

| SubAgent                 | 関心ごと           | 担当成果物                               |
| ------------------------ | ------------------ | ---------------------------------------- |
| SubAgent-DESIGN-MATRIX   | 監査マトリクス設計 | `outputs/phase-2/audit-matrix-design.md` |
| SubAgent-DESIGN-EVIDENCE | 証跡取得設計       | `outputs/phase-2/evidence-plan.md`       |
| SubAgent-DESIGN-TEAM     | 分業フロー設計     | `outputs/phase-2/subagent-plan.md`       |

## 成果物

| 成果物             | パス                                     | 内容                |
| ------------------ | ---------------------------------------- | ------------------- |
| 監査マトリクス設計 | `outputs/phase-2/audit-matrix-design.md` | 列定義と判定ルール  |
| 証跡取得計画       | `outputs/phase-2/evidence-plan.md`       | 証跡形式と取得手順  |
| SubAgent計画       | `outputs/phase-2/subagent-plan.md`       | 直列/並列の責務分担 |

## 完了条件

- [x] マトリクス列定義が固定されている。
- [x] 証跡取得手順が手順番号付きで定義されている。
- [x] 判定不能時の処理が明記されている。
- [x] SubAgent分担が重複なく定義されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. Phase 1 成果物を入力として設計する。
2. 分割仕様と画面仕様を別SubAgentで設計する。
3. 統合時に判定基準を再確認する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 3 のレビュー観点を明記した。

## 依存関係

- 前提: Phase 1
- 後続: Phase 3

## 次のPhase

- Phase 3: 設計レビューゲート
