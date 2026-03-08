# Knowledge Graph型定義（RAG実装）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-rag.md](./architecture-rag.md)

---

## 概要

GraphRAG（Graph Retrieval-Augmented Generation）のKnowledge Graph構造を型安全に実装するための型定義群。
Entity-Relation-Communityモデルに基づき、文書から抽出されたエンティティ、関係性、コミュニティを表現する。

**実装場所**: `packages/shared/src/types/rag/graph/`

---

## 主要型定義

| 型名             | カテゴリ     | 説明                                       |
| ---------------- | ------------ | ------------------------------------------ |
| EntityEntity     | Entity       | Knowledge Graphのノード（頂点）を表現      |
| RelationEntity   | Entity       | Knowledge Graphのエッジ（辺）を表現        |
| CommunityEntity  | Entity       | 意味的に関連するエンティティ群のクラスター |
| EntityMention    | Value Object | エンティティの文書内出現位置               |
| RelationEvidence | Value Object | 関係の出典チャンク情報                     |
| GraphStatistics  | Value Object | Knowledge Graph全体の統計情報              |

---

## EntityEntity型（ノード）

Knowledge Graphのノード（頂点）を表現するEntity型。

**主要プロパティ**:

| プロパティ     | 型                   | 説明                                      |
| -------------- | -------------------- | ----------------------------------------- |
| id             | EntityId             | エンティティ一意識別子（UUID）            |
| name           | string               | エンティティ名（元の形式）                |
| normalizedName | string               | 正規化されたエンティティ名                |
| type           | EntityType           | エンティティタイプ（52種類）              |
| embedding      | Float32Array \| null | ベクトル埋め込み（512/768/1024/1536次元） |
| importance     | number               | 重要度スコア（0.0〜1.0）                  |
| aliases        | string[]             | 別名・エイリアス                          |

**エンティティタイプ（52種類、10カテゴリ）**:

1. 人物・組織: person, organization, role, team（4種類）
2. 場所・時間: location, date, event（3種類）
3. ビジネス・経営: company, product, service, brand, strategy, metric, business_process, market, customer（9種類）
4. 技術全般: technology, tool, method, standard, protocol（5種類）
5. コード・ソフトウェア: programming_language, framework, library, api, function, class, module（7種類）
6. 抽象概念: concept, theory, principle, pattern, model（5種類）
7. ドキュメント構造: document, chapter, section, paragraph, heading（5種類）
8. ドキュメント要素: keyword, summary, figure, table, list, quote, code_snippet, formula, example（9種類）
9. メディア: image, video, audio, diagram（4種類）
10. その他: other（1種類）

---

## RelationEntity型（エッジ）

Knowledge Graphのエッジ（辺）を表現するEntity型。

**主要プロパティ**:

| プロパティ    | 型                 | 説明                      |
| ------------- | ------------------ | ------------------------- |
| id            | RelationId         | 関係一意識別子（UUID）    |
| sourceId      | EntityId           | 始点エンティティID        |
| targetId      | EntityId           | 終点エンティティID        |
| type          | RelationType       | 関係タイプ（15種類）      |
| weight        | number             | 関係の強さ（0.0〜1.0）    |
| bidirectional | boolean            | 双方向関係かどうか        |
| evidence      | RelationEvidence[] | 関係の証拠（必須1件以上） |

**関係タイプ（15種類、5カテゴリ）**:

1. 一般関係: related_to, part_of, has_part, belongs_to（4種類）
2. コード関係: uses, implements, extends, depends_on（4種類）
3. 参照関係: references, defines（2種類）
4. 階層関係: contains, contained_by（2種類）
5. 時間・作成関係: precedes, follows, created_by（3種類）

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

**制約**:

- Self-loop禁止: `sourceId !== targetId`
- Evidence必須: 最低1件の証拠が必要

---

## CommunityEntity型（クラスター）

意味的に関連するエンティティ群のクラスター（Leiden Algorithm）。

**主要プロパティ**:

| プロパティ      | 型                  | 説明                              |
| --------------- | ------------------- | --------------------------------- |
| id              | CommunityId         | コミュニティ一意識別子（UUID）    |
| level           | number              | 階層レベル（0=ルート）            |
| parentId        | CommunityId \| null | 親コミュニティID（level 0はnull） |
| memberEntityIds | EntityId[]          | メンバーエンティティID配列        |
| memberCount     | number              | メンバー数                        |
| summary         | string              | コミュニティ要約（最大2000文字）  |

**階層制約**:

- level 0の場合: `parentId === null`（ルートコミュニティ）
- level > 0の場合: `parentId !== null`（サブコミュニティ）

---

## バリデーション（Zod）

すべてのEntity型にZodスキーマを定義し、ランタイムバリデーションを実装。

**実装ファイル**: `packages/shared/src/types/rag/graph/schemas.ts`

**カスタムバリデーション例**:

- Embedding次元数チェック: [512, 768, 1024, 1536]のいずれか
- Self-loop禁止: `sourceId !== targetId`
- 配列長一致: `memberCount === memberEntityIds.length`
- 階層制約: level 0は`parentId === null`

---

## ユーティリティ関数

**実装ファイル**: `packages/shared/src/types/rag/graph/utils.ts`

| 関数名                    | 説明                                             |
| ------------------------- | ------------------------------------------------ |
| normalizeEntityName       | エンティティ名の正規化（小文字化、特殊文字除去） |
| getInverseRelationType    | 関係タイプの逆関係取得（uses ⇄ used_by）         |
| calculateEntityImportance | 簡易PageRankによる重要度計算                     |
| generateCommunityName     | コミュニティ名の自動生成                         |
| getEntityTypeCategory     | エンティティタイプのカテゴリ取得                 |
| calculateGraphDensity     | グラフ密度の計算                                 |

---

## 型安全性の保証

| 保証項目       | 実装方法                                                 |
| -------------- | -------------------------------------------------------- |
| 一意識別子     | Branded Type（EntityId, RelationId, CommunityId）        |
| 列挙型         | Union型 + 定数オブジェクト（EntityTypes, RelationTypes） |
| 境界値         | Zodスキーマによる範囲制約（0.0〜1.0）                    |
| 必須フィールド | TypeScript readonly + Zod required                       |
| カスタム制約   | Zod refine()による独自ロジック                           |

---

## テストカバレッジ

| ファイル   | カバレッジ                                         |
| ---------- | -------------------------------------------------- |
| types.ts   | 100% (Statements/Functions/Lines), 100% (Branches) |
| schemas.ts | 100% (Statements/Functions/Lines), 100% (Branches) |
| utils.ts   | 100% (Statements/Functions), 94.73% (Branches)     |

**総合カバレッジ**: 99.2%（目標80%を19.2%超過達成）

**総テスト数**: 230ケース（正常系・異常系・境界値）

---

## 関連ドキュメント

- [RAGアーキテクチャ概要](./architecture-rag.md)
- [ベクトル検索・同期](./rag-vector-search.md)
- [RAGサービス群](./rag-services.md)
