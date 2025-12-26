# 手動テスト実行結果レポート - chunks FTS5実装

## 実行サマリー

**実行日時**: 2025-12-26 16:15
**実行環境**:

- パッケージ: @repo/shared
- データベース: libSQL (file:./test-manual.db)
- Node.js: v22.x (macOS)
- テストスクリプト: `scripts/manual-test-chunks-fts.ts`

**実行コマンド**:

```bash
pnpm tsx scripts/manual-test-chunks-fts.ts
```

## テスト結果

### 全体サマリー

| テスト項目     | 結果                 |
| -------------- | -------------------- |
| **総テスト数** | 15項目               |
| **成功**       | ✅ **15項目** (100%) |
| **失敗**       | 0項目                |
| **スキップ**   | 0項目                |

✅ **全体評価: 合格**

---

## 詳細テスト結果

### 1. マイグレーション

#### 1-1: chunksテーブル作成

| 項目           | 内容                            |
| -------------- | ------------------------------- |
| **No**         | 1                               |
| **カテゴリ**   | マイグレーション                |
| **テスト項目** | chunksテーブル作成              |
| **前提条件**   | データベースが存在              |
| **操作手順**   | CREATE TABLE chunks実行         |
| **期待結果**   | chunksテーブルが作成される      |
| **実行結果**   | ✅ **成功**                     |
| **備考**       | 19カラム、4インデックス作成済み |

#### 1-2: FTS5テーブル作成

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| **No**         | 2                                  |
| **カテゴリ**   | マイグレーション                   |
| **テスト項目** | FTS5テーブル作成                   |
| **前提条件**   | chunksテーブルが存在               |
| **操作手順**   | initializeChunksFts()実行          |
| **期待結果**   | chunks_ftsテーブルが作成される     |
| **実行結果**   | ✅ **成功**                        |
| **備考**       | External Content Tableパターン適用 |

#### 1-3: トリガー作成

| 項目           | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| **No**         | 3                                                       |
| **カテゴリ**   | マイグレーション                                        |
| **テスト項目** | トリガー作成                                            |
| **前提条件**   | FTS5テーブルが存在                                      |
| **操作手順**   | createChunksFtsTriggers()実行                           |
| **期待結果**   | 3つのトリガーが作成される                               |
| **実行結果**   | ✅ **成功**                                             |
| **備考**       | chunks_fts_insert, chunks_fts_update, chunks_fts_delete |

---

### 2. INSERT操作

#### 2-1: チャンク挿入

| 項目           | 内容                                     |
| -------------- | ---------------------------------------- |
| **No**         | 4                                        |
| **カテゴリ**   | INSERT                                   |
| **テスト項目** | チャンク挿入                             |
| **前提条件**   | テーブルが作成済み                       |
| **操作手順**   | db.insert(chunks).values(...)実行（3件） |
| **期待結果**   | レコードが挿入される                     |
| **実行結果**   | ✅ **成功**                              |
| **備考**       | 3チャンク挿入完了                        |

#### 2-2: FTSインデックス自動更新

| 項目           | 内容                                   |
| -------------- | -------------------------------------- |
| **No**         | 5                                      |
| **カテゴリ**   | INSERT                                 |
| **テスト項目** | FTSインデックス自動更新                |
| **前提条件**   | チャンク挿入済み                       |
| **操作手順**   | checkChunksFtsIntegrity()実行          |
| **期待結果**   | FTSインデックスが更新される            |
| **実行結果**   | ✅ **成功** (chunks: 3, chunks_fts: 3) |
| **備考**       | トリガーにより自動同期                 |

---

### 3. 検索機能

#### 3-1: キーワード検索

| 項目           | 内容                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **No**         | 6                                                                      |
| **カテゴリ**   | 検索                                                                   |
| **テスト項目** | キーワード検索                                                         |
| **前提条件**   | データが挿入済み                                                       |
| **操作手順**   | searchChunksByKeyword("TypeScript JavaScript")実行                     |
| **期待結果**   | 関連チャンクが返される                                                 |
| **実行結果**   | ✅ **成功** (1件ヒット)                                                |
| **詳細**       | Score: 0.5901, Content: "TypeScript is a typed superset of JavaScript" |

#### 3-2: フレーズ検索

| 項目           | 内容                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **No**         | 7                                                                      |
| **カテゴリ**   | 検索                                                                   |
| **テスト項目** | フレーズ検索                                                           |
| **前提条件**   | データが挿入済み                                                       |
| **操作手順**   | searchChunksByPhrase("typed superset")実行                             |
| **期待結果**   | フレーズにマッチするチャンクが返される                                 |
| **実行結果**   | ✅ **成功** (1件ヒット)                                                |
| **詳細**       | Score: 0.5901, Content: "TypeScript is a typed superset of JavaScript" |

#### 3-3: NEAR検索

| 項目           | 内容                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| **No**         | 8                                                                                    |
| **カテゴリ**   | 検索                                                                                 |
| **テスト項目** | NEAR検索                                                                             |
| **前提条件**   | データが挿入済み                                                                     |
| **操作手順**   | searchChunksByNear(["JavaScript", "library"], {nearDistance: 5})実行                 |
| **期待結果**   | 近接するキーワードを含むチャンクが返される                                           |
| **実行結果**   | ✅ **成功** (1件ヒット)                                                              |
| **詳細**       | Score: 0.5854, Content: "React is a JavaScript library for building user interfaces" |

#### 3-4: BM25スコアリング

| 項目           | 内容                                       |
| -------------- | ------------------------------------------ |
| **No**         | 9                                          |
| **カテゴリ**   | 検索                                       |
| **テスト項目** | BM25スコアリング                           |
| **前提条件**   | データが挿入済み                           |
| **操作手順**   | 検索結果のスコア確認                       |
| **期待結果**   | スコアが正しく計算される（0-1範囲）        |
| **実行結果**   | ✅ **成功**                                |
| **詳細**       | スコア範囲: 0.5854 〜 0.5901（正規化済み） |

#### 3-5: スニペット生成

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| **No**         | 10                                 |
| **カテゴリ**   | 検索                               |
| **テスト項目** | ハイライト付きスニペット生成       |
| **前提条件**   | データが挿入済み                   |
| **操作手順**   | highlightedContent確認             |
| **期待結果**   | ハイライトタグが正しく挿入される   |
| **実行結果**   | ✅ **成功**                        |
| **備考**       | デフォルトタグ: `<mark>...</mark>` |

---

### 4. UPDATE操作

#### 4-1: チャンク更新

| 項目           | 内容                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| **No**         | 11                                                                                       |
| **カテゴリ**   | UPDATE                                                                                   |
| **テスト項目** | チャンク更新                                                                             |
| **前提条件**   | チャンクが存在                                                                           |
| **操作手順**   | db.update(chunks).set({content: "..."})実行                                              |
| **期待結果**   | レコードが更新される                                                                     |
| **実行結果**   | ✅ **成功**                                                                              |
| **詳細**       | "TypeScript is a typed superset" → "TypeScript is a strongly typed programming language" |

#### 4-2: FTSインデックス自動更新

| 項目           | 内容                                         |
| -------------- | -------------------------------------------- |
| **No**         | 12                                           |
| **カテゴリ**   | UPDATE                                       |
| **テスト項目** | FTSインデックス自動更新                      |
| **前提条件**   | チャンク更新済み                             |
| **操作手順**   | checkChunksFtsIntegrity()実行 + 更新内容検索 |
| **期待結果**   | FTSインデックスが更新される                  |
| **実行結果**   | ✅ **成功**                                  |
| **詳細**       | 整合性維持、更新内容が検索可能               |

---

### 5. DELETE操作

#### 5-1: チャンク削除

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **No**         | 13                               |
| **カテゴリ**   | DELETE                           |
| **テスト項目** | チャンク削除                     |
| **前提条件**   | チャンクが存在                   |
| **操作手順**   | db.delete(chunks).where(...)実行 |
| **期待結果**   | レコードが削除される             |
| **実行結果**   | ✅ **成功**                      |
| **備考**       | 1チャンク削除、残り2件           |

#### 5-2: FTSインデックス自動削除

| 項目           | 内容                                   |
| -------------- | -------------------------------------- |
| **No**         | 14                                     |
| **カテゴリ**   | DELETE                                 |
| **テスト項目** | FTSインデックス自動削除                |
| **前提条件**   | チャンク削除済み                       |
| **操作手順**   | checkChunksFtsIntegrity()実行          |
| **期待結果**   | FTSインデックスが削除される            |
| **実行結果**   | ✅ **成功** (chunks: 2, chunks_fts: 2) |
| **詳細**       | トリガーにより自動同期                 |

---

### 6. CASCADE DELETE

#### 6-1: ファイル削除時のCASCADE

| 項目           | 内容                                                                 |
| -------------- | -------------------------------------------------------------------- |
| **No**         | 15                                                                   |
| **カテゴリ**   | CASCADE                                                              |
| **テスト項目** | ファイル削除時のCASCADE DELETE                                       |
| **前提条件**   | ファイルとチャンクが存在                                             |
| **操作手順**   | db.delete(files).where(...)実行                                      |
| **期待結果**   | 関連チャンクも削除される                                             |
| **実行結果**   | ✅ **成功**                                                          |
| **詳細**       | ファイル削除 → 2チャンク削除、最終整合性: (chunks: 0, chunks_fts: 0) |

---

## 発見された問題と修正

### 問題1: searchChunksByPhraseのFTS5シンタックスエラー

**症状**: フレーズ検索でFTS5シンタックスエラー発生
**原因**: `escapeFts5Query`が二重引用符をバックスラッシュでエスケープし、FTS5が認識できない
**修正内容**:

```typescript
// Before
const escapedInnerQuery = query.replace(/"/g, '\\"');
const phraseQuery = `"${escapedInnerQuery}"`;
return searchChunksByKeyword(db, { query: phraseQuery });

// After (独自SQL構築)
const cleanedQuery = query.replace(/"/g, "");
const phraseQuery = `"${cleanedQuery}"`;
// 独自にSQL構築（escapeFts5Queryを使用しない）
```

**影響範囲**: `packages/shared/src/db/queries/chunks-search.ts:407-505`
**テスト結果**: ✅ 既存テスト68件すべてパス

### 問題2: searchChunksByNearのスキーマ定義

**症状**: NEAR検索で`query`フィールド必須エラー
**原因**: `NearSearchOptionsSchema`が`SearchOptionsSchema.extend()`で`query`を継承
**修正内容**:

```typescript
// Before
export const NearSearchOptionsSchema = SearchOptionsSchema.extend({
  nearDistance: z.number()...
});

// After
export const NearSearchOptionsSchema = SearchOptionsSchema.omit({
  query: true,
}).extend({
  nearDistance: z.number()...
});
```

**影響範囲**: `packages/shared/src/db/queries/chunks-search.ts:64-73`
**テスト結果**: ✅ 既存テスト68件すべてパス

### 問題3: searchChunksByNearのFTS5シンタックスエラー

**症状**: NEAR検索でFTS5シンタックスエラー発生
**原因**: `escapeFts5Query`によるエスケープがFTS5で認識されない
**修正内容**:

```typescript
// Before
const escapedTerms = terms.map((term) => `"${escapeFts5Query(term)}"`);
return searchChunksByKeyword(db, { query: nearQuery });

// After (独自SQL構築)
const cleanedTerms = terms.map((term) => {
  const cleaned = term.replace(/["*^()\-+:{}]/g, "");
  return `"${cleaned}"`;
});
// 独自にSQL構築（escapeFts5Queryを使用しない）
```

**影響範囲**: `packages/shared/src/db/queries/chunks-search.ts:530-637`
**テスト結果**: ✅ 既存テスト68件すべてパス

---

## 動作検証の詳細

### INSERT トリガー検証

**検証内容**: chunksテーブルへのINSERT時にchunks_ftsへ自動同期

```sql
-- トリガー: chunks_fts_insert
-- 動作: chunks挿入 → chunks_fts挿入
```

**結果**:

- ✅ 3チャンク挿入後、chunks_ftsも3件
- ✅ 整合性チェック成功 (chunks: 3, chunks_fts: 3)

### UPDATE トリガー検証

**検証内容**: chunksテーブルのUPDATE時にchunks_ftsへ自動同期

```sql
-- トリガー: chunks_fts_update
-- 動作: chunks更新 → chunks_fts DELETE + INSERT
```

**テストケース**:

- 更新前: "TypeScript is a typed superset of JavaScript"
- 更新後: "TypeScript is a strongly typed programming language"

**結果**:

- ✅ UPDATE後の整合性維持
- ✅ 更新後の内容（"strongly typed"）が検索可能

### DELETE トリガー検証

**検証内容**: chunksテーブルのDELETE時にchunks_ftsから自動削除

```sql
-- トリガー: chunks_fts_delete
-- 動作: chunks削除 → chunks_fts削除
```

**結果**:

- ✅ 1チャンク削除後、chunks: 2, chunks_fts: 2
- ✅ 整合性チェック成功

### CASCADE DELETE検証

**検証内容**: filesテーブル削除時に関連chunksも削除

```sql
-- 外部キー制約: file_id REFERENCES files(id) ON DELETE CASCADE
```

**結果**:

- ✅ ファイル削除後、関連チャンクすべて削除
- ✅ 最終整合性: chunks: 0, chunks_fts: 0

---

## 検索機能の詳細検証

### キーワード検索

**クエリ**: "TypeScript JavaScript"
**FTS5クエリ**: `TypeScript "AND" JavaScript` (予約語クォート)
**結果**: 1件ヒット
**スコア**: 0.5901

**検証項目**:

- ✅ escapeFts5Query正常動作
- ✅ BM25スコア正規化
- ✅ ハイライト生成

### フレーズ検索

**クエリ**: "typed superset"
**FTS5クエリ**: `"typed superset"` (完全一致)
**結果**: 1件ヒット
**スコア**: 0.5901

**検証項目**:

- ✅ フレーズクエリ構築
- ✅ 語順の保持
- ✅ 修正後の動作確認

### NEAR検索

**クエリ**: ["JavaScript", "library"]
**FTS5クエリ**: `NEAR("JavaScript" "library", 5)`
**結果**: 1件ヒット
**スコア**: 0.5854

**検証項目**:

- ✅ NEARクエリ構築
- ✅ 近接距離パラメータ（5トークン）
- ✅ 修正後の動作確認

---

## パフォーマンス測定

### 検索パフォーマンス

| 検索種別   | データ数 | 実行時間（推定） | 評価    |
| ---------- | -------- | ---------------- | ------- |
| キーワード | 3件      | < 10ms           | ✅ 高速 |
| フレーズ   | 3件      | < 10ms           | ✅ 高速 |
| NEAR       | 3件      | < 10ms           | ✅ 高速 |

**備考**: データ数が少ないため、大量データでの測定が必要

---

## 完了条件チェックリスト

### Phase 8: T-08-1 完了条件

- [x] **全テスト項目が実行されている** ✅
  - 15項目すべて実行完了

- [x] **全テスト項目がパスしている** ✅
  - 15項目すべて成功

- [x] **手動テストレポートが作成されている** ✅
  - 本ドキュメント作成完了

- [x] **問題が発見された場合、対応方針が明記されている** ✅
  - 3つの問題を発見し、すべて修正完了
  - 既存テスト68件すべてパス

---

## 総合評価

### テスト実施状況

✅ **全テスト成功 (15/15項目)**

**カテゴリ別結果**:

- ✅ マイグレーション: 3/3項目成功
- ✅ INSERT操作: 2/2項目成功
- ✅ 検索機能: 5/5項目成功
- ✅ UPDATE操作: 2/2項目成功
- ✅ DELETE操作: 2/2項目成功
- ✅ CASCADE DELETE: 1/1項目成功

### 発見された問題の対応状況

| 問題                            | 重要度   | 対応状況    |
| ------------------------------- | -------- | ----------- |
| searchChunksByPhrase FTS5エラー | CRITICAL | ✅ 修正完了 |
| NearSearchOptionsSchema定義     | MAJOR    | ✅ 修正完了 |
| searchChunksByNear FTS5エラー   | CRITICAL | ✅ 修正完了 |

### 実装品質

**検証項目**:

- ✅ マイグレーション動作確認
- ✅ トリガー自動同期確認
- ✅ FTS5検索動作確認
- ✅ データ整合性維持確認
- ✅ CASCADE DELETE動作確認

**リグレッション**:

- ✅ 既存テスト68件すべてパス
- ✅ 機能的リグレッションなし

---

## 推奨事項

### 短期対応

1. **大量データでのパフォーマンステスト**
   - 10,000チャンク規模での検索パフォーマンス測定
   - インデックス最適化の効果検証

2. **エッジケーステストの追加**
   - 日本語全文検索の検証
   - 特殊文字（絵文字、記号）の処理確認

### 長期対応

1. **ベンチマークテストスイート構築**
   - 継続的なパフォーマンス監視
   - リグレッション検出

2. **手動テストの自動化**
   - 統合テストスイートへの組み込み
   - CI/CDパイプラインでの実行

---

## 添付資料

### テスト実行ログ

- パス: `/tmp/manual-test-final.txt`

### テストスクリプト

- パス: `packages/shared/scripts/manual-test-chunks-fts.ts`

### 参照ドキュメント

- [要件定義](./requirements-chunks-fts5.md)
- [スキーマ設計](./design-chunks-schema.md)
- [FTS5設計](./design-chunks-fts5.md)
- [テストレポート](./test-report-chunks-fts5.md)
- [最終レビュー](./final-review-chunks-fts5.md)

---

**作成日**: 2025-12-26
**作成者**: Claude Sonnet 4.5
**実行環境**: macOS, Node.js v22.x, libSQL
**次フェーズ**: Phase 9 ドキュメント更新
