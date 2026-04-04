# TASK-UIUX-FEEDBACK-001: Phase 11 UI/UX 3層評価フィードバックループ再設計

## 概要

Phase 11 を「手動スクリーンショット確認」から、Semantic 確認、Visual 回帰確認、AI UX 評価を束ねた 3 層評価へ拡張する仕様を定義する。今回の workflow は **spec_created** 現在地で止め、実装、実行、Issue close、PR 作成は後続 wave で行う。

## メタ情報

| 項目                 | 内容                                                            |
| -------------------- | --------------------------------------------------------------- |
| タスクID             | TASK-UIUX-FEEDBACK-001                                          |
| タスク種別           | skill 改善 + UI task 仕様化                                     |
| 優先度               | HIGH                                                            |
| ステータス           | spec_created                                                    |
| 上流ゲート           | TASK-RT-05 multi_select 実装完了                                |
| 依存タスク           | TASK-RT-05                                                      |
| 後続タスク           | 実装 wave、Phase 11 実行 wave                                   |
| canonical root       | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/` |
| canonical skill root | `.claude/skills/task-specification-creator/`                    |
| mirror skill root    | `.agents/skills/task-specification-creator/`                    |
| 作成日               | 2026-03-31                                                      |
| 更新日               | 2026-03-31                                                      |

## 受入基準

| ID   | 基準                                                                                                          | 優先度 |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ |
| AC-1 | `.claude` 正本基準で Phase 11 3層評価構造の変更点が特定されている                                             | MUST   |
| AC-2 | `task-specification-creator` と `aiworkflow-requirements` の観点で sync 対象が漏れなく列挙されている          | MUST   |
| AC-3 | 4条件（矛盾なし、漏れなし、整合性あり、依存関係整合）で false green を除去している                            | MUST   |
| AC-4 | SubAgent lane を用いた並列実行計画が定義されている                                                            | MUST   |
| AC-5 | workflow root、`artifacts.json`、`outputs/artifacts.json`、Phase 11/12/13 の status vocabulary が整合している | MUST   |
| AC-6 | Phase 13 は user approval 未取得のため `blocked` と明示されている                                             | MUST   |

## スコープ

**含む**:

- Phase 11 3層評価仕様の設計
- 対象 skill と関連 spec の sync 対象洗い出し
- TASK-RT-05 Phase 11 の再定義方針
- Phase 4-13 の execution plan 整理
- `artifacts.json` / `outputs/artifacts.json` 整合

**含まない**:

- `.claude/skills/...` への実装反映
- `.claude/skills/task-specification-creator/scripts/` の新規実装
- TASK-RT-05 の実行完了
- Issue #1755 close
- commit、push、PR

## 依存関係

| 種別      | 参照先                                                                                                          | 役割                         |
| --------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| upstream  | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 適用対象の Phase 11 シナリオ |
| reference | `.claude/skills/task-specification-creator/SKILL.md`                                                            | Phase 1-13 運用基準          |
| reference | `.claude/skills/task-specification-creator/references/phase-templates.md`                                       | phase 文書構造基準           |
| reference | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                     | Phase 11/12 close-out 基準   |
| reference | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                               | canonical spec sync 基準     |
| reference | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                | 読むべき system spec 選定    |

## 真の論点

| 観点           | 結論                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 主問題         | 既存仕様書が `.agents` を正本として扱い、workflow 自身を completed 相当で記述していたため、skill sync と execution state がドリフトしていた |
| 責務境界       | 今回は 3 層評価の **仕様化** が責務であり、実装や実行結果を既成事実として書かない                                                           |
| 価値とコスト   | false green を除去し、後続実装者が `.claude` 正本、mirror、Phase 11 evidence、Phase 12 sync を迷わず踏めるようにする                        |
| stop condition | Phase 1-3 は completed、Phase 4-12 は pending、Phase 13 は blocked として workflow を凍結する                                               |

## 30思考法の適用方針

| カテゴリ     | 適用内容                                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| 論理分析系   | `.claude` 正本と workflow 記述の矛盾検出、completed 誤記の除去                       |
| 構造分解系   | workflow root、phase docs、outputs、artifacts、skill roots を分離して監査            |
| メタ・抽象系 | 「実装済みの記録」と「実装仕様」の混線を解消                                         |
| 発想・拡張系 | 3層評価を spec_created 現在地でも残せる最小証跡へ再構成                              |
| システム系   | Phase 11 evidence、Phase 12 sync、Phase 13 blocked の依存鎖を整理                    |
| 戦略・価値系 | 実装前に sync 漏れを潰すことで後続の修正コストを下げる                               |
| 問題解決系   | false green の原因を path、status、artifact inventory、future wording に分解して対処 |

## SubAgent 編成

| lane   | 目的                                            | 実行形態                  |
| ------ | ----------------------------------------------- | ------------------------- |
| Lane A | `task-specification-creator` 準拠監査           | 並列                      |
| Lane B | `aiworkflow-requirements` / spec sync 監査      | 並列                      |
| Lane C | workflow root / artifacts / phase status 正規化 | Lane A/B 結果を受けて直列 |

## ディレクトリ構成

```text
task-uiux-feedback-001-phase11-enhancement/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── phase-3/design-review-result.md
    ├── phase-4/test-specification.md
    ├── phase-4/red-test-result.md
    ├── phase-5/changed-files.md
    ├── phase-5/implementation-summary.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-11/screenshots/phase11-capture-metadata.json
    ├── phase-12/implementation-guide.md
    ├── phase-12/system-spec-update-summary.md
    ├── phase-12/documentation-changelog.md
    ├── phase-12/unassigned-task-detection.md
    ├── phase-12/skill-feedback-report.md
    ├── phase-12/phase12-task-spec-compliance-check.md
    └── phase-13/pr-summary.md
```

## Phase 状態

| Phase | 名称             | 状態      | 意味                                   |
| ----- | ---------------- | --------- | -------------------------------------- |
| 1     | 要件定義         | completed | 受入基準と inventory を確定            |
| 2     | 設計             | completed | 3層評価と sync 方針を設計              |
| 3     | 設計レビュー     | completed | false green の除去方針を承認           |
| 4-10  | 実装前工程       | pending   | 実装 wave で実行                       |
| 11    | 手動テスト       | pending   | evidence 雛形のみ配置、実行は未着手    |
| 12    | ドキュメント更新 | pending   | close-out 雛形のみ配置、実更新は未着手 |
| 13    | PR作成           | blocked   | user approval 待ち                     |

## 完了イメージ

- `.claude` 正本を更新する対象と mirror 同期対象が明確である
- Phase 11 は `not_run` を明示した雛形で false completion を避ける
- Phase 12 は `system-spec-update-summary` 命名を用い、実更新前提の close-out 要件だけを固定する
- Phase 13 は blocked 条件だけを保持し、commit / PR の誘導を既成事実化しない
