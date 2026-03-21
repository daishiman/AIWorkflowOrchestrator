# Phase 12: ドキュメント - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `12 - ドキュメント`                                         |
| 前提Phase     | `Phase 11: 手動テスト`                                      |
| 次Phase       | `Phase 13: 完了`                                            |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-11/manual-test-result.md`                    |

## 目的

implementation guide・system spec sync・未タスク検出・skill feedback を same-wave で完了し、current runtime snapshot の変更を正本へ同期する。

## Pitfall 準拠ルール

- **P43 対策**: サブエージェントに委譲する場合は 3 ファイル以下/エージェントに分割する
- **P51 対策**: `documentation-changelog.md` は全 Task 完了後に記録する（実行前に「完了」と書かない）
- **P57 対策**: 設計成果物であっても `.claude/skills/` の実更新を先送りしない
- **P59 対策**: 並列エージェントで分担した場合でも、changelog はメインエージェントが統合して件数を照合する

## 実行タスク

- [x] Task 1: `implementation-guide.md` を Part 1 / Part 2 で作成する
- [x] Task 2: system spec を same-wave で同期する（Step 1-A 〜 Step 2）
- [x] Task 3: `documentation-changelog.md` と `system-spec-update-summary.md` を作成する（全 Task 完了後）
- [x] Task 4: `unassigned-task-report.md` を 0 件でも作成する
- [x] Task 5: `skill-feedback-report.md` を改善有無に関係なく作成する
- [x] `artifacts.json` と `outputs/artifacts.json` を同期する

## Task 1: 実装ガイド

### Part 1: 中学生レベル概念説明（日常例え必須）

以下の例えを使って `HybridRAGFactory` の仕組みを説明する:

- **工場の組み立てライン**: `createFull()` は全部品を搭載した高性能ライン（AI 分類・3 種検索・リランク・CRAG 全て入り）。`createLite()` は標準部品だけの基本ライン（ルールベース分類・3 種検索のみ）。
- **変換アダプター**: `KeywordSearchStrategyAdapter` はキーワード検索機を engine が理解できるコネクタ形式に変換する「変換アダプター」。
- **入荷チェック**: `validateFullConfig` は工場が組み立てを始める前に「必要な部品が全部揃っているか」を確認する入荷検査係。必要な部品（API キーや LLM クライアント）がなければ明確なエラーメッセージで止める。
- **3 種の AI エンジン**: `llmProvider`（分類係）、`rerankerLlmClient`（並び替え係）、`cragLlmClient`（間違い訂正係）はそれぞれ別の仕事をする別々のスタッフ。同じ人物を兼任させることもできるが、会社（factory）は必ず別々に紹介してもらう。

作成チェックリスト:

- [ ] 工場/組み立てラインの例えで `createFull()` / `createLite()` を説明している
- [ ] 変換アダプターの例えで `KeywordSearchStrategyAdapter` を説明している
- [ ] 入荷チェックの例えでバリデーションを説明している
- [ ] 3 種の LLM 系統を「別々のスタッフ」として説明している
- [ ] graph strategy の limitation（local mode のみ）を正直に説明している

### Part 2: 開発者向け実装詳細

- [ ] `FullHybridRAGConfig` の型定義と 3 LLM 系統分離の設計理由を説明する
- [ ] `KeywordSearchStrategyAdapter` の bridge 責務（`SearchQuery` 変換ルール）を説明する
- [ ] `validateFullConfig` の 4 条件と P62 / P42 準拠（`.trim()` バリデーション）を説明する
- [ ] `createReranker` の 4 分岐（cohere / voyage / llm / none）を説明する
- [ ] `createCrag` の条件分岐（`enableCRAG` + `cragLlmClient` 必須チェック）を説明する
- [ ] import alias（`RerankerLLMClient` / `CragLLMClient`）の設計理由を説明する
- [ ] 既知制約（KL-01: queryType 非伝播 / KL-02: ILLMClient 未統一）を説明する
- [ ] `createForTesting()` との設計的一貫性を説明する

## Task 2: system spec 同期

> **P57 警告**: 本 task では worktree 環境でも `.claude/skills/` を実更新する。計画文ではなく実績ログを残す。

### Step 1-A: タスク完了記録（2 ファイル同時更新）

- [x] `.claude/skills/aiworkflow-requirements/LOGS.md` にタスク完了記録を追加する
- [x] `.claude/skills/task-specification-creator/LOGS.md` にタスク完了記録を追加する（**P1/P25 対策: 2 ファイル両方必須**）
- [x] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新する（P29 対策）
- [x] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴テーブルを更新する（P29 対策）

### Step 1-B: 実装状況テーブル

- [x] `HybridRAGFactory` の実装ステータス変更を反映し、`guidance stub` / `FACTORY_NOT_READY` 前提を削除する

### Step 1-C: 関連タスクテーブル

- [x] 以下のコマンドで関連仕様書を検索して更新する:

```bash
grep -rn "UT-RAG-08-002" .claude/skills/aiworkflow-requirements/references/
grep -rn "HybridRAGFactory" .claude/skills/aiworkflow-requirements/references/
```

### Step 1-D: topic-map.md 再生成（P2 対策）

- [x] 以下のコマンドで再生成する:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [x] `indexes/topic-map.md` と `indexes/keywords.json` が更新されていることを確認する

### Step 2: domain spec sync

**必須（常に更新）:**

- [x] `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` を更新する（`FACTORY_NOT_READY` → 実配線完了に更新）
- [x] `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md` を更新する（factory 設計の最新状態を反映）
- [x] `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` を更新する（pipeline runtime snapshot を更新）

**条件付き（契約変更があった場合のみ）:**

- [ ] `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`（`ILLMProvider` 等の変更があれば）
- [ ] `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`（`ISearchStrategy` の変更があれば）
- [ ] `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`（`IKnowledgeGraphStore` の変更があれば）
- [ ] `.claude/skills/aiworkflow-requirements/references/rag-search-graph.md`（`GraphSearchStrategy` の変更があれば）
- [ ] `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`（`CRAGOptions` / `IWebSearcher` の変更があれば）
- [ ] `.claude/skills/aiworkflow-requirements/references/rag-services.md`（service inventory 更新が必要であれば）

**API 判定（変更なし）:**

- [x] `api-*.md` は `N/A` 判定を明記する（service / IPC / public API の変更なし）

**条件付きファイルの判定結果を記録する（更新不要なら理由を明示）:**

| ファイル                                  | 判定 | 理由                                        |
| ----------------------------------------- | ---- | ------------------------------------------- |
| `interfaces-rag.md`                       | N/A  | `ILLMProvider` 契約変更なし                 |
| `interfaces-rag-search.md`                | N/A  | `ISearchStrategy` 契約変更なし              |
| `interfaces-rag-knowledge-graph-store.md` | N/A  | `IKnowledgeGraphStore` 契約変更なし         |
| `rag-search-graph.md`                     | N/A  | GraphSearchStrategy 契約変更なし            |
| `rag-search-crag.md`                      | N/A  | `CRAGOptions` / `IWebSearcher` 契約変更なし |
| `rag-services.md`                         | 更新 | current inventory の stub 記述が stale      |

## Task 3: documentation-changelog / summary

> **P51 警告**: 全 Task が完了するまで documentation-changelog.md に「完了」と記載しない。

- [ ] `outputs/phase-12/documentation-changelog.md` を作成する
  - Step 1-A（LOGS.md 2 ファイル更新）の実績を記録する
  - Step 1-D（topic-map.md 再生成）の実績を記録する
  - Step 2（domain spec sync）の各ファイルの実施結果を記録する
  - API N/A 判定を記録する
- [ ] `outputs/phase-12/system-spec-update-summary.md` を作成する
  - 必須更新 3 ファイルの変更サマリーを記録する
  - 条件付きファイルの判定理由を記録する
- [ ] Task 4（未タスク件数）と照合してから changelog の件数を確定する（P59 対策）

## Task 4: 未タスク検出

> **P3 / P38 警告**: 0 件でも指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する。レポートだけでは不十分。

### 手順

1. Phase 10 の review 結果（follow-up FU-01〜FU-03）を確認する
2. `graph queryType` 伝播改善（FU-01）を未タスク化するか最終判定する
3. `ILLMClient` 統一（FU-02）を未タスク化するか最終判定する
4. 以下の 3 ステップを全て実施する（P58 対策: 設計 task でも省略不可）:
   1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
   2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録する
   3. 関連仕様書（`rag-search-hybrid.md` 等）に参照リンクを追加する
5. `outputs/phase-12/unassigned-task-report.md` を 0 件でも作成する

### unassigned-task-detection.md 更新

- [ ] `.claude/skills/aiworkflow-requirements/references/unassigned-task-detection.md` の件数・ステータスを更新する

### GitHub Issue の扱い（P56 対策）

- 再評価クローズした未タスクがある場合は `gh issue close <number> --comment "再評価クローズ: ..."` を実行する

## Task 5: skill feedback

> **P28 警告**: 改善点がない場合でも「改善点なし」としてレポートを作成する。

- [ ] `outputs/phase-12/skill-feedback-report.md` を作成する
- [ ] `task-specification-creator` への改善点を記録する（本 task ワークフローで気づいた点）
- [ ] `aiworkflow-requirements` への改善点を記録する（RAG domain spec で気づいた点）
- [ ] 改善点がない場合は「改善点なし」と明示する

## 参照資料

| 資料名                  | パス / 場所                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| spec-update workflow    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                                                                                                                                                                                                                                                                                                                  |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                                                                                                                                                                                                            |
| lessons learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                                                                                                                                                                                                                                                                                                                                  |
| architecture-rag        | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                                                                                                                                                                                                                                                                                                                                                         |
| rag-search-hybrid       | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                                                                                                                                                                                                                                                                                                                                                        |
| rag-query-pipeline      | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`                                                                                                                                                                                                                                                                                                                                                       |
| Phase 2 設計成果物      | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/design.md`                                                                                                                                                                                                                                                                                                                                                   |
| Phase 5 実装成果物      | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md`                                                                                                                                                                                                                                                                                                                                      |
| Phase 11 手動テスト結果 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-11/manual-test-result.md`                                                                                                                                                                                                                                                                                                                                      |
| pitfalls                | `.claude/rules/06-known-pitfalls.md#P1`, `.claude/rules/06-known-pitfalls.md#P2`, `.claude/rules/06-known-pitfalls.md#P3`, `.claude/rules/06-known-pitfalls.md#P28`, `.claude/rules/06-known-pitfalls.md#P43`, `.claude/rules/06-known-pitfalls.md#P51`, `.claude/rules/06-known-pitfalls.md#P56`, `.claude/rules/06-known-pitfalls.md#P57`, `.claude/rules/06-known-pitfalls.md#P58`, `.claude/rules/06-known-pitfalls.md#P59` |

## 実行手順

1. Phase 11 の成果物（`manual-test-result.md` / `command-transcript.md`）を確認する
2. Task 1: `implementation-guide.md` を Part 1 / Part 2 で作成する
3. Task 2 Step 1-A: LOGS.md 2 ファイルを更新する
4. Task 2 Step 1-B: 実装状況テーブルの更新有無を判定する
5. Task 2 Step 1-C: 関連タスクテーブルを grep で検索して更新する
6. Task 2 Step 1-D: `generate-index.js` で topic-map.md を再生成する
7. Task 2 Step 2: domain spec sync を実施する（必須 3 ファイル + 条件付きファイル判定）
8. Task 4: 未タスク検出を実施し 3 ステップを全て完了する
9. Task 5: skill feedback を作成する
10. Task 3: 全 Task 完了後に `documentation-changelog.md` と `system-spec-update-summary.md` を作成する（P51 対策）
11. `artifacts.json` と `outputs/artifacts.json` を同期する

> **P43 対策**: サブエージェントを使う場合は以下のように分割する
>
> - エージェント A: Task 1（implementation-guide.md）
> - エージェント B: Task 2 Step 2 の必須 3 ファイル（architecture-rag.md / rag-search-hybrid.md / rag-query-pipeline.md）
> - エージェント C: Task 2 Step 1（LOGS.md / SKILL.md / topic-map.md 再生成）
> - メインエージェント: Task 3 / Task 4 / Task 5（全エージェント完了後に統合）

## 成果物

| 成果物                   | パス                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| 実装ガイド               | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-12/implementation-guide.md`       |
| system spec 更新サマリー | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-12/system-spec-update-summary.md` |
| ドキュメント変更履歴     | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-12/documentation-changelog.md`    |
| 未タスク検出レポート     | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-12/unassigned-task-report.md`     |
| skill feedback           | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-12/skill-feedback-report.md`      |

## 完了条件

- [x] implementation-guide.md が Part 1（日常例え必須）/ Part 2 を含む
- [x] LOGS.md が 2 ファイル（aiworkflow-requirements / task-specification-creator）更新済み
- [x] SKILL.md 変更履歴が 2 ファイル更新済み（P29 対策）
- [x] topic-map.md が再生成済み（P2 対策）
- [x] 必須 3 ファイル（architecture-rag.md / rag-search-hybrid.md / rag-query-pipeline.md）の same-wave sync が実施済み
- [x] 条件付きファイルの判定結果が記録されている
- [x] API N/A 判定が記録されている
- [x] unassigned-task-report.md が 0 件でも作成されている（P3 対策）
- [x] 未タスクがある場合は 3 ステップ（指示書 / task-workflow 登録 / 関連仕様書リンク）が完了している
- [x] skill-feedback-report.md が作成されている（P28 対策）
- [x] `documentation-changelog.md` は全 Task 完了後に作成されている（P51 対策）
- [x] `documentation-changelog.md` の未タスク件数が `unassigned-task-report.md` と一致している（P59 対策）
- [x] `artifacts.json` と `outputs/artifacts.json` が同期している

## 多角的チェック観点（AIが判断）

1. `rag-services.md` を更新対象に含めるか follow-up に残すかの判定根拠があるか。
2. graph queryType limitation を未タスクに切るべきかの判定が Phase 10 FU-01 と一致しているか。
3. worktree でも `.claude/skills/` 更新を先送りせず実施したか（P57 対策）。
4. documentation-changelog を全 Task 完了前に「完了」と記載していないか（P51 対策）。
5. サブエージェントを使った場合、changelog の件数が各サブエージェントの成果物と一致しているか（P59 対策）。

## タスク100%実行確認【必須】

- [x] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [x] same-wave sync の対象漏れがないことを確認した（必須 3 ファイル + 条件付き判定）
- [x] 未タスク管理の 3 ステップが全て完了していることを確認した（P3 対策）
- [x] documentation-changelog が全 Task 完了後に作成されていることを確認した（P51 対策）
- [x] Phase 13 へ blocked 状態を引き継げることを確認した

## 次Phase

Phase 13: 完了 → `phase-13-pr-creation.md`
