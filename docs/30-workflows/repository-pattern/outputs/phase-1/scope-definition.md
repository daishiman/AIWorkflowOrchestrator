# スコープ定義 - Repository パターン実装

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| タスクID | CONV-04-06              |
| タスク名 | Repository パターン実装 |
| 作成日   | 2026-01-05              |

---

## 1. スコープ（含む）

### 1.1 実装対象Repository

| Repository       | 対象テーブル | 優先度 | 備考                        |
| ---------------- | ------------ | ------ | --------------------------- |
| BaseRepository   | -            | 必須   | 抽象基底クラス              |
| FileRepository   | files        | 必須   | ファイルメタデータ          |
| ChunkRepository  | chunks       | 必須   | テキストチャンク            |
| EntityRepository | entities     | 必須   | Knowledge Graphエンティティ |

### 1.2 実装対象機能

**BaseRepository（汎用CRUD）**

- [x] findById - ID検索
- [x] findAll - ページネーション付き全件取得
- [x] create - 1件作成
- [x] createMany - バッチ作成
- [x] update - 更新
- [x] delete - 削除
- [x] exists - 存在確認
- [x] count - 件数取得

**FileRepository（固有機能）**

- [x] findByHash - ハッシュ検索
- [x] findByPath - パス検索
- [x] findByCategory - カテゴリ検索
- [x] softDelete - 論理削除
- [x] findByIds - 複数ID一括取得

**ChunkRepository（固有機能）**

- [x] findByFileId - ファイルID検索
- [x] deleteByFileId - ファイルID一括削除
- [x] findByHash - ハッシュ検索
- [x] findByIds - 複数ID一括取得
- [x] findAdjacent - 隣接チャンク取得

**EntityRepository（固有機能）**

- [x] findByNormalizedNameAndType - 正規化名+タイプ検索
- [x] findByType - タイプ検索
- [x] searchByName - 名前部分一致検索
- [x] findTopByImportance - 重要度上位取得
- [x] upsert - Upsert処理

**共通機能**

- [x] ファクトリ関数 `createRepositories(db)`
- [x] バレルエクスポート（index.ts）

### 1.3 品質要件

- [x] 全メソッドが `Result<T, RAGError>` を返却
- [x] Branded ID型の使用（FileId, ChunkId, EntityId）
- [x] ページネーション対応（PaginationParams, PaginatedResult）
- [x] エラーハンドリング（ErrorCodes使用）
- [x] 単体テスト（80%以上カバレッジ目標）

---

## 2. スコープ外（含まない）

### 2.1 今回実装しないRepository

| Repository           | 理由                   | 将来タスク候補 |
| -------------------- | ---------------------- | -------------- |
| RelationRepository   | 依存タスク完了後に実装 | CONV-04-07相当 |
| CommunityRepository  | 依存タスク完了後に実装 | CONV-04-07相当 |
| EmbeddingRepository  | 依存タスク完了後に実装 | CONV-04-07相当 |
| ConversionRepository | 依存タスク完了後に実装 | CONV-04-07相当 |

### 2.2 今回実装しない機能

| 機能                 | 理由                          |
| -------------------- | ----------------------------- |
| トランザクション管理 | サービス層で実装              |
| キャッシュ機構       | 別途インフラ層で実装          |
| ベクトル検索         | 専用Queryクラスで実装（既存） |
| 全文検索（FTS5）     | 専用Queryクラスで実装（既存） |
| 複雑なJOINクエリ     | 専用Queryクラスで分離         |
| バルクアップデート   | 必要に応じて追加              |
| ソフトデリート復元   | 必要に応じて追加              |

### 2.3 テスト対象外

| 項目                 | 理由                 |
| -------------------- | -------------------- |
| 統合テスト（E2E）    | 別フェーズで実施     |
| パフォーマンステスト | 別途計測タスクで実施 |
| 負荷テスト           | 本番環境準備後に実施 |

---

## 3. 前提条件

### 3.1 依存タスクの完了

| タスクID   | タスク名                     | ステータス |
| ---------- | ---------------------------- | ---------- |
| CONV-04-02 | files/conversions テーブル   | 完了       |
| CONV-04-03 | content_chunks + FTS5        | 完了       |
| CONV-04-04 | DiskANN ベクトルインデックス | 完了       |
| CONV-04-05 | Knowledge Graph テーブル群   | 完了       |

### 3.2 既存コードの利用

| コード              | パス                      | 用途              |
| ------------------- | ------------------------- | ----------------- |
| Result型            | `types/rag/result.ts`     | 成功/失敗ラッパー |
| RAGError/ErrorCodes | `types/rag/errors.ts`     | エラー型          |
| Branded ID型        | `types/rag/branded.ts`    | 型安全ID          |
| Pagination型        | `types/rag/interfaces.ts` | ページネーション  |
| Drizzle スキーマ    | `db/schema/**/*.ts`       | テーブル定義      |

### 3.3 技術スタック

| 技術        | バージョン | 用途                 |
| ----------- | ---------- | -------------------- |
| TypeScript  | 5.x        | 言語                 |
| Drizzle ORM | 最新       | ORMライブラリ        |
| SQLite      | -          | データベース         |
| Vitest      | 最新       | テストフレームワーク |

---

## 4. 制約条件

### 4.1 技術的制約

| 制約                 | 詳細                           |
| -------------------- | ------------------------------ |
| Drizzle ORM使用必須  | 既存スキーマとの互換性維持     |
| SQLite固有機能の活用 | `returning()`、`OR IGNORE`等   |
| 非同期処理           | 全メソッドはPromiseを返却      |
| `any`使用の最小化    | 型安全性維持のため必要最小限に |

### 4.2 設計制約

| 制約         | 詳細                         |
| ------------ | ---------------------------- |
| 単一責任原則 | 1 Repository = 1 テーブル    |
| 依存性注入   | コンストラクタでDB依存性注入 |
| 不変性       | 戻り値はreadonlyを推奨       |
| 例外非スロー | 全エラーはResult型で表現     |

### 4.3 プロジェクト制約

| 制約                | 詳細                        |
| ------------------- | --------------------------- |
| pnpm使用必須        | パッケージマネージャー統一  |
| モノレポ構成        | `packages/shared`配下に配置 |
| ESLint/Prettier準拠 | コードスタイル統一          |

---

## 5. リスクと対策

| リスク             | 影響度 | 対策                                 |
| ------------------ | ------ | ------------------------------------ |
| 型推論の複雑化     | 中     | ジェネリクス使用を段階的に           |
| Drizzle API変更    | 低     | 型テストで早期検出                   |
| パフォーマンス劣化 | 中     | ベンチマーク計測、インデックス最適化 |
| テスト網羅性不足   | 中     | カバレッジ80%基準設定                |

---

## 6. 将来的な拡張ポイント

### 6.1 追加予定Repository

- RelationRepository（関係テーブル）
- CommunityRepository（コミュニティテーブル）
- EmbeddingRepository（埋め込みテーブル）
- ConversionRepository（変換履歴テーブル）

### 6.2 追加予定機能

- トランザクションラッパー（`withTransaction`）
- バルクアップデート（`updateMany`）
- 論理削除復元（`restore`）
- 監査ログ記録

---

## 7. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
