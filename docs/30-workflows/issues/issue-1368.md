# [#1368] "[UT-RAG-08-002] HybridRAGFactory.createFull/createLite 実配線"

## メタ情報

```yaml
task_id: UT-RAG-08-002
task_name: HybridRAGFactory.createFull/createLite 実配線
category: 実装
target_feature: RAG/Embedding 抽出ランタイム - HybridRAGFactory
priority: 高
scale: M（2〜3日）
status: 未実施
source_phase: step-04-par-task-08-rag-embedding-extraction-runtime Phase 12 未タスク検出
created_date: 2026-03-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-002-hybrid-rag-factory-wiring.md
```

| 項目       | 内容        |
| ---------- | ----------- |
| 優先度     | 高          |
| 規模       | M（2〜3日） |
| ステータス | 未実施      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`packages/shared/src/services/search/hybrid-rag-factory.ts` の `createFull()` および `createLite()` メソッドは、現在 `[FACTORY_NOT_READY]` を throw するスタブ実装のまま残されている。これは親タスク（step-04-par-task-08）の Phase 5 実装工程でスコープ外として意図的に stub 化されたものであり、本番環境では HybridRAGEngine を instantiate できない状態である。

### 1.2 問題点・課題

- `createFull()` / `createLite()` を呼び出すと必ず例外が発生し、RAG 検索機能全体が使用不可になる
- エラーメッセージに代替手段や次のアクションの案内が含まれていない（L-RAG-02 教訓）
- `@placeholder` コメント（L25〜L59）のローカル型定義が実際の型インポートに置換されておらず、型安全性が担保されていない
- throw stub と production mock の区別が曖昧なため、テスト環境での挙動が不明確

### 1.3 放置した場合の影響

- RAG 検索機能が本番で完全に動作しない（致命的）
- UT-RAG-08-005（ILLMClient 型統一）と UT-RAG-08-004（型安全化）を完了しても、Factory が stub のままでは HybridRAGEngine を使用できない
- エンドユーザーに対して「利用不可」以上の情報が提供されず、デバッグコストが高騰する

## 2. 何を達成するか（What）

### 2.1 目的

`HybridRAGFactory` の `createFull()` / `createLite()` を実際の依存モジュールを用いて HybridRAGEngine を生成・返却する実装に置き換える。

### 2.2 最終ゴール

- `createFull()` が LLMQueryClassifier, KeywordSearchStrategy, VectorSearchStrategy, GraphSearchStrategy をすべて含む HybridRAGEngine を返す
- `createLite()` が KeywordSearchStrategy と VectorSearchStrategy のみを含む軽量な HybridRAGEngine を返す
- `@placeholder` ローカル型定義を廃止し、実際の型インポートに置換する
- throw stub を完全に除去し、意図的なエラーは Error サブクラスで表現する

### 2.3 スコープ（含む / 含まない）

**含む:**

- `createFull()` / `createLite()` の実装
- `@placeholder` コメント（L25〜L59）の型定義をインポートに置換
- throw stub の除去とエラーメッセージ改善
- 単体テストの追加・修正

**含まない:**

- LLMQueryClassifier, KeywordSearchStrategy, VectorSearchStrategy, GraphSearchStrategy 自体の実装改修（依存モジュールとして完成済みを前提）
- HybridRAGEngine のコアロジック変更

### 2.4 成果物

- `packages/shared/src/services/search/hybrid-rag-factory.ts`（実装完了版）
- `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts`（テスト追加分）

## 3. どのように実行するか（How）

### 3.1 前提条件

以下のモジュールが完成・エクスポート済みであること:

- `LLMQueryClassifier`（`packages/shared/src/services/search/` 配下）
- `KeywordSearchStrategy`（同上）
- `VectorSearchStrategy`（同上）
- `GraphSearchStrategy`（同上）
- `HybridRAGEngine`（`packages/shared/src/services/search/hybrid-rag-engine.ts`）

### 3.2 依存タスク

| タスクID      | タスク名                     | 関係     |
| ------------- | ---------------------------- | -------- |
| UT-RAG-08-005 | ILLMClient 型定義統一        | 推奨前提 |
| UT-RAG-08-004 | HybridRAGEngine any 型安全化 | 推奨前提 |

UT-RAG-08-005 が完了していると `@placeholder` 型の置換が容易になる。UT-RAG-08-004 完了後に実施することで型安全な Factory 実装が可能になる。

### 3.3 必要な知識

- Factory パターン（依存モジュールの組み立て）
- HybridRAGEngine のコンストラクタシグネチャ
- `ILLMClient` インターフェース（統一後）
- P62（DEFAULT_CONFIG への暗黙 fallback 禁止）

### 3.4 推奨アプローチ

1. `hybrid-rag-factory.ts` の現在のスタブ実装と `@placeholder` 箇所を確認する
2. 依存モジュールのエクスポート状況を `packages/shared/src/services/search/index.ts` で確認する
3. `@placeholder` ローカル型定義を実際のインポートに置換する
4. `createFull()` を実装: 4つの Strategy + Classifier を instantiate して HybridRAGEngine に渡す
5. `createLite()` を実装: Keyword + Vector の2 Strategy のみで HybridRAGEngine を生成する
6. エラーが必要な場合は `[FACTORY_NOT_READY]` throw を除去し、明示的な `FactoryError` を定義する
7. 既存テストが PASS することを確認し、createFull/createLite のテストを追加する

### 3.5 実装課題と解決策（親タスクからの教訓）

**L-RAG-02: throw stub と production mock の区別が曖昧**

- **問題**: `[FACTORY_NOT_READY]` は開発中のマーカーだが、production コードに残ると意図しないクラッシュを招く。エラーメッセージに「次に何をすべきか」の案内がない
- **解決策**: 実装後は throw stub を完全除去する。依存モジュール未完了の場合は `throw new FactoryNotReadyError("createFull requires LLMQueryClassifier. See UT-RAG-08-002.")` のように原因と参照先を明示する
- **関連 Pitfall**: P62（DEFAULT_CONFIG への暗黙 fallback 禁止）— Provider 未設定時は fallback せず明示的エラーを返すこと

**L-RAG-06: 同名異シグネチャによる型エラー**

- `@placeholder` 型がインポート先の実際の型と一致しない場合、TypeScript コンパイルエラーが発生する
- UT-RAG-08-005 完了後に本タスクを実施することで、この問題を回避できる

## 4. 実行手順（Phase構成）

### Phase 1: 現状確認と依存調査

- [ ] `hybrid-rag-factory.ts` を読み、`@placeholder` 箇所（L25〜L59）と throw stub（createFull/createLite）を特定する
- [ ] 依存モジュール（LLMQueryClassifier 等）のエクスポート状況を確認する
- [ ] UT-RAG-08-005 の完了状況を確認し、ILLMClient 型を特定する

### Phase 2: 型置換

- [ ] `@placeholder` ローカル型定義を実際のインポートに置換する
- [ ] TypeScript コンパイルエラーがなくなることを確認する（`pnpm --filter @repo/shared typecheck`）

### Phase 3: Factory 実装

- [ ] `createFull()` を実装する
- [ ] `createLite()` を実装する
- [ ] throw stub を除去または `FactoryNotReadyError` に置き換える

### Phase 4: テスト追加

- [ ] `createFull()` のテストケースを追加する（モック依存注入）
- [ ] `createLite()` のテストケースを追加する
- [ ] エラーケース（依存未完了）のテストを追加する
- [ ] `pnpm --filter @repo/shared test` が PASS することを確認する

## 5. 完了条件チェックリスト

- [ ] `createFull()` が HybridRAGEngine インスタンスを返す（例外なし）
- [ ] `createLite()` が軽量 HybridRAGEngine インスタンスを返す（例外なし）
- [ ] `@placeholder` コメントが一切残っていない
- [ ] `[FACTORY_NOT_READY]` の throw が一切残っていない
- [ ] `pnpm --filter @repo/shared typecheck` が PASS する
- [ ] `pnpm --filter @repo/shared test` が PASS する
- [ ] Line Coverage 80% 以上

## 6. 検証方法

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# テスト実行
pnpm --filter @repo/shared test packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts

# @placeholder 残存確認
grep -rn "@placeholder" packages/shared/src/services/search/hybrid-rag-factory.ts

# throw stub 残存確認
grep -rn "FACTORY_NOT_READY" packages/shared/src/services/search/hybrid-rag-factory.ts
```

## 7. リスクと対策

| リスク                                         | 影響度 | 対策                                                         |
| ---------------------------------------------- | ------ | ------------------------------------------------------------ |
| 依存モジュールが未完成                         | 高     | Phase 1 で完成状況を確認し、未完成なら本タスクをブロックする |
| ILLMClient 型が統一されていない                | 中     | UT-RAG-08-005 完了後に実施する                               |
| HybridRAGEngine のコンストラクタシグネチャ変更 | 中     | 実装前に最新シグネチャを確認する                             |
| テストモックの型差異（any 残存）               | 低     | UT-RAG-08-004 完了後に実施することで回避                     |

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/services/search/hybrid-rag-factory.ts`
- `packages/shared/src/services/search/hybrid-rag-engine.ts`
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG への暗黙 fallback 禁止）
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/phase-12-documentation.md`

### 関連タスク

| タスクID      | 関係                                                           |
| ------------- | -------------------------------------------------------------- |
| UT-RAG-08-004 | HybridRAGEngine any 型安全化（依存: 本タスクより先に実施推奨） |
| UT-RAG-08-005 | ILLMClient 型定義統一（依存: 本タスクより先に実施推奨）        |

## 9. 備考

- 親タスク（step-04-par-task-08）の Phase 5 でスコープ外として意図的にスタブ化された
- 本タスクは優先度「高」であり、HybridRAGEngine の本番利用に直結する唯一のブロッカー
- UT-RAG-08-005 → UT-RAG-08-004 → UT-RAG-08-002 の順で実施すると型安全な実装が最短で完成する
