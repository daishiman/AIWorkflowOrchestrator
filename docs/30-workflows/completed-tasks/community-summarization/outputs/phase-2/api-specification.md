# API仕様書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 2（設計）            |

---

## 1. ICommunitySummarizer インターフェース

### 1.1 インターフェース定義

````typescript
// packages/shared/src/services/graph/interfaces/community-summarizer.interface.ts

import type { Result } from "@/types/result";
import type { Community, CommunityStructure, CommunityId } from "./types";
import type { StoredEntity, StoredRelation } from "../knowledge-graph-store";
import type {
  CommunitySummary,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "../types";

/**
 * コミュニティ要約生成サービスのインターフェース
 *
 * @description
 * Leidenアルゴリズムで検出されたコミュニティに対してLLMで要約を生成し、
 * グローバルクエリへの回答に使用できる形式で保存する。
 * 要約の埋め込みも生成してセマンティック検索を可能にする。
 */
export interface ICommunitySummarizer {
  /**
   * 単一コミュニティの要約を生成
   *
   * @param community - 要約対象のコミュニティ
   * @param entities - コミュニティ内のエンティティ
   * @param relations - コミュニティ内の関係
   * @param options - 要約生成オプション
   * @returns 生成された要約、またはエラー
   *
   * @example
   * ```typescript
   * const result = await summarizer.summarize(
   *   community,
   *   entities,
   *   relations,
   *   { summaryStyle: "technical" }
   * );
   * if (result.ok) {
   *   console.log(result.value.summary);
   * }
   * ```
   */
  summarize(
    community: Community,
    entities: StoredEntity[],
    relations: StoredRelation[],
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummary, Error>>;

  /**
   * 全コミュニティの要約を生成（階層順）
   *
   * @param communityStructure - コミュニティ構造（全コミュニティを含む）
   * @param options - 要約生成オプション
   * @returns 全要約の生成結果、またはエラー
   *
   * @description
   * 階層の深い順（子→親）に処理することで、親コミュニティの要約に
   * 子コミュニティの要約を活用できる。
   *
   * @example
   * ```typescript
   * const result = await summarizer.summarizeAll(structure, {
   *   maxConcurrency: 5,
   *   useChildSummaries: true,
   * });
   * if (result.ok) {
   *   console.log(`Generated ${result.value.summaries.length} summaries`);
   *   console.log(`Failed: ${result.value.failedCommunities.length}`);
   * }
   * ```
   */
  summarizeAll(
    communityStructure: CommunityStructure,
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummarizationResult, Error>>;

  /**
   * コミュニティ要約をセマンティック検索
   *
   * @param query - 検索クエリ文字列
   * @param options - 検索オプション（レベル指定、結果数制限）
   * @returns 類似度順にソートされた要約の配列、またはエラー
   *
   * @description
   * クエリの埋め込みを生成し、要約の埋め込みとのコサイン距離で
   * 類似検索を行う。レベル指定で特定階層のみに絞り込める。
   *
   * @example
   * ```typescript
   * const result = await summarizer.searchSummaries(
   *   "プログラミング言語の特徴",
   *   { level: 0, limit: 5 }
   * );
   * if (result.ok) {
   *   result.value.forEach(s => console.log(s.summary));
   * }
   * ```
   */
  searchSummaries(
    query: string,
    options?: { level?: number; limit?: number },
  ): Promise<Result<CommunitySummary[], Error>>;

  /**
   * 要約を更新（グラフ変更時）
   *
   * @param communityId - 更新対象のコミュニティID
   * @returns 更新された要約、またはエラー
   *
   * @description
   * コミュニティの情報を再取得し、要約を再生成する。
   * グラフに変更があった場合の再計算に使用。
   *
   * @example
   * ```typescript
   * const result = await summarizer.updateSummary(communityId);
   * if (result.ok) {
   *   console.log(`Updated: ${result.value.createdAt}`);
   * }
   * ```
   */
  updateSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary, Error>>;
}
````

---

## 2. メソッド詳細仕様

### 2.1 summarize()

| 項目   | 内容                                                  |
| ------ | ----------------------------------------------------- |
| 目的   | 単一コミュニティに対してLLMで要約を生成する           |
| 入力   | Community, StoredEntity[], StoredRelation[], options? |
| 出力   | Result<CommunitySummary, Error>                       |
| 副作用 | ICommunityRepository.updateSummary()でDB保存          |

**処理フロー**:

1. オプションをデフォルト値とマージ
2. useChildSummaries=true かつ子コミュニティがある場合、子の要約を取得
3. `buildCommunitySummaryPrompt()` でプロンプト構築
4. `ILLMProvider.generate()` で要約生成（temperature=0.3, JSON形式）
5. レスポンスをJSONパース
6. generateEmbedding=true の場合、`IEmbeddingProvider.embedSingle()` で埋め込み生成
7. CommunitySummary オブジェクト構築
8. `ICommunityRepository.updateSummary()` でDB保存
9. Result.ok(summary) を返却

**エラーケース**:

| エラー条件      | 戻り値                                  |
| --------------- | --------------------------------------- |
| LLM呼び出し失敗 | Result.err(LLMエラー)                   |
| JSONパース失敗  | Result.err("No JSON found in response") |
| DB保存失敗      | Result.err(DBエラー)                    |

### 2.2 summarizeAll()

| 項目   | 内容                                            |
| ------ | ----------------------------------------------- |
| 目的   | 全コミュニティの要約を階層順（子→親）で生成する |
| 入力   | CommunityStructure, options?                    |
| 出力   | Result<CommunitySummarizationResult, Error>     |
| 副作用 | 各コミュニティの要約がDB保存される              |

**処理フロー**:

1. コミュニティをレベル降順でソート（level: 2→1→0）
2. maxConcurrency でチャンク分割
3. 各チャンクを並列処理
   - 各コミュニティについて:
     - IKnowledgeGraphStore からエンティティ・関係取得
     - summarize() 呼び出し
4. 成功/失敗を集計
5. CommunitySummarizationResult を返却

**部分失敗の処理**:

- 一部コミュニティが失敗しても処理を継続
- 成功した要約は `summaries[]` に格納
- 失敗したコミュニティIDは `failedCommunities[]` に格納
- 全体としては Result.ok を返却

### 2.3 searchSummaries()

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 目的   | クエリに類似した要約をセマンティック検索する |
| 入力   | query: string, options?: { level?, limit? }  |
| 出力   | Result<CommunitySummary[], Error>            |
| 副作用 | なし                                         |

**処理フロー**:

1. `IEmbeddingProvider.embedSingle(query)` でクエリ埋め込み生成
2. SQLでベクトル類似検索（コサイン距離）
3. level指定がある場合はフィルタリング
4. limit件数で結果制限
5. Result.ok(summaries) を返却

**SQLクエリ例**:

```sql
SELECT c.*, cs.summary, cs.keywords, cs.embedding
FROM communities c
JOIN community_summaries cs ON c.id = cs.community_id
WHERE cs.embedding IS NOT NULL
  AND c.level = ?  -- level指定時のみ
ORDER BY vector_distance_cos(cs.embedding, ?) ASC
LIMIT ?
```

### 2.4 updateSummary()

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 目的   | 既存コミュニティの要約を再生成する           |
| 入力   | communityId: CommunityId                     |
| 出力   | Result<CommunitySummary, Error>              |
| 副作用 | ICommunityRepository.updateSummary()でDB更新 |

**処理フロー**:

1. `ICommunityRepository.findById(communityId)` でコミュニティ取得
2. コミュニティが存在しない場合は Result.err("Community not found")
3. IKnowledgeGraphStore からエンティティ・関係取得
4. summarize() を呼び出して再生成
5. 結果を返却

---

## 3. エラー型定義

```typescript
/**
 * コミュニティ要約生成のエラー型
 */
export class CommunitySummarizationError extends Error {
  constructor(
    message: string,
    public readonly code: CommunitySummarizationErrorCode,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "CommunitySummarizationError";
  }
}

export type CommunitySummarizationErrorCode =
  | "LLM_GENERATION_FAILED" // LLM呼び出し失敗
  | "JSON_PARSE_FAILED" // JSONパース失敗
  | "EMBEDDING_FAILED" // 埋め込み生成失敗（警告レベル）
  | "COMMUNITY_NOT_FOUND" // コミュニティが見つからない
  | "GRAPH_DATA_LOAD_FAILED" // グラフデータ読み込み失敗
  | "DB_SAVE_FAILED"; // DB保存失敗
```

---

## 4. オプションパラメータ

### 4.1 CommunitySummarizationOptions

| パラメータ        | 型      | デフォルト | 説明                                       |
| ----------------- | ------- | ---------- | ------------------------------------------ |
| maxSummaryTokens  | number  | 200        | 要約の最大トークン数                       |
| maxKeywords       | number  | 10         | キーワードの最大数                         |
| useChildSummaries | boolean | true       | 子コミュニティの要約を使用                 |
| generateEmbedding | boolean | true       | 要約の埋め込みを生成                       |
| maxConcurrency    | number  | 5          | 並列処理の最大数                           |
| summaryStyle      | string  | "concise"  | 要約スタイル（detailed/concise/technical） |

### 4.2 検索オプション

| パラメータ | 型     | デフォルト | 説明                 |
| ---------- | ------ | ---------- | -------------------- |
| level      | number | undefined  | 検索対象の階層レベル |
| limit      | number | 10         | 返却する最大結果数   |

---

## 完了条件

- [x] ICommunitySummarizerインターフェースが定義されている
- [x] 全メソッドのシグネチャが定義されている
- [x] 各メソッドの責務が明確に記述されている
- [x] エラー処理パターン（Result型）が定義されている
- [x] オプションパラメータが定義されている
- [x] JSDocコメントが記述されている
