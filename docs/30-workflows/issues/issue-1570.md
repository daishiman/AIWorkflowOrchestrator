# [#1570] "[UT-RAG-08-007] ILLMClient 型定義統一（UT-RAG-08-002 wave）"

## メタ情報

```yaml
task_id: UT-RAG-08-007
task_name: ILLMClient 型定義統一（UT-RAG-08-002 wave）
category: リファクタリング
target_feature: RAG 検索パイプライン - LLM クライアント型定義
priority: 中
scale: S（0.5〜1日）
status: 未実施
source_phase: UT-RAG-08-002 Phase 10 FU-02 formalize（2026-03-20）
created_date: 2026-03-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-007-illmclient-type-unification.md
```

| 項目       | 内容          |
| ---------- | ------------- |
| 優先度     | 中            |
| 規模       | S（0.5〜1日） |
| ステータス | 未実施        |

---

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

## 6. 苦戦箇所（UT-RAG-08-002 での知見）

| 箇所                                          | 内容                                                                                                                                                                                                                                       | 対策                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| P64: 同名インターフェースのシグネチャドリフト | `crag/types.ts` の `ILLMClient` は `complete(options: {prompt, ...})` の1引数オブジェクト形式、`llm/types.ts` は `complete(prompt, options?)` の2引数形式。各モジュール単独ではコンパイルが通るため Factory 配線時まで不整合が検出されない | 統一先を1箇所に決め、他は re-export にする。統一後に `pnpm typecheck` で全パッケージの整合性を確認する |
| type alias の増殖                             | UT-RAG-08-002 では `CragLLMClient` / `RerankerLLMClient` の2つの alias を導入して回避した。alias が増えると import の追跡が困難になる                                                                                                      | 統一型定義後に alias を全削除し、`grep -rn "as.*LLMClient" packages/` でゼロ件を確認する               |
| P23/P32: 型定義の二箇所同時更新               | `crag/types.ts` と `llm/types.ts` を同時に変更しないと中間状態でコンパイルエラーが発生する                                                                                                                                                 | 1つのコミットで両ファイルを同時更新する。CI が通ることを確認してから push する                         |

## 7. UT-RAG-08-005 との関係

本タスク着手前に以下を確認すること:

1. `grep -rn "UT-RAG-08-005" docs/` で UT-RAG-08-005 の実施状況を確認
2. UT-RAG-08-005 が完了済みの場合は本タスク（UT-RAG-08-007）をクローズする
3. UT-RAG-08-005 が未実施の場合は本タスクを実施する

実施順序の推奨: UT-RAG-08-007（本タスク）→ UT-RAG-08-004 → UT-RAG-08-002 後続改善
