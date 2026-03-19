# HybridRAGEngine any 型安全化

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-RAG-08-004                                                              |
| タスク名     | HybridRAGEngine any 型安全化                                               |
| 分類         | リファクタリング                                                           |
| 対象機能     | RAG/Embedding 抽出ランタイム - HybridRAGEngine                             |
| 優先度       | 中                                                                         |
| 見積もり規模 | S〜M（1〜1.5日）                                                           |
| ステータス   | 未実施                                                                     |
| 発見元       | step-04-par-task-08-rag-embedding-extraction-runtime Phase 12 未タスク検出 |
| 発見日       | 2026-03-19                                                                 |
| ブロック対象 | UT-RAG-08-002                                                              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`packages/shared/src/services/search/hybrid-rag-engine.ts` の L428, L442, L461 において `any` 型が使用されている。これはテストモックと実装クラスの `Result` 型差異を吸収するための一時的な回避策として親タスク（step-04-par-task-08）の実装工程で導入されたものである。

根本原因は `crag/types.ts` と `llm/types.ts` の `ILLMClient` インターフェースのシグネチャ乖離（UT-RAG-08-005 の対象）であり、型が統一されることで `any` の必要性が解消される。

### 1.2 問題点・課題

- L428, L442, L461 の `any` 型が TypeScript の型チェックを無効化している
- `.claude/rules/02-code-quality.md` の「`any` 型の使用を避ける」原則に違反
- `any` 使用箇所では実行時型エラーの検出が型チェック時にできない
- P19（型キャストによる実行時検証バイパス）違反のリスクがある
- テストモックの型と実装クラスの型が一致していないため、モックが正しい動作を表現できていない可能性がある

### 1.3 放置した場合の影響

- 型安全性の欠如が HybridRAGEngine の品質低下に直結する
- `any` 型を通じた型キャストバイパスによる実行時エラーが将来的に発生しうる
- UT-RAG-08-002（HybridRAGFactory 実配線）実施時に型エラーが発生しやすくなる
- コードレビューで `any` 型が発見されるたびに「意図的な回避か」の判断コストが生じる

## 2. 何を達成するか（What）

### 2.1 目的

`hybrid-rag-engine.ts` の L428, L442, L461 の `any` 型を適切な型定義に置き換え、TypeScript の型安全性を確保する。

### 2.2 最終ゴール

- L428, L442, L461 の `any` 型がすべて除去される
- テストモックと実装クラスの `Result` 型が一致する
- `pnpm --filter @repo/shared typecheck` が `any` 型なしで PASS する
- テストが引き続き PASS する

### 2.3 スコープ（含む / 含まない）

**含む:**

- `hybrid-rag-engine.ts` L428, L442, L461 の `any` 型除去
- テストファイルのモック型修正（Result 型の統一に合わせて）
- 必要に応じた型定義の追加

**含まない:**

- `ILLMClient` 型定義の統一（UT-RAG-08-005 のスコープ）
- HybridRAGEngine のビジネスロジック変更
- `hybrid-rag-engine.ts` の他の箇所の `any` 型（スコープ外だが発見した場合は未タスク化）

### 2.4 成果物

- `packages/shared/src/services/search/hybrid-rag-engine.ts`（`any` 型除去版）
- 対応するテストファイルの修正（型修正分）

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-RAG-08-005（ILLMClient 型定義統一）が完了していること
  - 未完了の場合: UT-RAG-08-005 完了後に本タスクを実施する

### 3.2 依存タスク

| タスクID      | タスク名              | 関係     |
| ------------- | --------------------- | -------- |
| UT-RAG-08-005 | ILLMClient 型定義統一 | 前提条件 |

### 3.3 必要な知識

- TypeScript ジェネリクス・型ガード
- `Result<T, E>` パターン（`packages/shared` の Result 型定義）
- P19（型キャストによる実行時検証バイパス）
- P23（API 二重定義の型管理複雑性）
- P32（型定義の二箇所同時更新必須）

### 3.4 推奨アプローチ

1. UT-RAG-08-005 が完了していることを確認する
2. `hybrid-rag-engine.ts` の L428, L442, L461 を読み、`any` が何を表現しているか理解する
3. 期待される型を `Result<T, E>` パターンまたは統一後の `ILLMClient` に基づいて定義する
4. `any` を適切な型に置き換える
5. コンパイルエラーが発生した場合は型定義を修正する
6. テストファイルのモックも同様に修正する
7. 全テストが PASS することを確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

**L-RAG-06: 同名異シグネチャによる any 使用**

- **問題**: `crag/types.ts` の `ILLMClient.complete(options: {...})` と `llm/types.ts` の `ILLMClient.complete(prompt: string, ...)` のシグネチャが異なり、両者を受け付けるユニオン型やオーバーロードを定義するコストより `any` の方が簡単に見えたため、一時的に `any` が採用された
- **解決策**: UT-RAG-08-005 で `ILLMClient` が統一された後、統一型を使用することで `any` が不要になる。`any` を `unknown` に変更してから型ガードで絞り込む段階的アプローチも有効
- **関連 Pitfall**: P23（型定義の二重管理）、P32（型定義の二箇所同時更新必須）

**P19（型キャストによる実行時検証バイパス）対策**:

```typescript
// ❌ any で型チェック回避（現状）
const result = someMethod() as any;

// ✅ unknown + 型ガードで安全な型ナロイング
const result: unknown = someMethod();
if (isValidResult(result)) {
  // result が型安全に使える
}
```

**テストモックの型修正パターン**:

- モックが `any` を返している場合、実装クラスの戻り値型に合わせて修正する
- `Result<T, E>` 型を返す場合は `{ success: true, data: ... }` / `{ success: false, error: ... }` の形式で記述する

## 4. 実行手順（Phase構成）

### Phase 1: 現状把握

- [ ] UT-RAG-08-005 の完了を確認する
- [ ] `hybrid-rag-engine.ts` の L428, L442, L461 を読み、各 `any` の用途を把握する
- [ ] 対応するテストファイルで同箇所のモック型を確認する

### Phase 2: 型設計

- [ ] 各 `any` を置き換える適切な型を定義する
- [ ] 型ガードが必要な場合は実装方針を決定する

### Phase 3: 型安全化実装

- [ ] L428 の `any` を除去する
- [ ] L442 の `any` を除去する
- [ ] L461 の `any` を除去する
- [ ] `pnpm --filter @repo/shared typecheck` が PASS することを確認する

### Phase 4: テスト修正

- [ ] テストファイルのモック型を修正する
- [ ] `pnpm --filter @repo/shared test` が PASS することを確認する

### Phase 5: 追加 any 確認

- [ ] `hybrid-rag-engine.ts` に他の `any` 型がないか確認する（あれば未タスク化）

## 5. 完了条件チェックリスト

- [ ] L428, L442, L461 の `any` 型がすべて除去されている
- [ ] `grep -n ": any" packages/shared/src/services/search/hybrid-rag-engine.ts` の結果が0件になっている
- [ ] `pnpm --filter @repo/shared typecheck` が PASS する
- [ ] `pnpm --filter @repo/shared test` が PASS する
- [ ] スコープ外で発見した `any` は未タスク化されている

## 6. 検証方法

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# any 型残存確認
grep -n ": any\|as any" packages/shared/src/services/search/hybrid-rag-engine.ts

# テスト実行
pnpm --filter @repo/shared test packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts

# 関連テスト含む広範囲実行
pnpm --filter @repo/shared test packages/shared/src/services/search/
```

## 7. リスクと対策

| リスク                                 | 影響度 | 対策                                                       |
| -------------------------------------- | ------ | ---------------------------------------------------------- |
| UT-RAG-08-005 未完了による型エラー多発 | 高     | UT-RAG-08-005 完了を前提条件として必ず確認する             |
| any 除去によるテスト失敗               | 中     | Phase 4 でテストモック型も合わせて修正する                 |
| Result 型定義が複数存在する            | 中     | `packages/shared` の Result 型エクスポートを事前に確認する |
| スコープ外の any 型発見による作業拡大  | 低     | スコープ外は未タスク化して本タスクのスコープを維持する     |

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/services/search/hybrid-rag-engine.ts`
- `.claude/rules/02-code-quality.md`（`any` 型禁止）
- `.claude/rules/06-known-pitfalls.md#P19`（型キャストによる実行時検証バイパス）
- `.claude/rules/06-known-pitfalls.md#P23`（API 二重定義の型管理複雑性）
- `.claude/rules/06-known-pitfalls.md#P32`（型定義の二箇所同時更新必須）
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/phase-12-documentation.md`

### 関連タスク

| タスクID      | 関係                                      |
| ------------- | ----------------------------------------- |
| UT-RAG-08-005 | ILLMClient 型定義統一（前提条件）         |
| UT-RAG-08-002 | HybridRAGFactory 実配線（本タスクの後続） |

## 9. 備考

- 実施順序の推奨: UT-RAG-08-005 → UT-RAG-08-004 → UT-RAG-08-002
- L428, L442, L461 は親タスク実装時点の行番号であり、UT-RAG-08-005 実施後に変わる可能性がある。実施前に行番号を再確認すること
- `any` 除去は `.claude/rules/02-code-quality.md` の「`any` 型の使用を避ける」原則への準拠であり、コード品質の基本要件
