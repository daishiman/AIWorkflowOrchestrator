# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 1                                          |
| Phase名   | 要件定義                                   |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | なし                                       |
| 後続Phase | Phase 2                                    |

## 目的

`TASK-UI-00-DESIGN-FOUNDATION` の正本要件が分割仕様と後続画面仕様へ反映されているかを判定できる要件セットを確定する。

## 実行タスク

- 監査対象定義: `task-050` の Task 1〜6 と Task 5B/5C/5D を監査単位へ分解する。
- 判定基準定義: 「反映済み」「要追記」「対象外」の3状態と証跡要件を定義する。
- スコープ確定: 分割仕様（`00-1`〜`00-4`）と後続画面仕様（`task-057`〜`task-061`）を監査対象として固定する。
- 並列方針定義: セクション単位監査を並列、最終判定統合を直列で固定する。

## 参照資料

| 参照資料           | パス                                                                                                                                      | 内容               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| タスク原本         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-055-ui-00-foundation-reflection-audit.md` | 監査の初期要件     |
| デザイン基盤正本   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-050-ui-00-ui-design-foundation.md`                                 | 反映元仕様         |
| 分割仕様 Tokens    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md`                                                  | Task 1反映先       |
| 分割仕様 Atoms     | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md`                                               | Task 2/5反映先     |
| 分割仕様 Molecules | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md`                               | Task 2/3/4/5反映先 |
| 分割仕様 Organisms | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-054-ui-00-4-organisms-components.md`                               | Task 2/4/5反映先   |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                           | このPhaseでの適用観点 |
| -------------------- | ------------------------------------------------------------------------------ | --------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`        | Atomic Design責務境界 |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | HIG/WCAG判定軸        |
| デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | トークン反映要件      |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      | 分割単位の妥当性      |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 監査品質基準          |

## aiworkflow-requirements 抽出チェック（今回実装で必須）

| カテゴリ      | 参照仕様                        | 抽出目的                                       | 反映先Phase                        |
| ------------- | ------------------------------- | ---------------------------------------------- | ---------------------------------- |
| UI/UX         | `ui-ux-components.md`           | Atomic Design責務境界の確認                    | Phase 1 / 5 / 11 / 12              |
| UI/UX         | `ui-ux-design-principles.md`    | Apple HIG / WCAG / ARIA / キーボード要件の確認 | Phase 1 / 4 / 6                    |
| UI/UX         | `ui-ux-design-system.md`        | デザイントークン体系とブレークポイントの確認   | Phase 1                            |
| Architecture  | `arch-ui-components.md`         | UIコンポーネント構成パターンの確認             | Phase 1 / 5                        |
| Testing       | `testing-component-patterns.md` | 監査テストケース設計の形式統一                 | Phase 4                            |
| Testing       | `testing-accessibility.md`      | a11yテスト観点（role/aria/focus）の抽出        | Phase 4 / 6 / 11                   |
| State         | `arch-state-management.md`      | 状態責務分離と再発防止観点（P31）を抽出        | Phase 2 / 12                       |
| Quality       | `quality-requirements.md`       | テスト品質・監査品質の判定基準を抽出           | Phase 1 / 3 / 5 / 7 / 9 / 10       |
| Process       | `task-workflow.md`              | Phase進行と完了記録フォーマットを統一          | Phase 3 / 7 / 11 / 12 / 13         |
| Process       | `task-workflow-rules.md`        | ゲート判定と戻り条件を統一                     | Phase 3 / 10                       |
| Process       | `task-workflow-phases.md`       | Phase 11/12 の成果物粒度を統一                 | Phase 11 / 12                      |
| Documentation | `lessons-learned.md`            | 監査漏れの再発防止ナレッジを反映               | Phase 2 / 3 / 7 / 9 / 10 / 12 / 13 |
| Documentation | `spec-guidelines.md`            | 仕様書更新時の記述規約を統一                   | Phase 2 / 8 / 12                   |

## 統合テスト連携

| 連携観点               | 実施内容                                                                                   | 出力先                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| 反映元トレーサビリティ | `task-050` Task 1〜6 と Task 5B/5C/5D を監査IDへ正規化する。                               | `outputs/phase-1/requirements-definition.md` |
| 判定ルール整合         | 「反映済み / 要追記 / 対象外」の判定条件と証跡要件を固定する。                             | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ整合           | 分割仕様（`00-1`〜`00-4`）と後続画面仕様（`task-057`〜`task-061`）の対象外理由を明記する。 | `outputs/phase-1/scope-definition.md`        |

## 実行順序（直列/並列）

| 作業               | 実行方式 | 理由                              |
| ------------------ | -------- | --------------------------------- |
| 監査対象分解       | 直列     | 正本要件の理解を先に固定するため  |
| 分割仕様の反映確認 | 並列     | 00-1〜00-4 は独立に確認できるため |
| 判定基準の統合     | 直列     | 最終判定軸を一つに統一するため    |

## SubAgent Team分担

| SubAgent              | 関心ごと           | 担当成果物                                   |
| --------------------- | ------------------ | -------------------------------------------- |
| SubAgent-REQ-SOURCE   | 反映元要件整理     | `outputs/phase-1/requirements-definition.md` |
| SubAgent-REQ-TARGET   | 反映先スコープ整理 | `outputs/phase-1/scope-definition.md`        |
| SubAgent-REQ-CRITERIA | 判定基準策定       | `outputs/phase-1/acceptance-criteria.md`     |

## 成果物

| 成果物       | パス                                         | 内容               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 監査対象と監査観点 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 判定基準と証跡要件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象/非対象一覧    |

## 完了条件

- [x] 反映元セクションIDが定義されている。
- [x] 反映先ドキュメント一覧が固定されている。
- [x] 判定状態3種と証跡要件が定義されている。
- [x] 並列作業と直列作業が分離されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 参照資料を読み、監査対象IDを採番する。
2. SubAgentごとに成果物担当を固定する。
3. 成果物パスを `outputs/phase-1/` に統一する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 2 へ引き継ぐ入力を明記した。

## 依存関係

- 前提: なし
- 後続: Phase 2

## 次のPhase

- Phase 2: 設計
