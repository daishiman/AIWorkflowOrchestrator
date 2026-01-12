# 受け入れ基準 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-07-02 |
| Phase    | 1          |
| 作成日   | 2026-01-11 |

---

## 受け入れ基準一覧

### AC-001: キーワード検索（OR検索）

**関連要件**: FR-002

```gherkin
Given テストDBに以下のチャンクが存在する
  | id | content |
  | 1  | "AI and machine learning are transforming industries" |
  | 2  | "Deep learning is a subset of machine learning" |
  | 3  | "Natural language processing uses AI" |

When "AI learning" でキーワード検索を実行する

Then 結果が3件返される
And 各結果にscoreが0.0-1.0の範囲で含まれる
And 結果はscore降順でソートされている
```

---

### AC-002: フレーズ検索（完全一致）

**関連要件**: FR-003

```gherkin
Given テストDBに以下のチャンクが存在する
  | id | content |
  | 1  | "machine learning is powerful" |
  | 2  | "learning machine tools" |
  | 3  | "machine learning algorithms" |

When "machine learning" でフレーズ検索を実行する

Then 結果が2件返される（id: 1, 3）
And "learning machine" を含むチャンク（id: 2）は含まれない
```

---

### AC-003: NEAR検索（近接検索）

**関連要件**: FR-004

```gherkin
Given テストDBに以下のチャンクが存在する
  | id | content |
  | 1  | "AI is transforming machine learning rapidly" |
  | 2  | "AI and machine learning" |
  | 3  | "AI in 2024 has many applications in learning systems" |

When ["AI", "learning"] でNEAR検索を実行する（nearDistance: 3）

Then 結果が2件返される（id: 1, 2）
And 距離が3を超えるチャンク（id: 3）は含まれない
```

---

### AC-004: BM25スコア正規化

**関連要件**: FR-005

```gherkin
Given FTS5のBM25スコアが以下の値を返す
  | rawBM25Score |
  | 0            |
  | 1            |
  | 10           |

When スコアを正規化する（scaleFactor: 0.3）

Then 正規化スコアは以下の範囲になる
  | rawBM25Score | normalizedScore |
  | 0            | 1.0             |
  | 1            | ~0.77           |
  | 10           | ~0.25           |
And 全ての正規化スコアは0.0以上1.0以下
```

---

### AC-005: 空クエリ処理

**関連要件**: NFR-004

```gherkin
Given 任意のDB状態

When 空文字 "" で検索を実行する

Then 空配列 [] が返される
And エラーは発生しない
```

---

### AC-006: 空白のみクエリ処理

**関連要件**: NFR-004

```gherkin
Given 任意のDB状態

When 空白のみ "   " で検索を実行する

Then 空配列 [] が返される
And エラーは発生しない
```

---

### AC-007: 結果が0件の場合

**関連要件**: FR-002

```gherkin
Given テストDBにチャンクが存在する

When マッチしないクエリ "xyzabc123nonexistent" で検索を実行する

Then 空配列 [] が返される
And エラーは発生しない
```

---

### AC-008: ファイルIDフィルタリング

**関連要件**: FR-007

```gherkin
Given テストDBに以下のチャンクが存在する
  | id | file_id | content |
  | 1  | file-A  | "AI concepts" |
  | 2  | file-B  | "AI applications" |
  | 3  | file-A  | "AI research" |

When "AI" で検索しfileId "file-A" でフィルタリングする

Then 結果が2件返される（id: 1, 3）
And file_id "file-B" のチャンクは含まれない
```

---

### AC-009: ハイライト情報

**関連要件**: FR-006

```gherkin
Given テストDBにチャンク "AI and machine learning" が存在する

When "AI" で検索しハイライトを有効にする

Then 結果にhighlightsが含まれる
And highlights[0].start = 0
And highlights[0].end = 2
```

---

### AC-010: 検索結果フォーマット

**関連要件**: FR-008

```gherkin
Given テストDBにチャンクが存在する

When 有効なクエリで検索を実行する

Then 各結果は以下のフィールドを持つ
  | フィールド | 型 | 説明 |
  | id | string | 結果アイテムID |
  | type | "chunk" | 結果タイプ |
  | score | number | 0.0-1.0 |
  | relevance.keyword | number | キーワードスコア |
  | content.text | string | チャンク本文 |
  | sources.chunkId | string | チャンクID |
  | sources.fileId | string | ファイルID |
```

---

### AC-011: 検索速度（キーワード）

**関連要件**: NFR-001

```gherkin
Given テストDBに10,000件のチャンクが存在する

When キーワード検索を100回実行する

Then 95パーセンタイルの応答時間が100ms未満
```

---

### AC-012: 検索速度（フレーズ）

**関連要件**: NFR-001

```gherkin
Given テストDBに10,000件のチャンクが存在する

When フレーズ検索を100回実行する

Then 95パーセンタイルの応答時間が100ms未満
```

---

### AC-013: 検索速度（NEAR）

**関連要件**: NFR-001

```gherkin
Given テストDBに10,000件のチャンクが存在する

When NEAR検索を100回実行する

Then 95パーセンタイルの応答時間が150ms未満
```

---

### AC-014: 型安全性

**関連要件**: NFR-003

```gherkin
Given KeywordSearchStrategy実装コード

When TypeScript型チェックを実行する（pnpm typecheck）

Then エラー0件でパスする
And any型が使用されていない
And @ts-ignoreが使用されていない
```

---

### AC-015: 結果件数制限（limit）

**関連要件**: FR-002

```gherkin
Given テストDBに100件のマッチするチャンクが存在する

When limit=10 で検索を実行する

Then 結果が10件以下返される
```

---

### AC-016: SQLインジェクション防止

**関連要件**: NFR-004

```gherkin
Given テストDBにチャンクが存在する

When 悪意のあるクエリ "'; DROP TABLE chunks; --" で検索を実行する

Then SQLインジェクションは発生しない
And クエリはエスケープされて安全に処理される
And DBテーブルは削除されない
```

---

### AC-017: 日本語検索

**関連要件**: FR-002

```gherkin
Given テストDBに日本語チャンク "機械学習とAIの基礎" が存在する

When "機械学習" で検索を実行する

Then チャンクがマッチする
And 正規化されたスコアが返される
```

---

### AC-018: メトリクス収集

**関連要件**: FR-009

```gherkin
Given KeywordSearchStrategyインスタンス

When 検索を5回実行する
And getMetrics() を呼び出す

Then totalSearches = 5
And averageResponseTime > 0
```

---

## 境界値テストケース

| テストケース            | 入力値             | 期待動作             |
| ----------------------- | ------------------ | -------------------- |
| 空文字                  | `""`               | 空配列を返す         |
| 空白のみ                | `"   "`            | 空配列を返す         |
| 1文字                   | `"a"`              | 正常に検索           |
| 最大長（1000文字）      | 1000文字の文字列   | 正常に検索           |
| 超過（1001文字）        | 1001文字の文字列   | バリデーションエラー |
| limit=0                 | `limit: 0`         | 空配列を返す         |
| limit=100（最大）       | `limit: 100`       | 最大100件返す        |
| limit=101（超過）       | `limit: 101`       | バリデーションエラー |
| nearDistance=1（最小）  | `nearDistance: 1`  | 正常に検索           |
| nearDistance=50（最大） | `nearDistance: 50` | 正常に検索           |
| nearDistance=51（超過） | `nearDistance: 51` | バリデーションエラー |
