# Phase 8: 型安全性リファクタリング

## 実行日時

2026-01-14

## 目的

TypeScriptの型システムを最大限活用する。

## 確認・修正項目

### 1. any / unknown の使用確認

#### Grepによる検索

```bash
grep -rn "any\|unknown" packages/shared/src/services/search/fusion/
grep -rn "any\|unknown" packages/shared/src/services/search/reranking/
```

#### 結果

| ファイル                  | 使用箇所                          | 評価 |
| ------------------------- | --------------------------------- | ---- |
| rrf-fusion.ts             | metadata: Record<string, unknown> | 適切 |
| cross-encoder-reranker.ts | なし                              | OK   |
| types.ts                  | metadata: Record<string, unknown> | 適切 |

評価: `unknown` は適切な使用（メタデータの柔軟性確保）。`any` は使用なし。

#### 修正

修正不要。

### 2. 型ガードの確認

#### 現在の実装

```typescript
// APIレスポンスの型アサーション
const data = (await response.json()) as CohereRerankResponse;
const data = (await response.json()) as VoyageRerankResponse;
```

#### 検討

型ガードの追加を検討:

```typescript
function isCohereRerankResponse(data: unknown): data is CohereRerankResponse {
  return typeof data === "object" && data !== null && "results" in data;
}
```

#### 判断

現時点では型アサーションで十分。理由:

1. APIレスポンス形式は公式ドキュメントで保証されている
2. 不正なレスポンスはcatchブロックで処理される
3. 過度な型ガードは可読性を損なう

### 3. Branded Type の活用

#### 確認結果

```typescript
// 既に使用されている
import type { ChunkId } from "../../../types/rag/branded";
```

評価: ChunkIdにBranded Typeを使用し、型安全性を確保。

#### 修正

修正不要。

### 4. 型推論の活用

#### 確認結果

```typescript
// 適切な型アノテーション
const fused: FusedSearchResult[] = Array.from(chunkMap.values()).map(...);

// 型推論を活用
const existing = chunkMap.get(chunkIdStr);  // 型推論で十分
const weight = this.getWeight(strategy, weights);  // 戻り値から推論
```

評価: 適切なバランスで型アノテーションと型推論を使い分け。

#### 修正

修正不要。

### 5. ジェネリクスの使用

#### 確認結果

```typescript
// Result型でジェネリクスを使用
Promise<Result<FusedSearchResult[], Error>>;

// Map型でジェネリクスを使用
Map<string, SearchResult[]>;
```

評価: 適切にジェネリクスを使用。

#### 修正

修正不要。

### 6. Required<T> の活用

#### 確認結果

```typescript
// オプションの完全化
private readonly options: Required<LLMRerankerOptions>;
private readonly options: Required<CohereRerankerOptions>;
private readonly options: Required<VoyageRerankerOptions>;
```

評価: `Required<T>` を使用してオプションを完全化し、
undefinedチェックを不要にしている。

#### 修正

修正不要。

## 型安全性チェックリスト

| 項目                 | 状態 | コメント                   |
| -------------------- | ---- | -------------------------- |
| any の排除           | OK   | 使用なし                   |
| unknown の適切な使用 | OK   | メタデータのみで使用       |
| Branded Type         | OK   | ChunkIdで使用              |
| 型ガード             | OK   | 必要最小限                 |
| ジェネリクス         | OK   | Result, Map等で適切に使用  |
| Required<T>          | OK   | オプション型で使用         |
| 戻り値の型定義       | OK   | 全パブリックメソッドで明示 |
| パラメータの型定義   | OK   | 全パブリックメソッドで明示 |

## テスト実行結果

```bash
pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
```

結果: 47/47 テスト成功

## 型チェック結果

```bash
pnpm --filter @repo/shared typecheck
```

結果: エラーなし

## 結論

現在の実装は型安全性の観点から十分に整理されている。

- `any` の使用なし
- `unknown` は適切な箇所でのみ使用
- Branded TypeでChunkIDの型安全性を確保
- ジェネリクスと`Required<T>`を効果的に活用

## 次のステップ

テスト継続成功確認（タスク5）へ進む
