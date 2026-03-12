# UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001: Workspace parent reference sweep ガード

## 概要

この workflow は Issue [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) を、`task-specification-creator` の execute モードに沿って Phase 1-12 まで完了させた実行仕様書である。parent pointer doc、child workflow、completed-task pointer docs、legacy index、interfaces、capture script、dual root mirror の sweep を 1 つの改善目的として扱い、path drift / status drift / mirror drift を混線させずに閉じた。

Phase 13 は commit / PR 作成を伴うため、本 turn では実行していない。

## メタ情報

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                               |
| タスク種別 | 改善                                                                            |
| 優先度     | 中                                                                              |
| ステータス | phase12_completed                                                               |
| 依存タスク | TASK-UI-04-WORKSPACE-VIEW, UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001 |
| Issue番号  | #1173                                                                           |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 受入基準

| ID   | 基準                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | sweep manifest が parent pointer / child workflow / pointer docs / legacy index / interfaces / capture script / mirror root を全件含む |
| AC-2 | path drift / status drift / mirror drift の責務が設計上で分離される                                                                    |
| AC-3 | task-060 parent pointer と child workflow の参照関係が一意に説明される                                                                 |
| AC-4 | Phase 12 仕様に `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `LOGS.md` / mirror sync が含まれる         |
| AC-5 | `verify-all-specs` と `validate-phase-output` を通せる 13 Phase 構成になっている                                                       |

## スコープ

**含む**:

- docs-only parent workflow の sweep manifest 設計
- stale path / status drift / mirror drift guard の設計と実装計画
- task-060 parent pointer と child workflow follow-up の参照整理
- Phase 12 の system spec 同期計画

**含まない**:

- child workflow 04A / 04B / 04C の UI 実装変更
- screenshot policy 自体の再設計
- `.claude` / `.agents` を単一 root へ統合する大規模リファクタリング
- この turn での commit、PR、実装実行

## Phase 1-3 ゲート

- Phase 1 は監査対象、同期対象、除外範囲を固定する
- Phase 2 は manifest / guard / Phase 12 sync / concern boundary を設計する
- Phase 3 が PASS か MINOR になってから Phase 4 以降へ進む

## 並列化方針

- 直列で先に確定するもの:
  - Phase 1 要件定義
  - Phase 2 設計
  - Phase 3 設計レビュー
- Phase 3 後に並列化できるもの:
  - Phase 4 の red case 作成
  - Phase 5 の実装順序整理
  - Phase 6 / 7 の検証拡充と traceability 整理
  - Phase 12 の更新対象洗い出し

## 関心ごとの分離

| 関心ごと                   | 主担当     | 主な判断対象                                                                       |
| -------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| pointer / index inventory  | SubAgent-A | parent pointer、master index、completed-task pointer docs、legacy index            |
| interfaces / capture drift | SubAgent-B | `interfaces-llm.md`、`interfaces-chat-history.md`、capture script root             |
| mirror sync / validator    | SubAgent-C | canonical root、`diff -qr`、drift fail 条件                                        |
| Phase 12 sync              | SubAgent-D | `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md`、`LOGS.md` |

## システム仕様参照

| 参照資料                   | パス                                                                                 | 用途                           |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 台帳正本                       |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`      | feature spec 同期              |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 苦戦箇所の資産化               |
| interfaces-llm             | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                | workspace evidence path 監査   |
| interfaces-chat-history    | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`       | workspace evidence path 監査   |
| create-workflow            | `.claude/skills/task-specification-creator/references/create-workflow.md`            | create モードの直列 / 並列規約 |
| unassigned-task-guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | unassigned task 品質規約       |

## 作成物

- `artifacts.json`
- `phase-1-requirements.md` から `phase-13-pr-creation.md`
- workflow 本体の `index.md`
- GitHub Issue #1173 に対応するローカル unassigned-task 指示書

## 注意事項

- この workflow は Phase 1-12 の実行記録まで同期済みである
- Phase 13 で PR を扱う場合も、ユーザーの明示指示が前提になる
- root 差分は `task-060` parent pointer と child workflow completed path の両方を基準に扱う
