# 型安全クエリ・マイグレーション データベース設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 型安全なクエリ実装

### Drizzle ORM使用時のベストプラクティス

1. **スキーマからの型推論を活用する**
   - `InferSelectModel`と`InferInsertModel`を使用して型を生成
   - 手動で型定義を二重管理しない

2. **リレーションを明示的に定義する**
   - `relations()`関数でテーブル間の関係を宣言
   - `with`オプションで関連データを一括取得し、N+1問題を回避

3. **JSON カラムにはZodスキーマを併用する**
   - `.$type<T>()`で型を指定しつつ、ランタイムバリデーションも行う
   - スキーマ変更時はZodスキーマも更新する

4. **クエリビルダーのメソッドチェーンを活用する**
   - `where()`, `orderBy()`, `limit()`などを適切に組み合わせる
   - 動的な条件は配列に集めて`and()`で結合

### トランザクション処理の注意点

1. **トランザクション境界を明確にする**
   - 複数テーブルへの書き込みは必ずトランザクション内で行う
   - `db.transaction()`のコールバック内で全操作を完結させる

2. **エラー時の自動ロールバック**
   - トランザクション内で例外が発生すると自動的にロールバックされる
   - catchブロックで部分的なコミットを試みない

3. **デッドロック対策**
   - 複数テーブルへのアクセス順序を統一する
   - リトライ処理を実装し、一時的な競合に対応する

### バッチ処理のベストプラクティス

1. **一括挿入を使用する**
   - ループ内での個別insertではなく、`values()`に配列を渡す
   - 大量データは1000件程度のチャンクに分割

2. **大量削除は段階的に行う**
   - `LIMIT`を使って少しずつ削除し、ロック時間を短縮
   - 本番環境では営業時間外に実行することを推奨

3. **集計クエリの最適化**
   - `sql`タグ付きテンプレートで集計関数を使用
   - カバリングインデックスを活用し、テーブルスキャンを回避

---

## Embedded Replicas とオフライン対応

### Embedded Replicasの仕組み

Turso の Embedded Replicas は、ローカルの SQLite ファイルとクラウドの Turso DB を自動同期する機能。デスクトップアプリのオフライン動作に最適。

### 初期化時の設定項目

| 設定項目     | 説明                   | 推奨値    |
| ------------ | ---------------------- | --------- |
| url          | ローカルDBファイルパス | file:パス |
| syncUrl      | 同期先のTurso URL      | libsql:// |
| authToken    | Turso認証トークン      | 環境変数  |
| syncInterval | 自動同期間隔（秒）     | 60        |

### 同期フロー

1. **オフライン時**: ローカルSQLiteファイルに対して読み書きを行う
2. **オンライン復帰時**: `client.sync()`を呼び出して差分をTursoに送信
3. **定期同期**: `syncInterval`で指定した間隔でバックグラウンド同期
4. **競合発生時**: 設定した競合解決戦略に従って解決

### 競合解決戦略

| 戦略            | 説明                       | 適用シーン                 |
| --------------- | -------------------------- | -------------------------- |
| last_write_wins | 最後に書き込まれた値を採用 | 設定値など、最新が正の場合 |
| manual          | ユーザーに選択を委ねる     | 重要データの競合           |
| merge           | フィールドごとにマージ     | 部分的な更新が可能な場合   |

### 同期状態の監視

- 同期の成功/失敗をUIに表示する
- 競合発生時はユーザーに通知する
- オフライン状態を明示的に表示する
- 同期エラーが続く場合は手動同期ボタンを提供する

### オフライン対応の注意点

1. **データ整合性**: オフライン中に作成されたIDが重複しないよう、UUIDを使用する
2. **タイムスタンプ**: クライアント時刻のずれに注意し、サーバー時刻での補正を検討
3. **同期順序**: 依存関係のあるデータは親→子の順序で同期する
4. **ストレージ容量**: ローカルDBのサイズを監視し、古いデータは定期的にクリーンアップ

---

## マイグレーション管理

### Drizzle Kit の使用方法

| コマンド                      | 用途                                      |
| ----------------------------- | ----------------------------------------- |
| `pnpm drizzle-kit generate`   | スキーマ変更からマイグレーションSQLを生成 |
| `pnpm drizzle-kit push`       | マイグレーションを直接DBに適用（開発用）  |
| `pnpm drizzle-kit migrate`    | マイグレーションを順次適用（本番用）      |
| `pnpm drizzle-kit studio`     | Web UIでDBを確認・操作                    |
| `pnpm drizzle-kit introspect` | 既存DBからスキーマを逆生成                |

### マイグレーション運用原則

1. **バージョン管理必須**
   - 生成されたマイグレーションファイルは必ずGit管理する
   - マイグレーションファイルを手動編集した場合はコメントで理由を記載

2. **ロールバック可能な設計**
   - 破壊的変更（カラム削除等）は段階的に行う
   - 旧カラムを一定期間残し、移行完了後に削除

3. **データ移行とスキーマ変更の分離**
   - 大量データの移行はマイグレーションとは別のスクリプトで行う
   - 本番適用前にステージング環境で十分にテスト

4. **ダウンタイム最小化**
   - カラム追加は即時反映可能（ダウンタイムなし）
   - カラム削除・型変更は慎重に計画

### 本番デプロイ時のチェックリスト

- [ ] ステージング環境でマイグレーションをテスト済み
- [ ] ロールバック手順を確認済み
- [ ] バックアップを取得済み
- [ ] 想定実行時間を見積もり済み
- [ ] 影響範囲をチームに共有済み

---

## テスト戦略

### ユニットテストでのDB設定

1. **インメモリDBを使用する**
   - `url: ':memory:'`でインメモリSQLiteを作成
   - テストごとにクリーンな状態から開始

2. **テスト前にマイグレーションを適用する**
   - `beforeEach`で毎回DBを初期化
   - 本番と同じスキーマでテスト

3. **テストデータはファクトリ関数で生成する**
   - 必要最小限のデータを動的に生成
   - ハードコードされたテストデータを避ける

### テストデータのシード

- 開発環境用のシードスクリプトを用意する
- 現実的なサンプルデータを生成する
- 外部APIキーなどの機密情報はダミー値を使用

### 統合テストの考慮事項

1. **テスト用DBの分離**: テストは専用のDBインスタンスを使用
2. **並列実行**: テスト間でデータが干渉しないよう設計
3. **クリーンアップ**: テスト後に作成したデータを削除

---

## エラーハンドリング

### DB接続エラーへの対応

1. **リトライ処理を実装する**
   - 最大リトライ回数: 3回
   - 指数バックオフ: 1秒 → 2秒 → 4秒

2. **エラーの種類を分類する**
   - 接続エラー: リトライ対象
   - クエリエラー: 即座に失敗
   - タイムアウト: リトライ対象

3. **ユーザーへのフィードバック**
   - 接続エラー時は明確なメッセージを表示
   - リトライ中であることを示す

### デッドロック対応

- トランザクションの取得順序を統一する
- 競合が予想される操作にはリトライを実装
- 長時間のトランザクションを避ける

### データ整合性エラー

- 外部キー制約違反は適切にキャッチしてエラーメッセージを返す
- UNIQUE制約違反は重複チェックのロジックを見直す
- NOT NULL制約違反は入力バリデーションを強化

---

## ベクトル検索実装（DiskANN）

### 概要

libSQLのDiskANNベクトルインデックスを使用したセマンティック検索機能。
RAGシステムの類似度検索基盤として実装。

**実装場所**: `packages/shared/src/db/queries/vector-search.ts`

### embeddingsテーブル

| カラム              | 型        | 制約                       | 説明               |
| ------------------- | --------- | -------------------------- | ------------------ |
| id                  | TEXT      | PRIMARY KEY                | 埋め込みID（UUID） |
| chunk_id            | TEXT      | UNIQUE, FK→chunks(id)      | チャンク参照       |
| vector              | BLOB      | NOT NULL                   | Float32Arrayバイナリ |
| model_id            | TEXT      | NOT NULL                   | 埋め込みモデルID   |
| dimensions          | INTEGER   | NOT NULL                   | ベクトル次元数     |
| normalized_magnitude| REAL      | NOT NULL                   | 正規化済みマグニチュード |
| created_at          | INTEGER   | DEFAULT unixepoch()        | 作成日時           |
| updated_at          | INTEGER   | DEFAULT unixepoch()        | 更新日時           |

**インデックス**:
- `embeddings_chunk_id_idx`: UNIQUE（高速ルックアップ）
- `embeddings_model_id_idx`: モデル別集計用
- `embeddings_vector_idx`: DiskANNベクトルインデックス

### ベクトル検索関数

| 関数                | 距離メトリクス | 用途                  |
| ------------------- | -------------- | --------------------- |
| searchByVector      | コサイン類似度 | セマンティック検索    |
| searchByVectorL2    | ユークリッド距離 | 空間的な類似検索    |
| searchByVectorDot   | 内積           | 正規化ベクトル向け    |

### Float32Array ⇔ BLOB 変換

ベクトルデータはFloat32Array形式でアプリケーション層で扱い、データベースにはBLOB（バイナリ）形式で保存する。変換はゼロコピー操作で効率的に行われる。

**変換制約**:
- 空のベクトルは禁止（要素数が1以上であること）
- BLOBのバイト長は4の倍数であること（Float32は4バイト単位）
- 変換時にNaN、Infinity、-Infinityが含まれていないことを検証

### バッチ挿入

大量の埋め込みを効率的に挿入するため、100件単位のバッチ処理を実装。トランザクション内で処理され、挿入前にすべてのベクトルがバリデーションされる。いずれかのベクトルが不正な場合は全体がロールバックされる。

### パフォーマンス目標

| データ規模   | 検索時間目標 | インデックス |
| ------------ | ------------ | ------------ |
| < 10,000件   | < 50ms       | 任意         |
| 10,000-100,000件 | < 100ms  | 推奨         |
| > 100,000件  | < 200ms      | 必須         |

---

## Knowledge Graphテーブル群（GraphRAG基盤）

### 概要

GraphRAG（Graph Retrieval-Augmented Generation）のKnowledge Graph構造をSQLiteで永続化するためのテーブル群。
Entity-Relation-Communityモデルに基づき、文書から抽出されたエンティティ、関係性、コミュニティを格納する。

**実装場所**: `packages/shared/src/db/schema/graph/`

### entitiesテーブル（ノード）

Knowledge Graphのノード（頂点）を格納するテーブル。

| カラム             | 型      | 制約                  | 説明                        |
| ------------------ | ------- | --------------------- | --------------------------- |
| id                 | TEXT    | PRIMARY KEY           | エンティティID（UUID）      |
| name               | TEXT    | NOT NULL              | エンティティ名（元の形式）  |
| normalized_name    | TEXT    | NOT NULL              | 正規化されたエンティティ名  |
| type               | TEXT    | NOT NULL              | エンティティタイプ（52種類）|
| description        | TEXT    | NULL                  | エンティティの説明          |
| aliases            | TEXT    | NOT NULL DEFAULT '[]' | 別名（JSON配列）            |
| embedding          | BLOB    | NULL                  | ベクトル埋め込み            |
| embedding_model_id | TEXT    | NULL                  | 埋め込みモデルID            |
| importance         | REAL    | NOT NULL DEFAULT 0.5  | 重要度スコア（0.0〜1.0）    |
| mention_count      | INTEGER | NOT NULL DEFAULT 1    | 出現回数                    |
| metadata           | TEXT    | NULL                  | 追加メタデータ（JSON）      |
| created_at         | INTEGER | DEFAULT unixepoch()   | 作成日時（Unix epoch）      |
| updated_at         | INTEGER | DEFAULT unixepoch()   | 更新日時（Unix epoch）      |

**インデックス**:
- `entities_normalized_name_idx`: 正規化名検索用
- `entities_type_idx`: タイプ別検索用
- `entities_importance_idx`: 重要度順ソート用
- `entities_name_type_idx`: UNIQUE（正規化名＋タイプ）

**エンティティタイプ（52種類）**:

| カテゴリ     | タイプ                                                              |
| ------------ | ------------------------------------------------------------------- |
| 人物・組織   | `person`, `organization`, `company`, `team`, `department`           |
| 場所         | `location`, `country`, `city`, `region`, `building`, `address`      |
| 時間         | `date`, `time`, `datetime`, `period`, `duration`                    |
| 技術         | `technology`, `framework`, `library`, `tool`, `platform`            |
| コード       | `api`, `endpoint`, `function`, `method`, `class`, `interface`, `module`, `package`, `variable`, `constant` |
| ドキュメント | `document`, `file`, `section`, `chapter`, `paragraph`               |
| データ       | `database`, `table`, `column`, `schema`, `index`, `query`           |
| 概念         | `concept`, `pattern`, `principle`, `methodology`, `architecture`    |
| プロダクト   | `product`, `service`, `feature`, `version`, `release`               |
| イベント     | `event`, `meeting`, `milestone`, `deadline`                         |
| フォールバック | `other`                                                           |

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

### relationsテーブル（エッジ）

Knowledge Graphのエッジ（辺）を格納するテーブル。

| カラム         | 型      | 制約                      | 説明                      |
| -------------- | ------- | ------------------------- | ------------------------- |
| id             | TEXT    | PRIMARY KEY               | 関係ID（UUID）            |
| source_id      | TEXT    | FK→entities(id) CASCADE   | 始点エンティティID        |
| target_id      | TEXT    | FK→entities(id) CASCADE   | 終点エンティティID        |
| type           | TEXT    | NOT NULL                  | 関係タイプ（15種類）      |
| description    | TEXT    | NULL                      | 関係の説明                |
| weight         | REAL    | NOT NULL DEFAULT 0.5      | 関係の強さ（0.0〜1.0）    |
| bidirectional  | INTEGER | NOT NULL DEFAULT 0        | 双方向関係フラグ          |
| evidence_count | INTEGER | NOT NULL DEFAULT 1        | 証拠数（裏付けチャンク数）|
| metadata       | TEXT    | NULL                      | 追加メタデータ（JSON）    |
| created_at     | INTEGER | DEFAULT unixepoch()       | 作成日時                  |
| updated_at     | INTEGER | DEFAULT unixepoch()       | 更新日時                  |

**インデックス**:
- `relations_source_id_idx`: 始点エンティティ検索用
- `relations_target_id_idx`: 終点エンティティ検索用
- `relations_type_idx`: タイプ別検索用
- `relations_weight_idx`: 重み順ソート用
- `relations_source_target_type_idx`: UNIQUE（始点＋終点＋タイプ）

**関係タイプ（15種類）**:

| カテゴリ   | タイプ                                              |
| ---------- | --------------------------------------------------- |
| 一般       | `related_to`, `part_of`, `has_part`, `belongs_to`   |
| コード     | `uses`, `implements`, `extends`, `depends_on`       |
| 参照       | `references`, `defines`                             |
| 階層       | `contains`, `contained_by`                          |
| 時間       | `precedes`, `follows`, `created_by`                 |

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

**注記**: 変数名は`graphRelations`を使用（Drizzle ORMの`relations`関数との衝突回避）

### relation_evidenceテーブル（証拠）

関係の出典チャンク情報を格納する中間テーブル。

| カラム      | 型      | 制約                     | 説明                    |
| ----------- | ------- | ------------------------ | ----------------------- |
| relation_id | TEXT    | PK, FK→relations CASCADE | 関係ID                  |
| chunk_id    | TEXT    | PK, FK→chunks CASCADE    | チャンクID              |
| excerpt     | TEXT    | NOT NULL                 | 証拠テキスト抜粋        |
| confidence  | REAL    | NOT NULL DEFAULT 0.5     | 信頼度（0.0〜1.0）      |
| created_at  | INTEGER | DEFAULT unixepoch()      | 作成日時                |
| updated_at  | INTEGER | DEFAULT unixepoch()      | 更新日時                |

**インデックス**:
- `relation_evidence_relation_id_idx`: 関係別検索用
- `relation_evidence_chunk_id_idx`: チャンク別検索用

### communitiesテーブル（クラスター）

Leiden Algorithmによるコミュニティクラスターを格納するテーブル。

| カラム             | 型      | 制約                    | 説明                      |
| ------------------ | ------- | ----------------------- | ------------------------- |
| id                 | TEXT    | PRIMARY KEY             | コミュニティID（UUID）    |
| level              | INTEGER | NOT NULL DEFAULT 0      | 階層レベル（0=ルート）    |
| parent_id          | TEXT    | FK→communities SET NULL | 親コミュニティID          |
| name               | TEXT    | NOT NULL                | コミュニティ名（LLM生成） |
| summary            | TEXT    | NOT NULL                | コミュニティ要約（LLM生成）|
| member_count       | INTEGER | NOT NULL DEFAULT 0      | メンバー数                |
| embedding          | BLOB    | NULL                    | ベクトル埋め込み          |
| embedding_model_id | TEXT    | NULL                    | 埋め込みモデルID          |
| created_at         | INTEGER | DEFAULT unixepoch()     | 作成日時                  |
| updated_at         | INTEGER | DEFAULT unixepoch()     | 更新日時                  |

**インデックス**:
- `communities_level_idx`: 階層レベル別検索用
- `communities_parent_id_idx`: 親コミュニティ検索用

### entity_communitiesテーブル（多対多）

エンティティとコミュニティの多対多関係を格納する中間テーブル。

| カラム       | 型   | 制約                       | 説明             |
| ------------ | ---- | -------------------------- | ---------------- |
| entity_id    | TEXT | PK, FK→entities CASCADE    | エンティティID   |
| community_id | TEXT | PK, FK→communities CASCADE | コミュニティID   |

**インデックス**:
- `entity_communities_entity_id_idx`: エンティティ別検索用
- `entity_communities_community_id_idx`: コミュニティ別検索用

### chunk_entitiesテーブル（出現情報）

チャンク内のエンティティ出現情報を格納する中間テーブル。

| カラム        | 型      | 制約                    | 説明                         |
| ------------- | ------- | ----------------------- | ---------------------------- |
| chunk_id      | TEXT    | PK, FK→chunks CASCADE   | チャンクID                   |
| entity_id     | TEXT    | PK, FK→entities CASCADE | エンティティID               |
| mention_count | INTEGER | NOT NULL DEFAULT 1      | チャンク内出現回数           |
| positions     | TEXT    | NOT NULL DEFAULT '[]'   | 出現位置（JSON配列）         |

**positions JSON形式**:
```typescript
interface EntityPosition {
  startChar: number;    // 開始文字位置
  endChar: number;      // 終了文字位置
  surfaceForm: string;  // 表層形（実際のテキスト表記）
}
```

**インデックス**:
- `chunk_entities_chunk_id_idx`: チャンク別検索用
- `chunk_entities_entity_id_idx`: エンティティ別検索用

### Drizzleリレーション定義

`graph-relations.ts`で6つのリレーションを定義:

| リレーション                 | 定義内容                                  |
| ---------------------------- | ----------------------------------------- |
| entitiesRelations            | エンティティ→関係・コミュニティ・チャンク |
| graphRelationsTableRelations | 関係→始点/終点エンティティ・証拠         |
| relationEvidenceRelations    | 証拠→関係・チャンク                       |
| communitiesRelations         | コミュニティ→親子・メンバー               |
| entityCommunitiesRelations   | 中間テーブル→エンティティ・コミュニティ   |
| chunkEntitiesRelations       | 中間テーブル→チャンク・エンティティ       |

### テストカバレッジ（スキーマ）

| テストファイル                | テスト数 | 検証内容                       |
| ----------------------------- | -------- | ------------------------------ |
| entities.test.ts              | 33       | テーブル・カラム・インデックス |
| graph-relations-table.test.ts | 39       | 外部キー・CASCADE動作          |
| relation-evidence.test.ts     | 19       | 複合主キー・証拠チェーン       |
| communities.test.ts           | 24       | 階層構造・自己参照             |
| junction-tables.test.ts       | 31       | 中間テーブル・複合主キー       |
| graph-relations.test.ts       | 23       | Drizzleリレーション定義        |
| index.test.ts                 | 29       | エクスポート・型安全性         |
| **合計**                      | **198**  |                                |

### テストカバレッジ（Knowledge Graph Store）

| テストファイル                | テスト数 | 検証内容                       |
| ----------------------------- | -------- | ------------------------------ |
| knowledge-graph-store.test.ts | 178      | ストア全機能（CRUD・クエリ等） |

**カバレッジ**: Line 87.96%, Branch 77.77%, Function 100%

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

---

## パフォーマンス最適化

### クエリ最適化のポイント

1. **N+1問題を回避する**
   - リレーションデータは`with`オプションで一括取得
   - ループ内でのクエリ発行を避ける

2. **必要なカラムのみ取得する**
   - `select()`で必要なカラムを明示的に指定
   - `*`による全カラム取得を避ける

3. **インデックスを活用する**
   - WHERE句で使用するカラムにはインデックスを追加
   - 複合検索には複合インデックスを検討

4. **EXPLAIN ANALYZEで実行計画を確認する**
   - 遅いクエリは実行計画を確認して改善

### バッチ処理の最適化

- 大量INSERT: 1000件程度のチャンクに分割
- 大量UPDATE: 主キーでの範囲指定を活用
- 大量DELETE: LIMITで段階的に削除

### 接続管理

- 接続はシングルトンで管理
- 不要な接続の作成を避ける
- 長時間のアイドル接続は定期的にリフレッシュ

---
