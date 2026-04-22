---
task_id: UNASSIGNED-EVALS-VALIDATOR-GUARD-001
task_name: skill-fixture-runner EVALS.json スキーマ検証追加
category: 改善
target_feature: skill-fixture-runner / EVALS.json 自動検証
priority: 高
scale: 中規模
task_type: docs-only / NON_VISUAL
status: spec_created
issue_number: 2325
created_date: 2026-04-21
dependencies:
  - UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
  - TASK-EVALS-CONSUMER-AUDIT-001
implementation_mode: new
---

# UNASSIGNED-EVALS-VALIDATOR-GUARD-001: skill-fixture-runner EVALS.json スキーマ検証追加

## メタ情報

| 項目                | 内容                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| タスクID            | UNASSIGNED-EVALS-VALIDATOR-GUARD-001                                                                   |
| タスク名            | skill-fixture-runner EVALS.json スキーマ検証追加                                                       |
| 分類                | 改善                                                                                                   |
| 対象機能            | skill-fixture-runner / EVALS.json 自動検証                                                             |
| 優先度              | 高                                                                                                     |
| 見積もり規模        | 中規模                                                                                                 |
| ステータス          | spec_created（Phase 1-12 completed / Phase 13 blocked）                                                |
| GitHub Issue        | #2325（CLOSED）                                                                                        |
| 先行タスク          | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001（先行推奨）、TASK-EVALS-CONSUMER-AUDIT-001（完了済み） |
| 後続タスク          | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001                                                    |
| タスク種別          | docs-only / NON_VISUAL（UI変更なし。close-out と system spec sync が責務）                             |
| implementation_mode | new                                                                                                    |
| 発見元              | TASK-EVALS-CONSUMER-AUDIT-001 Phase 12                                                                 |
| 作成日              | 2026-04-21                                                                                             |

## 背景・課題

`TASK-EVALS-CONSUMER-AUDIT-001 Phase 12` の監査結果として、EVALS.json を機械的に検証する consumer（validator）が **0 件** であることが判明した。

主な課題は以下の通りである。

- EVALS.json を機械的に検証する consumer（validator）が **0 件** の状態であり、破損・不整合を自動検出する仕組みが存在しない
- dual root（`.claude/skills/*` と `.agents/skills/*`）の一方だけ更新した場合のドリフトを自動検出できない
- camelCase / snake_case の 2 方言が 3 組 6 フィールドで併存しており、方言不整合を静的に検知できない
- 動的パス consumer が 13 件存在するため、単純な glob では検証対象の完全列挙が不足する

`validate-schemas.js` / `validate-skill-structure.js` に EVALS.json 検証を追加し、validator=0 件の状態を解消することが本タスクの核心である。

## 目的・ゴール

新設する `validate-evals.js` により、EVALS.json に対して L1 JSON パース / L2 必須キー / L3 dual root 一致 の 3 層検証を実施する。これにより以下の状態を達成する。

- EVALS.json validator の件数を 0 件から 1 件以上に引き上げる
- dual root ドリフトを同一 commit 単位で自動検出できるようにする
- `run-all-validations.js` から 1 コマンドで新 validator を起動できるようにする
- `.claude/` と `.agents/` を常に同一 commit で更新する運用を確立する

## スコープ

### 対象

- 新設 `validate-evals.js`（L1 JSON パース / L2 必須キー / L3 dual root 一致 の3層検証）
- `validate-skill-structure.js` の EVALS.json 存在チェック強化
- `run-all-validations.js` への新 validator 統合
- `.agents/` ミラーの同一 commit 更新

### 対象外

- EVALS.json のスキーマ方言統一（UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 が担当）
- EVALS.json の内容・スキル仕様そのものの変更
- UI コンポーネントの変更（NON_VISUAL タスク）
- 動的パス consumer 13 件の個別対応

## 受入基準

| ID     | 基準                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| AC-001 | `validate-evals.js` が L1 JSON パース検証を実行できる                             |
| AC-002 | `validate-evals.js` が L2 必須キー検証（方言許容モード）を実行できる              |
| AC-003 | `validate-evals.js` が L3 dual root 一致検証を 6 スキル全件で実行できる           |
| AC-004 | 破損 JSON / 欠落必須キー / 方言不整合 / dual root ドリフトの 4 種を検出できる     |
| AC-005 | fixture EVALS.json の除外 or 特別扱い方針が実装と SKILL.md の双方に明示されている |
| AC-006 | `run-all-validations.js` から 1 コマンドで新 validator が起動する                 |
| AC-007 | `.claude/` と `.agents/` の同一 commit 更新後に `diff -u` で差分ゼロ              |

## 共通契約

### CLI 契約の正本

`validate-evals.js` の CLI 契約は **Phase 2 の `## CLI インターフェース` を唯一の正本** とする。Phase 4 / 5 / 11 / 12 / 13 はその契約を参照して具体化し、独自のフラグ体系を増やさない。

### 成果物契約の正本

- Phase 1 の成果物名は `script-inventory.md` / `evals-target-list.md` / `dialect-field-map.md`
- Phase 3 の 30 思考法監査は `outputs/phase-3/elegance-thinking-audit.md`
- Phase 11 の primary evidence は `outputs/phase-11/manual-test-result.md`
- Phase 12 の canonical 名は `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md`

### 30種の思考法の適用方針

30 種の思考法は Phase 3 で一括監査し、`矛盾なし / 漏れなし / 整合性あり / 依存関係整合` の 4 条件へ束ねる。個別所見は `outputs/phase-3/elegance-thinking-audit.md` に記録し、Phase 8 と Phase 10 で再参照する。

## 実装対象ファイル

- `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`（新規作成）
- `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`（EVALS.json 存在チェック強化）
- `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`（新 validator 統合）
- `.agents/skills/skill-fixture-runner/scripts/`（ミラー同期）

## Phase一覧

| Phase    | 名称             | 仕様書                                                       | ステータス |
| -------- | ---------------- | ------------------------------------------------------------ | ---------- |
| Phase 1  | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| Phase 2  | 設計             | [phase-2-design.md](phase-2-design.md)                       | completed  |
| Phase 3  | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| Phase 4  | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| Phase 5  | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| Phase 6  | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| Phase 7  | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| Phase 8  | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| Phase 9  | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| Phase 10 | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| Phase 11 | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| Phase 12 | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| Phase 13 | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |
