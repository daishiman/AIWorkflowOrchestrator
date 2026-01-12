# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 6                     |
| Phase名    | テスト拡充            |
| 前提Phase  | Phase 5               |
| 後続Phase  | Phase 7               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | vector-search-diskann |

---

## 目的

Phase 5の実装完了後、テストカバレッジ目標達成に向けて追加テストを作成する。ユニットテストと統合テストを拡充し、フロントエンド・バックエンド接続の不具合を事前に防止する。

## 背景

TDDのGreen段階で最小限の実装を行った後、本Phaseでテストを拡充してカバレッジ目標を達成する。リファクタリング（Phase 8）に進む前に十分なテスト網羅性を確保することで、リファクタリング時の回帰を防止する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現在のカバレッジ確認

**目的**: 現在のテストカバレッジを確認し、不足箇所を特定する

**実行手順**:

1. カバレッジ計測を実行:

   ```bash
   pnpm --filter @repo/shared test:coverage -- --run vector-search-strategy
   ```

2. 以下の指標を記録:
   - Line Coverage
   - Branch Coverage
   - Function Coverage

3. 不足箇所（未カバーの行・分岐・関数）を特定

**期待される成果物**:

- カバレッジ分析結果（`outputs/phase-6/coverage-analysis.md`）

---

### タスク2: 境界値テストの追加

**目的**: 境界値ケースのテストを追加する

**実行手順**:

1. 以下のテストケースを追加:

   ```typescript
   describe("境界値テスト", () => {
     it("limit=0の場合は空配列を返す", async () => {
       const result = await strategy.search("test", 0);
       expect(result.success).toBe(true);
       expect(result.data).toHaveLength(0);
     });

     it("limit=100の場合も動作する", async () => {
       const result = await strategy.search("test", 100);
       expect(result.success).toBe(true);
     });

     it("threshold=0の場合は完全一致のみ", async () => {
       const result = await strategy.search("test", 10, undefined, {
         threshold: 0,
       });
       expect(result.success).toBe(true);
       for (const item of result.data) {
         expect(item.score).toBe(1);
       }
     });

     it("threshold=2の場合は全結果を返す", async () => {
       const result = await strategy.search("test", 10, undefined, {
         threshold: 2,
       });
       expect(result.success).toBe(true);
     });

     it("非常に長いクエリでも動作する", async () => {
       const longQuery = "a".repeat(1000);
       const result = await strategy.search(longQuery, 10);
       expect(result).toBeDefined();
     });
   });
   ```

**期待される成果物**:

- 境界値テスト追加（テストファイル内）

---

### タスク3: distanceToSimilarity関数のテスト追加

**目的**: 距離→類似度変換関数のエッジケースをテストする

**実行手順**:

1. 以下のテストケースを追加:

   ```typescript
   describe("distanceToSimilarity", () => {
     it("距離0は類似度1を返す", () => {
       expect(strategy["distanceToSimilarity"](0)).toBe(1);
     });

     it("距離2は類似度0を返す", () => {
       expect(strategy["distanceToSimilarity"](2)).toBe(0);
     });

     it("距離1は類似度0.5を返す", () => {
       expect(strategy["distanceToSimilarity"](1)).toBe(0.5);
     });

     it("負の距離は類似度1に丸められる", () => {
       expect(strategy["distanceToSimilarity"](-0.5)).toBe(1);
     });

     it("距離2超は類似度0に丸められる", () => {
       expect(strategy["distanceToSimilarity"](2.5)).toBe(0);
     });
   });
   ```

**期待される成果物**:

- distanceToSimilarityテスト追加（テストファイル内）

---

### タスク4: buildFilterClausesのテスト追加

**目的**: フィルタ条件構築のエッジケースをテストする

**実行手順**:

1. 以下のテストケースを追加:

   ```typescript
   describe("buildFilterClauses", () => {
     it("filtersがundefinedの場合は空のフィルタを返す", () => {
       const result = strategy["buildFilterClauses"](undefined);
       expect(result.join).toBe(false);
       expect(result.where).toHaveLength(0);
       expect(result.params).toHaveLength(0);
     });

     it("fileIdsのみ指定時はJOINなし", () => {
       const result = strategy["buildFilterClauses"]({
         fileIds: ["id1", "id2"],
       });
       expect(result.join).toBe(false);
       expect(result.where).toHaveLength(1);
       expect(result.params).toEqual(["id1", "id2"]);
     });

     it("fileTypesが指定時はJOINあり", () => {
       const result = strategy["buildFilterClauses"]({
         fileTypes: ["text/markdown"],
       });
       expect(result.join).toBe(true);
     });

     it("dateRangeが正しく処理される", () => {
       const result = strategy["buildFilterClauses"]({
         dateRange: { from: "2026-01-01", to: "2026-12-31" },
       });
       expect(result.where).toContain(
         "c.created_at >= ? AND c.created_at <= ?",
       );
       expect(result.params).toContain("2026-01-01");
       expect(result.params).toContain("2026-12-31");
     });

     it("複数フィルタの組み合わせ", () => {
       const result = strategy["buildFilterClauses"]({
         fileIds: ["id1"],
         fileTypes: ["text/markdown"],
         workspaceIds: ["ws1"],
       });
       expect(result.join).toBe(true);
       expect(result.where.length).toBe(3);
     });
   });
   ```

**期待される成果物**:

- buildFilterClausesテスト追加（テストファイル内）

---

### タスク5: 統合テストの拡充

**目的**: 埋め込み生成→ベクトル検索→結果変換の統合テストを拡充する

**実行手順**:

1. 以下のテストカテゴリを拡充:

   ```typescript
   describe("統合テスト拡充", () => {
     describe("データフローテスト", () => {
       it("正常フロー: クエリ→埋め込み→検索→結果", async () => {
         // 全データフローの検証
       });

       it("メタデータが正しく変換される", async () => {
         // metadata JSONパースの検証
       });
     });

     describe("エラーハンドリング拡充", () => {
       it("埋め込みAPIタイムアウト時", async () => {
         // タイムアウトシミュレーション
       });

       it("不正なembedding形式時", async () => {
         // 不正データのハンドリング
       });

       it("DBクエリ構文エラー時", async () => {
         // SQLエラーのハンドリング
       });
     });

     describe("パフォーマンス関連", () => {
       it("大量結果時のメモリ使用", async () => {
         // 100件以上の結果処理
       });
     });
   });
   ```

**期待される成果物**:

- 統合テスト拡充（統合テストファイル内）

---

### タスク6: CachedVectorSearchStrategyテスト拡充

**目的**: キャッシュ機能のエッジケースをテストする

**実行手順**:

1. 以下のテストケースを追加:

   ```typescript
   describe("CachedVectorSearchStrategy拡充", () => {
     it("大文字小文字を区別しないキャッシュキー", async () => {
       await strategy.search("Test Query", 10);
       await strategy.search("test query", 10);

       expect(mockProvider.embedSingle).toHaveBeenCalledTimes(1);
     });

     it("先頭・末尾の空白を無視したキャッシュキー", async () => {
       await strategy.search("  test  ", 10);
       await strategy.search("test", 10);

       expect(mockProvider.embedSingle).toHaveBeenCalledTimes(1);
     });

     it("キャッシュクリーンアップが動作する", async () => {
       // 古いエントリが削除されることを検証
     });

     it("キャッシュサイズ制限", async () => {
       // 多数のクエリ後も適切にクリーンアップ
     });
   });
   ```

**期待される成果物**:

- CachedVectorSearchStrategyテスト拡充（テストファイル内）

---

### タスク7: カバレッジ再計測

**目的**: テスト拡充後のカバレッジを確認する

**実行手順**:

1. カバレッジ計測を実行:

   ```bash
   pnpm --filter @repo/shared test:coverage -- --run vector-search-strategy
   ```

2. カバレッジ目標との比較:
   - Line Coverage: 80%以上（推奨90%）
   - Branch Coverage: 60%以上（推奨70%）
   - Function Coverage: 80%以上（推奨90%）

3. 結果を記録

**期待される成果物**:

- カバレッジ拡充結果（`outputs/phase-6/coverage-result.md`）

---

## 参照資料

| 参照資料      | パス                                                        | 内容       |
| ------------- | ----------------------------------------------------------- | ---------- |
| Phase 4テスト | `packages/shared/src/services/search/strategies/__tests__/` | 既存テスト |
| Phase 5実装   | `packages/shared/src/services/search/strategies/`           | 実装コード |

---

## 成果物

| 成果物             | パス                                                        | 内容                   |
| ------------------ | ----------------------------------------------------------- | ---------------------- |
| カバレッジ分析結果 | `outputs/phase-6/coverage-analysis.md`                      | 拡充前のカバレッジ分析 |
| カバレッジ拡充結果 | `outputs/phase-6/coverage-result.md`                        | 拡充後のカバレッジ結果 |
| テストファイル更新 | `packages/shared/src/services/search/strategies/__tests__/` | 拡充されたテスト       |

---

## テストカバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6の統合テスト連携アクション**:

- 統合テストの拡充（全カテゴリのカバレッジ向上）
- API接続テスト（IEmbeddingProvider）の拡充
- データフローテスト（埋め込み→検索→変換）の拡充
- エラーハンドリングテスト（API障害、DB障害）の拡充

---

## 完了条件

- [ ] 現在のカバレッジを分析した
- [ ] 境界値テストを追加した
- [ ] distanceToSimilarity関数のテストを追加した
- [ ] buildFilterClausesのテストを追加した
- [ ] 統合テストを拡充した
- [ ] CachedVectorSearchStrategyテストを拡充した
- [ ] カバレッジ再計測を行った
- [ ] 全成果物が配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/vector-search-diskann/phase-7-coverage-check.md`
