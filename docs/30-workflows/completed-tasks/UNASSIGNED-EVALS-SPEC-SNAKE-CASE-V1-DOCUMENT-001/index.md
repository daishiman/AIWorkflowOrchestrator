---
task_id: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001
task_name: snake_case v1 系 EVALS スキーマを正本へ追記
category: ドキュメント更新
target_feature: aiworkflow-requirements / EVALS スキーマ正本
priority: medium
scale: small
status: completed
issue_number: 2326
created_date: 2026-04-21
implementation_mode: new
task_type: NON_VISUAL
canonical_root: .claude/skills
mirror_root: .agents/skills
dependencies:
  後続: UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
---

# UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001: snake_case v1 系 EVALS スキーマを正本へ追記

## メタ情報

| 項目                | 内容                                             |
| ------------------- | ------------------------------------------------ |
| タスクID            | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク名            | snake_case v1 系 EVALS スキーマを正本へ追記      |
| 分類                | ドキュメント更新                                 |
| 対象機能            | aiworkflow-requirements / EVALS スキーマ正本     |
| 優先度              | medium                                           |
| 規模                | small                                            |
| ステータス          | completed                                        |
| GitHub Issue        | #2326（CLOSED）                                  |
| implementation_mode | new                                              |
| task_type           | NON_VISUAL                                       |
| canonical root      | `.claude/skills`                                 |
| mirror root         | `.agents/skills`                                 |
| 作成日              | 2026-04-21                                       |

## ユーザー要求の要約

本ブランチ差分で追加された task spec 一式が `task-specification-creator` と `aiworkflow-requirements` の両 skill に漏れなく準拠しているかを確認し、不足・矛盾・冗長を除去したうえで、最小複雑性の仕様書へ再整形する。

## 概要

この task の主責務は、`aiworkflow-requirements` 正本である `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` の snake_case v1 節に不足している定義を補うための workflow を、現行ルールに沿った形で明文化することである。対象は docs-only かつ NON_VISUAL であり、コード変更や dialect 統一は扱わない。

## 真の論点

主問題は「snake_case v1 で実際に使われている `levels.{N}` と `average_satisfaction` が正本仕様で未定義のまま残っていること」と「その修正を扱う task spec 自体が current skill rules に十分追随できていないこと」の二点である。したがって、単に追記内容を書くのではなく、workflow contract、dual root 運用、Phase 11/12 証跡方針まで一貫して閉じる必要がある。

## why now

- 後続タスク `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` が、この正本定義を前提に進むため
- consumer 側に validator が存在しない既知制約があり、仕様未記述のままでは silent break を起こしやすいため
- `task-specification-creator` の現行ルールでは Phase 11 NON_VISUAL 証跡、Phase 12 6成果物、`artifacts.json` parity が重要であり、そこを先に固定した方が後工程の手戻りが小さいため

## why this way

- docs-only / NON_VISUAL として workflow を組み直し、余計な UI 実装前提を排除する
- `.claude` を正本、`.agents` を mirror とする dual root 運用を明記し、Phase 6/8/9 で parity を閉じる
- 30種の思考法は Phase 1〜3 で分析に集約し、Phase 4 以降はその結論を消費する形にして複雑性を増やさない
- Phase 12 は workflow-local close-out と global spec sync 判定を分け、根拠を 6成果物へ分散ではなく整然と束ねる

## スコープ

### 含むもの

- `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §3 への追記方針の策定
- canonical 更新後に mirror を同期スクリプトで追随させる方針
- `levels` と `average_satisfaction` の実データ構造・保持有無・説明責務の定義
- camelCase v2 との関係を断定なしで記述する方針
- NON_VISUAL / docs-only task としての Phase 11、Phase 12 証跡設計

### 含まないもの

- 実コード変更
- dialect migration / dialect unification
- validator 実装
- commit、push、PR 作成

## 受け入れ基準

| ID   | 内容                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | `levels` がレベル番号文字列キーを持つ静的オブジェクトとして定義され、未保持スキルの扱いも明記される     |
| AC-2 | `average_satisfaction` が観測値ベースで型・意味・保持有無を定義され、固定値域を断定しない               |
| AC-3 | snake_case v1 固有項目と camelCase v2 の関係が「比較対象ではあるが 1:1 対応は断定しない」形で整理される |
| AC-4 | v1 / v2 の関係記述が断定なし・両立スタイルで記述される                                                  |
| AC-5 | `.claude/skills` と `.agents/skills` の反映内容が parity を保つ                                         |

## 4条件評価

| 条件         | 判定 | 根拠                                                                                                 |
| ------------ | ---- | ---------------------------------------------------------------------------------------------------- |
| 矛盾なし     | OK   | stale path、sync summary、skill feedback の不一致を解消し、close-out 記録を current facts に更新した |
| 漏れなし     | OK   | Phase 12 必須 6 成果物、NON_VISUAL 固定文言、same-wave sync 記録を揃えた                             |
| 整合性あり   | OK   | 参照パス、成果物名、Phase 4 artifact 名、4条件自己評価を実体へ同期した                               |
| 依存関係整合 | OK   | 本 task は仕様追記に閉じており、後続 task との境界を明示すれば成立する                               |

## 30種の思考法適用方針

| 系統         | 思考法               | この task での主用途                                              |
| ------------ | -------------------- | ----------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | 「何が未定義か」を事実ベースで切り出す                            |
| 論理分析系   | 演繹思考             | skill rule → workflow 必須項目 → 具体ファイル差分へ落とす         |
| 論理分析系   | 帰納的思考           | 実 EVALS.json の実値から v1 フィールド定義を抽出する              |
| 論理分析系   | アブダクション       | 未記述だが必要な説明責務を推定し、仮説を Phase 2 に渡す           |
| 論理分析系   | 垂直思考             | Phase 1 から 13 までを順序立てて閉じる                            |
| 構造分解系   | 要素分解             | `levels.{N}` と `average_satisfaction` を検証可能最小単位へ分ける |
| 構造分解系   | MECE                 | AC、Phase、成果物の重複と漏れを排除する                           |
| 構造分解系   | 2軸思考              | `skill準拠 × 正本仕様整合` の軸で不備を分類する                   |
| 構造分解系   | プロセス思考         | 調査、設計、追記、parity、close-out の流れを固定する              |
| メタ・抽象系 | メタ思考             | 本当の改善対象がコードではなく仕様契約である点を明示する          |
| メタ・抽象系 | 抽象化思考           | v1 / v2 の具体差分を「方言併存ルール」へ抽象化する                |
| メタ・抽象系 | ダブル・ループ思考   | 追記内容だけでなく workflow の作り方自体も見直す                  |
| 発想・拡張系 | ブレインストーミング | 追記形式、対照表、独立セクションなど複数案を洗う                  |
| 発想・拡張系 | 水平思考             | v2 の表現をそのまま移植せず v1 に合う記述粒度を探す               |
| 発想・拡張系 | 逆説思考             | 「何を書かないか」を定めて後続 task 侵食を防ぐ                    |
| 発想・拡張系 | 類推思考             | 既存の completed task の close-out 証跡を参考にする               |
| 発想・拡張系 | if思考               | validator が無い前提で壊れたら何が困るかを先に考える              |
| 発想・拡張系 | 素人思考             | 初見読者が v1 フィールドを理解できる説明かを確認する              |
| システム系   | システム思考         | workflow、system spec、mirror sync を一体で捉える                 |
| システム系   | 因果関係分析         | 未定義仕様が consumer 破壊へつながる経路を明示する                |
| システム系   | 因果ループ           | 仕様欠落 → 実装推測 → 追加ドリフトの循環を止める                  |
| 戦略・価値系 | トレードオン思考     | 過剰な再設計を避け、必要最小限の構成に留める                      |
| 戦略・価値系 | プラスサム思考       | skill準拠と読みやすさを両立させる                                 |
| 戦略・価値系 | 価値提案思考         | consumer が参照しやすい正本を作ることを価値の中心に置く           |
| 戦略・価値系 | 戦略的思考           | 後続の dialect 統一 task が動きやすい土台を作る                   |
| 問題解決系   | why思考              | 「なぜ今この task spec を直すのか」を固定する                     |
| 問題解決系   | 改善思考             | 既存文書のノイズを除き current rule に寄せる                      |
| 問題解決系   | 仮説思考             | 型や writer/reader の仮説を Phase 1 調査で検証する                |
| 問題解決系   | 論点思考             | 実装変更、方言統一、validator 実装を論点から外す                  |
| 問題解決系   | KJ法                 | findings を skill準拠、正本仕様、close-out、parity に束ねる       |

## 参照資料

| 資料名                      | パス                                                                                                   | 用途                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------- |
| EVALS スキーマ正本          | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                               | 追記対象              |
| EVALS スキーマ mirror       | `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`                               | parity 対象           |
| EVALS consumer audit report | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`  | consumer 全体像の確認 |
| EVALS field map             | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`        | フィールド突合        |
| scope architecture          | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | 断定なし方針の参照    |
| lessons learned             | `.claude/skills/aiworkflow-requirements/references/lessons-learned-evals-consumer-audit-001.md`        | 既知制約の確認        |
| 後続 task                   | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`                       | 境界確認              |

## ディレクトリ構成

```text
docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage.md
├── phase-8-refactoring.md
├── phase-9-quality.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr.md
└── outputs/
    └── artifacts.json
```

## Phase 構成

| Phase | 名称             | 並列性 | 主な成果物                                                                  | 状態      |
| ----- | ---------------- | ------ | --------------------------------------------------------------------------- | --------- |
| 1     | 要件定義         | seq    | `requirements-summary.md`, `spec-extraction-map.md`                         | completed |
| 2     | 設計             | seq    | `schema-addition-design.md`, `field-definition-draft.md`                    | completed |
| 3     | 設計レビュー     | seq    | `design-review-result.md`, `gate-decision.md`                               | completed |
| 4     | テスト作成       | par    | `command-suite.md`, `test-scenarios.md`                                     | completed |
| 5     | 実装             | seq    | `spec-addition-result.md`, `section-diff-report.md`                         | completed |
| 6     | テスト拡張       | par    | `dual-root-verification.md`, `consumer-impact-note.md`                      | completed |
| 7     | カバレッジ確認   | par    | `coverage-report.md`, `traceability-matrix.md`                              | completed |
| 8     | リファクタリング | seq    | `refactor-decision-log.md`                                                  | completed |
| 9     | 品質保証         | seq    | `quality-gate-report.md`                                                    | completed |
| 10    | 最終レビュー     | seq    | `final-review-result.md`                                                    | completed |
| 11    | 手動テスト       | seq    | `manual-test-checklist.md`, `manual-test-result.md`, `discovered-issues.md` | completed |
| 12    | ドキュメント更新 | seq    | Phase 12 の 6成果物                                                         | completed |
| 13    | PR 作成          | seq    | `local-check-result.md`, `change-summary.md`, `pr-info.md`                  | blocked   |

## 実行原則

1. Phase 1〜3 で 30種の思考法を使って論点を圧縮し、Phase 4 以降に推測を持ち込まない。
2. `.claude/skills` を正本、`.agents/skills` を mirror とし、Phase 6 / 8 / 9 で parity を閉じる。
3. docs-only task のため、Phase 5 は実装コードではなく仕様追記そのものを対象とする。
4. NON_VISUAL task のため、Phase 11 は screenshot 不要とし、primary evidence は `manual-test-result.md`、補助 evidence は checklist と discovered-issues で閉じる。
5. Phase 12 は implementation guide、system spec update summary、documentation changelog、unassigned task detection、skill feedback report、phase12 task spec compliance check の 6成果物を必須とする。
6. Phase 13 は user の明示承認があるまで blocked を維持する。
