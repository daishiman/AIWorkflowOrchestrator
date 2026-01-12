# Phase 4: テスト作成（TDD: Red） - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成（TDD: Red）        |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-11                    |
| 機能名     | keyword-search-fts5           |
| タスクID   | CONV-07-02                    |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。TDD原則に従い、テストファーストで開発を進める。

## 背景

Phase 3でレビュー済みの設計に基づき、KeywordSearchStrategyの動作を検証するユニットテスト・統合テストを作成する。テストは実装前に作成し、全て失敗状態（Red）であることを確認する。

---

## 実行タスク

### タスク1: テストシナリオ設計

**目的**: 受け入れ基準からテストシナリオを導出する

**実行手順**:

1. Phase 1の受け入れ基準（AC）からテストケースを導出
2. 正常系・異常系・境界値テストを分類
3. テストシナリオをテスト仕様書に記録

**テストカテゴリ**:

| カテゴリ | 内容                           |
| -------- | ------------------------------ |
| 正常系   | 基本的な検索機能の動作確認     |
| 異常系   | 無効入力、エラー状態の処理確認 |
| 境界値   | 空文字、最大長、特殊文字等     |
| 性能     | 検索速度目標（<100ms）の確認   |

---

### タスク2: ユニットテスト作成

**目的**: KeywordSearchStrategyの各メソッドをテストする

**実行手順**:

1. `keyword-search-strategy.test.ts` ファイルを作成
2. search()メソッドのテストを作成
3. buildFTS5Query()メソッドのテストを作成
4. normalizeScore()メソッドのテストを作成
5. toSearchResultItem()メソッドのテストを作成

**テストファイル配置**:

```
packages/shared/src/services/search/__tests__/
  keyword-search-strategy.test.ts
  keyword-search-strategy.unit.test.ts
```

**テストケース例**:

```typescript
describe("KeywordSearchStrategy", () => {
  describe("search", () => {
    it("キーワード検索で関連するチャンクを返す", async () => {
      // Given: テストデータが投入されている
      // When: search()を呼び出す
      // Then: 関連するSearchResultItem[]が返される
    });

    it("空のクエリでは空配列を返す", async () => {
      // Given: 空のSearchQuery
      // When: search()を呼び出す
      // Then: 空配列が返される
    });

    it("マッチするチャンクがない場合は空配列を返す", async () => {
      // Given: マッチしないクエリ
      // When: search()を呼び出す
      // Then: 空配列が返される
    });
  });

  describe("normalizeScore", () => {
    it("BM25スコア0を1.0に正規化する", () => {
      // BM25スコア0（完全一致）は関連度1.0
    });

    it("BM25スコアが大きいほど低い正規化スコアになる", () => {
      // BM25スコアが大きい = 関連度が低い
    });
  });
});
```

---

### タスク3: 統合テスト作成

**目的**: KeywordSearchStrategyとデータベース層の連携をテストする

**実行手順**:

1. `keyword-search-strategy.integration.test.ts` ファイルを作成
2. 実際のデータベース（テスト用）との連携テストを作成
3. chunks-search.ts関数との統合テストを作成

**テストファイル配置**:

```
packages/shared/src/services/search/__tests__/
  keyword-search-strategy.integration.test.ts
```

**統合テストシナリオ**:

| シナリオカテゴリ   | 検証内容                              | テストファイル          |
| ------------------ | ------------------------------------- | ----------------------- |
| API接続テスト      | ISearchStrategy.search()の動作        | `*.integration.test.ts` |
| データフローテスト | SearchQuery→FTS5→SearchResultItem変換 | `*.flow.test.ts`        |
| エラーハンドリング | DB接続エラー、タイムアウトの処理      | `*.error.test.ts`       |

---

### タスク4: 境界値・エッジケーステスト

**目的**: 境界値やエッジケースを網羅的にテストする

**実行手順**:

1. 空文字クエリのテストを作成
2. 最大長クエリ（1000文字）のテストを作成
3. 特殊文字（SQLインジェクション）のテストを作成
4. 日本語クエリのテストを作成

**境界値テストケース**:

| テストケース        | 入力                      | 期待動作             |
| ------------------- | ------------------------- | -------------------- |
| 空文字              | `""`                      | 空配列を返す         |
| 空白のみ            | `"   "`                   | 空配列を返す         |
| 1文字               | `"a"`                     | 正常に検索           |
| 最大長（1000文字）  | 1000文字の文字列          | 正常に検索           |
| 超過（1001文字）    | 1001文字の文字列          | バリデーションエラー |
| SQLインジェクション | `"'; DROP TABLE chunks;"` | エスケープされて安全 |
| 日本語              | `"検索クエリ"`            | 正常に検索           |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                         | 内容                 |
| -------------------- | ---------------------------------------------------------------------------- | -------------------- |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchQuery/Result型 |

### Phase成果物

| 参照資料     | パス                                      | 内容     |
| ------------ | ----------------------------------------- | -------- |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`  | AC定義   |
| 設計書       | `outputs/phase-2/architecture-design.md`  | 設計詳細 |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果 |

---

## 成果物

| 成果物             | パス                                                      | 内容               |
| ------------------ | --------------------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                   | テスト設計         |
| テストケース一覧   | `outputs/phase-4/test-cases.md`                           | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`              | 統合テスト設計     |
| テストファイル     | `packages/shared/src/services/search/__tests__/*.test.ts` | 実際のテストコード |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                      | テストファイル                                |
| ------------------ | --------------------------------------------- | --------------------------------------------- |
| API接続テスト      | ISearchStrategy.search()の動作確認            | `keyword-search-strategy.integration.test.ts` |
| データフローテスト | SearchQuery→FTS5クエリ→SearchResultItem[]変換 | `keyword-search-strategy.flow.test.ts`        |
| エラーハンドリング | DB接続エラー、タイムアウト、無効クエリ処理    | `keyword-search-strategy.error.test.ts`       |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonのPhase 4を更新

---

## 次のPhase

Phase 5: 実装（TDD: Green）

`docs/30-workflows/keyword-search-fts5/phase-5-implementation.md`
