# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| Phase名    | ドキュメント更新        |
| 前提Phase  | Phase 11（手動テスト）  |
| 後続Phase  | Phase 13（PR作成）      |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | embedding-late-chunking |

---

## 目的

実装内容をドキュメントに反映し、未タスクを検出・記録する。

## 背景

Late Chunkingは仕様と実装の整合性が重要なため、システム仕様書と実装ガイドの更新が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 非技術者/開発者向けの2部構成ガイドを作成する

**実行手順**:

1. Part 1（概念説明）とPart 2（技術詳細）の構成で作成
2. `outputs/phase-12/implementation-guide.md` に記録

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

### Phase 12-2: システムドキュメント更新【必須】

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 仕様正本を優先し、概要のみ記載

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirementsの仕様を更新する

**実行手順**:

1. Late Chunkingに関する変更点を特定
2. `architecture-embedding-pipeline.md` / `api-internal-embedding.md` / `interfaces-rag-chunk-embedding.md` を更新
3. `spec-update-workflow.md` に従い更新要否を判定し、更新が必要と判断された場合は「タスク完了ステータス」セクションを追加
4. 変更履歴にバージョン追記を行う
5. `outputs/phase-12/documentation-update-log.md` に更新履歴を記録

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

### タスク3: 未タスク検出

**目的**: 未完了課題を検出し記録する

**実行手順**:

1. Phase 3/10レビュー結果・Phase 11手動テスト結果を確認
2. TODO/FIXME/HACK/XXXコメントを検出
3. 検出がない場合は「検出タスクなし」と明記
4. `outputs/phase-12/unassigned-task-report.md` に記録

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/embedding-late-chunking \
  --sources "packages/,apps/"
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                                    | パス                                                                                   | 内容                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| Embedding Generation Pipelineアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | パイプライン構成とチャンキング/埋め込みの責務 |
| Embedding Generation API                    | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | EmbeddingPipeline/ChunkingServiceのAPI仕様    |
| チャンク・埋め込み型定義                    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`  | チャンク/埋め込みエンティティと設定値         |

**ドキュメント更新ガイド**

| 参照資料                   | パス                                                                                    | 内容               |
| -------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| 仕様更新フロー             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新の判断基準 |
| 技術ドキュメント作成ガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド作成指針 |

**前Phase成果物**

| 参照資料       | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | ベンチマーク結果 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 課題リスト       |

**依存Phase成果物**

| 参照資料                 | パス                                         | 内容           |
| ------------------------ | -------------------------------------------- | -------------- |
| Phase 1 要件定義         | `outputs/phase-1/requirements-definition.md` | 要件整理       |
| Phase 2 設計             | `outputs/phase-2/architecture-design.md`     | 設計まとめ     |
| Phase 5 実装             | `outputs/phase-5/implementation-summary.md`  | 実装サマリー   |
| Phase 6 テスト拡充       | `outputs/phase-6/coverage-report.md`         | カバレッジ分析 |
| Phase 7 カバレッジ確認   | `outputs/phase-7/coverage-report.md`         | 再測定結果     |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-log.md`         | 変更記録       |
| Phase 9 品質保証         | `outputs/phase-9/quality-summary.md`         | 品質まとめ     |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`    | 判定結果       |

---

## 未タスク検出レポート形式（0件の場合）

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 成果物

| 成果物               | パス                                                                                   | 内容                     |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                                             | 概念/技術の2部構成ガイド |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md`                                         | 更新履歴                 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`                                           | 検出結果                 |
| 更新対象仕様         | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | 仕様更新                 |
| 更新対象仕様         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | 仕様更新                 |
| 更新対象仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`  | 仕様更新                 |

---

## 完了条件

- [ ] 実装ガイド（Part 1/Part 2）が作成されている
- [ ] システム仕様書が更新されている
- [ ] ドキュメント更新履歴が記録されている
- [ ] 未タスク検出レポートが出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 12
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- タスク1:
- タスク2:
- タスク3:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 11（手動テスト）の完了
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-13-pr-creation.md`
