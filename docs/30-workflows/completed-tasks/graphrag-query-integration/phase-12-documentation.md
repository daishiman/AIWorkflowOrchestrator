# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11                   |
| 後続Phase  | Phase 13                   |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

Phase 12では以下の3つの必須作業を行う：

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **未タスク検出**: 技術的負債の可視化と継続的改善

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（Part 1: 概念的説明）【必須】

**目的**: 初学者・非技術者向けに、機能を概念的に説明するドキュメントを作成する

**実行手順**:

1. 概念的な説明を作成する（中学生でもわかる版）

```markdown
<!-- outputs/phase-12/implementation-guide.md - Part 1 -->

# GraphRAGクエリ統合 実装ガイド

## Part 1: 概念的な説明

### 例え話で理解する

GraphRAGクエリ統合とは、「図書館の司書が本を探すときに、本棚ごとの要約メモを活用する」ようなものです。

**従来の方法**:

- 司書（システム）が本（情報）を1冊ずつ確認して探す
- 時間がかかり、全体像が見えにくい

**新しい方法（コミュニティ要約統合）**:

- 各本棚（コミュニティ）に「この棚にはこんな本がある」という要約メモがある
- 司書はまず要約メモを見て、関連しそうな本棚を素早く特定
- 関連する本棚の情報を使って、より的確な回答を生成

### なぜこの機能が必要か

1. **回答品質の向上**: 関連する情報をグループ化して把握することで、より包括的な回答が可能
2. **処理効率の改善**: 要約を活用することで、不要な検索を減らせる
3. **階層的な情報活用**: 概要から詳細まで、適切な粒度の情報を選択できる

### 全体の流れ（図解）

\`\`\`
ユーザークエリ
↓
[1] クエリを分析
↓
[2] 関連するコミュニティ要約を検索
↓
[3] 要約をコンテキストとしてLLMに渡す
↓
[4] より質の高い回答を生成
↓
ユーザーへ回答を返す
\`\`\`
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md` (Part 1セクション)

---

### タスク2: 実装ガイド作成（Part 2: 技術的詳細）【必須】

**目的**: 開発者・技術者向けに、実装の詳細を説明するドキュメントを作成する

**実行手順**:

1. 技術的な詳細を追記する

```markdown
<!-- outputs/phase-12/implementation-guide.md - Part 2 -->

## Part 2: 技術的な詳細

### アーキテクチャ

\`\`\`
┌─────────────────────────────────────────────────────┐
│ GraphRAGQueryService │
├─────────────────────────────────────────────────────┤
│ │
│ ┌──────────────┐ ┌──────────────────────────┐ │
│ │ query() │───→│ ICommunitySummarizer │ │
│ └──────────────┘ │ .searchSummaries() │ │
│ │ └──────────────────────────┘ │
│ │ │ │
│ ↓ ↓ │
│ ┌──────────────┐ ┌──────────────────────────┐ │
│ │ buildPrompt()│←───│ CommunitySummaryReference│ │
│ └──────────────┘ └──────────────────────────┘ │
│ │ │
│ ↓ │
│ ┌──────────────┐ │
│ │ ILLMProvider │ │
│ │ .chat() │ │
│ └──────────────┘ │
│ │
└─────────────────────────────────────────────────────┘
\`\`\`

### データフロー

1. **入力**: ユーザークエリ + オプション
2. **バリデーション**: Zodスキーマでオプションを検証
3. **検索**: ICommunitySummarizer.searchSummaries()でコミュニティ要約を取得
4. **フィルタリング**: confidence閾値でフィルタリング
5. **プロンプト構築**: 要約をコンテキストとして組み込み
6. **回答生成**: ILLMProvider.chat()で回答生成
7. **出力**: Result<GraphRAGQueryResponse, GraphRAGQueryError>

### 主要インターフェース

\`\`\`typescript
interface IGraphRAGQueryService {
query(
query: string,
options?: GraphRAGQueryOptions
): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}
\`\`\`

### エラーハンドリング設計

| エラー種別           | 対処方法                 | 理由                           |
| -------------------- | ------------------------ | ------------------------------ |
| コミュニティ検索失敗 | フォールバック（空配列） | クエリ処理を継続可能にするため |
| LLM生成失敗          | エラー返却               | 回答生成は必須のため           |
| バリデーション失敗   | エラー返却               | 不正な入力は早期に拒否         |

### 用語集

| 用語         | 読み方         | 意味                                                          |
| ------------ | -------------- | ------------------------------------------------------------- |
| GraphRAG     | グラフラグ     | Graph Retrieval-Augmented Generation。グラフ構造を活用したRAG |
| Community    | コミュニティ   | 意味的に関連するエンティティのクラスタ                        |
| confidence   | コンフィデンス | 検索結果の確信度（0-1）                                       |
| Result<T, E> | リザルト       | 成功/失敗を表す型パターン                                     |
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md` (Part 2セクション追記)

---

### タスク3: システムドキュメント更新

**目的**: 既存システムドキュメントを更新し、aiworkflow-requirementsに反映する

**実行手順**:

1. aiworkflow-requirementsの更新が必要か確認する

| 更新対象             | パス                                                                         | 更新内容                 |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | GraphRAGQueryService追記 |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | 新型定義追記             |

2. 更新内容を記録する

```markdown
<!-- outputs/phase-12/documentation-update-log.md -->

# ドキュメント更新記録

## 更新日時

2026-01-XX

## 更新ファイル一覧

| ファイル                 | 更新種別 | 更新内容                                          |
| ------------------------ | -------- | ------------------------------------------------- |
| architecture-rag.md      | 追記     | GraphRAGQueryService統合の説明追加                |
| interfaces-rag-search.md | 追記     | GraphRAGQueryOptions, GraphRAGQueryResponse型追加 |

## 詳細

...
```

**期待される成果物**:

- 更新されたaiworkflow-requirements（該当時）
- `outputs/phase-12/documentation-update-log.md`

---

### タスク4: 未タスク検出【必須】

**目的**: 残課題を検出し、未完了タスク指示書を作成する

**実行手順**:

1. 未タスクソースを確認する

| #   | ソース                 | 確認項目                      | Grepパターン                                                             |
| --- | ---------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                                       |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                                                      |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                                      |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                               |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/search/` |

2. 未タスク検出レポートを作成する

```markdown
<!-- outputs/phase-12/unassigned-task-report.md -->

# 未タスク検出レポート

## 検出日時

2026-01-XX

## 検出結果サマリー

| ソース                    | 検出数  |
| ------------------------- | ------- |
| Phase 3レビュー（MINOR）  | X件     |
| Phase 10レビュー（MINOR） | X件     |
| Phase 11手動テスト        | X件     |
| コードベースTODO          | X件     |
| **合計**                  | **X件** |

## 検出された未タスク一覧

### 1. [タスク名]

- **検出元**: Phase X
- **内容**: ...
- **優先度**: 高/中/低
- **見積もり**: 小/中/大

（該当がない場合は「検出された未タスクはありません」と記載）
```

3. 検出された未タスクに対して指示書を作成する（該当時）

```bash
# 未タスク指示書の配置先
docs/30-workflows/unassigned-task/task-XX-XX-[タスク名].md
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`【必須】
- 未タスク指示書（該当時）

---

### タスク5: API仕様書の作成

**目的**: GraphRAGQueryService のAPI仕様書を作成する

**実行手順**:

1. API仕様書を作成する

````markdown
<!-- packages/shared/docs/api/graphrag-query-service.md -->

# GraphRAGQueryService API仕様書

## 概要

GraphRAGQueryServiceは、コミュニティ要約を活用したRAGクエリ処理を提供するサービスです。

## インターフェース

### IGraphRAGQueryService

```typescript
interface IGraphRAGQueryService {
  query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}
```
````

### GraphRAGQueryOptions

| パラメータ             | 型            | デフォルト | 説明                          |
| ---------------------- | ------------- | ---------- | ----------------------------- |
| limit                  | number        | 10         | 最大検索結果数（1-20）        |
| communityLevel         | number        | -          | コミュニティ階層レベル（0-5） |
| confidenceThreshold    | number        | 0.5        | confidence閾値（0-1）         |
| searchWeights          | SearchWeights | -          | 検索戦略の重み                |
| enableCommunitySummary | boolean       | true       | コミュニティ要約検索を有効化  |

### GraphRAGQueryResponse

| フィールド         | 型                          | 説明                     |
| ------------------ | --------------------------- | ------------------------ |
| answer             | string                      | 生成された回答テキスト   |
| communitySummaries | CommunitySummaryReference[] | 参照したコミュニティ要約 |
| chunks             | ChunkReference[]            | 参照したチャンク         |
| entities           | EntityReference[]           | 参照したエンティティ     |
| metadata           | QueryMetadata               | 処理メタデータ           |

### GraphRAGQueryError

| コード                  | 説明                   |
| ----------------------- | ---------------------- |
| EMBEDDING_FAILED        | 埋め込み生成に失敗     |
| COMMUNITY_SEARCH_FAILED | コミュニティ検索に失敗 |
| HYBRID_SEARCH_FAILED    | ハイブリッド検索に失敗 |
| LLM_GENERATION_FAILED   | LLM回答生成に失敗      |
| INVALID_QUERY           | 無効なクエリ           |

## 使用例

### 基本的な使用

```typescript
import { GraphRAGQueryService } from "@repo/shared";

const service = new GraphRAGQueryService({
  communitySummarizer,
  queryClassifier,
  embeddingProvider,
  llmProvider,
});

const result = await service.query("プロジェクトの概要を教えてください");

if (result.success) {
  console.log(result.data.answer);
} else {
  console.error(result.error.code, result.error.message);
}
```

### オプション指定

```typescript
const result = await service.query("認証機能について詳しく教えてください", {
  limit: 5,
  confidenceThreshold: 0.7,
  communityLevel: 2,
});
```

````

2. 仕様書の完全性を確認する

| 確認項目                 | 記載状況 | 判定 |
| ------------------------ | -------- | ---- |
| インターフェース定義     | ?        | ?    |
| 全パラメータの説明       | ?        | ?    |
| 戻り値の説明             | ?        | ?    |
| エラーコードの説明       | ?        | ?    |
| 使用例                   | ?        | ?    |

**期待される成果物**:

- `packages/shared/docs/api/graphrag-query-service.md`

---

### タスク6: TSDocコメントの追加

**目的**: ソースコードにTSDocコメントを追加する

**実行手順**:

1. インターフェースにTSDocを追加する

```typescript
// packages/shared/src/services/search/interfaces/graphrag-query-service.ts

/**
 * GraphRAGクエリサービスインターフェース
 *
 * コミュニティ要約を活用したRAGクエリ処理を提供します。
 *
 * @example
 * ```typescript
 * const service = new GraphRAGQueryService(dependencies);
 * const result = await service.query("質問テキスト");
 * ```
 */
export interface IGraphRAGQueryService {
  /**
   * GraphRAGクエリを実行し、コミュニティ要約を含む回答を生成
   *
   * @param query - ユーザークエリ（空文字不可）
   * @param options - クエリオプション（省略可）
   * @returns 回答レスポンスまたはエラー
   *
   * @example
   * ```typescript
   * const result = await service.query("プロジェクトの概要は？", { limit: 5 });
   * if (result.success) {
   *   console.log(result.data.answer);
   * }
   * ```
   */
  query(
    query: string,
    options?: GraphRAGQueryOptions
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}
````

2. 型定義にTSDocを追加する

```typescript
// packages/shared/src/services/search/types/graphrag-query.ts

/**
 * GraphRAGクエリオプション
 *
 * クエリ実行時の動作をカスタマイズするためのオプションです。
 */
export interface GraphRAGQueryOptions {
  /**
   * 最大検索結果数
   * @minimum 1
   * @maximum 20
   * @default 10
   */
  limit?: number;

  /**
   * コミュニティ階層レベル（指定時はそのレベルのみ検索）
   * @minimum 0
   * @maximum 5
   */
  communityLevel?: number;

  /**
   * 要約のconfidence閾値（これ以下は除外）
   * @minimum 0
   * @maximum 1
   * @default 0.5
   */
  confidenceThreshold?: number;

  /**
   * 検索戦略の重み
   */
  searchWeights?: SearchWeights;

  /**
   * コミュニティ要約検索を有効化
   * @default true
   */
  enableCommunitySummary?: boolean;
}
```

3. TSDocの適用を確認する

| ファイル                             | TSDoc追加 | 判定 |
| ------------------------------------ | --------- | ---- |
| graphrag-query-service.ts            | ?         | ?    |
| interfaces/graphrag-query-service.ts | ?         | ?    |
| types/graphrag-query.ts              | ?         | ?    |
| schemas/graphrag-query.ts            | ?         | ?    |

**期待される成果物**:

- TSDocコメント追加済みソースコード

---

### タスク7: READMEの更新

**目的**: パッケージのREADMEにGraphRAGクエリサービスの情報を追加する

**実行手順**:

1. `packages/shared/README.md` を更新する

````markdown
## GraphRAG Query Service

コミュニティ要約を活用したRAGクエリ処理を提供します。

### インストール

```bash
pnpm add @repo/shared
```
````

### 使用方法

```typescript
import { GraphRAGQueryService } from "@repo/shared";

// サービスの初期化
const service = new GraphRAGQueryService({
  communitySummarizer, // ICommunitySummarizer
  queryClassifier, // IQueryClassifier
  embeddingProvider, // IEmbeddingProvider
  llmProvider, // ILLMProvider
});

// クエリの実行
const result = await service.query("質問テキスト");

if (result.success) {
  console.log("回答:", result.data.answer);
  console.log("参照コミュニティ数:", result.data.communitySummaries.length);
}
```

### 詳細

詳細なAPI仕様は [API仕様書](./docs/api/graphrag-query-service.md) を参照してください。

````

2. README更新の確認

| 確認項目             | 記載状況 | 判定 |
| -------------------- | -------- | ---- |
| 機能概要             | ?        | ?    |
| インストール方法     | ?        | ?    |
| 基本的な使用例       | ?        | ?    |
| 詳細ドキュメントリンク | ?      | ?    |

**期待される成果物**:

- 更新された `packages/shared/README.md`

---

### タスク8: 変更履歴の記録

**目的**: CHANGELOGに変更内容を記録する

**実行手順**:

1. `CHANGELOG.md` に追記する

```markdown
## [Unreleased]

### Added

- GraphRAGQueryService: コミュニティ要約を活用したRAGクエリサービス
  - `IGraphRAGQueryService` インターフェース
  - `GraphRAGQueryOptions` クエリオプション
  - `GraphRAGQueryResponse` レスポンス型
  - `ICommunitySummarizer.searchSummaries()` との統合
  - 階層別コミュニティ要約検索
  - confidence閾値フィルタリング
  - エラーハンドリング（フォールバック処理）
````

2. 変更履歴の確認

| 確認項目     | 記載状況 | 判定 |
| ------------ | -------- | ---- |
| 新機能の説明 | ?        | ?    |
| 主要な変更点 | ?        | ?    |
| 破壊的変更   | ?        | ?    |

**期待される成果物**:

- 更新された `CHANGELOG.md`

---

### タスク9: ドキュメントレビュー

**目的**: 作成したドキュメントの品質を確認する

**実行手順**:

1. ドキュメント品質チェック

| 確認項目       | 基準                     | 状況 | 判定 |
| -------------- | ------------------------ | ---- | ---- |
| 正確性         | 実装と一致している       | ?    | ?    |
| 完全性         | 必要情報が網羅されている | ?    | ?    |
| 可読性         | 読みやすい文章           | ?    | ?    |
| 例の動作確認   | 例が正しく動作する       | ?    | ?    |
| リンクの有効性 | リンク切れがない         | ?    | ?    |

2. ドキュメント成果物リスト

| ドキュメント  | パス                                                 | 状況 |
| ------------- | ---------------------------------------------------- | ---- |
| API仕様書     | `packages/shared/docs/api/graphrag-query-service.md` | ?    |
| TSDocコメント | ソースコード内                                       | ?    |
| README        | `packages/shared/README.md`                          | ?    |
| CHANGELOG     | `CHANGELOG.md`                                       | ?    |

**期待される成果物**:

- `outputs/phase-12/documentation-checklist.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> ドキュメント作成時に以下のシステム仕様を参照してください。

| 参照資料             | パス                                                                                          | 内容          |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------- |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | API仕様の参照 |
| 検索型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | 型定義の参照  |

---

## 成果物

| 成果物               | パス                                                 | 内容                               | 必須 |
| -------------------- | ---------------------------------------------------- | ---------------------------------- | ---- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`           | Part 1（概念的）+ Part 2（技術的） | ✅   |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md`       | システムドキュメント更新履歴       | ✅   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`         | 残課題検出結果（なしでも出力）     | ✅   |
| API仕様書            | `packages/shared/docs/api/graphrag-query-service.md` | 完全なAPI仕様                      |      |
| TSDocコメント        | ソースコード内                                       | インラインドキュメント             |      |
| README更新           | `packages/shared/README.md`                          | 使用方法追記                       |      |
| CHANGELOG更新        | `CHANGELOG.md`                                       | 変更履歴追記                       |      |
| ドキュメントチェック | `outputs/phase-12/documentation-checklist.md`        | 品質確認結果                       |      |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`             | 検出された未タスクの指示書         | 条件 |

---

## 完了条件

### 必須成果物

- [ ] **実装ガイド（Part 1: 概念的説明）が作成されている**【必須】
- [ ] **実装ガイド（Part 2: 技術的詳細）が作成されている**【必須】
- [ ] **ドキュメント更新履歴が出力されている**【必須】
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

### その他の成果物

- [ ] API仕様書が作成されている
- [ ] TSDocコメントが追加されている
- [ ] READMEが更新されている
- [ ] CHANGELOGが更新されている
- [ ] ドキュメントの正確性が確認されている
- [ ] 使用例が動作確認されている
- [ ] `outputs/phase-12/documentation-checklist.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-13-pr-creation.md`
