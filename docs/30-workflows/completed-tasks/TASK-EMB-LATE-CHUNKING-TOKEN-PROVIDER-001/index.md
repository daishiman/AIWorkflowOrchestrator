---
task_id: TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001
task_name: Late Chunking トークンレベル隠れ状態プロバイダー実装
task_type: NON_VISUAL
implementation_mode: new
category: 新機能実装
target_feature: packages/shared/src/services/chunking
priority: 高
scale: 大規模
status: in_progress
current_phase: 13
created_date: 2026-04-20
issue_number: 2316
dependencies: []
---

# TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001

## メタ情報

| 項目                | 内容                                      |
| ------------------- | ----------------------------------------- |
| タスクID            | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| タスク種別          | NON_VISUAL                                |
| implementation_mode | new                                       |
| ステータス          | in_progress                               |
| 現在Phase           | 13                                        |

## ユーザー要求の要約

本ブランチの変更分を対象に、`task-specification-creator` と `aiworkflow-requirements` の両方へ漏れなく整合する task 仕様書へ改善する。commit / push / PR は行わず、NON_VISUAL code task として Phase 1〜13 を step-by-step で実行できる状態に再構成する。

## 現状整理

- 現在の `IEmbeddingClient` は `embed()` / `embedBatch()` のみを前提としており、文書全体の token-level hidden states を返す契約がない
- `ChunkingService` 側はセグメント単位の近似処理に依存しており、真の Late Chunking に必要な入力契約が不足している
- 本 task の主責務は「token-level provider 契約と最小実装基盤の追加」であり、pooling strategy 拡張や pipeline 統合は後続 task に分離する

## 真の論点

1. `IEmbeddingClient` に token-level provider 契約をどう追加すれば既存実装を壊さないか
2. `TokenEmbeddingsResult` の型とバリデーション責務をどこに置けば依存が閉じるか
3. `ChunkingService` のフォールバックをどこまで本 task に含め、どこから後続 task に分離するか
4. NON_VISUAL code task として Phase 11 / 12 / 13 の証跡をどう固定するか

## 価値とコスト

- 価値
  - token-level provider 契約が明文化され、後続の Late Chunking 実装 task が依存できる
  - 既存 `embed()` / `embedBatch()` の後方互換を崩さずに拡張できる
  - Phase 11 / 12 / 13 の close-out が skill 準拠で追跡可能になる
- コスト
  - interface / type / service の境界見直しが必要
  - Phase 12 で system spec sync 対象を明示しないと close-out が破綻する

## 4条件の初期評価

| 条件         | 初期判定 | 主因                                                               |
| ------------ | -------- | ------------------------------------------------------------------ |
| 矛盾なし     | FAIL     | scope にない real provider / pooling strategy が一部 phase に混在  |
| 漏れなし     | FAIL     | `implementation_mode`、`artifacts.json`、Phase 12 Task 12-6 が不足 |
| 整合性あり   | FAIL     | `NON_VISUAL` と `docs-only` が混線                                 |
| 依存関係整合 | FAIL     | 後続 task と canonical artifacts のつながりが弱い                  |

## 最終ゴール

- `IEmbeddingClient` に `getTokenEmbeddings?()` を追加する task として scope を固定する
- `TokenEmbeddingsResult` 型と `ChunkingService` の token-provider 分岐を設計・実装・検証できる workflow にする
- `MockTokenEmbeddingClient` を用意し、実装系 test と close-out evidence が成立する
- `task-specification-creator` と `aiworkflow-requirements` の close-out 要件に整合する

## スコープ

### 含む

- `IEmbeddingClient` への `getTokenEmbeddings?()` 追加
- `TokenEmbeddingsResult` 型の定義
- `ChunkingService` から token-level provider を呼び出す分岐とフォールバックの明記
- `MockTokenEmbeddingClient` の追加
- targeted test / quality gate / NON_VISUAL close-out

### 含まない

- OpenAI / DashScope など real provider への本番実装
- `poolTokenEmbeddings()` の戦略追加や attention pooling
- EmbeddingPipeline への統合
- Late Chunking 全体の責務分離

## 後続タスク

| タスクID                                        | 関係 | 説明                             |
| ----------------------------------------------- | ---- | -------------------------------- |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001   | 後続 | Late Chunking 処理責務を分離する |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | 後続 | pipeline へ統合する              |

## 30思考法の適用方針

### 論理分析系

- 批判的思考
- 演繹思考
- 帰納的思考
- アブダクション
- 垂直思考

役割: scope 外の内容を除去し、実際の responsibility に収束させる。

### 構造分解系

- 要素分解
- MECE
- 2軸思考
- プロセス思考

役割: interface / type / service / test / close-out を重複なく分解する。

### メタ・抽象系

- メタ思考
- 抽象化思考
- ダブル・ループ思考

役割: 局所修正ではなく workflow 骨格を skill 準拠へ戻す。

### 発想・拡張系

- ブレインストーミング
- 水平思考
- 逆説思考
- 類推思考
- if思考
- 素人思考

役割: real provider や pooling を切り離し、最小責務の task に保つ。

### システム系

- システム思考
- 因果関係分析
- 因果ループ

役割: 契約不足が test / pipeline / close-out に波及する因果を明示する。

### 戦略・価値系

- トレードオン思考
- プラスサム思考
- 価値提案思考
- 戦略的思考

役割: 最小複雑性で後続 task の土台を作る。

### 問題解決系

- why思考
- 改善思考
- 仮説思考
- 論点思考
- KJ法

役割: 真因を「task scope と skill close-out の崩れ」に固定する。

## 参照根拠

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`

## Phase 一覧

| Phase | 名称             | 仕様書                                                 | 目的                                               | ステータス  |
| ----- | ---------------- | ------------------------------------------------------ | -------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)     | P50 と `implementation_mode: new` を確定する       | in_progress |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                 | interface / type / service / mock の設計を確定する | pending     |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)   | 30思考法と 4条件で設計を監査する                   | pending     |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)   | token provider 契約の RED を定義する               | pending     |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md) | interface / type / service / mock を実装する       | pending     |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md) | エッジケースと回帰観点を補強する                   | pending     |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)             | token provider 分岐と長さ検証の網羅性を確認する    | pending     |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)       | 型ガードと責務境界を整理する                       | pending     |
| 9     | 品質保証         | [phase-9-quality.md](phase-9-quality.md)               | typecheck / lint / test を通す                     | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)   | AC と実装差分を最終確認する                        | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)     | NON_VISUAL code task として代替証跡を固定する      | completed   |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md) | mandatory 6 tasks で close-out する                | completed   |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)     | user 承認待ちの blocked phase として扱う           | blocked     |

## Canonical Artifacts

| Phase | 成果物                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements.md`, `outputs/phase-1/interface-inventory.md`                                                                                                                                                                                                                         |
| 2     | `outputs/phase-2/design.md`                                                                                                                                                                                                                                                                         |
| 3     | `outputs/phase-3/review-result.md`, `outputs/phase-3/gate-decision.md`                                                                                                                                                                                                                              |
| 4     | `outputs/phase-4/test-scenarios.md`, `outputs/phase-4/red-test-result.md`                                                                                                                                                                                                                           |
| 5     | `outputs/phase-5/implementation-notes.md`, `outputs/phase-5/changed-files.md`                                                                                                                                                                                                                       |
| 6     | `outputs/phase-6/test-expansion-result.md`                                                                                                                                                                                                                                                          |
| 7     | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                |
| 8     | `outputs/phase-8/refactoring-summary.md`                                                                                                                                                                                                                                                            |
| 9     | `outputs/phase-9/quality-gate-report.md`                                                                                                                                                                                                                                                            |
| 10    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                           |
| 11    | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/discovered-issues.md`                                                                                                                                                                      |
| 12    | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | `outputs/phase-13/local-check-result.md`, `outputs/phase-13/change-summary.md`, `outputs/phase-13/pr-info.md`, `outputs/phase-13/pr-creation-result.md`                                                                                                                                             |

## SubAgent 編成

| Lane   | 役割                        | 実行形態 |
| ------ | --------------------------- | -------- |
| Lane A | skill 準拠監査              | 並列     |
| Lane B | 30思考法による多角分析      | 並列     |
| Lane C | phase spec / artifacts 整流 | 直列     |

## ゲート

- Phase 1 → 2: `implementation_mode` と AC が固定されていること
- Phase 3 → 4: MAJOR 以上の設計欠陥が 0 件であること
- Phase 5 → 6: TP-01〜TP-05 の GREEN が確認できること
- Phase 10 → 11: blocker が 0 件であること
- Phase 12 → 13: mandatory 6 tasks と artifacts parity が完了していること
- Phase 13: user 承認があるまで blocked
