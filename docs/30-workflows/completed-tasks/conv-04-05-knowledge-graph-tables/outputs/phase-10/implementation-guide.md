# Knowledge Graph テーブル群 - 実装ガイド

## メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 機能名   | Knowledge Graph テーブル群 |
| 作成日   | 2026-01-04                 |
| 対象読者 | 開発者・技術者・学習者     |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. Knowledge Graphって何？

### 1.1 身近な例で考えてみよう

**友達関係の地図**を想像してください。

```
太郎 ──友達── 花子
  │            │
 友達         友達
  │            │
次郎 ──友達── 美咲
```

これは「人」と「関係」で繋がった「グラフ」です。Knowledge Graph（ナレッジグラフ）も同じ考え方で、**知識の繋がりを表す地図**です。

### 1.2 なぜ必要なの？

AIが文章を読んで答えを出すとき、**バラバラの情報**よりも**繋がった情報**の方が賢く答えられます。

**例**: 「東京タワーについて教えて」

❌ バラバラの情報:

- 東京タワーは333メートル
- 東京タワーは1958年完成
- 東京タワーは港区にある

⭕ 繋がった情報:

```
東京タワー ──場所── 港区 ──所在── 東京都
    │
   高さ
    │
  333m
```

### 1.3 今回作ったもの

| 日本語   | 英語      | 役割                             |
| -------- | --------- | -------------------------------- |
| もの・人 | Entity    | 「東京タワー」「港区」などの名前 |
| つながり | Relation  | 「場所」「友達」などの関係       |
| グループ | Community | 似たもの同士の集まり             |

---

## 2. どうやって保存するの？

### 2.1 表（テーブル）で管理

エクセルの表を想像してください。

**entitiesテーブル（もの・人の一覧）**:
| ID | 名前 | 種類 | 重要度 |
| -- | ---------- | ---- | ------ |
| 1 | 東京タワー | 場所 | 0.9 |
| 2 | 港区 | 場所 | 0.7 |
| 3 | 太郎 | 人 | 0.5 |

**relationsテーブル（つながりの一覧）**:
| 始まり | 終わり | 関係の種類 |
| ------ | ------ | ---------- |
| 1 | 2 | 場所 |
| 3 | 1 | 訪問した |

### 2.2 なぜ表で管理？

1. **速く探せる**: 「人」だけ検索したいとき、すぐ見つかる
2. **整理しやすい**: 同じ形式で統一されている
3. **間違いを防げる**: 決まったルールで保存される

---

## 3. 作ったテーブルの全体像

```
┌─────────────┐
│  entities   │←── もの・人を保存
└─────────────┘
      ↑ ↓
┌─────────────┐
│  relations  │←── つながりを保存
└─────────────┘
      ↑
┌─────────────┐
│  evidence   │←── 「どこから見つけた？」を保存
└─────────────┘

┌─────────────┐
│ communities │←── グループを保存
└─────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 なぜこの構成にしたか

**GraphRAG（Graph Retrieval-Augmented Generation）** は、MicrosoftがRAGの精度向上のために提唱したアーキテクチャです。従来のRAGが「類似チャンクを検索→回答生成」という単純なフローだったのに対し、GraphRAGは**文書からEntity（実体）とRelation（関係）を抽出し、Knowledge Graphとして構造化**することで、より文脈を理解した回答を可能にします。

本実装では、GraphRAGの永続化層として以下の設計判断を行いました：

| 設計判断                 | 理由                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| **SQLite + Drizzle ORM** | Electronアプリでのローカルストレージ、型安全なクエリ構築、Tursoとの互換性   |
| **6テーブル構成**        | Entity-Relation-Communityモデルの正規化、中間テーブルによる多対多関係の表現 |
| **UUID主キー**           | 分散環境での一意性保証、オフライン作成時のID衝突回避                        |

### 1.2 ファイル構成と責務

```
packages/shared/src/db/schema/graph/
├── entities.ts           # ノード（頂点）定義
├── relations.ts          # エッジ（辺）定義
├── relation-evidence.ts  # 関係の出典情報
├── communities.ts        # Leidenアルゴリズムによるクラスター
├── entity-communities.ts # Entity ⇔ Community の多対多
├── chunk-entities.ts     # Chunk ⇔ Entity の多対多（出現位置付き）
├── graph-relations.ts    # Drizzle ORM のリレーション定義
└── index.ts              # バレルエクスポート
```

**なぜファイルを分割したか**:

- **単一責任の原則**: 1ファイル = 1テーブル定義で保守性向上
- **循環参照回避**: `graph-relations.ts` をリレーション専用にすることで、テーブル定義とリレーション定義を分離
- **テスト容易性**: 個別ファイルごとにユニットテストが可能

### 1.3 データモデル詳細

```
Entity (ノード) ──────────────────────────────────────
│
│  なぜこの構造か:
│  • name + normalizedName: 表記ゆれ対応（"東京タワー" と "とうきょうタワー"）
│  • importance: GraphRAGのランキングで使用（PageRank的な重み付け）
│  • embedding: ベクトル検索用（セマンティック類似度計算）
│  • aliases: 同一エンティティの別名管理（"AI" = "人工知能"）
│
├── 14種類のタイプ: person, organization, location, etc.
├── 重要度スコア (importance: 0.0-1.0)
├── ベクトル埋め込み (embedding: BLOB)
└── 別名リスト (aliases: JSON)

Relation (エッジ) ──────────────────────────────────────
│
│  なぜこの構造か:
│  • source_id / target_id: 有向グラフ表現（A→B と B→A は別の関係）
│  • weight: 関係の強さ（同じ関係が複数回出現したら重み増加）
│  • bidirectional: 双方向関係のフラグ（"友達"は双方向、"親"は片方向）
│
├── 23種類のタイプ: related_to, depends_on, implements, etc.
├── 重み (weight: 0.0-1.0)
├── 双方向フラグ (bidirectional: boolean)
└── 外部キー: source_id → entities, target_id → entities

Community (クラスター) ──────────────────────────────────────
│
│  なぜこの構造か:
│  • level: Leidenアルゴリズムは階層的コミュニティを検出
│  • parent_id: 親コミュニティへの自己参照（木構造）
│  • summary: コミュニティの要約テキスト（LLMで生成）
│
├── 階層レベル (level: 0=ルート)
├── 自己参照 (parent_id → communities)
└── メンバー数 (member_count)
```

---

## 2. スキーマ詳細と設計判断

### 2.1 entitiesテーブル

```typescript
export const entities = sqliteTable("entities", {
  // ===== 主キー =====
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // なぜUUID: オフライン環境でも一意なIDを生成可能。
  // AUTO_INCREMENTだと複数デバイス間で衝突する可能性がある。

  // ===== 識別情報 =====
  name: text("name").notNull(),
  // 元の表記をそのまま保存（"OpenAI", "openai", "オープンAI"）

  normalizedName: text("normalized_name").notNull(),
  // なぜ正規化名が必要: 表記ゆれを吸収して同一エンティティを判定するため。
  // 例: "東京都" と "Tokyo" を同一視するかはアプリケーション層で判断。

  type: text("type", { enum: entityTypes }).notNull(),
  // なぜenum: TypeScriptの型安全性を確保し、不正な値の挿入を防ぐ。
  // enum値はコンパイル時にチェックされる。

  // ===== スコアリング =====
  importance: real("importance").notNull().default(0.5),
  // なぜREAL型: 0.0〜1.0の連続値を扱うため。
  // デフォルト0.5 = 中程度の重要度。GraphRAGでは出現頻度や接続数から再計算。

  // ===== ベクトル =====
  embedding: blob("embedding", { mode: "buffer" }),
  // なぜBLOB: Float32Array をバイナリで保存。
  // SQLiteにはネイティブのベクトル型がないため。
  // mode: "buffer" でNode.jsのBufferとして取得可能。

  // ===== メタデータ =====
  aliases: text("aliases", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  // なぜJSON: 可変長の別名リストを柔軟に格納。
  // $type<T>() でTypeScriptの型を明示的に指定。

  metadata: text("metadata", { mode: "json" })
    .$type<EntityMetadata>()
    .notNull()
    .default({}),
  // なぜJSON: スキーマを変更せずに追加属性を格納できる拡張ポイント。

  // ===== タイムスタンプ =====
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  // なぜINTEGER + unixepoch: SQLiteにはDATETIME型がないため。
  // Unix秒で保存し、mode: "timestamp" でDateオブジェクトに変換。

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),

  firstSeenAt: integer("first_seen_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  // なぜfirstSeenAt: エンティティが最初に検出された日時を追跡。
  // GraphRAGでは時系列分析に使用。

  lastSeenAt: integer("last_seen_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  // なぜlastSeenAt: 古いエンティティを識別しクリーンアップするため。

  mentionCount: integer("mention_count").notNull().default(1),
  // なぜmentionCount: エンティティの重要度計算に使用。
  // 同じエンティティが複数回検出されたらインクリメント。
});
```

### 2.2 インデックス設計と理由

| インデックス名                      | カラム               | 種類   | なぜ必要か                                       |
| ----------------------------------- | -------------------- | ------ | ------------------------------------------------ |
| `entities_normalized_name_type_idx` | normalized_name+type | UNIQUE | 同じタイプで同じ正規化名のエンティティは1つだけ  |
| `entities_type_idx`                 | type                 | 通常   | 「personだけ取得」のようなタイプ別クエリが高速に |
| `entities_importance_idx`           | importance           | 通常   | 重要度順ソートが高速に（TOP N取得で使用）        |
| `entities_updated_at_idx`           | updated_at           | 通常   | 「最近更新されたエンティティ」の取得が高速に     |

**なぜ複合インデックス (normalized_name+type)**:

- `WHERE normalized_name = ? AND type = ?` のクエリを最適化
- typeとnormalized_nameの組み合わせで一意性を保証（同名でも異なるタイプなら別エンティティ）

### 2.3 relationsテーブル

```typescript
export const graphRelations = sqliteTable("relations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // ===== 外部キー =====
  sourceId: text("source_id")
    .notNull()
    .references(() => entities.id, { onDelete: "cascade" }),
  // なぜCASCADE: エンティティが削除されたら、そのエンティティを始点とする
  // 関係も自動削除。孤立した関係を防ぐ。

  targetId: text("target_id")
    .notNull()
    .references(() => entities.id, { onDelete: "cascade" }),

  // ===== 関係属性 =====
  type: text("type", { enum: relationTypes }).notNull(),
  // なぜenum: 関係タイプを制限し、一貫性を保証。
  // "RELATED_TO" vs "related_to" のような表記ゆれを防ぐ。

  weight: real("weight").notNull().default(1.0),
  // なぜweight: 同じ関係が複数回抽出されたら重みを増加させる。
  // GraphRAGでの経路検索時に重み付けとして使用。

  bidirectional: integer("bidirectional", { mode: "boolean" })
    .notNull()
    .default(false),
  // なぜbidirectional: "友達"のような対称関係をフラグで表現。
  // 逆方向のエッジを2本作るより効率的。

  description: text("description"),
  // なぜdescription: LLMが抽出した関係の説明文を保存。
  // 例: "AはBを開発した" → "OpenAIがGPT-4を開発"

  metadata: text("metadata", { mode: "json" })
    .$type<RelationMetadata>()
    .notNull()
    .default({}),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  firstSeenAt: integer("first_seen_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
```

**なぜ変数名が `graphRelations` か**:
Drizzle ORMには `relations()` という関数があり、テーブル間のリレーションを定義するために使用します。もしテーブル変数を `relations` にすると、この関数と名前が衝突します。

```typescript
// ❌ 衝突する例
import { relations } from "drizzle-orm";
import { relations } from "./relations"; // 名前衝突!

// ⭕ 解決策
import { relations } from "drizzle-orm";
import { graphRelations } from "./relations"; // OK
```

### 2.4 外部キー設計と削除戦略

| 参照元テーブル     | 参照先      | 削除時動作 | なぜこの戦略か                                           |
| ------------------ | ----------- | ---------- | -------------------------------------------------------- |
| relations          | entities    | CASCADE    | エンティティ削除時、関連する関係も意味をなさないため削除 |
| relation_evidence  | relations   | CASCADE    | 関係削除時、その証拠も不要になるため削除                 |
| relation_evidence  | chunks      | CASCADE    | チャンク削除時、そこから抽出した証拠も削除               |
| communities        | communities | SET NULL   | 親削除時、子は孤立させて後で再割当て可能に               |
| entity_communities | entities    | CASCADE    | エンティティ削除時、所属情報も削除                       |
| entity_communities | communities | CASCADE    | コミュニティ削除時、所属情報も削除                       |
| chunk_entities     | chunks      | CASCADE    | チャンク削除時、出現情報も削除                           |
| chunk_entities     | entities    | CASCADE    | エンティティ削除時、出現情報も削除                       |

**なぜcommunitiesだけSET NULL**:
コミュニティは階層構造（木構造）を持ちます。親コミュニティを削除したとき、子コミュニティを連鎖削除すると大量のデータが失われます。SET NULLにすることで、子コミュニティは「孤児」となり、後から別の親に再割当てできます。

---

## 3. 型定義と設計思想

### 3.1 エンティティタイプ（14種類）

```typescript
export const entityTypes = [
  // ===== 一般カテゴリ =====
  "person", // 人物: "田中太郎", "Elon Musk"
  "organization", // 組織: "OpenAI", "経済産業省"
  "location", // 場所: "東京", "Silicon Valley"
  "date", // 日付: "2024年1月1日", "Q4 2023"
  "event", // イベント: "World Cup", "決算発表"

  // ===== 技術カテゴリ =====
  "technology", // 技術: "機械学習", "React"
  "concept", // 概念: "アジャイル開発", "マイクロサービス"
  "product", // 製品: "iPhone", "GPT-4"

  // ===== コードカテゴリ（技術文書向け）=====
  "api", // API: "OpenAI API", "REST API"
  "function", // 関数: "useEffect", "createClient"
  "class", // クラス: "UserService", "DatabaseConnection"

  // ===== 文書カテゴリ =====
  "document", // ドキュメント: "設計書", "README.md"
  "section", // セクション: "第3章", "概要セクション"

  // ===== フォールバック =====
  "other", // その他: 上記に分類できないもの
] as const;
```

**なぜこの14種類か**:

- **一般カテゴリ**: ビジネス文書・ニュース記事から抽出されるエンティティをカバー
- **技術カテゴリ**: ソフトウェア開発・技術文書に特化したエンティティ
- **コードカテゴリ**: ソースコード解析時に抽出されるプログラム要素
- **文書カテゴリ**: ドキュメント間の参照関係を表現
- **other**: 分類できないエンティティの受け皿（LLMの出力は予測不能なため必須）

### 3.2 関係タイプ（23種類）

```typescript
export const relationTypes = [
  // ===== 汎用関係（最も頻繁に使用）=====
  "related_to", // 関連: 具体的な関係が不明な場合のフォールバック
  "depends_on", // 依存: A は B に依存する
  "implements", // 実装: A は B を実装する
  "extends", // 拡張: A は B を拡張する
  "contains", // 包含: A は B を含む

  // ===== 参照関係（コード・ドキュメント向け）=====
  "references", // 参照: A は B を参照する
  "calls", // 呼出: A は B を呼び出す
  "imports", // 導入: A は B をインポートする
  "exports", // 公開: A は B をエクスポートする
  "creates", // 作成: A は B を作成する
  "modifies", // 変更: A は B を変更する

  // ===== 所属関係 =====
  "uses", // 使用: A は B を使用する
  "part_of", // 部分: A は B の一部である
  "belongs_to", // 所属: A は B に所属する

  // ===== 因果・時系列 =====
  "causes", // 原因: A は B を引き起こす
  "precedes", // 先行: A は B より前に起こる
  "follows", // 後続: A は B の後に起こる

  // ===== 類似・対比 =====
  "similar_to", // 類似: A は B に似ている
  "opposite_of", // 対比: A は B の反対である
  "synonym_of", // 同義: A は B と同じ意味

  // ===== 階層・分類 =====
  "instance_of", // 例示: A は B の一例である
  "subclass_of", // 下位: A は B の下位概念である
  "has_property", // 属性: A は B という属性を持つ
] as const;
```

**なぜこの23種類か**:

- **汎用関係**: ほとんどの文書で出現する基本的な関係
- **参照関係**: ソースコード解析・技術文書で重要
- **因果・時系列**: 時間軸を持つ分析（インシデント分析、プロジェクト追跡）
- **類似・対比**: セマンティック検索の補強、同義語解決
- **階層・分類**: オントロジー構築、概念の階層化

---

## 4. Drizzle ORM リレーション

### 4.1 なぜリレーションを定義するか

Drizzle ORMのリレーション定義は、**N+1問題を防ぐ**ために使用します。

```typescript
// ❌ リレーションなしの場合（N+1問題）
const entity = await db.query.entities.findFirst({
  where: eq(entities.id, id),
});
// 1回目のクエリ

const relations = await db.query.graphRelations.findMany({
  where: eq(graphRelations.sourceId, entity.id),
});
// 2回目のクエリ（entityごとに実行されると N+1 になる）

// ⭕ リレーションありの場合（JOINで1回のクエリ）
const entityWithRelations = await db.query.entities.findFirst({
  where: eq(entities.id, id),
  with: {
    outgoingRelations: true, // JOINで取得
  },
});
```

### 4.2 リレーション定義

```typescript
// エンティティのリレーション
export const entitiesRelations = relations(entities, ({ many }) => ({
  // outgoing: このエンティティが「始点」となる関係
  outgoingRelations: many(graphRelations, { relationName: "sourceEntity" }),

  // incoming: このエンティティが「終点」となる関係
  incomingRelations: many(graphRelations, { relationName: "targetEntity" }),

  // communities: このエンティティが所属するコミュニティ（多対多）
  communities: many(entityCommunities),

  // chunks: このエンティティが出現するチャンク（多対多）
  chunks: many(chunkEntities),
}));
```

**なぜrelationNameが必要か**:
relationsテーブルは `source_id` と `target_id` の2つの外部キーでentitiesを参照します。Drizzleがどちらの外部キーを使うか区別するために、`relationName` で名前を付けます。

### 4.3 使用例（グラフトラバーサル）

```typescript
// エンティティと、そこから出ていく関係、関係の先のエンティティを一括取得
const entityWithGraph = await db.query.entities.findFirst({
  where: eq(entities.id, entityId),
  with: {
    outgoingRelations: {
      with: {
        targetEntity: true, // 関係の終点エンティティも取得
        evidence: true, // 関係の証拠も取得
      },
    },
    incomingRelations: {
      with: {
        sourceEntity: true, // 関係の始点エンティティも取得
      },
    },
    communities: {
      with: {
        community: true, // 所属コミュニティの詳細も取得
      },
    },
  },
});
```

---

## 5. テスト戦略

### 5.1 テスト構成と目的

| テストファイル                | テスト数 | 検証目的                                       |
| ----------------------------- | -------- | ---------------------------------------------- |
| entities.test.ts              | 33       | カラム定義、デフォルト値、インデックス存在確認 |
| graph-relations-table.test.ts | 39       | 外部キー制約、CASCADE削除の動作確認            |
| relation-evidence.test.ts     | 19       | 複合主キーの動作、証拠チェーンの整合性         |
| communities.test.ts           | 24       | 自己参照FK、階層構造の正しさ                   |
| junction-tables.test.ts       | 31       | 中間テーブルの複合主キー、多対多の正しさ       |
| graph-relations.test.ts       | 23       | Drizzle relations定義の正確性                  |
| index.test.ts                 | 29       | 全エクスポートの存在確認、型推論の正しさ       |
| **合計**                      | **198**  |                                                |

### 5.2 なぜスキーマにテストが必要か

Drizzle ORMのスキーマ定義は「設定」であり、通常のコードカバレッジでは測定されません。しかし、以下の理由でテストは重要です：

1. **リグレッション防止**: スキーマ変更時に既存の定義を壊していないか確認
2. **ドキュメント代わり**: テストを読めば「このカラムは何のためにあるか」がわかる
3. **型推論の確認**: `InferSelectModel<typeof entities>` が期待通りの型を返すか確認

---

## 6. 使用上の注意と制約

### 6.1 SQLite外部キーの有効化

```sql
PRAGMA foreign_keys = ON;
```

**なぜ必要か**: SQLiteは**デフォルトで外部キー制約が無効**です。有効化しないと、CASCADE削除が機能せず、参照整合性が壊れます。

```typescript
// Drizzle + better-sqlite3 での有効化
const db = drizzle(sqlite, {
  schema,
});
sqlite.exec("PRAGMA foreign_keys = ON");
```

### 6.2 バッチ処理の推奨サイズ

| 操作   | 推奨サイズ | 理由                                            |
| ------ | ---------- | ----------------------------------------------- |
| INSERT | 100-500件  | SQLiteのステートメントサイズ制限（約1MB）を考慮 |
| UPDATE | 100件      | トランザクションロック時間を短縮                |
| DELETE | 100件      | CASCADE削除による連鎖的な削除を制御             |

### 6.3 パフォーマンス注意点

1. **JSONカラムの検索**: `metadata` や `aliases` はインデックスが効かない。頻繁に検索するフィールドは専用カラムに抽出を検討。

2. **グラフトラバーサルの深度制限**: 再帰的なグラフ探索は深度を制限しないとパフォーマンスが劣化。

3. **ベクトル検索との使い分け**: 類似エンティティ検索は `embedding` カラムでベクトル検索、関係探索はグラフクエリと使い分ける。

---

## 7. 次のステップ

| タスクID   | タスク名                   | 依存関係         | 説明                              |
| ---------- | -------------------------- | ---------------- | --------------------------------- |
| CONV-04-06 | マイグレーション生成・適用 | 本タスク完了後   | スキーマをDBに反映                |
| CONV-08-01 | Knowledge Graph Store 実装 | CONV-04-06完了後 | CRUD操作とグラフクエリのAPI層実装 |

---

## 8. 用語集

| 用語               | 説明                                                            |
| ------------------ | --------------------------------------------------------------- |
| GraphRAG           | Graph Retrieval-Augmented Generation。グラフ構造を使ったRAG手法 |
| Entity             | 実体。人、場所、概念など識別可能な「もの」                      |
| Relation           | 関係。2つのEntity間のつながり                                   |
| Community          | コミュニティ。関連性の高いEntityのクラスター                    |
| CASCADE削除        | 親レコード削除時に子レコードも自動削除する制約                  |
| SET NULL           | 親レコード削除時に子の外部キーをNULLにする制約                  |
| N+1問題            | ループ内でクエリを発行し、N+1回のクエリが発生する非効率パターン |
| 複合主キー         | 複数カラムの組み合わせで一意性を保証する主キー                  |
| バレルエクスポート | index.tsで複数モジュールをまとめて再エクスポートするパターン    |
| Leidenアルゴリズム | グラフからコミュニティを検出するアルゴリズム                    |
