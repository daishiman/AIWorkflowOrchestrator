# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | vector-search-diskann |

---

## 目的

TDDのRed段階として、VectorSearchStrategyの動作を検証するテストを実装より先に作成する。全テストが失敗状態（Red）であることを確認する。

## 背景

テスト駆動開発（TDD）では、まず失敗するテストを書き、その後テストを通す実装を行う。これにより、テストが実際に機能を検証していることを保証し、過剰な実装を防ぐ。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイル作成

**目的**: VectorSearchStrategyのテストファイルを作成する

**実行手順**:

1. テストファイルを作成:
   - `packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.test.ts`
2. 必要なimportを記述:
   ```typescript
   import { describe, it, expect, vi, beforeEach } from "vitest";
   import { VectorSearchStrategy } from "../vector-search-strategy";
   import { ok, err } from "@repo/shared/utils/result";
   ```
3. モック設定を準備:
   - mockDb: DrizzleClientのモック
   - mockEmbeddingProvider: IEmbeddingProviderのモック

**期待される成果物**:

- テストファイル（`packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.test.ts`）

---

### タスク2: 基本検索テストの作成

**目的**: 基本的なセマンティック検索の動作を検証するテストを作成する

**実行手順**:

1. 以下のテストケースを作成:

   ```typescript
   describe("VectorSearchStrategy", () => {
     it("基本的なセマンティック検索が動作する", async () => {
       const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
       const result = await strategy.search("型安全なプログラミング", 10);

       expect(result.success).toBe(true);
       expect(result.data.length).toBeGreaterThan(0);
       expect(result.data[0].source).toBe("semantic");
     });

     it('nameプロパティが"semantic"を返す', () => {
       const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
       expect(strategy.name).toBe("semantic");
     });
   });
   ```

**期待される成果物**:

- 基本検索テスト（テストファイル内）

---

### タスク3: スコア計算テストの作成

**目的**: コサイン類似度スコアの計算を検証するテストを作成する

**実行手順**:

1. 以下のテストケースを作成:

   ```typescript
   it("類似度スコアが0-1の範囲", async () => {
     const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
     const result = await strategy.search("test query", 10);

     expect(result.success).toBe(true);
     for (const item of result.data) {
       expect(item.score).toBeGreaterThanOrEqual(0);
       expect(item.score).toBeLessThanOrEqual(1);
     }
   });

   it("結果が類似度順でソートされる", async () => {
     const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
     const result = await strategy.search("test", 10);

     expect(result.success).toBe(true);
     for (let i = 1; i < result.data.length; i++) {
       expect(result.data[i].score).toBeLessThanOrEqual(
         result.data[i - 1].score,
       );
     }
   });
   ```

**期待される成果物**:

- スコア計算テスト（テストファイル内）

---

### タスク4: フィルタリングテストの作成

**目的**: 閾値とフィルタ条件によるフィルタリングを検証するテストを作成する

**実行手順**:

1. 以下のテストケースを作成:

   ```typescript
   it("閾値でフィルタリングされる", async () => {
     const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
     const result = await strategy.search("test query", 10, undefined, {
       threshold: 0.2,
     });

     expect(result.success).toBe(true);
     // 距離が0.2以下 = 類似度が0.9以上の結果のみ
     for (const item of result.data) {
       expect(item.score).toBeGreaterThanOrEqual(0.9);
     }
   });

   it("フィルタが正しく適用される", async () => {
     const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
     const result = await strategy.search("test", 10, {
       fileTypes: ["text/markdown"],
     });

     expect(result.success).toBe(true);
   });

   it("複数のフィルタ条件を組み合わせられる", async () => {
     const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
     const result = await strategy.search("test", 10, {
       fileIds: ["file-1", "file-2"],
       fileTypes: ["text/markdown"],
     });

     expect(result.success).toBe(true);
   });
   ```

**期待される成果物**:

- フィルタリングテスト（テストファイル内）

---

### タスク5: エラーハンドリングテストの作成

**目的**: エラーケースの動作を検証するテストを作成する

**実行手順**:

1. 以下のテストケースを作成:

   ```typescript
   it("埋め込みプロバイダーエラー時にエラーを返す", async () => {
     const failingProvider = {
       embedSingle: vi.fn().mockResolvedValue(err(new Error("API error"))),
     };
     const strategy = new VectorSearchStrategy(mockDb, failingProvider as any);
     const result = await strategy.search("test", 10);

     expect(result.success).toBe(false);
     expect(result.error.message).toBe("API error");
   });

   it("データベースエラー時にエラーを返す", async () => {
     const failingDb = {
       execute: vi
         .fn()
         .mockRejectedValue(new Error("Database connection failed")),
     };
     const strategy = new VectorSearchStrategy(
       failingDb as any,
       mockEmbeddingProvider,
     );
     const result = await strategy.search("test", 10);

     expect(result.success).toBe(false);
   });

   it("空のクエリでもエラーにならない", async () => {
     const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
     const result = await strategy.search("", 10);

     // 空のクエリでも処理は行われる（埋め込み生成は試みる）
     expect(result).toBeDefined();
   });
   ```

**期待される成果物**:

- エラーハンドリングテスト（テストファイル内）

---

### タスク6: 統合テストシナリオの作成

**目的**: 埋め込み生成→ベクトル検索→結果変換の統合テストシナリオを作成する

**実行手順**:

1. 統合テストファイルを作成:
   - `packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.integration.test.ts`

2. 以下のテストカテゴリを作成:

   ```typescript
   describe("VectorSearchStrategy 統合テスト", () => {
     describe("データフローテスト", () => {
       it("埋め込み生成→検索→結果変換のフローが動作する", async () => {
         // IEmbeddingProvider → VectorSearchStrategy → SearchResultItem
       });
     });

     describe("エラーハンドリングテスト", () => {
       it("埋め込みAPI障害時にエラーを返す", async () => {
         // API障害シミュレーション
       });

       it("DB障害時にエラーを返す", async () => {
         // DB障害シミュレーション
       });
     });
   });
   ```

**期待される成果物**:

- 統合テストファイル（`packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.integration.test.ts`）

---

### タスク7: CachedVectorSearchStrategyテストの作成

**目的**: キャッシュ付きバージョンのテストを作成する

**実行手順**:

1. テストファイルを作成:
   - `packages/shared/src/services/search/strategies/__tests__/cached-vector-search-strategy.test.ts`

2. 以下のテストケースを作成:

   ```typescript
   describe("CachedVectorSearchStrategy", () => {
     it("同じクエリでキャッシュが使用される", async () => {
       const strategy = new CachedVectorSearchStrategy(
         baseStrategy,
         mockProvider,
       );

       await strategy.search("test query", 10);
       await strategy.search("test query", 10);

       // 埋め込み生成は1回のみ
       expect(mockProvider.embedSingle).toHaveBeenCalledTimes(1);
     });

     it("異なるクエリでは新しい埋め込みが生成される", async () => {
       const strategy = new CachedVectorSearchStrategy(
         baseStrategy,
         mockProvider,
       );

       await strategy.search("query 1", 10);
       await strategy.search("query 2", 10);

       expect(mockProvider.embedSingle).toHaveBeenCalledTimes(2);
     });

     it("キャッシュが期限切れになると再生成される", async () => {
       // 時間経過をシミュレート
     });
   });
   ```

**期待される成果物**:

- CachedVectorSearchStrategyテストファイル

---

### タスク8: テスト失敗確認（Red状態）

**目的**: 全テストが失敗することを確認する

**実行手順**:

1. テストを実行:

   ```bash
   pnpm --filter @repo/shared test -- --run vector-search-strategy
   ```

2. 全テストが失敗することを確認（モジュールが未実装のため）

3. 失敗したテスト数を記録

**期待される成果物**:

- テスト実行結果記録（`outputs/phase-4/test-red-state.md`）

---

## 参照資料

| 参照資料            | パス                                             | 内容                     |
| ------------------- | ------------------------------------------------ | ------------------------ |
| Phase 2設計         | `outputs/phase-2/`                               | クラス設計・メソッド設計 |
| Phase 3レビュー結果 | `outputs/phase-3/`                               | 統合テスト観点           |
| 既存テスト例        | `packages/shared/src/services/search/__tests__/` | 既存テストのパターン     |

---

## 成果物

| 成果物             | パス                                                                                                  | 内容                             |
| ------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------- |
| ユニットテスト     | `packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.test.ts`             | VectorSearchStrategyのテスト     |
| 統合テスト         | `packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.integration.test.ts` | 統合テスト                       |
| キャッシュテスト   | `packages/shared/src/services/search/strategies/__tests__/cached-vector-search-strategy.test.ts`      | CachedVectorSearchStrategyテスト |
| テスト実行結果記録 | `outputs/phase-4/test-red-state.md`                                                                   | Red状態の確認記録                |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4の統合テスト連携アクション**:

- 埋め込み生成→ベクトル検索→結果変換の統合テストシナリオを作成
- API接続テスト（IEmbeddingProvider）のモック設計
- データフローテスト（VectorSearchStrategy → libSQL）のモック設計

---

## 完了条件

- [ ] VectorSearchStrategyのテストファイルが作成されている
- [ ] 基本検索テストが作成されている
- [ ] スコア計算テストが作成されている
- [ ] フィルタリングテストが作成されている
- [ ] エラーハンドリングテストが作成されている
- [ ] 統合テストシナリオが作成されている
- [ ] CachedVectorSearchStrategyテストが作成されている
- [ ] すべてのテストが失敗状態（Red）であることを確認した
- [ ] テスト実行結果を記録した
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run vector-search-strategy
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク1: テストファイル作成 - [結果]
- タスク2: 基本検索テストの作成 - [結果]
- タスク3: スコア計算テストの作成 - [結果]
- タスク4: フィルタリングテストの作成 - [結果]
- タスク5: エラーハンドリングテストの作成 - [結果]
- タスク6: 統合テストシナリオの作成 - [結果]
- タスク7: CachedVectorSearchStrategyテストの作成 - [結果]
- タスク8: テスト失敗確認（Red状態） - [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/vector-search-diskann/phase-5-implementation.md`
