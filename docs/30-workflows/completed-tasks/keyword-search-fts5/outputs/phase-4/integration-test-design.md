# Phase 4: 統合テスト設計 - KeywordSearchStrategy

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| 作成日     | 2026-01-11            |
| 機能名     | KeywordSearchStrategy |
| タスクID   | CONV-07-02            |
| テスト種別 | 統合テスト            |

---

## 統合テストシナリオ

### カテゴリ1: API接続テスト

**目的**: ISearchStrategy.search()インターフェースの動作確認

| シナリオID | シナリオ名                | 検証内容                                            | 期待結果                 |
| ---------- | ------------------------- | --------------------------------------------------- | ------------------------ |
| API-001    | search()メソッド正常動作  | SearchQueryを渡してResult<SearchResultItem[]>を取得 | Result.okが返される      |
| API-002    | getStrategyName()動作確認 | 戦略名の取得                                        | `"keyword"` が返される   |
| API-003    | getMetrics()動作確認      | メトリクスオブジェクトの取得                        | StrategyMetricが返される |

### カテゴリ2: データフローテスト

**目的**: SearchQuery→FTS5クエリ→SearchResultItem変換の整合性確認

| シナリオID | シナリオ名               | 入力                       | 検証ポイント                       |
| ---------- | ------------------------ | -------------------------- | ---------------------------------- |
| FLOW-001   | キーワード検索完全フロー | `{ text: "test", type }`   | SearchQuery→FTS5→DB→Result変換     |
| FLOW-002   | フレーズ検索完全フロー   | `{ text: "exact phrase" }` | フレーズクエリ生成→DB検索→結果変換 |
| FLOW-003   | NEAR検索完全フロー       | `["word1", "word2"]`       | NEAR()クエリ生成→DB検索→結果変換   |
| FLOW-004   | スコア正規化フロー       | BM25生スコア               | 0-1範囲への正規化が正しい          |
| FLOW-005   | ハイライト情報フロー     | マッチしたテキスト         | highlight()関数の結果が正しく変換  |

### カテゴリ3: エラーハンドリングテスト

**目的**: DB接続エラー、タイムアウト、無効クエリの適切な処理確認

| シナリオID | シナリオ名         | 発生条件                 | 期待エラー                    |
| ---------- | ------------------ | ------------------------ | ----------------------------- |
| ERR-001    | DB接続エラー       | DBモックがエラーを投げる | `Result.err(DatabaseError)`   |
| ERR-002    | クエリタイムアウト | 10秒以上応答なし         | `Result.err(TimeoutError)`    |
| ERR-003    | 無効なSearchQuery  | 必須フィールドが欠損     | `Result.err(ValidationError)` |
| ERR-004    | FTS5構文エラー     | 不正なFTS5クエリ         | エラーが適切にキャッチされる  |

---

## テスト環境

### テストデータベース

| 項目         | 設定                       |
| ------------ | -------------------------- |
| DB種別       | SQLite in-memory           |
| FTS5テーブル | `chunks_fts`（テスト用）   |
| 初期化       | beforeEach()で毎回リセット |

### テストデータセット

```typescript
// テストフィクスチャ
export const testChunks = [
  {
    id: "chunk-001",
    fileId: "file-001",
    content: "TypeScript is a typed superset of JavaScript",
    contextualContent: "Programming language introduction",
    parentHeader: "TypeScript Basics",
    chunkIndex: 0,
  },
  {
    id: "chunk-002",
    fileId: "file-001",
    content: "React is a JavaScript library for building user interfaces",
    contextualContent: "Frontend framework overview",
    parentHeader: "React Introduction",
    chunkIndex: 1,
  },
  {
    id: "chunk-003",
    fileId: "file-002",
    content: "日本語の全文検索テストデータです",
    contextualContent: "日本語テスト",
    parentHeader: "日本語セクション",
    chunkIndex: 0,
  },
];
```

---

## 統合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## テストファイル構成

```
packages/shared/src/services/search/__tests__/
├── keyword-search-strategy.integration.test.ts  # 統合テスト本体
├── keyword-search-strategy.flow.test.ts         # データフローテスト
├── keyword-search-strategy.error.test.ts        # エラーハンドリングテスト
└── fixtures/
    └── search-test-data.ts                      # テストフィクスチャ
```

---

## モック・スタブ戦略

### 統合テストで使用するリソース

| リソース         | 実際/モック | 理由                       |
| ---------------- | ----------- | -------------------------- |
| LibSQLDatabase   | 実際        | DB連携の動作確認が目的     |
| FTS5テーブル     | 実際        | FTS5クエリの動作確認が必要 |
| ファイルシステム | モック      | テスト速度・独立性のため   |

### エラーハンドリングテスト用モック

```typescript
// DB接続エラーモック
vi.mock("drizzle-orm/libsql", () => ({
  drizzle: () => ({
    all: vi.fn().mockRejectedValue(new Error("Connection failed")),
  }),
}));

// タイムアウトモック
vi.mock("./chunks-search", () => ({
  searchChunksByKeyword: vi
    .fn()
    .mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 100),
        ),
    ),
}));
```

---

## 実行手順

```bash
# 統合テスト実行
pnpm --filter @repo/shared test integration

# データフローテスト
pnpm --filter @repo/shared test flow

# エラーハンドリングテスト
pnpm --filter @repo/shared test error

# 全統合テスト
pnpm --filter @repo/shared test keyword-search-strategy.integration
```

---

## ステータス

- [x] 統合テストシナリオ設計完了
- [x] テスト環境設計完了
- [ ] テストファイル実装待ち
- [ ] Red状態確認待ち
