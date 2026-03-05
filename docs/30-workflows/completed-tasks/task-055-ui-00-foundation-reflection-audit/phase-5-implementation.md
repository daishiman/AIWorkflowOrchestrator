# Phase 5: 実装

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 5                                          |
| Phase名   | 実装                                       |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 4                                    |
| 後続Phase | Phase 6                                    |

## 目的

設計済み監査フローに従って反映トレーサビリティ監査を実施し、監査マトリクスと課題一覧を作成する。

## 実行タスク

- 監査実行: 反映元セクションごとに反映先仕様を確認し判定を記録する。
- マトリクス作成: `反映元 -> 反映先 -> 証跡 -> 判定 -> 修正案` を記録する。
- 指摘記録: 反映漏れ、表記ずれ、リンク不整合を課題として記録する。
- 修正提案: 反映漏れがある場合の修正タスク案を記録する。

## 参照資料

| 参照資料                 | パス                                                                                                                                 | 内容         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Phase 4 監査テストケース | `outputs/phase-4/audit-test-cases.md`                                                                                                | 実行ケース   |
| Phase 4 Redチェック計画  | `outputs/phase-4/red-check-plan.md`                                                                                                  | 失敗条件     |
| Phase 4 検証コマンド表   | `outputs/phase-4/validation-command-sheet.md`                                                                                        | 実行コマンド |
| 監査対象画面仕様         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md` | 反映先確認   |
| 監査対象画面仕様         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-061-ui-09-onboarding-wizard.md`      | 反映先確認   |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                            | このPhaseでの適用観点 |
| -------------------- | ------------------------------------------------------------------------------- | --------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | 実体との整合確認      |
| 機能別UI仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 反映先責務確認        |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`       | 層別責務の確認        |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 監査品質の判定        |

## 統合テスト連携

| 連携観点       | 実施内容                                                | 出力先                                 |
| -------------- | ------------------------------------------------------- | -------------------------------------- |
| ケース実行ログ | Phase 4 のケースID順に判定結果を記録する。              | `outputs/phase-5/reflection-matrix.md` |
| 証跡リンク整合 | 反映元セクションと反映先仕様のリンク/行情報を記録する。 | `outputs/phase-5/section-link-map.md`  |
| 指摘連携       | 反映漏れと修正提案を課題IDで管理する。                  | `outputs/phase-5/finding-log.md`       |

## 実行順序（直列/並列）

| 作業           | 実行方式 | 理由                               |
| -------------- | -------- | ---------------------------------- |
| ケース起票     | 直列     | 実行対象を固定するため             |
| セクション監査 | 並列     | 各セクションは独立に監査できるため |
| 判定統合       | 直列     | 最終判定を一本化するため           |

## SubAgent Team分担

| SubAgent                | 関心ごと                                        | 担当成果物                             |
| ----------------------- | ----------------------------------------------- | -------------------------------------- |
| SubAgent-IMP-TOKENS     | `00-1-design-tokens.md` 監査                    | `outputs/phase-5/reflection-matrix.md` |
| SubAgent-IMP-ATOMS      | `00-2-atoms-components.md` 監査                 | `outputs/phase-5/reflection-matrix.md` |
| SubAgent-IMP-MOLECULES  | `task-053-ui-00-3-molecules-components.md` 監査 | `outputs/phase-5/reflection-matrix.md` |
| SubAgent-IMP-ORGANISMS  | `task-054-ui-00-4-organisms-components.md` 監査 | `outputs/phase-5/reflection-matrix.md` |
| SubAgent-IMP-SCREENS    | 後続画面仕様（`task-057`〜`task-061`）監査      | `outputs/phase-5/section-link-map.md`  |
| SubAgent-IMP-INTEGRATOR | 判定統合・指摘整理                              | `outputs/phase-5/finding-log.md`       |

## 仕様書別SubAgent分担（関心ごとの分離）

| 対象仕様書                                 | 専任SubAgent            | 実行方式 | 統合先                 |
| ------------------------------------------ | ----------------------- | -------- | ---------------------- |
| `00-1-design-tokens.md`                    | SubAgent-IMP-TOKENS     | 並列     | `reflection-matrix.md` |
| `00-2-atoms-components.md`                 | SubAgent-IMP-ATOMS      | 並列     | `reflection-matrix.md` |
| `task-053-ui-00-3-molecules-components.md` | SubAgent-IMP-MOLECULES  | 並列     | `reflection-matrix.md` |
| `task-054-ui-00-4-organisms-components.md` | SubAgent-IMP-ORGANISMS  | 並列     | `reflection-matrix.md` |
| `task-057`〜`task-061`                     | SubAgent-IMP-SCREENS    | 並列     | `section-link-map.md`  |
| 判定統合・課題化                           | SubAgent-IMP-INTEGRATOR | 直列     | `finding-log.md`       |

## 成果物

| 成果物                 | パス                                   | 内容               |
| ---------------------- | -------------------------------------- | ------------------ |
| 反映マトリクス         | `outputs/phase-5/reflection-matrix.md` | 反映状況一覧       |
| セクションリンクマップ | `outputs/phase-5/section-link-map.md`  | 元章と先章の対応   |
| 指摘ログ               | `outputs/phase-5/finding-log.md`       | 不整合一覧と対応案 |

## 完了条件

- [x] 全監査ケースの判定が記録されている。
- [x] 反映マトリクスに証跡列が記録されている。
- [x] 反映漏れ有無が結論として明記されている。
- [x] 修正提案が指摘ごとに記録されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. ケースID順で監査を実行する。
2. 仕様書ごとに専任SubAgentを割り当てて並列監査する。
3. 判定と修正案を統合SubAgentへ集約する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 6 拡充対象を確定した。

## 依存関係

- 前提: Phase 4
- 後続: Phase 6

## 次のPhase

- Phase 6: テスト拡充
