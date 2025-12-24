# エンティティ・関係モデル要件仕様書

**タスクID**: T-00-1 (CONV-03-04)
**フェーズ**: Phase 0 - 要件定義
**作成日**: 2025-12-18
**ステータス**: 完了

---

## 1. 目的

Knowledge Graph構築に必要なエンティティ（Entity）、関係（Relation）、コミュニティ（Community）のデータ構造要件を明文化し、TypeScript型定義・Zodスキーマ設計の基盤を確立する。

---

## 2. 背景

### 2.1 GraphRAGアーキテクチャ

本システムはGraphRAG（Graph Retrieval-Augmented Generation）アーキテクチャを採用する。これは従来のベクトル検索（RAG）に加えて、文書から抽出したエンティティとその関係を構造化して保存することで、以下を実現する：

- **意味的ナビゲーション**: エンティティ間の関係を辿ることで、関連情報を効率的に発見
- **推論能力の向上**: エンティティ間の関係パターンから暗黙的な知識を導出
- **コミュニティ検出**: Leidenアルゴリズムによる意味的クラスタリング

### 2.2 GraphRAGの主要コンポーネント

```
文書 → エンティティ抽出 → 関係抽出 → Knowledge Graph構築 → コミュニティ検出
```

1. **エンティティ抽出**: NER（Named Entity Recognition）により文書から固有表現を抽出
2. **関係抽出**: エンティティ間の意味的関係を特定
3. **Knowledge Graph構築**: エンティティと関係をグラフ構造で表現
4. **コミュニティ検出**: Leidenアルゴリズムで意味的に近いエンティティ群を検出

---

## 3. エンティティ（Entity）要件

### 3.1 エンティティの定義

**エンティティ（EntityEntity）**は、Knowledge Graphのノード（頂点）を表現する。文書から抽出された固有表現（人名、組織名、技術用語等）を構造化して保存する。

### 3.2 エンティティタイプ（EntityType）

エンティティは以下の48種類に分類される（システム開発以外の様々な分野に対応）：

#### 1. 人物・組織カテゴリ

| タイプ | 値（enum）     | 説明             | 例                                        |
| ------ | -------------- | ---------------- | ----------------------------------------- |
| 人物   | `person`       | 人名             | Elon Musk, 田中太郎, Albert Einstein      |
| 組織   | `organization` | 企業・団体・組織 | OpenAI, NASA, 経済産業省, WHO             |
| 役職   | `role`         | 役職・肩書       | CEO, プロジェクトマネージャー, 主任研究員 |
| チーム | `team`         | チーム・部門     | 開発チーム, マーケティング部, 研究室      |

#### 2. 場所・時間カテゴリ

| タイプ   | 値（enum） | 説明             | 例                                    |
| -------- | ---------- | ---------------- | ------------------------------------- |
| 場所     | `location` | 地名・地理的位置 | Tokyo, Silicon Valley, 工場A棟        |
| 日付     | `date`     | 日時・期間       | 2024-01-01, Q1 2024, 平成30年         |
| イベント | `event`    | 出来事・イベント | WWDC 2024, 東京オリンピック, 株主総会 |

#### 3. ビジネス・経営カテゴリ

| タイプ         | 値（enum）         | 説明                 | 例                                           |
| -------------- | ------------------ | -------------------- | -------------------------------------------- |
| 企業           | `company`          | 企業（具体的な会社） | Apple Inc., トヨタ自動車, スターバックス     |
| 製品           | `product`          | 物理的製品           | iPhone, プリウス, Surface Pro                |
| サービス       | `service`          | サービス・業務       | AWS Lambda, Uber, Netflix                    |
| ブランド       | `brand`            | ブランド             | Nike, Coca-Cola, 無印良品                    |
| 戦略           | `strategy`         | 経営戦略・方針       | DX戦略, ブルーオーシャン戦略, アジャイル開発 |
| 指標           | `metric`           | KPI・測定指標        | ROI, NPS, コンバージョン率, 売上高           |
| 業務プロセス   | `business_process` | 業務フロー           | 受注処理, 在庫管理, 採用プロセス             |
| 市場           | `market`           | 市場・業界           | SaaS市場, 自動車業界, EC市場                 |
| 顧客セグメント | `customer`         | 顧客層               | エンタープライズ, 個人事業主, Z世代          |

#### 4. 技術全般カテゴリ（コード以外も含む）

| タイプ     | 値（enum）   | 説明                                   | 例                                           |
| ---------- | ------------ | -------------------------------------- | -------------------------------------------- |
| 技術       | `technology` | 技術全般（製造、医療、建築、農業など） | 3Dプリンティング, CRISPR, 免震構造, 水耕栽培 |
| ツール     | `tool`       | ツール・機器・装置                     | Figma, Excel, MRI装置, ドローン              |
| 手法       | `method`     | 手法・メソッド・方法論                 | アジャイル, デザイン思考, PDCA, Six Sigma    |
| 標準       | `standard`   | 標準・規格・仕様                       | ISO 9001, HTTP/2, IEEE 802.11, JIS規格       |
| プロトコル | `protocol`   | 通信プロトコル・取り決め               | TCP/IP, OAuth 2.0, REST, SOAP                |

#### 5. コード・ソフトウェアカテゴリ

| タイプ             | 値（enum）             | 説明                       | 例                           |
| ------------------ | ---------------------- | -------------------------- | ---------------------------- |
| プログラミング言語 | `programming_language` | プログラミング言語         | TypeScript, Python, Rust, Go |
| フレームワーク     | `framework`            | ソフトウェアフレームワーク | Next.js, Django, Spring Boot |
| ライブラリ         | `library`              | ライブラリ・パッケージ     | React, Zod, Drizzle ORM      |
| API                | `api`                  | APIエンドポイント          | OpenAI API, Google Maps API  |
| 関数               | `function`             | 関数・メソッド             | useState, useEffect, map()   |
| クラス             | `class`                | クラス・型                 | EntityEntity, RelationEntity |
| モジュール         | `module`               | モジュール・パッケージ     | @repo/shared, next/image     |

#### 6. 抽象概念カテゴリ

| タイプ   | 値（enum）  | 説明                   | 例                                                   |
| -------- | ----------- | ---------------------- | ---------------------------------------------------- |
| 概念     | `concept`   | 抽象的概念             | クラウドネイティブ, サステナビリティ, イノベーション |
| 理論     | `theory`    | 理論・学説             | 相対性理論, ゲーム理論, 進化論                       |
| 原則     | `principle` | 原則・原理             | SOLID原則, パレートの法則, 最小権限の原則            |
| パターン | `pattern`   | デザインパターン       | MVC, Observer, Singleton                             |
| モデル   | `model`     | モデル・フレームワーク | ビジネスモデルキャンバス, OSIモデル, SWOT分析        |

#### 7. ドキュメント構造カテゴリ

| タイプ     | 値（enum）  | 説明       | 例                              |
| ---------- | ----------- | ---------- | ------------------------------- |
| 文書       | `document`  | 文書全体   | README.md, 仕様書, 論文, 報告書 |
| 章         | `chapter`   | 章         | 第1章, Chapter 1, 序論          |
| セクション | `section`   | セクション | 1.1 背景, Introduction, まとめ  |
| 段落       | `paragraph` | 段落       | 本文の1段落                     |
| 見出し     | `heading`   | 見出し     | ## Overview, ### 概要           |

#### 8. ドキュメント要素カテゴリ

| タイプ           | 値（enum）     | 説明                   | 例                                     |
| ---------------- | -------------- | ---------------------- | -------------------------------------- |
| キーワード       | `keyword`      | 重要なキーワード・用語 | RAG, エンティティ抽出, Knowledge Graph |
| 要約             | `summary`      | 要約・サマリー         | TL;DR, Abstract, 概要                  |
| 図               | `figure`       | 図・イラスト           | システム構成図, UML図, フローチャート  |
| 表               | `table`        | 表・テーブル           | 比較表, データテーブル, 仕様一覧       |
| リスト           | `list`         | リスト・箇条書き       | チェックリスト, 手順リスト, 目次       |
| 引用             | `quote`        | 引用・出典             | "Stay hungry", 参考文献                |
| コードスニペット | `code_snippet` | コード断片             | ```typescript, サンプルコード          |
| 数式             | `formula`      | 数式・計算式           | E=mc², アルゴリズム式                  |
| 例               | `example`      | 例・サンプル           | 使用例, ユースケース, デモ             |

#### 9. メディアカテゴリ

| タイプ       | 値（enum） | 説明           | 例                                       |
| ------------ | ---------- | -------------- | ---------------------------------------- |
| 画像         | `image`    | 画像・写真     | スクリーンショット, 図表, アイコン       |
| 動画         | `video`    | 動画・映像     | チュートリアル動画, デモ, ウェビナー     |
| 音声         | `audio`    | 音声・音楽     | ポッドキャスト, 議事録音声, BGM          |
| ダイアグラム | `diagram`  | 構造図・設計図 | ER図, アーキテクチャ図, ワイヤーフレーム |

#### 10. その他カテゴリ

| タイプ | 値（enum） | 説明               | 例  |
| ------ | ---------- | ------------------ | --- |
| その他 | `other`    | 上記に分類されない | -   |

**合計**: 48種類のエンティティタイプ

### 3.3 エンティティの属性

EntityEntity型は以下の属性を持つ：

| 属性名           | 型                     | 必須 | 説明                                                                 |
| ---------------- | ---------------------- | ---- | -------------------------------------------------------------------- |
| `id`             | `EntityId`             | ✓    | エンティティの一意識別子（UUID）                                     |
| `name`           | `string`               | ✓    | エンティティ名（1〜255文字）                                         |
| `normalizedName` | `string`               | ✓    | 正規化されたエンティティ名（検索用、小文字・空白統一・特殊文字除去） |
| `type`           | `EntityType`           | ✓    | エンティティタイプ（14種類のいずれか）                               |
| `description`    | `string \| null`       |      | エンティティの説明（最大1000文字、省略可）                           |
| `aliases`        | `readonly string[]`    | ✓    | 別名リスト（空配列可、各別名1〜255文字）                             |
| `embedding`      | `Float32Array \| null` |      | エンティティの埋め込みベクトル（ベクトル検索用、省略可）             |
| `importance`     | `number`               | ✓    | 重要度スコア（0.0〜1.0、PageRankアルゴリズムで計算）                 |
| `metadata`       | `Metadata`             | ✓    | メタデータ（JSON形式、任意のキー・値ペア）                           |
| `createdAt`      | `Date`                 | ✓    | 作成日時（ISO 8601形式）                                             |
| `updatedAt`      | `Date`                 | ✓    | 更新日時（ISO 8601形式）                                             |

#### 属性の詳細要件

**normalizedName（正規化名）**:

- 目的: エンティティの統一化・重複排除
- 正規化ルール:
  - 小文字化: `toLowerCase()`
  - 空白統一: 連続空白を単一空白に変換 `replace(/\s+/g, ' ')`
  - 特殊文字除去: 英数字・空白・ハイフン以外を削除 `replace(/[^\w\s-]/g, '')`
  - 前後空白除去: `trim()`
- 例: "React.js" → "reactjs", "Claude 3.5 Sonnet" → "claude 3 5 sonnet"

**embedding（埋め込みベクトル）**:

- 型: Float32Array（JavaScript TypedArray）
- 次元数: 未定（AI APIの埋め込みモデルに依存、通常512〜1536次元）
- 用途: エンティティ間の意味的類似度計算、ベクトル検索
- 省略可能: エンティティ抽出時点では不要、後続処理で生成

**importance（重要度スコア）**:

- 範囲: 0.0（最低）〜 1.0（最高）
- 計算方法: PageRankアルゴリズム（簡易版は接続数ベース）
- 用途: エンティティの重要度順ソート、サマリー生成時の優先度決定

**aliases（別名）**:

- 用途: 同一エンティティの異なる表記を統合
- 例: "AI" と "人工知能", "React" と "React.js"

---

## 4. 関係（Relation）要件

### 4.1 関係の定義

**関係（RelationEntity）**は、Knowledge Graphのエッジ（辺）を表現する。2つのエンティティ間の意味的関係を構造化して保存する。

### 4.2 関係タイプ（RelationType）

関係は以下の23種類に分類される：

#### 汎用関係

| タイプ | 値（enum）   | 説明           | 逆関係     | 例                           |
| ------ | ------------ | -------------- | ---------- | ---------------------------- |
| 関連   | `related_to` | 一般的な関連   | -          | React ← related_to → Redux   |
| 部分   | `part_of`    | 部分・構成要素 | `has_part` | useEffect ← part_of → React  |
| 所有   | `has_part`   | 全体・所有     | `part_of`  | React ← has_part → useEffect |
| 所属   | `belongs_to` | 所属・帰属     | `has_part` | 従業員 ← belongs_to → 会社   |

#### 時間的関係

| タイプ | 値（enum）        | 説明         | 逆関係        | 例                                  |
| ------ | ----------------- | ------------ | ------------- | ----------------------------------- |
| 先行   | `preceded_by`     | 先行・前提   | `followed_by` | React 18 ← preceded_by → React 17   |
| 後続   | `followed_by`     | 後続・続き   | `preceded_by` | React 17 ← followed_by → React 18   |
| 同時   | `concurrent_with` | 同時期・並行 | -             | WWDC ← concurrent_with → Google I/O |

#### 技術的関係

| タイプ     | 値（enum）   | 説明                 | 逆関係    | 例                                    |
| ---------- | ------------ | -------------------- | --------- | ------------------------------------- |
| 使用       | `uses`       | 使用・利用           | `used_by` | Next.js ← uses → React                |
| 被使用     | `used_by`    | 使用される           | `uses`    | React ← used_by → Next.js             |
| 実装       | `implements` | インターフェース実装 | -         | Repository ← implements → IRepository |
| 拡張       | `extends`    | 継承・拡張           | -         | ErrorHandler ← extends → BaseHandler  |
| 依存       | `depends_on` | 依存                 | -         | Frontend ← depends_on → API           |
| 呼び出し   | `calls`      | 関数呼び出し         | -         | main() ← calls → init()               |
| インポート | `imports`    | モジュールインポート | -         | App.tsx ← imports → React             |

#### 階層関係

| タイプ | 値（enum）  | 説明     | 逆関係      | 例                                   |
| ------ | ----------- | -------- | ----------- | ------------------------------------ |
| 親     | `parent_of` | 親・上位 | `child_of`  | Clean Architecture ← parent_of → DDD |
| 子     | `child_of`  | 子・下位 | `parent_of` | DDD ← child_of → Clean Architecture  |

#### 参照関係

| タイプ | 値（enum）      | 説明       | 逆関係          | 例                            |
| ------ | --------------- | ---------- | --------------- | ----------------------------- |
| 参照   | `references`    | 参照・引用 | `referenced_by` | 論文A ← references → 論文B    |
| 被参照 | `referenced_by` | 参照される | `references`    | 論文B ← referenced_by → 論文A |
| 定義   | `defines`       | 定義       | `defined_by`    | RFC 7231 ← defines → HTTP     |
| 定義元 | `defined_by`    | 定義される | `defines`       | HTTP ← defined_by → RFC 7231  |

#### 人物関係

| タイプ | 値（enum）          | 説明           | 逆関係 | 例                                |
| ------ | ------------------- | -------------- | ------ | --------------------------------- |
| 著者   | `authored_by`       | 著作           | -      | React Docs ← authored_by → Meta   |
| 雇用   | `works_for`         | 雇用・所属     | -      | Elon Musk ← works_for → Tesla     |
| 協力   | `collaborates_with` | 協力・共同作業 | -      | NASA ← collaborates_with → SpaceX |

### 4.3 関係の属性

RelationEntity型は以下の属性を持つ：

| 属性名          | 型                            | 必須 | 説明                                                 |
| --------------- | ----------------------------- | ---- | ---------------------------------------------------- |
| `id`            | `RelationId`                  | ✓    | 関係の一意識別子（UUID）                             |
| `sourceId`      | `EntityId`                    | ✓    | 関係の始点エンティティID                             |
| `targetId`      | `EntityId`                    | ✓    | 関係の終点エンティティID                             |
| `type`          | `RelationType`                | ✓    | 関係タイプ（23種類のいずれか）                       |
| `description`   | `string \| null`              |      | 関係の説明（最大500文字、省略可）                    |
| `weight`        | `number`                      | ✓    | 関係の強さ（0.0〜1.0、複数のevidenceがあるほど高い） |
| `bidirectional` | `boolean`                     | ✓    | 双方向関係か（true: A ↔ B, false: A → B）            |
| `evidence`      | `readonly RelationEvidence[]` | ✓    | 関係の証拠（出典チャンク）リスト                     |
| `metadata`      | `Metadata`                    | ✓    | メタデータ（JSON形式、任意のキー・値ペア）           |
| `createdAt`     | `Date`                        | ✓    | 作成日時（ISO 8601形式）                             |
| `updatedAt`     | `Date`                        | ✓    | 更新日時（ISO 8601形式）                             |

#### 属性の詳細要件

**weight（関係の強さ）**:

- 範囲: 0.0（弱い）〜 1.0（強い）
- 計算方法: evidence配列の要素数と各evidenceのconfidenceに基づく
- 例: evidence数が多いほど、またconfidenceが高いほど、weightが高くなる

**bidirectional（双方向関係）**:

- `true`: 関係が双方向（例: `collaborates_with`, `concurrent_with`）
- `false`: 関係が単方向（例: `uses`, `depends_on`）

**evidence（証拠）**:

- 型: `RelationEvidence[]`（配列）
- 用途: 関係が抽出された文書箇所を記録、トレーサビリティ確保
- 最小要素数: 1（関係は必ず証拠を持つ）

### 4.4 関係の証拠（RelationEvidence）

RelationEvidence型は関係の出典チャンクを表現する：

| 属性名       | 型        | 必須 | 説明                                        |
| ------------ | --------- | ---- | ------------------------------------------- |
| `chunkId`    | `ChunkId` | ✓    | 証拠となる文書チャンクのID                  |
| `excerpt`    | `string`  | ✓    | 関係を示すテキスト抜粋（1〜500文字）        |
| `confidence` | `number`  | ✓    | 証拠の信頼度（0.0〜1.0、NERモデルの確信度） |

---

## 5. コミュニティ（Community）要件

### 5.1 コミュニティの定義

**コミュニティ（CommunityEntity）**は、Knowledge Graphのクラスター（意味的に関連するエンティティ群）を表現する。Leidenアルゴリズムにより自動検出される。

### 5.2 Leidenアルゴリズム

Leidenアルゴリズムは、グラフのモジュラリティ（密結合性）を最大化するコミュニティ検出手法：

- **入力**: エンティティ（ノード）と関係（エッジ）のグラフ
- **出力**: 階層的コミュニティ構造（レベル0〜N）
- **特徴**: Louvainアルゴリズムの改良版、より高品質なクラスタリング

### 5.3 コミュニティの属性

CommunityEntity型は以下の属性を持つ：

| 属性名            | 型                     | 必須 | 説明                                                          |
| ----------------- | ---------------------- | ---- | ------------------------------------------------------------- |
| `id`              | `CommunityId`          | ✓    | コミュニティの一意識別子（UUID）                              |
| `level`           | `number`               | ✓    | 階層レベル（0: 最下層、数値が大きいほど上位の抽象的クラスタ） |
| `parentId`        | `CommunityId \| null`  |      | 親コミュニティID（level > 0の場合、省略可）                   |
| `name`            | `string`               | ✓    | コミュニティ名（1〜255文字、自動生成または手動命名）          |
| `summary`         | `string`               | ✓    | コミュニティのサマリー（最大2000文字、LLMで生成）             |
| `memberEntityIds` | `readonly EntityId[]`  | ✓    | メンバーエンティティIDリスト                                  |
| `memberCount`     | `number`               | ✓    | メンバー数（memberEntityIds.length、非負整数）                |
| `embedding`       | `Float32Array \| null` |      | コミュニティ埋め込み（メンバーのembedding平均、省略可）       |
| `createdAt`       | `Date`                 | ✓    | 作成日時（ISO 8601形式）                                      |
| `updatedAt`       | `Date`                 | ✓    | 更新日時（ISO 8601形式）                                      |

#### 属性の詳細要件

**level（階層レベル）**:

- レベル0: 最も細かいクラスター（エンティティの直接的なグループ）
- レベル1以上: より抽象的なクラスター（レベル0コミュニティの集合）
- 最大レベル: 設定可能（デフォルト3レベル）

**parentId（親コミュニティID）**:

- level = 0の場合: null
- level > 0の場合: 親コミュニティのIDを保持（階層構造）

**name（コミュニティ名）**:

- 自動生成ルール:
  - メンバーが1個: そのエンティティ名
  - メンバーが2個: "エンティティA & エンティティB"
  - メンバーが3個以上: "エンティティA, エンティティB & others"
  - importanceが高いエンティティ上位3つを使用
- 手動命名: ユーザーが意味のある名前を付与可能

**summary（サマリー）**:

- 生成方法: LLM（GPT-4, Claude等）にメンバーエンティティと関係を入力し、要約を生成
- 内容: コミュニティが表現する概念・テーマの説明
- 例: "React生態系に関するコミュニティ。Next.js, Remix, Create React App等のフレームワークと、useEffect, useState等のHooksが含まれる。"

**embedding（コミュニティ埋め込み）**:

- 計算方法: メンバーエンティティのembeddingの平均ベクトル
- 用途: コミュニティ間の類似度計算

---

## 6. チャンク-エンティティ関連（ChunkEntityRelation）要件

### 6.1 定義

**ChunkEntityRelation**は、文書チャンク（RAGの基本単位）とエンティティの関連を表現する。エンティティが文書のどの箇所に出現したかを記録する。

### 6.2 属性

| 属性名         | 型                         | 必須 | 説明                                           |
| -------------- | -------------------------- | ---- | ---------------------------------------------- |
| `chunkId`      | `ChunkId`                  | ✓    | 文書チャンクのID                               |
| `entityId`     | `EntityId`                 | ✓    | エンティティのID                               |
| `mentionCount` | `number`                   | ✓    | チャンク内でのエンティティ出現回数（正の整数） |
| `positions`    | `readonly EntityMention[]` | ✓    | 出現位置リスト                                 |

### 6.3 エンティティメンション（EntityMention）

EntityMention型はエンティティの出現位置を表現する：

| 属性名        | 型       | 必須 | 説明                                           |
| ------------- | -------- | ---- | ---------------------------------------------- |
| `startChar`   | `number` | ✓    | 開始文字位置（0-indexed、非負整数）            |
| `endChar`     | `number` | ✓    | 終了文字位置（0-indexed、startChar < endChar） |
| `surfaceForm` | `string` | ✓    | 実際のテキスト表現（1文字以上）                |

**用途**:

- エンティティのハイライト表示
- コンテキスト抽出（前後N文字を取得）
- 出現頻度分析

---

## 7. グラフ統計情報（GraphStatistics）要件

### 7.1 定義

**GraphStatistics**は、Knowledge Graph全体の統計情報を表現する。システムの健全性監視、パフォーマンス分析に使用する。

### 7.2 属性

| 属性名                | 型       | 必須 | 説明                                                  |
| --------------------- | -------- | ---- | ----------------------------------------------------- |
| `entityCount`         | `number` | ✓    | エンティティ総数（非負整数）                          |
| `relationCount`       | `number` | ✓    | 関係総数（非負整数）                                  |
| `communityCount`      | `number` | ✓    | コミュニティ総数（非負整数）                          |
| `averageDegree`       | `number` | ✓    | 平均次数（エンティティあたりの平均関係数、非負実数）  |
| `density`             | `number` | ✓    | グラフ密度（0.0〜1.0、実際の関係数/可能な最大関係数） |
| `connectedComponents` | `number` | ✓    | 連結成分数（孤立したサブグラフの個数、正の整数）      |

### 7.3 計算式

**averageDegree（平均次数）**:

```
averageDegree = (2 * relationCount) / entityCount
```

**density（グラフ密度）**:

```
maxEdges = entityCount * (entityCount - 1) / 2
density = relationCount / maxEdges
```

- 完全グラフ（全エンティティが相互接続）: density = 1.0
- 疎グラフ（関係が少ない）: density ≈ 0.0

**connectedComponents（連結成分数）**:

- 幅優先探索（BFS）または深さ優先探索（DFS）で計算
- 1: 全エンティティが何らかの経路で接続されている
- N > 1: N個の孤立したサブグラフが存在

---

## 8. 非機能要件

### 8.1 パフォーマンス要件

| 項目             | 要件                                 |
| ---------------- | ------------------------------------ |
| エンティティ検索 | 1000件のエンティティから10ms以内     |
| 関係トラバース   | 深さ3の関係探索を100ms以内           |
| コミュニティ検出 | 1000エンティティ・10000関係で5秒以内 |
| グラフ統計計算   | 10000エンティティで1秒以内           |

### 8.2 スケーラビリティ要件

| 項目            | 要件                          |
| --------------- | ----------------------------- |
| エンティティ数  | 最大100万件                   |
| 関係数          | 最大1000万件                  |
| コミュニティ数  | 最大10万件                    |
| embedding次元数 | 512〜1536次元（AI APIに依存） |

### 8.3 データ整合性要件

| 要件                                  | 優先度 |
| ------------------------------------- | ------ |
| sourceId, targetIdは存在するEntityId  | 必須   |
| chunkIdは存在するChunkId              | 必須   |
| parentIdは存在するCommunityId         | 必須   |
| normalizedName重複時は統合            | 必須   |
| 孤児コミュニティ（memberCount=0）禁止 | 必須   |

---

## 9. 受け入れ基準

以下の基準をすべて満たすこと：

### 9.1 エンティティ

- [ ] EntityTypeは48種類すべて定義されている（10カテゴリ：人物・組織、場所・時間、ビジネス・経営、技術全般、コード・ソフトウェア、抽象概念、ドキュメント構造、ドキュメント要素、メディア、その他）
- [ ] EntityEntity型の11属性すべて定義されている
- [ ] normalizedNameの正規化ルールが明確
- [ ] importanceの範囲が0.0〜1.0
- [ ] embeddingがFloat32Array型

### 9.2 関係

- [ ] RelationTypeは23種類すべて定義されている
- [ ] RelationEntity型の10属性すべて定義されている
- [ ] 逆関係の対応表が整備されている
- [ ] weightの範囲が0.0〜1.0
- [ ] evidenceが最低1件必須

### 9.3 コミュニティ

- [ ] CommunityEntity型の10属性すべて定義されている
- [ ] levelの階層構造が明確
- [ ] parentIdの制約（level=0ならnull）が明確
- [ ] summaryの生成方法（LLM使用）が明確

### 9.4 その他

- [ ] ChunkEntityRelation型が定義されている
- [ ] EntityMention型が定義されている
- [ ] GraphStatistics型が定義されている
- [ ] 非機能要件（パフォーマンス、スケーラビリティ、整合性）が明確

### 9.5 ドキュメント品質

- [ ] 各型の用途が明確に説明されている
- [ ] 属性の詳細要件（範囲、制約、計算方法）が明確
- [ ] 具体例が豊富に記載されている
- [ ] 非機能要件が数値で定量化されている

---

## 10. 優先度（MoSCoW分析）

### Must Have（必須）

- EntityEntity型定義（14種類のEntityType）
- RelationEntity型定義（23種類のRelationType）
- CommunityEntity型定義（階層構造）
- ChunkEntityRelation型定義
- 基本属性（id, name, type, timestamps等）

### Should Have（推奨）

- embedding（埋め込みベクトル）
- importance（重要度スコア）
- weight（関係の強さ）
- evidence（関係の証拠）
- GraphStatistics

### Could Have（あれば望ましい）

- aliases（別名）の詳細管理
- description（説明）の多言語対応
- metadata拡張フィールド

### Won't Have（今回は対象外）

- グラフのビジュアライゼーション機能
- リアルタイムグラフ更新
- 分散グラフデータベース統合

---

## 11. 依存関係

### 前提条件

- CONV-03-01（RAG基本型・共通インターフェース定義）が完了している
- `EntityId`, `RelationId`, `CommunityId`, `ChunkId`（Branded Type）が定義されている
- `Timestamped`, `WithMetadata`インターフェースが定義されている

### 後続タスクへの影響

本要件仕様書は以下のタスクの入力となる：

- T-01-1: 型定義設計（types.ts）
- T-01-2: Zodスキーマ設計（schemas.ts）
- T-01-3: ユーティリティ関数設計（utils.ts）

---

## 12. 参考資料

- [GraphRAG論文](https://arxiv.org/abs/2404.16130) - Microsoft Research
- [Leiden Algorithm論文](https://www.nature.com/articles/s41598-019-41695-z) - Nature Scientific Reports
- [Named Entity Recognition (NER)](https://en.wikipedia.org/wiki/Named-entity_recognition)
- [PageRank Algorithm](https://en.wikipedia.org/wiki/PageRank)

---

## 13. 変更履歴

| 日付       | 変更者       | 変更内容               |
| ---------- | ------------ | ---------------------- |
| 2025-12-18 | .claude/agents/req-analyst.md | 初版作成（T-00-1完了） |

---

**ステータス**: ✅ 完了
**レビュアー**: （Phase 2で設定）
**承認日**: （Phase 2で設定）
