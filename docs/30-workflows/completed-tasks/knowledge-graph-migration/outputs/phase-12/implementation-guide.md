# 実装ガイド - Knowledge Graph Migration

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-04-06                |
| Phase    | 12                        |
| 実行日   | 2026-01-13                |
| 機能名   | knowledge-graph-migration |

---

# Part 1: 概念的説明

## Knowledge Graphとは何か

Knowledge Graph（ナレッジグラフ）を中学生にもわかる言葉で説明すると、「情報の関係性を表した地図」です。

### 図書館の例え

想像してください。図書館に何万冊もの本があるとします。普通の検索システムでは「AIについて」と検索すると、AI という単語が含まれる本のリストが出てきます。

でも Knowledge Graph は違います。「AIの開発者」を調べると：

```
[ジェフリー・ヒントン] ---教えた---> [ヨシュア・ベンジオ]
       |                                    |
       |---研究した--->                    ---研究した--->
       v                                    v
[ディープラーニング]              [自然言語処理]
       |
       |---発展した--->
       v
  [ChatGPT]
```

このように、「誰が」「何を」「どう関係しているか」を繋げて表現するのが Knowledge Graph です。

### なぜKnowledge Graphが必要なのか

**従来のキーワード検索の限界**:

| 問題点         | 具体例                                           |
| -------------- | ------------------------------------------------ |
| 同音異義語     | 「Apple」→ 果物？会社？                          |
| 文脈欠落       | 「JavaScript」の質問 → React? Node.js? ブラウザ? |
| 関連情報の分断 | Aの資料とBの資料に同じ人物が登場しても紐付かない |

**Knowledge Graphによる解決**:

| 解決策           | 効果                                              |
| ---------------- | ------------------------------------------------- |
| エンティティ識別 | 「Apple Inc.」と「りんご」を区別                  |
| 関係性保持       | 「ReactはJavaScriptのライブラリ」という関係を記録 |
| グラフ探索       | 関連エンティティを辿って網羅的に情報取得          |

---

## 全体像

### テーブル関係図

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Graph Schema                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   entities       │◄───────►│   relations      │
│   (ノード)        │         │   (エッジ)       │
│                  │         │                  │
│  id              │         │  id              │
│  name            │  source │  source_id ───┐  │
│  normalized_name │◄────────│  target_id ───┼──┘
│  type            │  target │  type          │
│  description     │         │  weight        │
│  importance      │         │  bidirectional │
│  aliases (JSON)  │         │                │
│  embedding       │         │                │
└───────┬──────────┘         └───────┬────────┘
        │                            │
        │ entity_id                  │ relation_id
        ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│entity_communities│         │relation_evidence │
│   (多対多)        │         │   (証拠)         │
│                  │         │                  │
│  entity_id ──────┼─┐       │  relation_id     │
│  community_id ───┼─┼─┐     │  chunk_id ───────┼──► chunks (既存)
└──────────────────┘ │ │     │  excerpt         │
                     │ │     │  confidence      │
                     │ │     └──────────────────┘
                     │ │
                     │ ▼
                     │ ┌──────────────────┐
                     │ │  communities     │
                     │ │  (クラスター)     │
                     │ │                  │
                     └►│  id              │
                       │  level           │
                       │  parent_id ──────┼──► 自己参照
                       │  name            │
                       │  summary         │
                       │  member_count    │
                       └──────────────────┘

┌──────────────────┐
│  chunk_entities  │
│  (出現情報)       │
│                  │
│  chunk_id ───────┼──► chunks (既存)
│  entity_id ──────┼──► entities
│  mention_count   │
│  positions (JSON)│
└──────────────────┘
```

### データフロー

```
文書アップロード
      │
      ▼
┌─────────────┐
│   files     │ ← ファイルメタデータ
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   chunks    │ ← テキストチャンク + FTS5検索
└─────┬───────┘
      │
      │ LLM処理 (エンティティ抽出・関係性抽出)
      ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  entities   │────►│  relations   │────►│  communities │
│             │     │              │     │              │
│ 「誰/何が」  │     │ 「どう繋がる」│     │ 「グループ」  │
└──────┬──────┘     └──────┬───────┘     └──────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│chunk_entities│   │relation_evidence │
│              │   │                  │
│ 出現位置記録  │   │ 証拠チャンク記録  │
└──────────────┘   └──────────────────┘
```

---

# Part 2: 技術的詳細

## テーブル設計

### なぜ6テーブル構成なのか

Knowledge Graphを実現するには最低限以下の3要素が必要です：

1. **ノード（頂点）**: エンティティ
2. **エッジ（辺）**: 関係性
3. **クラスター**: コミュニティ

しかし、これだけでは不十分です：

| 追加要素           | なぜ必要か                                                   |
| ------------------ | ------------------------------------------------------------ |
| relation_evidence  | 関係性の根拠（どのチャンクから抽出したか）を追跡するため     |
| entity_communities | エンティティは複数コミュニティに所属できるため（多対多）     |
| chunk_entities     | どのチャンクにどのエンティティが何回出現したかを記録するため |

### 各テーブルの設計意図

#### entities（13カラム）

| 設計判断                           | 理由                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `normalized_name` と `name` を分離 | 「Apple Inc.」「apple」「アップル」を同一エンティティとして扱うため        |
| `type` を52種類に分類              | 検索精度向上のため（「JavaScript」がコンセプトか技術かで検索結果が変わる） |
| `aliases` をJSON配列               | 別名を柔軟に追加できるように                                               |
| `importance` スコア                | 重要なエンティティを優先表示するため                                       |
| `embedding` をBLOBで保存           | セマンティック検索のため（将来実装）                                       |

#### relations（11カラム）

| 設計判断                     | 理由                                             |
| ---------------------------- | ------------------------------------------------ |
| source_id / target_id の分離 | 有向グラフを表現するため（AからBへの関係）       |
| `bidirectional` フラグ       | 双方向関係（AとBは同僚）を表現するため           |
| `weight` スコア              | 関係の強さを数値化（頻繁に言及される関係は重要） |
| `evidence_count`             | 裏付けとなるチャンク数を非正規化して高速参照     |

#### communities（10カラム）

| 設計判断                 | 理由                                             |
| ------------------------ | ------------------------------------------------ |
| `level` と `parent_id`   | 階層構造を表現（トピック → サブトピック → 詳細） |
| `parent_id` の自己参照FK | ツリー構造をSQLiteで効率的に表現                 |
| SET NULL on delete       | 親コミュニティ削除時も子は残す                   |
| `summary` はLLM生成      | コミュニティの内容を自然言語で要約               |

---

## 外部キー設計

### CASCADE動作の選択理由

```
┌────────────────┬────────────────────┬─────────────────────────────────┐
│ FK制約         │ 動作               │ 理由                            │
├────────────────┼────────────────────┼─────────────────────────────────┤
│ relations →    │ CASCADE DELETE     │ エンティティ削除時、             │
│ entities       │                    │ 関連する関係も削除されるべき     │
├────────────────┼────────────────────┼─────────────────────────────────┤
│ relation_      │ CASCADE DELETE     │ 関係削除時、証拠も不要になる     │
│ evidence →     │                    │                                 │
│ relations      │                    │                                 │
├────────────────┼────────────────────┼─────────────────────────────────┤
│ communities.   │ SET NULL           │ 親削除時、子は独立コミュニティ   │
│ parent_id →    │                    │ として残す                      │
│ communities    │                    │                                 │
├────────────────┼────────────────────┼─────────────────────────────────┤
│ entity_        │ CASCADE DELETE     │ どちらか削除されたら紐付け不要   │
│ communities →  │                    │                                 │
│ 両テーブル     │                    │                                 │
├────────────────┼────────────────────┼─────────────────────────────────┤
│ chunk_entities │ CASCADE DELETE     │ チャンク/エンティティ削除時、    │
│ → 両テーブル   │                    │ 出現情報も不要                  │
└────────────────┴────────────────────┴─────────────────────────────────┘
```

### 悪い例と良い例

**悪い例**: CASCADE DELETEを使わない場合

```sql
-- エンティティを削除しようとすると...
DELETE FROM entities WHERE id = 'entity-1';
-- エラー: FOREIGN KEY constraint failed
-- relations テーブルがこのエンティティを参照しているため削除できない

-- 手動で順番に削除が必要（面倒でエラーの元）
DELETE FROM relation_evidence WHERE relation_id IN (SELECT id FROM relations WHERE source_id = 'entity-1');
DELETE FROM relations WHERE source_id = 'entity-1';
DELETE FROM entity_communities WHERE entity_id = 'entity-1';
DELETE FROM chunk_entities WHERE entity_id = 'entity-1';
DELETE FROM entities WHERE id = 'entity-1';
```

**良い例**: CASCADE DELETE使用時

```sql
-- エンティティを削除すると、関連レコードも自動削除
DELETE FROM entities WHERE id = 'entity-1';
-- 成功！関連するrelations, entity_communities, chunk_entitiesも自動削除
```

---

## インデックス設計

### インデックス一覧と用途

| テーブル           | インデックス                      | 用途                           |
| ------------------ | --------------------------------- | ------------------------------ |
| entities           | `normalized_name_idx`             | 名前で高速検索                 |
| entities           | `type_idx`                        | タイプ別フィルタ               |
| entities           | `importance_idx`                  | 重要度順ソート                 |
| entities           | `name_type_idx` (UNIQUE)          | 重複防止                       |
| relations          | `source_id_idx`                   | 始点からの関係検索             |
| relations          | `target_id_idx`                   | 終点への関係検索               |
| relations          | `type_idx`                        | 関係タイプ別フィルタ           |
| relations          | `weight_idx`                      | 重み順ソート                   |
| relations          | `source_target_type_idx` (UNIQUE) | 重複関係防止                   |
| communities        | `level_idx`                       | 階層別取得                     |
| communities        | `parent_id_idx`                   | 子コミュニティ取得             |
| relation_evidence  | `relation_id_idx`                 | 関係別証拠取得                 |
| relation_evidence  | `chunk_id_idx`                    | チャンク別証拠取得             |
| entity_communities | `entity_id_idx`                   | エンティティ別所属取得         |
| entity_communities | `community_id_idx`                | コミュニティ別メンバー取得     |
| chunk_entities     | `chunk_id_idx`                    | チャンク別エンティティ取得     |
| chunk_entities     | `entity_id_idx`                   | エンティティ別出現チャンク取得 |

### なぜこれらのインデックスが必要か

**グラフ探索パターン**:

```sql
-- 「このエンティティと関係のある全エンティティを取得」
-- → source_id_idx と target_id_idx が両方必要
SELECT target_id FROM relations WHERE source_id = ?
UNION
SELECT source_id FROM relations WHERE target_id = ?;

-- 「このコミュニティの全メンバーを取得」
-- → community_id_idx が必要
SELECT entity_id FROM entity_communities WHERE community_id = ?;
```

---

## マイグレーション

### 生成コマンド

```bash
# スキーマ定義からマイグレーションSQLを生成
pnpm --filter @repo/shared drizzle-kit generate
```

### 適用コマンド

```bash
# 開発環境: 直接適用
pnpm --filter @repo/shared drizzle-kit push

# 本番環境: マイグレーションファイルを順次適用
pnpm --filter @repo/shared drizzle-kit migrate
```

### マイグレーションファイル

生成されたファイル: `packages/shared/drizzle/migrations/0003_spotty_callisto.sql`

このファイルには以下が含まれます：

1. 6テーブルのCREATE TABLE文
2. 17インデックスのCREATE INDEX文
3. 8外部キー制約

### テスト実行

```bash
# 統合テスト（35テスト）
pnpm --filter @repo/shared vitest run migration.integration.test.ts
```

---

## 用語集

| 用語             | 読み方                   | 意味                                 | コンテキスト          |
| ---------------- | ------------------------ | ------------------------------------ | --------------------- |
| Knowledge Graph  | ナレッジグラフ           | 知識の関係性を表現したグラフ構造     | RAG、検索システム     |
| Entity           | エンティティ             | グラフ内のノード（人、物、概念など） | Knowledge Graph       |
| Relation         | リレーション             | エンティティ間の関係（エッジ）       | Knowledge Graph       |
| Community        | コミュニティ             | 関連エンティティのクラスター         | Leiden Algorithm      |
| Leiden Algorithm | ライデン・アルゴリズム   | グラフクラスタリング手法             | コミュニティ検出      |
| GraphRAG         | グラフラグ               | Knowledge Graphを用いたRAG           | Microsoft Research    |
| CASCADE DELETE   | カスケード・デリート     | 親削除時に子も自動削除               | SQL外部キー制約       |
| SET NULL         | セット・ヌル             | 親削除時に子のFKをNULLに             | SQL外部キー制約       |
| Drizzle ORM      | ドリズル・オーアールエム | TypeScript用のORM                    | TypeScript、SQL       |
| libSQL           | リブエスキューエル       | SQLiteのフォーク                     | Turso、Edge DB        |
| FTS5             | エフティーエスファイブ   | SQLite全文検索エンジン               | 全文検索              |
| DiskANN          | ディスクアン             | ベクトル検索アルゴリズム             | 類似度検索            |
| BLOB             | ブロブ                   | バイナリデータ型                     | SQL、埋め込みベクトル |
| normalized_name  | ノーマライズド・ネーム   | 正規化された名前                     | 重複防止              |
| bidirectional    | バイディレクショナル     | 双方向の                             | 無向グラフの関係      |
| evidence         | エビデンス               | 証拠、根拠                           | 関係の出典            |
| excerpt          | エクサープト             | 抜粋                                 | テキスト引用          |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
