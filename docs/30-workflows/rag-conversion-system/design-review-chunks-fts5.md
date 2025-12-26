# chunks-fts5 設計レビューレポート

**レビュー日**: 2025-12-26
**レビュアー**: arch-police
**対象**: Phase 1 設計成果物

---

## 1. 総合判定

| 判定      | 説明                                      |
| --------- | ----------------------------------------- |
| **MINOR** | 軽微な問題あり。対応後にPhase 3へ進行可能 |

---

## 2. レビュー対象ドキュメント

| ドキュメント             | パス                                      | サイズ  |
| ------------------------ | ----------------------------------------- | ------- |
| 要件定義書               | `requirements-chunks-fts5.md`             | 23.5 KB |
| chunksスキーマ設計書     | `design-chunks-schema.md`                 | 9.6 KB  |
| FTS5仮想テーブル設計書   | `design-chunks-fts5.md`                   | 10.9 KB |
| 検索クエリビルダー設計書 | `design-chunks-search.md`                 | 27.8 KB |
| Drizzle ORMスキーマ      | `packages/shared/src/db/schema/chunks.ts` | 8.3 KB  |

---

## 3. スキーマ設計レビュー

### 3.1 カラム定義

| 観点           | 判定 | 詳細                                                                    |
| -------------- | ---- | ----------------------------------------------------------------------- |
| 基本情報       | PASS | id, fileId, content, contextualContent が適切に定義                     |
| 位置情報       | PASS | chunkIndex, startLine, endLine, startChar, endChar, parentHeader が完備 |
| チャンキング   | PASS | strategy, tokenCount, hash が要件を満たす                               |
| オーバーラップ | PASS | prevChunkId, nextChunkId, overlapTokens で連続性管理                    |
| 監査情報       | PASS | createdAt, updatedAt が Unix timestamp 形式で定義                       |

### 3.2 制約定義

| 観点         | 判定 | 詳細                                        |
| ------------ | ---- | ------------------------------------------- |
| 外部キー     | PASS | fileId → files.id ON DELETE CASCADE         |
| 一意制約     | PASS | hash カラムで重複チャンク検出               |
| デフォルト値 | PASS | overlapTokens = 0, timestamps = unixepoch() |

### 3.3 インデックス設計

| インデックス           | 判定 | 用途                         |
| ---------------------- | ---- | ---------------------------- |
| idx_chunks_file_id     | PASS | ファイル単位チャンク取得     |
| idx_chunks_hash        | PASS | 重複検出（UNIQUE）           |
| idx_chunks_chunk_index | PASS | 順序付きチャンク取得（複合） |
| idx_chunks_strategy    | PASS | 戦略別分析                   |

### 3.4 型定義

| 観点          | 判定 | 詳細                        |
| ------------- | ---- | --------------------------- |
| ChunkStrategy | PASS | 7つの戦略が適切に定義       |
| ChunkMetadata | PASS | 拡張可能なJSON型            |
| Chunk         | PASS | $inferSelect による自動推論 |
| NewChunk      | PASS | $inferInsert による自動推論 |

**スキーマ設計総合判定**: ✅ **PASS**

---

## 4. FTS5設計レビュー

### 4.1 Tokenizer設定

| 観点               | 判定 | 詳細                                            |
| ------------------ | ---- | ----------------------------------------------- |
| 日本語対応         | PASS | unicode61 tokenizer を採用                      |
| ダイアクリティカル | PASS | remove_diacritics 2 で正規化                    |
| 選択理由           | PASS | porter は日本語非対応、icu は外部依存ありを考慮 |

### 4.2 FTS5仮想テーブル定義

| 観点               | 判定 | 詳細                                             |
| ------------------ | ---- | ------------------------------------------------ |
| content指定        | PASS | content='chunks' で外部コンテンツテーブル参照    |
| content_rowid      | PASS | content_rowid='rowid' で正確に紐付け             |
| インデックスカラム | PASS | content, contextual_content, parent_header の3列 |

### 4.3 トリガー設計

| トリガー          | 判定 | 詳細                                     |
| ----------------- | ---- | ---------------------------------------- |
| chunks_fts_insert | PASS | AFTER INSERT で FTS5 へ挿入              |
| chunks_fts_update | PASS | DELETE + INSERT で確実に再インデックス化 |
| chunks_fts_delete | PASS | AFTER DELETE で FTS5 から削除            |

**FTS5設計判定**: ✅ **PASS**

---

## 5. 検索クエリ設計レビュー

### 5.1 クエリ効率性

| 観点           | 判定 | 詳細                        |
| -------------- | ---- | --------------------------- |
| FTS5 MATCH活用 | PASS | 全文検索にMATCH演算子を使用 |
| BM25ソート     | PASS | bm25() 関数で関連性ソート   |
| LIMIT/OFFSET   | PASS | ページネーション対応        |

### 5.2 エスケープ処理

| 観点                 | 判定 | 詳細                                    |
| -------------------- | ---- | --------------------------------------- |
| 特殊文字エスケープ   | PASS | `"*^()-+:{}` の10文字を適切にエスケープ |
| 予約語クォート       | PASS | AND, OR, NOT, NEAR を二重引用符で囲む   |
| インジェクション防御 | PASS | escapeFts5Query 関数で統一的に処理      |

### 5.3 スコアリング

| 観点               | 判定 | 詳細                          |
| ------------------ | ---- | ----------------------------- |
| 正規化方式         | PASS | シグモイド関数で0-1範囲に変換 |
| スケールファクター | PASS | bm25ScaleFactor で調整可能    |
| 精度               | PASS | 小数点4桁で丸め               |

### 5.4 エラーハンドリング

| 観点                 | 判定 | 詳細                        |
| -------------------- | ---- | --------------------------- |
| Zodバリデーション    | PASS | 入力パラメータを事前検証    |
| NEAR検索引数チェック | PASS | 2つ未満のキーワードでエラー |

**検索クエリ設計判定**: ✅ **PASS**

---

## 6. アーキテクチャ整合性レビュー

### 6.1 master_system_design.md との整合性

| 観点         | 判定 | 詳細                           |
| ------------ | ---- | ------------------------------ |
| ORM          | PASS | Drizzle ORM 使用               |
| データベース | PASS | Turso/libSQL 対応              |
| TDD方針      | PASS | テストケースが設計書に含まれる |

### 6.2 依存関係

| 観点           | 判定 | 詳細                                   |
| -------------- | ---- | -------------------------------------- |
| files テーブル | PASS | 外部キー参照が正確                     |
| Zod スキーマ   | PASS | 入力バリデーションに使用               |
| drizzle-orm    | PASS | sql, LibSQLDatabase を適切にインポート |

### 6.3 ディレクトリ構造

| 観点         | 判定  | 詳細                                               |
| ------------ | ----- | -------------------------------------------------- |
| スキーマ配置 | PASS  | packages/shared/src/db/schema/chunks.ts            |
| エクスポート | PASS  | index.ts で正しくエクスポート                      |
| 検索関数配置 | MINOR | 設計書ではservices/search/、実装ではqueries/を想定 |

**アーキテクチャ整合性判定**: ⚠️ **MINOR**

---

## 7. 発見された問題点

### 7.1 MINOR 問題

#### M-01: 要件定義書とスキーマ設計の差異

**内容**: 要件定義書と実装済みスキーマ設計に差異がある

| 項目       | 要件定義書                       | 設計書/実装                                                                 |
| ---------- | -------------------------------- | --------------------------------------------------------------------------- |
| 位置情報   | startOffset, endOffset           | chunkIndex, startLine, endLine, startChar, endChar                          |
| 一意制約   | (fileId, startOffset, endOffset) | hash (UNIQUE)                                                               |
| 追加カラム | なし                             | strategy, tokenCount, prevChunkId, nextChunkId, overlapTokens, parentHeader |

**影響度**: 低（設計書/実装の方がより包括的）

**対応方針**: 要件定義書を設計書に合わせて更新

---

#### M-02: FTS5カラム数の差異

**内容**: ドキュメント間でFTS5のインデックス対象カラム数が異なる

| ドキュメント            | インデックスカラム                                |
| ----------------------- | ------------------------------------------------- |
| design-chunks-schema.md | content, contextual_content（2列）                |
| design-chunks-fts5.md   | content, contextual_content, parent_header（3列） |

**影響度**: 低（design-chunks-fts5.md が正式版）

**対応方針**: design-chunks-schema.md の FTS5 セクションを design-chunks-fts5.md への参照に置換

---

#### M-03: Tokenizer設定値の差異

**内容**: ドキュメント間でtokenizer設定が異なる

| ドキュメント            | tokenizer設定                        |
| ----------------------- | ------------------------------------ |
| design-chunks-schema.md | porter unicode61 remove_diacritics 1 |
| design-chunks-fts5.md   | unicode61 remove_diacritics 2        |

**影響度**: 中（日本語検索に影響）

**対応方針**: design-chunks-fts5.md の `unicode61 remove_diacritics 2` を正式版とし、他ドキュメントを更新

---

#### M-04: 検索関数のディレクトリ配置

**内容**: 設計書と要件定義書でディレクトリパスが異なる

| ドキュメント                | パス                                     |
| --------------------------- | ---------------------------------------- |
| requirements-chunks-fts5.md | packages/shared/src/db/queries/chunks.ts |
| design-chunks-search.md     | packages/shared/src/services/search/     |

**影響度**: 低（実装時に決定）

**対応方針**: 既存のプロジェクト構造に合わせて `db/queries/` に統一

---

## 8. 推奨アクション

### 8.1 MINOR対応（Phase 3前に実施）

| ID   | アクション                                           | 優先度 |
| ---- | ---------------------------------------------------- | ------ |
| A-01 | requirements-chunks-fts5.md のカラム定義を更新       | 中     |
| A-02 | design-chunks-schema.md の FTS5 セクションを修正     | 低     |
| A-03 | tokenizer設定を unicode61 remove_diacritics 2 に統一 | 高     |
| A-04 | 検索関数パスを db/queries/ に統一                    | 低     |

### 8.2 今後の改善提案

| 提案                           | 理由                                 |
| ------------------------------ | ------------------------------------ |
| カーソルベースページネーション | 大きなOFFSETのパフォーマンス問題回避 |
| FTS5 OPTIMIZE定期実行          | インデックス断片化防止               |
| 整合性チェックジョブ           | FTS5とchunksテーブルの同期確認       |

---

## 9. レビューチェックリスト

### スキーマ設計

- [x] カラム定義が妥当である
- [x] 制約が適切である
- [x] インデックスが効率的である
- [x] 型定義が正確である

### FTS5設計

- [x] tokenizer設定が適切である（日本語対応）
- [x] トリガーが完全である（INSERT/UPDATE/DELETE）
- [x] content_rowid設定が正確である

### 検索クエリ設計

- [x] クエリが効率的である
- [x] エスケープ処理が安全である
- [x] スコアリングが妥当である
- [x] エラーハンドリングが適切である

### アーキテクチャ整合性

- [x] master_system_design.mdとの整合性がある
- [x] 依存関係が正確である
- [ ] ディレクトリ構造を完全遵守している（MINOR: M-04）

---

## 10. 結論

### 判定: MINOR

設計は全体的に良好で、技術的な観点からは問題ありません。ただし、ドキュメント間の不整合が4件発見されました。これらは軽微な問題であり、以下の対応を推奨します:

1. **A-03を優先対応**: tokenizer設定を統一（影響度: 中）
2. **A-01/A-02/A-04は任意**: 実装フェーズで自然に解決される可能性あり

### 次のアクション

| 条件             | 進行先                                 |
| ---------------- | -------------------------------------- |
| MINOR対応完了後  | Phase 3: TDD - テスト作成（T-03-1）    |
| 対応スキップ可能 | ドキュメント不整合は実装時に解消される |

---

## 変更履歴

| 日付       | 変更内容 | 担当        |
| ---------- | -------- | ----------- |
| 2025-12-26 | 初版作成 | arch-police |
