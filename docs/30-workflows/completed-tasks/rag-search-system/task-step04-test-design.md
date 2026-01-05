# CONV-03-05: ユーティリティ関数テスト設計書

**バージョン**: 1.0.0
**作成日**: 2025-12-18
**作成者**: Unit Tester Agent
**フェーズ**: Phase 3 (TDD: Red Phase)
**前提ドキュメント**:

- task-step01-requirements.md (要件定義)
- task-step02-utils-design.md (関数設計)

---

## 1. 概要

### 1.1 目的

本ドキュメントは、HybridRAG検索エンジンのユーティリティ関数（`utils.ts`）に対するテスト設計を定義する。
TDD（Test-Driven Development）のRed-Green-Refactorサイクルに従い、まずテストを作成し、実装前にRed状態を確認する。

### 1.2 テスト戦略

| 戦略                        | 説明                                                   |
| --------------------------- | ------------------------------------------------------ |
| **TDD Red-Green-Refactor**  | テスト→実装→リファクタのサイクル                       |
| **Given-When-Then**         | テストケースの命名規則                                 |
| **Boundary Value Analysis** | 境界値とエッジケースの網羅的テスト                     |
| **AAA Pattern**             | Arrange-Act-Assertパターン（テストの構造化）           |
| **Pure Function Testing**   | 純粋関数の性質を検証（副作用なし、入力不変、同一出力） |

### 1.3 使用ツール

- **テストフレームワーク**: Vitest
- **アサーションライブラリ**: Vitest expect API
- **カバレッジツール**: Vitest coverage (v8)

---

## 2. テスト対象関数一覧

| #   | 関数名                | 主な機能                   | テストケース数 |
| --- | --------------------- | -------------------------- | -------------- |
| 1   | calculateRRFScore     | RRFアルゴリズムによる融合  | 6件            |
| 2   | normalizeScores       | スコアの0-1正規化          | 6件            |
| 3   | deduplicateResults    | 重複排除                   | 4件            |
| 4   | expandQuery           | クエリ拡張                 | 3件            |
| 5   | calculateCRAGScore    | CRAG評価                   | 5件            |
| 6   | mergeSearchResults    | 検索結果マージ             | 1件            |
| 7   | sortByRelevance       | 関連度順ソート             | 2件            |
| 8   | filterByThreshold     | 閾値フィルタリング         | 6件            |
| --- | --------------------- | -------------------------- | -------------- |
|     | **合計**              |                            | **33件**       |

---

## 3. テストケース詳細

### 3.1 calculateRRFScore（6件）

#### 正常系（2件）

**TC-001: 標準的な3戦略でのRRF計算**

- **Given**: keyword/semantic/graphの3戦略の結果がある
- **When**: 標準的な重み（0.35/0.35/0.30）でRRF計算
- **Then**: スコア降順で結果が返る（ID='a'が最高スコア）

**TC-002: RRFスコアの数値精度検証**

- **Given**: k=60, rank=1, weight=1.0
- **When**: RRF計算
- **Then**: 1/61 = 0.01639に近い値（小数点5桁）

#### 境界値（2件）

**TC-003: 一部戦略が空**

- **Given**: semantic戦略のみ結果あり、keyword/graphは空
- **When**: RRF計算
- **Then**: semantic戦略のみでスコア計算、結果は1件

**TC-004: 全戦略が空**

- **Given**: keyword/semantic/graphすべて空配列
- **When**: RRF計算
- **Then**: `EmptyRankedListsError` をスロー

#### エラー系（2件）

**TC-005: 重みの合計が1.0でない**

- **Given**: 重みの合計が1.5（0.5+0.5+0.5）
- **When**: RRF計算
- **Then**: `InvalidWeightsError` をスロー

**TC-006: k=0（無効な値）**

- **Given**: k=0
- **When**: RRF計算
- **Then**: `InvalidKValueError` をスロー

---

### 3.2 normalizeScores（6件）

#### 正常系（2件）

**TC-007: 標準的な正規化**

- **Given**: スコア配列 [0.2, 0.8, 0.5]
- **When**: 正規化
- **Then**: [0.0, 1.0, 0.5]

**TC-008: 順序保持の検証**

- **Given**: スコア配列 [0.8, 0.2, 0.5]
- **When**: 正規化
- **Then**: result[0] > result[1]（元の順序を保持）

#### 境界値（4件）

**TC-009: 空配列**

- **Given**: 空配列 []
- **When**: 正規化
- **Then**: 空配列 []

**TC-010: 単一要素**

- **Given**: [0.5]
- **When**: 正規化
- **Then**: [1.0]（単一要素は最大値として1.0）

**TC-011: 全て同値**

- **Given**: [0.5, 0.5, 0.5]
- **When**: 正規化
- **Then**: [0.5, 0.5, 0.5]（変更なし）

**TC-012: 負の値を含む**

- **Given**: [-1, 0, 1]
- **When**: 正規化
- **Then**: [0.0, 0.5, 1.0]

---

### 3.3 deduplicateResults（4件）

#### max_score戦略（1件）

**TC-013: 同一IDの最大スコア採用**

- **Given**: [{id:'a', score:0.8}, {id:'a', score:0.6}, {id:'b', score:0.7}]
- **When**: max_score戦略で重複排除
- **Then**: 2件、id='a'のスコアは0.8

#### sum_score戦略（1件）

**TC-014: 同一IDのスコア合計**

- **Given**: [{id:'a', score:0.3}, {id:'a', score:0.4}]
- **When**: sum_score戦略で重複排除
- **Then**: 1件、スコアは0.7

#### 境界値（2件）

**TC-015: 空配列**

- **Given**: []
- **When**: 重複排除
- **Then**: []

**TC-016: 重複なし**

- **Given**: [{id:'a', score:0.8}, {id:'b', score:0.6}]
- **When**: 重複排除
- **Then**: 元の配列と同じ

---

### 3.4 expandQuery（3件）

#### 境界値（3件）

**TC-017: 空クエリ**

- **Given**: 空文字列 ""
- **When**: クエリ拡張
- **Then**: expanded配列は空、metadata.synonymCount=0

**TC-018: 拡張なし設定**

- **Given**: includeSynonyms=false, includeRelated=false
- **When**: クエリ拡張
- **Then**: expanded配列は空

**TC-019: maxExpansions=0**

- **Given**: maxExpansions=0
- **When**: クエリ拡張
- **Then**: expanded配列は空

---

### 3.5 calculateCRAGScore（5件）

#### 判定ロジック（3件）

**TC-020: correct判定**

- **Given**: relevanceScore=0.8（>= 0.7）
- **When**: CRAG評価
- **Then**: relevance='correct', needsWebSearch=false

**TC-021: incorrect判定**

- **Given**: relevanceScore=0.2（<= 0.3）
- **When**: CRAG評価
- **Then**: relevance='incorrect', needsWebSearch=true

**TC-022: ambiguous判定**

- **Given**: relevanceScore=0.5（0.3 < x < 0.7）
- **When**: CRAG評価
- **Then**: relevance='ambiguous', needsWebSearch=true

#### 境界値（2件）

**TC-023: 境界値0.7（correct）**

- **Given**: relevanceScore=0.7
- **When**: CRAG評価
- **Then**: relevance='correct'

**TC-024: 境界値0.3（incorrect）**

- **Given**: relevanceScore=0.3
- **When**: CRAG評価
- **Then**: relevance='incorrect'

---

### 3.6 mergeSearchResults（1件）

**TC-025: 複数ソースのマージ**

- **Given**: 2つのSearchResultItem配列（set1: score=0.8, set2: score=0.6）
- **When**: マージ
- **Then**: 2件、スコア降順（id='a'が先頭）

---

### 3.7 sortByRelevance（2件）

**TC-026: スコア降順ソート**

- **Given**: 未ソートの結果配列 [{score:0.5}, {score:0.8}, {score:0.3}]
- **When**: ソート
- **Then**: [0.8, 0.5, 0.3]の順

**TC-027: 純粋関数検証（入力不変）**

- **Given**: 結果配列
- **When**: ソート
- **Then**: 元の配列は変更されない

---

### 3.8 filterByThreshold（6件）

#### 境界値（6件）

**TC-028: 全て閾値以上**

- **Given**: [{score:0.8}, {score:0.6}], threshold=0.5
- **When**: フィルタリング
- **Then**: 入力と同じ

**TC-029: 全て閾値未満**

- **Given**: [{score:0.3}, {score:0.2}], threshold=0.5
- **When**: フィルタリング
- **Then**: 空配列

**TC-030: 境界値（等しい）**

- **Given**: [{score:0.5}], threshold=0.5
- **When**: フィルタリング
- **Then**: [{score:0.5}]（含む）

**TC-031: 閾値=0**

- **Given**: [{score:0.1}], threshold=0.0
- **When**: フィルタリング
- **Then**: 全て含む

**TC-032: 閾値=1**

- **Given**: [{score:0.9}], threshold=1.0
- **When**: フィルタリング
- **Then**: 空配列

**TC-033: 閾値範囲外**

- **Given**: threshold=1.5
- **When**: フィルタリング
- **Then**: `InvalidThresholdError` をスロー

---

## 4. TDD Red-Green-Refactorサイクル

### 4.1 Red Phase（現在のフェーズ）

**目的**: テストを作成し、実装がないためテストが失敗することを確認

**成果物**:

- ✅ `packages/shared/src/types/rag/search/__tests__/utils.test.ts`
- ✅ `packages/shared/src/types/rag/search/types.ts`（型定義）
- ✅ `packages/shared/src/types/rag/search/errors.ts`（エラークラス）
- ✅ `packages/shared/src/types/rag/search/utils.ts`（スタブ関数）

**検証方法**:

```bash
cd packages/shared
pnpm test:run src/types/rag/search/__tests__/utils.test.ts
```

**期待結果**:

- 全33件のテストが失敗（Error: Not implemented）
- テスト構造にエラーがないこと（構文エラーなし）

### 4.2 Green Phase（次のフェーズ: T-05）

**目的**: テストが通るように実装を追加

**タスク**:

- T-05-1: calculateRRFScore実装
- T-05-2: normalizeScores実装
- T-05-3: deduplicateResults実装
- （以降、残りの関数を実装）

### 4.3 Refactor Phase

**目的**: テストを通過状態に保ったまま、コードを改善

**観点**:

- パフォーマンス最適化
- 可読性向上
- 重複コードの削除
- 型安全性の強化

---

## 5. カバレッジ目標

| メトリクス            | 目標値 | 備考                      |
| --------------------- | ------ | ------------------------- |
| **Statements**        | 100%   | 全ての文を実行            |
| **Branches**          | 100%   | 全ての条件分岐をカバー    |
| **Functions**         | 100%   | 全ての関数を実行          |
| **Lines**             | 100%   | 全ての行を実行            |
| **Mutation Coverage** | N/A    | （Phase 3では実施しない） |

**カバレッジ計測コマンド**:

```bash
pnpm test:coverage
```

---

## 6. テストファイル構造

```typescript
// __tests__/utils.test.ts

import { describe, it, expect } from 'vitest';
import { ... } from '../utils';

describe('calculateRRFScore', () => {
  describe('正常系', () => {
    it('Given: ..., When: ..., Then: ...', () => {
      // Arrange
      const input = ...;

      // Act
      const result = calculateRRFScore(input);

      // Assert
      expect(result).toBe(...);
    });
  });

  describe('境界値', () => { ... });
  describe('エラー系', () => { ... });
});

describe('normalizeScores', () => { ... });
// ... 他の関数
```

---

## 7. テスト実行方法

### 7.1 全テスト実行

```bash
cd packages/shared
pnpm test:run
```

### 7.2 特定ファイルのみ実行

```bash
pnpm test:run src/types/rag/search/__tests__/utils.test.ts
```

### 7.3 Watch モード（開発中）

```bash
pnpm test
```

### 7.4 カバレッジ付き実行

```bash
pnpm test:coverage
```

---

## 8. エラーハンドリングテスト

### 8.1 カスタムエラークラステスト

| エラークラス          | テストケース | 検証内容                   |
| --------------------- | ------------ | -------------------------- |
| InvalidWeightsError   | TC-005       | エラーメッセージと詳細情報 |
| EmptyRankedListsError | TC-004       | エラーメッセージ           |
| InvalidKValueError    | TC-006       | k値の詳細情報              |
| InvalidThresholdError | TC-033       | 閾値の詳細情報             |

### 8.2 エラー検証パターン

```typescript
expect(() => functionCall()).toThrow(ErrorClass);
```

---

## 9. 純粋関数検証チェックリスト

各関数が純粋関数の性質を満たすことを検証:

| 関数名             | 同一入力同一出力 | 副作用なし | 入力不変 | テストケース |
| ------------------ | ---------------- | ---------- | -------- | ------------ |
| calculateRRFScore  | ✓                | ✓          | ✓        | TC-001〜006  |
| normalizeScores    | ✓                | ✓          | ✓        | TC-007〜012  |
| deduplicateResults | ✓                | ✓          | ✓        | TC-013〜016  |
| expandQuery        | ✓                | ✓          | ✓        | TC-017〜019  |
| calculateCRAGScore | ✓                | ✓          | ✓        | TC-020〜024  |
| mergeSearchResults | ✓                | ✓          | ✓        | TC-025       |
| sortByRelevance    | ✓                | ✓          | ✓        | TC-026, 027  |
| filterByThreshold  | ✓                | ✓          | ✓        | TC-028〜033  |

**純粋関数検証テスト例**（TC-027）:

```typescript
it("Given: 結果配列, When: ソート, Then: 元の配列は変更されない（純粋関数）", () => {
  const original = [
    { id: "a", score: 0.5 },
    { id: "b", score: 0.8 },
  ];
  const originalCopy = [...original];

  sortByRelevance(original);

  expect(original).toEqual(originalCopy); // 不変性検証
});
```

---

## 10. 完了条件チェックリスト

### Phase 3 (Red Phase) 完了条件

| #   | 条件                                                         | 状態 |
| --- | ------------------------------------------------------------ | ---- |
| 1   | `types.ts` で必要な型定義がすべて作成されている              | ✅   |
| 2   | `errors.ts` でエラークラスが定義されている                   | ✅   |
| 3   | `utils.ts` でスタブ関数（全8関数）が定義されている           | ✅   |
| 4   | `__tests__/utils.test.ts` でテストケース33件が作成されている | ✅   |
| 5   | テストが構文エラーなく実行できる                             | ⏳   |
| 6   | 全テストが「Not implemented」エラーで失敗する（Red状態確認） | ⏳   |
| 7   | テスト設計ドキュメント（本ドキュメント）が作成されている     | ✅   |

---

## 11. 次のステップ（Phase 4: Green Phase）

1. **T-05-1**: calculateRRFScore実装
   - RRFアルゴリズムの実装
   - 重みバリデーション
   - エラーハンドリング

2. **T-05-2**: normalizeScores実装
   - Min-Max正規化アルゴリズム
   - 境界値ハンドリング

3. **T-05-3**: deduplicateResults実装
   - 重複排除戦略の実装
   - スコア集約ロジック

4. **T-05-4〜8**: 残りの関数実装

---

## 12. 変更履歴

| バージョン | 日付       | 変更者            | 変更内容              |
| ---------- | ---------- | ----------------- | --------------------- |
| 1.0.0      | 2025-12-18 | Unit Tester Agent | 初版作成（Red Phase） |
