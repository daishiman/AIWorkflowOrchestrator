# Phase 4: テスト仕様書 - KeywordSearchStrategy

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 作成日     | 2026-01-11                    |
| 機能名     | KeywordSearchStrategy         |
| タスクID   | CONV-07-02                    |
| テスト種別 | ユニットテスト / 統合テスト   |
| 状態       | Red（テスト作成完了、実装前） |

---

## テスト対象

### KeywordSearchStrategy クラス

| メソッド               | 責務                                          | テスト優先度 |
| ---------------------- | --------------------------------------------- | ------------ |
| `search()`             | SearchQueryを受け取りSearchResultItem[]を返す | 高           |
| `buildFTS5Query()`     | SearchQueryをFTS5クエリ文字列に変換           | 高           |
| `normalizeScore()`     | BM25スコアを0-1範囲に正規化                   | 中           |
| `toSearchResultItem()` | FtsSearchResultをSearchResultItemに変換       | 中           |
| `getMetrics()`         | 検索メトリクスを返す                          | 低           |

---

## テストカテゴリ分類

### 正常系テスト

| テストID | シナリオ                           | 検証内容                                   |
| -------- | ---------------------------------- | ------------------------------------------ |
| UT-001   | 単一キーワード検索                 | 関連チャンクが返される                     |
| UT-002   | 複数キーワードOR検索               | いずれかに一致するチャンクが返される       |
| UT-003   | フレーズ検索（完全一致）           | 完全一致するチャンクが返される             |
| UT-004   | NEAR検索（近接検索）               | 近接するキーワードを含むチャンクが返される |
| UT-005   | 日本語キーワード検索               | 日本語クエリが正常に処理される             |
| UT-006   | limit/offsetによるページネーション | 指定件数のみ返される                       |
| UT-007   | fileIdフィルタ適用                 | 特定ファイルのみが検索される               |

### 異常系テスト

| テストID | シナリオ       | 検証内容             |
| -------- | -------------- | -------------------- |
| UT-101   | 空文字クエリ   | 空配列が返される     |
| UT-102   | 空白のみクエリ | 空配列が返される     |
| UT-103   | マッチなし     | 空配列が返される     |
| UT-104   | DB接続エラー   | Result.errが返される |
| UT-105   | タイムアウト   | Result.errが返される |

### 境界値テスト

| テストID | シナリオ               | 入力値               | 期待結果             |
| -------- | ---------------------- | -------------------- | -------------------- |
| UT-201   | 最小文字数（1文字）    | `"a"`                | 正常に検索           |
| UT-202   | 最大文字数（1000文字） | 1000文字の文字列     | 正常に検索           |
| UT-203   | 超過文字数（1001文字） | 1001文字の文字列     | バリデーションエラー |
| UT-204   | SQLインジェクション    | `"'; DROP TABLE --"` | エスケープされて安全 |
| UT-205   | FTS5特殊文字           | `"hello \"world\""`  | エスケープされて検索 |

### 性能テスト

| テストID | シナリオ           | 条件           | 目標値 |
| -------- | ------------------ | -------------- | ------ |
| PT-001   | キーワード検索性能 | 10,000チャンク | <100ms |
| PT-002   | フレーズ検索性能   | 10,000チャンク | <100ms |
| PT-003   | NEAR検索性能       | 10,000チャンク | <150ms |

---

## テストファイル構成

```
packages/shared/src/services/search/__tests__/
├── keyword-search-strategy.test.ts           # ユニットテスト
├── keyword-search-strategy.integration.test.ts # 統合テスト
├── keyword-search-strategy.flow.test.ts       # データフローテスト
└── keyword-search-strategy.error.test.ts      # エラーハンドリングテスト
```

---

## モック戦略

### ユニットテスト

| モック対象                | モック方法  | 理由         |
| ------------------------- | ----------- | ------------ |
| `searchChunksByKeyword()` | vitest.mock | DB依存を排除 |
| `searchChunksByPhrase()`  | vitest.mock | DB依存を排除 |
| `searchChunksByNear()`    | vitest.mock | DB依存を排除 |

### 統合テスト

| 使用リソース | 準備                         |
| ------------ | ---------------------------- |
| テストDB     | SQLite in-memory             |
| テストデータ | fixtures/search-test-data.ts |

---

## テストカバレッジ目標

| 指標     | 目標 | 測定方法          |
| -------- | ---- | ----------------- |
| Line     | 80%+ | vitest --coverage |
| Branch   | 60%+ | vitest --coverage |
| Function | 80%+ | vitest --coverage |

---

## テスト実行コマンド

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test keyword-search-strategy

# カバレッジ確認
pnpm --filter @repo/shared test --coverage

# ウォッチモード
pnpm --filter @repo/shared test --watch keyword-search-strategy
```

---

## 状態確認

- [x] テスト仕様書作成完了
- [x] テストケース分類完了
- [ ] テストファイル作成中
- [ ] Red状態確認待ち
