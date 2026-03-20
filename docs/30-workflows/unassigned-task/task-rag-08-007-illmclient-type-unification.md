# ILLMClient 型定義統一（UT-RAG-08-002 wave）

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-RAG-08-007                                        |
| タスク名     | ILLMClient 型定義統一（UT-RAG-08-002 wave）          |
| 分類         | リファクタリング                                     |
| 対象機能     | RAG 検索パイプライン - LLM クライアント型定義        |
| 優先度       | 中                                                   |
| 見積もり規模 | S（0.5〜1日）                                        |
| ステータス   | 未実施                                               |
| 発見元       | UT-RAG-08-002 Phase 10 FU-02 formalize（2026-03-20） |
| 発見日       | 2026-03-20                                           |
| ブロック対象 | UT-RAG-08-004（HybridRAGEngine 型安全化）            |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-RAG-08-002（HybridRAGFactory 実配線）では、`crag/types.ts` と `llm/types.ts` の `ILLMClient` シグネチャ乖離を type alias で回避した。alias による回避は動作するが、将来の保守で混乱を招くリスクがある。

同名の `ILLMClient` が2箇所に異なるシグネチャで存在する状態は、DI の文脈で型エラーの温床になる。

> **注意**: UT-RAG-08-005（ILLMClient 型定義統一）が `completed-tasks/` 配下の旧 wave で既に指示書化されているが、当該指示書は旧ワークフローの成果物であり `docs/30-workflows/unassigned-task/` には未登録。本タスク（UT-RAG-08-007）は UT-RAG-08-002 wave の follow-up として改めて正式登録する。UT-RAG-08-005 と実施内容は実質同一のため、着手前に UT-RAG-08-005 の実施状況を確認し、完了済みであれば本タスクはクローズする。

### 1.2 問題点・課題

**シグネチャ比較:**

```typescript
// crag/types.ts
interface ILLMClient {
  complete(options: {
    prompt: string;
    [key: string]: unknown;
  }): Promise<string>;
}

// llm/types.ts
interface ILLMClient {
  complete(prompt: string, options?: Record<string, unknown>): Promise<string>;
}
```

2つの型が混在するため、`CorrectiveRAG` と `LLMReranker` / `LLMQueryClassifier` で同一の LLM クライアントインスタンスを渡せない。UT-RAG-08-002 では alias で回避済みだが、type alias の数が増えると混乱が生じる。

## 2. スコープ

### 含む

- `packages/shared/src/types/llm/types.ts` と `packages/shared/src/services/search/crag/types.ts` の `ILLMClient` シグネチャを1つに統一
- 統一後の型を参照する既存コードの修正
- UT-RAG-08-002 で追加した type alias の削除

### 含まない

- LLM プロバイダ実装クラス本体の修正（インターフェースのみを対象とする）
- UT-RAG-08-004 のスコープ（`any` 型の排除）との重複作業

## 3. 技術コンテキスト

### 推奨統一方針

`packages/shared` に統一型 `ILLMClient` を定義し、`crag/types.ts` は再エクスポートに置き換える。

```typescript
// packages/shared/src/types/llm/types.ts（統一後）
export interface ILLMClient {
  complete(options: {
    prompt: string;
    [key: string]: unknown;
  }): Promise<string>;
}

// packages/shared/src/services/search/crag/types.ts（再エクスポート）
export type { ILLMClient } from "../../types/llm/types";
```

### 関連ファイル

| ファイル                                                    | 役割                    |
| ----------------------------------------------------------- | ----------------------- |
| `packages/shared/src/types/llm/types.ts`                    | 現行 llm 側 ILLMClient  |
| `packages/shared/src/services/search/crag/types.ts`         | 現行 crag 側 ILLMClient |
| `packages/shared/src/services/search/hybrid-rag-factory.ts` | alias 回避コードが存在  |

## 4. 依存タスク

| タスクID      | タスク名                 | 依存種別 |
| ------------- | ------------------------ | -------- |
| UT-RAG-08-002 | HybridRAGFactory 実配線  | 推奨前提 |
| UT-RAG-08-004 | HybridRAGEngine 型安全化 | 後続     |

UT-RAG-08-002 完了後に実施し、完了後に UT-RAG-08-004 を実施するのが推奨順序。

## 5. 受入基準

- [ ] `ILLMClient` が1箇所で定義されていること
- [ ] `crag/types.ts` が `packages/shared` の統一型を参照していること
- [ ] UT-RAG-08-002 で追加した type alias が削除されていること
- [ ] 全テストが PASS すること
- [ ] `pnpm typecheck` がエラーゼロで通ること

## 6. UT-RAG-08-005 との関係

本タスク着手前に以下を確認すること:

1. `grep -rn "UT-RAG-08-005" docs/` で UT-RAG-08-005 の実施状況を確認
2. UT-RAG-08-005 が完了済みの場合は本タスク（UT-RAG-08-007）をクローズする
3. UT-RAG-08-005 が未実施の場合は本タスクを実施する

実施順序の推奨: UT-RAG-08-007（本タスク）→ UT-RAG-08-004 → UT-RAG-08-002 後続改善
