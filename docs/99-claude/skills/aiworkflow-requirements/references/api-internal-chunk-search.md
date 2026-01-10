# チャンク検索API（RAG全文検索）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

FTS5全文検索機能を利用したチャンク検索APIの設計。将来的にREST APIまたはElectron IPCとして実装予定。

**実装状況**: データベース層（chunks-search.ts）のみ実装済み、API層は未実装

## 検索エンドポイント（将来実装）

### キーワード検索

**エンドポイント**: `POST /api/v1/chunks/search/keyword`

**リクエストボディ**:

| フィールド      | 型     | 必須 | 説明                                    |
| --------------- | ------ | ---- | --------------------------------------- |
| query           | string | Yes  | 検索クエリ（複数キーワードOR検索）      |
| fileId          | string | No   | ファイルIDで絞り込み（ULID形式）        |
| limit           | number | No   | 取得件数（デフォルト: 10、最大: 100）   |
| offset          | number | No   | オフセット（デフォルト: 0）             |
| highlightTags   | object | No   | ハイライトタグ（開始/終了タグ）         |
| bm25ScaleFactor | number | No   | BM25スケールファクタ（デフォルト: 0.3） |

**レスポンス**:

| フィールド            | 型      | 説明                                 |
| --------------------- | ------- | ------------------------------------ |
| results               | array   | 検索結果配列                         |
| results[].id          | string  | チャンクID                           |
| results[].content     | string  | チャンク本文                         |
| results[].highlighted | string  | ハイライト適用済み本文（オプション） |
| results[].score       | number  | 関連度スコア（0.0 - 1.0）            |
| results[].fileId      | string  | 親ファイルID                         |
| results[].chunkIndex  | number  | ファイル内の順序                     |
| totalCount            | number  | 総ヒット数                           |
| hasMore               | boolean | 次ページの有無                       |

### フレーズ検索

**エンドポイント**: `POST /api/v1/chunks/search/phrase`

**リクエストボディ**: キーワード検索と同じ（queryは完全一致フレーズ）

**動作**: 語順を保持した完全一致検索

### NEAR検索（近接検索）

**エンドポイント**: `POST /api/v1/chunks/search/near`

**リクエストボディ**:

| フィールド   | 型       | 必須 | 説明                                |
| ------------ | -------- | ---- | ----------------------------------- |
| terms        | string[] | Yes  | 検索キーワード配列（2個以上）       |
| nearDistance | number   | No   | 近接距離（デフォルト: 5、最大: 50） |
| fileId       | string   | No   | ファイルIDで絞り込み                |
| limit        | number   | No   | 取得件数                            |
| offset       | number   | No   | オフセット                          |

**動作**: 指定距離内にすべてのキーワードが出現するチャンクを検索

## 性能目標

| 指標               | 目標値（10,000チャンク） | 備考             |
| ------------------ | ------------------------ | ---------------- |
| キーワード検索速度 | < 100ms                  | 95パーセンタイル |
| フレーズ検索速度   | < 100ms                  | 95パーセンタイル |
| NEAR検索速度       | < 150ms                  | 95パーセンタイル |
| 並行検索（10req）  | < 100ms（平均）          | スループット維持 |

## 使用例（データベース層）

現在実装済みのデータベース層APIの使用例：

```typescript
// キーワード検索
import { searchChunksByKeyword } from "@repo/shared/db/queries/chunks-search";

const results = await searchChunksByKeyword(db, {
  query: "TypeScript JavaScript",
  limit: 10,
  offset: 0,
});

// フレーズ検索
const phraseResults = await searchChunksByPhrase(db, {
  query: "typed superset",
  limit: 10,
});

// NEAR検索
const nearResults = await searchChunksByNear(db, ["JavaScript", "library"], {
  nearDistance: 5,
  limit: 10,
});
```

## 実装ステータス

| レイヤー       | 実装状況    | 備考                       |
| -------------- | ----------- | -------------------------- |
| データベース層 | ✅ 実装済み | `queries/chunks-search.ts` |
| サービス層     | 未実装      | 将来追加予定               |
| REST API層     | 未実装      | Next.js App Router         |
| Desktop IPC層  | 未実装      | Electron IPC               |

**参照実装**: `packages/shared/src/db/queries/chunks-search.ts`
