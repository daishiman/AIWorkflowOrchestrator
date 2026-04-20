# TASK-LOGS-ARCHIVE-POLICY-001: LOGS.md アーカイブポリシー詳細化

## メタ情報

| 項目                | 内容                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| タスクID            | TASK-LOGS-ARCHIVE-POLICY-001                                                       |
| タスク名            | LOGS.md アーカイブポリシー詳細化（threshold と archive 先の確定）                  |
| カテゴリ            | 改善                                                                               |
| 対象機能            | スキル管理 / LOGS.md 運用                                                          |
| 優先度              | 中                                                                                 |
| 規模                | 小規模                                                                             |
| ステータス          | Phase 12完了 / Phase 13 blocked                                                    |
| ソースPhase         | Phase 12（TASK-CONFLICT-PREVENT-001 の unassigned-task-detection.md）              |
| 作成日              | 2026-04-19                                                                         |
| GitHub Issue        | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282)（CLOSED） |
| ブランチ            | `docs/task-spec-TASK-LOGS-ARCHIVE-POLICY-001`                                      |
| 依存タスク          | TASK-CONFLICT-PREVENT-001（mirror sync 機構構築）                                  |
| タスク種別          | docs-only / NON_VISUAL                                                             |
| implementation_mode | `verify_existing`                                                                  |

## 目的

`.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` のアーカイブ閾値と
archive 先パス規則を統一ポリシー文書として確定する。`worktree` 間マージコンフリクトの抑制と
スキルログ運用の属人化解消を実現するため、以下の 3 要素を明文化する：

- アーカイブ閾値（行数 300 / バイトサイズ 30 KB / 月次のいずれか）
- archive 先パス規則（`logs-archive-YYYY-MM.md`）
- アーカイブ手順・運用ルール・エスカレーションフロー

## 実行タスク

- docs-only / NON_VISUAL / `verify_existing` の前提を固定する
- skill 2系統の要求へ対応する Phase 骨格を揃える
- 正本、mirror、3インデックス、blocked PR の責務境界を明確化する
- validator と evidence の導線を `artifacts.json` / `outputs/` に固定する

## 参照資料

| 資料名                     | パス                                                                       | 用途                       |
| -------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| task-specification-creator | `.agents/skills/task-specification-creator/SKILL.md`                       | Phase 骨格・Phase 12 要件  |
| aiworkflow-requirements    | `.agents/skills/aiworkflow-requirements/SKILL.md`                          | 正本仕様同期の判断基準     |
| verification-report        | `docs/30-workflows/logs-archive-policy-001/outputs/verification-report.md` | 初回監査結果               |
| artifacts                  | `docs/30-workflows/logs-archive-policy-001/artifacts.json`                 | Phase 依存と taskType 固定 |

## 成果物

| 種別 | パス                                                                       | 備考     |
| ---- | -------------------------------------------------------------------------- | -------- |
| 新規 | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 正本     |
| 同期 | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | mirror   |
| 更新 | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | 参照追加 |

## Phase 一覧

| Phase | 文書                                                           | 目的                                   | 前提    |
| ----- | -------------------------------------------------------------- | -------------------------------------- | ------- |
| 1     | [phase-1-requirements.md](./phase-1-requirements.md)           | 要件定義・現状計測・閾値候補選定       | 完了    |
| 2     | [phase-2-design.md](./phase-2-design.md)                       | 設計決定（D-1〜D-4）                   | 完了    |
| 3     | [phase-3-design-review.md](./phase-3-design-review.md)         | 設計レビュー・Findings（F-001〜F-005） | 完了    |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md)         | 検証手順策定（文書品質検証）           | 完了    |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md)       | ポリシー文書執筆                       | 完了    |
| 6     | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | 追加検証・エッジケース適用             | 完了    |
| 7     | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | Issue要件 7 項目の網羅確認             | 完了    |
| 8     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | 文書構成最適化                         | 完了    |
| 9     | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | 文書品質保証（markdown lint等）        | 完了    |
| 10    | [phase-10-final-review.md](./phase-10-final-review.md)         | 最終レビュー・AC 総点検                | 完了    |
| 11    | [phase-11-manual-test.md](./phase-11-manual-test.md)           | 手動テスト・ダミー適用シミュレーション | 完了    |
| 12    | [phase-12-documentation.md](./phase-12-documentation.md)       | 最終文書整備・インデックス反映         | 完了    |
| 13    | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | PR 作成手順                            | blocked |

## 実行原則

- Phase 1-3 は直列（設計フェーズ）
- Phase 4 以降は関心事に応じて並列可（テスト群、実装、文書整備）
- コード実装・PR 作成はユーザーの明示指示があるまで実行しない
- `--no-verify` 絶対禁止（CLAUDE.md 規約）

## 実行手順

1. Phase 1 で docs-only / NON_VISUAL / `verify_existing` を固定する
2. Phase 2-3 で閾値・命名・mirror・index の論点を確定する
3. Phase 4-11 は検証証跡レーンとして使い、重複実装を避ける
4. Phase 12 で canonical 6成果物と Step 1 / Step 2 判断を閉じる
5. Phase 13 は blocked のまま PR 条件だけを整理する

## 多角的チェック観点

| 観点            | チェック内容                                                   |
| --------------- | -------------------------------------------------------------- |
| 論点集中        | 本タスク固有論点が「閾値・命名・mirror・参照」に収束しているか |
| 最小複雑性      | docs-only に不要な儀式を持ち込みすぎていないか                 |
| 依存整合        | `artifacts.json`、Phase依存、Step 1 / Step 2 が一致しているか  |
| NON_VISUAL 整合 | screenshot 不要方針と Phase 11 / 12 の証跡が一致しているか     |
| blocked 運用    | Phase 13 の禁止事項が前倒し実行されないか                      |

## 参照情報

- 既存アーカイブ実例: `.claude/skills/task-specification-creator/references/logs-archive-*.md`
- 前提タスク: [TASK-CONFLICT-PREVENT-001](../) 成果物
- mirror sync 機構: `.claude/skills/` ↔ `.agents/skills/` 同期

## 完了条件

- [x] docs-only / NON_VISUAL / `verify_existing` の前提が index / artifacts で一致している
- [x] 全 13 Phase へのリンクが有効である
- [x] 主要成果物が正本・mirror・index 更新・blocked PR に収束している
- [x] skill 準拠監査で指摘された必須骨格不足を解消している
