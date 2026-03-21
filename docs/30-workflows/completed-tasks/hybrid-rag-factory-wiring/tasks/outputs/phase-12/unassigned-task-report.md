# 未タスク検出レポート

## メタ情報

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| タスクID | UT-RAG-08-002                                                           |
| Phase    | 12 - ドキュメント / Task 4: 未タスク検出                                |
| 作成日   | 2026-03-20                                                              |
| 担当     | Phase 12 Task 4 エージェント                                            |
| 検出件数 | 3件（FU-01: UT-RAG-08-006、FU-02: UT-RAG-08-007、FU-03: UT-RAG-08-008） |

## 1. 検出結果サマリー

| タスクID      | タスク名                                              | 優先度 | 発見元                                      | ステータス |
| ------------- | ----------------------------------------------------- | ------ | ------------------------------------------- | ---------- |
| UT-RAG-08-006 | GraphSearchStrategy queryType 伝播改善                | 中     | Phase 3 多角的チェック観点 / Phase 10 FU-01 | 未実施     |
| UT-RAG-08-007 | ILLMClient 型定義統一（UT-RAG-08-002 wave）           | 中     | Phase 10 FU-02                              | 未実施     |
| UT-RAG-08-008 | Graph global mode での communitySummarizer 活用仕上げ | 中     | Phase 3 多角的チェック観点 / Phase 10 FU-03 | 未実施     |

## 2. 各未タスクの概要

### UT-RAG-08-006: GraphSearchStrategy queryType 伝播改善

`HybridRAGEngine.search()` が分類した `queryType`（local / global / hybrid）を `GraphSearchStrategy` に伝播する経路が実装されていない制約を解消する。現状、グラフ検索は常に `local` モードのみで動作する。Global クエリでの community summary 活用を可能にするために `ISearchStrategy` の `SearchOptions` を拡張し、エンジンから戦略への伝播経路を追加する。

**発見元**: Phase 1 NFR-04 で必須要件から除外済みだったが、Phase 10 FU-01 で follow-up 候補として formalize 判定。

### UT-RAG-08-007: ILLMClient 型定義統一（UT-RAG-08-002 wave）

`crag/types.ts` と `llm/types.ts` に同名 `ILLMClient` が異なるシグネチャで定義されている。UT-RAG-08-002 では type alias で回避済みだが、将来の保守混乱を防ぐために統一型を定義し alias を削除する。

**注意**: `completed-tasks/` 配下の旧 wave に UT-RAG-08-005 が存在する（内容は実質同一）。着手前に UT-RAG-08-005 の実施状況を確認し、完了済みであれば本タスクをクローズすること。

**発見元**: Phase 10 FU-02 formalize。

### UT-RAG-08-008: Graph global mode での communitySummarizer 活用仕上げ

`FullHybridRAGConfig.communitySummarizer` 自体は実装済みで、Factory から `GraphSearchStrategy` への配線も完了している。残っているのは、UT-RAG-08-006 の queryType 伝播と組み合わせて global query 時に community summary を実際の探索経路で活用する仕上げである。

**発見元**: Phase 3 多角的チェック観点「community summary を global graph mode で最後まで活かせているか」の再判定結果から Phase 10 FU-03 として formalize。

## 3. P3準拠 3ステップ 完了状況

| ステップ | 内容                                                               | 状態 |
| -------- | ------------------------------------------------------------------ | ---- |
| Step 1   | `docs/30-workflows/unassigned-task/` に指示書ファイルを作成（3件） | 完了 |
| Step 2   | `task-workflow-backlog.md` 残課題テーブルに3件を登録               | 完了 |
| Step 3   | `rag-search-hybrid.md` に3件の参照リンクを追加                     | 完了 |

### Step 1: 作成済み指示書ファイル

| ファイルパス                                                                                 |
| -------------------------------------------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/task-rag-08-006-graph-query-type-propagation.md`          |
| `docs/30-workflows/unassigned-task/task-rag-08-007-illmclient-type-unification.md`           |
| `docs/30-workflows/unassigned-task/task-rag-08-008-community-summarizer-config-extension.md` |

### Step 2: task-workflow-backlog.md 登録確認

`.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の末尾に UT-RAG-08-006〜008 の3行を追加済み。

### Step 3: 関連仕様書 参照リンク追加確認

`.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md` の末尾「関連未タスク（UT-RAG-08-002 follow-up）」セクションに3件を登録済み。

## 4. FU-02（UT-RAG-08-007）と UT-RAG-08-005 の重複確認

`grep -rn "UT-RAG-08-005" docs/` の結果:

- `completed-tasks/.../task-rag-08-005-illmclient-type-unification.md` に指示書が存在（旧 wave）
- `docs/30-workflows/unassigned-task/` には UT-RAG-08-005 は未登録

UT-RAG-08-005 は旧ワークフロー（step-04-par-task-08）の成果物であり、ステータスは「未実施」のまま。本 wave（UT-RAG-08-002）の follow-up として改めて UT-RAG-08-007 として登録した。実施時に UT-RAG-08-005 の状態を再確認し、重複を避けること。

## 5. 推奨実施順序

```
UT-RAG-08-007（ILLMClient 型統一）
  ↓ 型が統一されると以降の alias コードが削除できる
UT-RAG-08-006（queryType 伝播）  ← UT-RAG-08-008 と並列実施可能
UT-RAG-08-008（communitySummarizer 活用仕上げ）
```
