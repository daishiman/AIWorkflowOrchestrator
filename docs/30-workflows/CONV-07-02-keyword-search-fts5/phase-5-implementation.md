# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| Phase名    | 実装（TDD: Green）             |
| 前提Phase  | Phase 4                        |
| 後続Phase  | Phase 6                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | CONV-07-02-keyword-search-fts5 |

---

## 目的

TDDのGreen段階として、テストを通す最小限の実装を行う。

## 背景

Phase 4で作成したテストを全て成功させる実装を行い、機能要件を満たす。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: キーワード検索に必要な型を定義する

**実行手順**:

1. SearchMode型の定義

```typescript
type SearchMode = "keyword" | "phrase" | "near";
```

2. FTS5Result型の定義

```typescript
interface FTS5Result {
  rowid: number;
  score: number;
  content: string;
}
```

3. KeywordSearchError型の定義

```typescript
interface KeywordSearchError {
  type: "validation" | "database" | "timeout";
  message: string;
  cause?: Error;
}
```

4. StrategyMetric型の定義（既存を使用または拡張）

**期待される成果物**:

- `packages/shared/src/services/search/types.ts`（追加）

---

### タスク2: インターフェースの実装

**目的**: IKeywordSearchStrategyインターフェースを定義する

**実行手順**:

1. インターフェース定義

```typescript
interface IKeywordSearchStrategy extends ISearchStrategy {
  search(
    query: SearchQuery,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>>;
  searchNear(
    query: SearchQuery,
    nearDistance?: number,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>>;
  getStrategyName(): "keyword";
  getMetrics(): StrategyMetric;
}
```

2. エクスポート設定

**期待される成果物**:

- `packages/shared/src/services/search/IKeywordSearchStrategy.ts`

---

### タスク3: メイン実装

**目的**: KeywordSearchStrategyクラスを実装する

**実行手順**:

1. コンストラクタ実装
   - Database依存の注入
   - Logger依存の注入
   - 定数の初期化

2. search()メソッド実装
   - クエリ検証
   - 検索モード判定（keyword/phrase）
   - FTS5クエリ生成
   - DB検索実行
   - 結果変換

3. searchNear()メソッド実装
   - NEAR演算子クエリ生成
   - DB検索実行
   - 結果変換

4. ヘルパーメソッド実装
   - validateQuery(): 入力検証
   - buildFTS5Query(): FTS5クエリ文字列生成
   - normalizeScore(): BM25スコア正規化
   - toSearchResultItem(): 結果変換

5. エラーハンドリング実装
   - タイムアウト検出
   - DB接続エラー検出
   - バリデーションエラー生成

**期待される成果物**:

- `packages/shared/src/services/search/strategies/keyword-search-strategy.ts`

---

### タスク4: テスト実行と成功確認

**目的**: 全テストが成功することを確認する（Green状態）

**実行手順**:

1. テスト実行

```bash
pnpm --filter @repo/shared test -- --testPathPattern="keyword-search"
```

2. 全テストが成功することを確認
3. 成功結果の記録

**期待される成果物**:

- `outputs/phase-5/test-result-green.md`

---

### タスク5: インデックスファイルの更新

**目的**: モジュールエクスポートを設定する

**実行手順**:

1. 型エクスポートの追加
2. インターフェースエクスポートの追加
3. 実装クラスエクスポートの追加

**期待される成果物**:

- `packages/shared/src/services/search/index.ts`（更新）

---

## 参照資料

| 参照資料      | パス               | 内容           |
| ------------- | ------------------ | -------------- |
| Phase 2成果物 | `outputs/phase-2/` | 設計文書       |
| Phase 4成果物 | テストファイル     | 作成済みテスト |

---

## 成果物

| 成果物           | パス                                                                        | 内容           |
| ---------------- | --------------------------------------------------------------------------- | -------------- |
| 型定義           | `packages/shared/src/services/search/types.ts`                              | 型定義（追加） |
| インターフェース | `packages/shared/src/services/search/IKeywordSearchStrategy.ts`             | IF定義         |
| メイン実装       | `packages/shared/src/services/search/strategies/keyword-search-strategy.ts` | 実装クラス     |
| インデックス     | `packages/shared/src/services/search/index.ts`                              | エクスポート   |
| テスト結果       | `outputs/phase-5/test-result-green.md`                                      | 成功確認結果   |

---

## TDD検証

### Green段階確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --testPathPattern="keyword-search"
```

**確認項目**:

- [ ] 全ユニットテストが成功している
- [ ] 全統合テストが成功している

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                       |
| ------------------ | ------------------------------------------ |
| DB接続             | SQLite FTS5テーブルへのクエリ実行実装      |
| スコア正規化       | BM25スコアのシグモイド関数による正規化実装 |
| エラーハンドリング | KeywordSearchError3種のハンドリング実装    |
| Orchestrator統合   | ISearchStrategy準拠の実装                  |

---

---

## 完了条件

- [ ] 型定義が実装されている
- [ ] インターフェースが定義されている
- [ ] KeywordSearchStrategyが実装されている
- [ ] 全テストが成功している（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-07-02-keyword-search-fts5/phase-6-test-expansion.md`
