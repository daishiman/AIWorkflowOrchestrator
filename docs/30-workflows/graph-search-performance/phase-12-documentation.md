# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| Phase名    | ドキュメント更新         |
| 前提Phase  | Phase 11（手動テスト）   |
| 後続Phase  | Phase 13（PR作成）       |
| ステータス | 未実施                   |
| 作成日     | 2026-01-18               |
| 機能名     | graph-search-performance |

---

## 目的

実装内容をドキュメント化し、必要な仕様更新と未タスク検出を実施する。

## 背景

キャッシュ導入は性能と運用に関わるため、実装ガイドと仕様更新の記録が必要である。

---

## 使用スキル

- `aiworkflow-requirements`: システム仕様の更新判断に使用する。
- `skill-creator`: スキルフィードバックを記録する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 実装内容を概念説明と技術詳細でまとめる。

**実行手順**:

1. `assets/implementation-guide-template.md` に従ってガイドを作成する。
2. キャッシュ導入の背景、メリット、制約を説明する。
3. `outputs/phase-12/implementation-guide.md` に記録する。

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: ドキュメント更新履歴

**目的**: 更新対象のドキュメントと変更理由を記録する。

**実行手順**:

1. 更新したファイルを一覧化する。
2. 変更理由と参照仕様を記録する。
3. `outputs/phase-12/documentation-update-log.md` に記録する。

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

### タスク3: 未タスク検出

**目的**: 未対応課題を検出し、必要であれば指示書を作成する。

**実行手順**:

**未タスク検出ソースとパターン**

| ソース               | 対象                                      | 検出パターン/観点                          |
| -------------------- | ----------------------------------------- | ------------------------------------------ |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md` | 未対応の指摘事項、戻り先条件に該当する項目 |
| Phase 9 品質保証     | `outputs/phase-9/quality-report.md`       | 未解決の品質課題、改善TODO                 |
| Phase 11 手動テスト  | `outputs/phase-11/manual-test-result.md`  | 未解決の不具合、再現手順付きの未対応課題   |
| コードベース         | `packages/` `apps/` `docs/` `scripts/`    | TODO/FIXME/HACK/XXXの残件、未実装メモ      |
| スキルログ           | `.claude/skills/**/LOGS.md`               | 未対応/改善提案/ToDoの記録                 |

1. Phase 3/9/11の指摘事項を確認する。
2. TODO/FIXMEの検出を実施する（例: `rg -n "TODO|FIXME|HACK|XXX" packages apps docs scripts`）。
3. `outputs/phase-12/unassigned-task-report.md` に記録する。
4. 検出した場合は `docs/30-workflows/unassigned-task/` に指示書を作成する。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/unassigned-task/*.md`（該当時）

---

### タスク4: スキルフィードバック記録

**目的**: 使用したスキルの評価を記録する。

**実行手順**:

1. 各Phaseで使用したスキルの結果を整理する。
2. `skill-creator` の手順に従ってLOGS.mdへ記録する。
3. `outputs/phase-12/skill-feedback-report.md` にまとめる。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

### タスク5: 仕様更新判断

**目的**: システム仕様の更新が必要か判断する。

**実行手順**:

1. `references/spec-update-workflow.md` を確認する。
2. 仕様更新が必要な場合は `.claude/skills/aiworkflow-requirements/references/` を更新する。
3. 判断結果を `outputs/phase-12/spec-update-decision.md` に記録する。

**期待される成果物**:

- `outputs/phase-12/spec-update-decision.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                           | 内容                            |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------------------- |
| 検索クエリ・結果型定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`   | GraphSearchStrategyと検索型定義 |
| Embedding Generation API | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`  | 埋め込み生成APIとキャッシュ指標 |
| 仕様更新ガイド           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`         | 仕様更新の命名規則と記述方針    |
| 仕様更新フロー           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断フロー                  |

**前Phase成果物**

| 参照資料             | パス                                         | 内容           |
| -------------------- | -------------------------------------------- | -------------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` | 要件一覧       |
| キャッシュ設計       | `outputs/phase-2/cache-design.md`            | キャッシュ仕様 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 実装内容       |
| テスト拡充結果       | `outputs/phase-6/coverage-report.md`         | カバレッジ分析 |
| ゲート判定結果       | `outputs/phase-7/gate-result.md`             | 判定結果       |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`         | 変更点         |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | 品質検証結果   |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`     | 手動検証結果   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`    | 判定結果       |

---

## 成果物

| 成果物                   | パス                                           | 内容               |
| ------------------------ | ---------------------------------------------- | ------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`     | 概念説明と技術詳細 |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-update-log.md` | 更新内容の記録     |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-report.md`   | 未対応課題の整理   |
| スキルフィードバック報告 | `outputs/phase-12/skill-feedback-report.md`    | スキル評価         |
| 仕様更新判断             | `outputs/phase-12/spec-update-decision.md`     | 仕様更新の要否     |

---

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている
- [ ] スキルフィードバックが記録されている
- [ ] 仕様更新判断が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

| スキル                  | 結果    | 備考                                 |
| ----------------------- | ------- | ------------------------------------ |
| aiworkflow-requirements | pending | 参照資料確認後に結果を記録する       |
| skill-creator           | pending | フィードバック記録後に結果を記録する |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 12
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

| タスク                   | 結果   | 備考 |
| ------------------------ | ------ | ---- |
| 実装ガイド作成           | 未実施 |      |
| ドキュメント更新履歴     | 未実施 |      |
| 未タスク検出             | 未実施 |      |
| スキルフィードバック記録 | 未実施 |      |
| 仕様更新判断             | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 13: PR作成

`docs/30-workflows/graph-search-performance/phase-13-pr-creation.md`
