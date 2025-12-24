# データベース保存・バージョン管理 - タスク指示書

## メタ情報

| 項目             | 内容                                                   |
| ---------------- | ------------------------------------------------------ |
| タスクID         | CONV-04                                                |
| タスク名         | データベース保存・バージョン管理・ハイブリッド検索基盤 |
| 分類             | 要件/新規機能                                          |
| 対象機能         | ファイル変換システム                                   |
| 優先度           | 高                                                     |
| 見積もり規模     | 大規模                                                 |
| ステータス       | 未実施                                                 |
| 発見元           | 初期要件定義                                           |
| 発見日           | 2025-12-15                                             |
| 発見エージェント | .claude/agents/db-architect.md                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ファイル変換結果をデータベースに永続化し、バージョン管理を行う機能が必要。ファイルが更新された際に履歴を保持しながら新バージョンを作成する仕組みが求められる。

**RAG（検索拡張生成）対応**: 変換データを効率的に検索し、LLMに提供するためのハイブリッド検索基盤（キーワード検索 + ベクトル検索）の構築が必要。

### 1.2 問題点・課題

- 変換結果の永続化先（データベース）が未整備
- ファイル更新時のデータ管理方針が未決定
- 履歴データの保持とロールバック機能の要件整理が必要
- Turso (SQLite) + Drizzle ORM での実装パターンの確立が必要
- **RAG対応**: ベクトル埋め込みの保存とインデックス設計が必要
- **ハイブリッド検索**: FTS5（全文検索）とDiskANN（ベクトル検索）の統合が必要
- **チャンク管理**: 大きなドキュメントの分割保存と親子関係の管理が必要

### 1.3 放置した場合の影響

- 変換結果が永続化できない
- ファイル更新時に旧データが失われる
- 履歴管理・監査ログの要件が満たせない

---

## 2. 何を達成するか（What）

### 2.1 目的

変換結果をTursoデータベースに保存し、バージョン管理（履歴保持・ロールバック）機能を実装する。

### 2.2 最終ゴール

- 変換結果をデータベースに保存できる
- ファイル更新時に新バージョンを作成し、旧バージョンを保持
- `is_latest` フラグによる最新バージョンの識別
- 過去バージョンへのロールバック機能
- 論理削除（soft delete）による安全なデータ管理
- **チャンクテーブル**: RAG用のチャンク分割データを保存
- **ベクトルカラム**: libSQL ネイティブベクトル型（F32_BLOB）でembeddingを保存
- **FTS5テーブル**: 全文検索用の仮想テーブル
- **DiskANNインデックス**: ベクトル類似度検索用インデックス

### 2.3 スコープ

#### 含むもの

- Drizzle ORMスキーマ定義（file_conversions テーブル）
- **content_chunks テーブル**（チャンク保存・ベクトル埋め込み）
- **content_chunks_fts テーブル**（FTS5全文検索用仮想テーブル）
- Repository パターンによるデータアクセス層
- バージョン管理ロジック（新バージョン作成、`is_latest` 更新）
- ロールバック機能
- 論理削除機能
- マイグレーションスクリプト
- **ベクトルインデックス作成**（DiskANN）
- **全文検索インデックス作成**（FTS5）

#### 含まないもの

- UIでの履歴表示（CONV-05で対応）
- 変換処理自体（CONV-02で対応）
- 埋め込み生成ロジック（CONV-06で対応）
- ハイブリッド検索ロジック（CONV-07で対応）
- 外部バックアップ・レプリケーション

### 2.4 成果物

- `packages/shared/src/database/schema/file-conversions.ts` - 変換結果Drizzleスキーマ
- `packages/shared/src/database/schema/content-chunks.ts` - チャンクDrizzleスキーマ
- `packages/shared/src/repositories/file-conversion-repository.ts` - Repository
- `packages/shared/src/repositories/chunk-repository.ts` - チャンクRepository
- `packages/shared/src/services/version-manager.ts` - バージョン管理サービス
- マイグレーションファイル（テーブル・インデックス）
- ユニットテスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Turso + Drizzle ORM環境がセットアップ済み
- JSONスキーマ定義（CONV-03）が完成済み
- 既存のデータベース接続設定が整備済み

### 3.2 依存タスク

- CONV-03: JSONスキーマ定義（保存するデータ構造）
- CONV-02: ファイル変換エンジン（保存対象データの生成元）

### 3.3 必要な知識・スキル

- Drizzle ORM
- SQLite / Turso
- Repository パターン
- トランザクション管理
- インデックス設計

### 3.4 推奨アプローチ

1. Drizzleスキーマを定義（CONV-03の型定義を基に）
2. マイグレーションを実行
3. Repository パターンでデータアクセス層を実装
4. バージョン管理サービスを実装
5. TDDでテストを先に作成

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

データベーススキーマとバージョン管理の詳細要件を明確化する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements database-version-management
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/db-architect.md
- **選定理由**: データベース設計・スキーマ設計に特化
- **代替候補**: .claude/agents/dba-mgr.md（運用面が重視される場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法         | 選定理由             |
| ---------------------- | ---------------- | -------------------- |
| .claude/skills/database-normalization/SKILL.md | スキーマ正規化   | データ整合性の確保   |
| .claude/skills/indexing-strategies/SKILL.md    | インデックス設計 | クエリパフォーマンス |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- データベース要件定義書
- バージョン管理仕様書

#### 完了条件

- [ ] テーブル構造が決定
- [ ] バージョン管理の仕様が明確化
- [ ] インデックス戦略が決定

---

### Phase 1: 設計

#### 目的

Drizzleスキーマとバージョン管理のアーキテクチャ設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:design-database file-conversions
/ai:create-db-schema file-conversions
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/db-architect.md
- **選定理由**: データベーススキーマ設計に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法               | 選定理由               |
| ----------------------- | ---------------------- | ---------------------- |
| .claude/skills/repository-pattern/SKILL.md      | データアクセス層の設計 | 疎結合なアーキテクチャ |
| .claude/skills/transaction-management/SKILL.md  | トランザクション設計   | データ整合性の確保     |
| .claude/skills/foreign-key-constraints/SKILL.md | 外部キー設計           | 参照整合性             |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- ERD（Entity Relationship Diagram）
- Drizzleスキーマ設計書
- Repository インターフェース設計

#### 完了条件

- [ ] Drizzleスキーマの設計が完了
- [ ] Repository インターフェースが定義
- [ ] バージョン管理ロジックの設計が完了

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

Repository とバージョン管理サービスのテストを先に作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/src/repositories/file-conversion-repository.ts
/ai:generate-unit-tests packages/shared/src/services/version-manager.ts
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテストの設計・実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法           | 選定理由           |
| -------------------- | ------------------ | ------------------ |
| .claude/skills/test-doubles/SKILL.md         | DBモックの作成     | 依存関係の分離     |
| .claude/skills/test-data-management/SKILL.md | テストデータの管理 | 再現性のあるテスト |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `packages/shared/src/repositories/__tests__/file-conversion-repository.test.ts`
- `packages/shared/src/services/__tests__/version-manager.test.ts`

#### 完了条件

- [ ] Repository のCRUDテストが作成済み
- [ ] バージョン管理のテストが作成済み
- [ ] テストが失敗すること（Red状態）を確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための最小限の実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:create-repository FileConversion
/ai:create-migration add-file-conversions-table
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/repo-dev.md
- **選定理由**: Repository パターンの実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名           | 活用方法           | 選定理由           |
| ------------------ | ------------------ | ------------------ |
| .claude/skills/query-optimization/SKILL.md | 効率的なクエリ実装 | パフォーマンス確保 |
| .claude/skills/connection-pooling/SKILL.md | 接続管理           | リソース効率化     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- Drizzleスキーマ実装
- Repository 実装
- バージョン管理サービス実装
- マイグレーションファイル

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 変換結果の保存が正常に動作
- [ ] 新バージョン作成時に旧バージョンの `is_latest` が `false` に更新
- [ ] 最新バージョンのみを取得するクエリが動作
- [ ] 全バージョン履歴の取得が動作
- [ ] 特定バージョンへのロールバックが動作
- [ ] 論理削除が正常に動作

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上
- [ ] トランザクションの整合性が保証されている

### ドキュメント要件

- [ ] Drizzleスキーマの各カラムにコメントが記述
- [ ] Repository メソッドのJSDocが記述
- [ ] マイグレーション手順が文書化

---

## 6. 検証方法

### テストケース

1. 変換結果の新規保存
2. 既存ファイルの更新（新バージョン作成）
3. 最新バージョンの取得
4. バージョン履歴の取得
5. 特定バージョンへのロールバック
6. 論理削除の実行と復元
7. トランザクションのロールバック（エラー時）

### 検証手順

1. `pnpm --filter @repo/shared test:run` でユニットテスト実行
2. マイグレーションの適用テスト
3. 実際のTurso接続でのE2Eテスト

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                         |
| -------------------------------- | ------ | -------- | -------------------------------------------- |
| トランザクション競合             | 高     | 中       | 楽観的ロック（version列）の導入              |
| 大量履歴によるパフォーマンス低下 | 中     | 中       | パーティショニング検討、古い履歴のアーカイブ |
| マイグレーション失敗             | 高     | 低       | ロールバックスクリプトの準備                 |
| Turso接続エラー                  | 中     | 低       | リトライロジック、接続プール設定             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/15-database-design.md`
- `docs/00-requirements/master_system_design.md`
- CONV-03: JSONスキーマ定義（保存データ構造）

### 参考資料

- Drizzle ORM Documentation: https://orm.drizzle.team/
- Turso Documentation: https://docs.turso.tech/

---

## 9. 備考

### 推奨Drizzleスキーマ（2025年12月版 - RAG/ハイブリッド検索対応）

```typescript
// =============================================================================
// file-conversions.ts - 変換結果テーブル
// =============================================================================
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const fileConversions = sqliteTable(
  "file_conversions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fileId: text("file_id").notNull(),
    version: integer("version").notNull().default(1),

    // コンテンツ（JSON形式）
    content: text("content", { mode: "json" }).notNull(),
    plainText: text("plain_text").notNull(), // 全文検索用
    metadata: text("metadata", { mode: "json" }),

    // バージョン管理
    isLatest: integer("is_latest", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => ({
    fileVersionIdx: uniqueIndex("file_version_idx").on(
      table.fileId,
      table.version,
    ),
    latestIdx: index("latest_idx").on(table.fileId, table.isLatest),
    historyIdx: index("history_idx").on(table.fileId, table.createdAt),
  }),
);

// =============================================================================
// content-chunks.ts - チャンクテーブル（RAG用）
// =============================================================================
export const contentChunks = sqliteTable(
  "content_chunks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversionId: text("conversion_id")
      .notNull()
      .references(() => fileConversions.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),

    // コンテンツ
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull(),

    // 位置情報
    startOffset: integer("start_offset").notNull(),
    endOffset: integer("end_offset").notNull(),

    // コンテキスト情報（Contextual Retrieval用）
    contextualHeader: text("contextual_header"),
    parentChunkId: text("parent_chunk_id"),

    // ベクトル埋め込み（libSQL ネイティブベクトル型）
    // F32_BLOB(dimensions) - 次元数は埋め込みモデルに依存
    embedding: text("embedding").notNull(), // libsql_vector型として格納

    // メタデータ
    metadata: text("metadata", { mode: "json" }),

    // 埋め込み情報
    embeddingModel: text("embedding_model").notNull(),
    embeddingDimensions: integer("embedding_dimensions").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    conversionChunkIdx: index("conversion_chunk_idx").on(
      table.conversionId,
      table.chunkIndex,
    ),
    parentChunkIdx: index("parent_chunk_idx").on(table.parentChunkId),
  }),
);
```

### SQLマイグレーション（ベクトル・全文検索インデックス）

```sql
-- =============================================================================
-- FTS5 全文検索仮想テーブル
-- =============================================================================
CREATE VIRTUAL TABLE content_chunks_fts USING fts5(
  content,
  contextual_header,
  content='content_chunks',
  content_rowid='rowid',
  tokenize='unicode61'  -- 日本語対応
);

-- FTS5トリガー（自動同期）
CREATE TRIGGER content_chunks_ai AFTER INSERT ON content_chunks BEGIN
  INSERT INTO content_chunks_fts(rowid, content, contextual_header)
  VALUES (NEW.rowid, NEW.content, NEW.contextual_header);
END;

CREATE TRIGGER content_chunks_ad AFTER DELETE ON content_chunks BEGIN
  INSERT INTO content_chunks_fts(content_chunks_fts, rowid, content, contextual_header)
  VALUES('delete', OLD.rowid, OLD.content, OLD.contextual_header);
END;

CREATE TRIGGER content_chunks_au AFTER UPDATE ON content_chunks BEGIN
  INSERT INTO content_chunks_fts(content_chunks_fts, rowid, content, contextual_header)
  VALUES('delete', OLD.rowid, OLD.content, OLD.contextual_header);
  INSERT INTO content_chunks_fts(rowid, content, contextual_header)
  VALUES (NEW.rowid, NEW.content, NEW.contextual_header);
END;

-- =============================================================================
-- DiskANN ベクトルインデックス（libSQL ネイティブ）
-- =============================================================================
-- 注意: ~10,000ベクトル以下ではインデックス不要（フルスキャンで十分）
-- 参考: https://turso.tech/blog/approximate-nearest-neighbor-search-with-diskann-in-libsql

CREATE INDEX embedding_idx ON content_chunks(
  libsql_vector_idx(embedding, 'metric=cosine', 'compress_neighbors=float8')
);
```

### ハイブリッド検索クエリパターン

```sql
-- =============================================================================
-- キーワード検索（BM25）
-- =============================================================================
SELECT
  c.id,
  c.content,
  bm25(content_chunks_fts) as keyword_score
FROM content_chunks_fts fts
JOIN content_chunks c ON fts.rowid = c.rowid
WHERE content_chunks_fts MATCH ?
ORDER BY keyword_score
LIMIT ?;

-- =============================================================================
-- セマンティック検索（ベクトル類似度）
-- =============================================================================
SELECT
  id,
  content,
  vector_distance_cos(embedding, ?) as semantic_score
FROM content_chunks
ORDER BY semantic_score
LIMIT ?;

-- =============================================================================
-- ハイブリッド検索（RRF融合 - アプリケーション層で実装）
-- =============================================================================
-- 両方の結果を取得し、Reciprocal Rank Fusion (RRF) で統合
-- RRF_score = Σ 1 / (k + rank_i)  where k = 60 (typical)
```

### Turso/libSQL ベクトル検索の特性（2025年12月時点）

| 項目                 | 詳細                                          |
| -------------------- | --------------------------------------------- |
| **アルゴリズム**     | DiskANN (FreshDiskANN)                        |
| **メトリック**       | cosine, L2, inner_product                     |
| **量子化**           | float8圧縮、1-bit量子化対応                   |
| **インデックス作成** | 大規模データでは時間がかかる（hours）         |
| **推奨規模**         | ~100K ベクトル（それ以上は専用Vector DB検討） |
| **全文検索**         | FTS5（SQLite標準）                            |

> **参考**: [Turso Vector Search](https://turso.tech/vector)によると、10,000ベクトル以下ではインデックスなしのフルスキャンで十分な性能

### バージョン管理戦略

- 更新時に新レコードを作成（version を +1）
- 旧レコードの `is_latest` を `false` に更新
- 削除は `deleted_at` による論理削除
- ロールバックは対象バージョンをコピーして新バージョン作成
- **チャンク更新**: 変換結果更新時は関連チャンクも再生成（CASCADE DELETE + 再INSERT）

### 補足事項

- このタスクはCONV-03（JSONスキーマ定義）完了後に実装
- Tursoの制限事項（SQLite互換性）を考慮した設計
- 将来的な物理削除（古い履歴のクリーンアップ）は別タスクとして検討
- **埋め込み生成**はCONV-06で実装（このタスクではDBスキーマのみ）
- **ハイブリッド検索ロジック**はCONV-07で実装
- 日本語対応: FTS5のtokenize設定で`unicode61`を使用
