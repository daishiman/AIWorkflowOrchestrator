# [#1571] "[UT-RAG-08-008] Graph global mode での communitySummarizer 活用仕上げ"

## メタ情報

```yaml
task_id: UT-RAG-08-008
task_name: Graph global mode での communitySummarizer 活用仕上げ
category: 機能改善
target_feature: HybridRAG 検索パイプライン - Factory / GraphSearchStrategy
priority: 中
scale: S（0.5〜1日）
status: 未実施
source_phase: UT-RAG-08-002 Phase 3 多角的チェック観点 / Phase 10 FU-03 formalize（2026-03-20）
created_date: 2026-03-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-008-community-summarizer-config-extension.md
```

| 項目       | 内容          |
| ---------- | ------------- |
| 優先度     | 中            |
| 規模       | S（0.5〜1日） |
| ステータス | 未実施        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`HybridRAGFactory.createFull()` から `GraphSearchStrategy` への `communitySummarizer` 配線自体は完了している。一方で、`HybridRAGEngine` から graph strategy へ `queryType` が伝播していないため、Global クエリでも graph search は `local` mode 相当で動作し、community summary を活かしきれていない。

### 1.2 問題点・課題

- UT-RAG-08-006（queryType 伝播）を実装しても、graph strategy 側で global path を使い分ける仕上げが不足すると community summary を活用できない。
- current docs では「config 未定義」と誤記されやすく、実装済み部分と未実装部分の境界が曖昧だった。
- Phase 10 FU-03 として残すべきなのは config 追加そのものではなく、global graph mode の end-to-end 利用完了である。

## 2. スコープ

### 含む

- graph queryType 伝播後に global mode で `communitySummarizer` を活用する探索経路の実装
- 必要に応じた `GraphSearchStrategy` / `HybridRAGEngine` / test の同時更新
- `communitySummarizer` が未指定のときの graceful degradation 方針の明文化

### 含まない

- `ICommunitySummarizer` インターフェース定義そのものの新設
- `communitySummarizer` フィールド追加（実装済み）
- `createLite()` への追加

## 3. 技術コンテキスト

### 現状整理

```typescript
// 既に実装済み
export interface FullHybridRAGConfig {
  communitySummarizer?: ICommunitySummarizer;
}
```

### 今回の未完了部分

```typescript
// HybridRAGEngine.search() 側
const queryType = classification.data.type;
// current: graph strategy に queryType を渡していない
await graphStrategy.search(query, limit, filters);
```

### 関連ファイル

| ファイル                                                                  | 役割                               |
| ------------------------------------------------------------------------- | ---------------------------------- |
| `packages/shared/src/services/search/hybrid-rag-engine.ts`                | queryType 伝播元                   |
| `packages/shared/src/services/search/strategies/graph-search-strategy.ts` | global mode 活用先                 |
| `packages/shared/src/services/search/hybrid-rag-factory.ts`               | `communitySummarizer` 配線済み実装 |

## 4. 依存タスク

| タスクID      | タスク名                               | 依存種別                              |
| ------------- | -------------------------------------- | ------------------------------------- |
| UT-RAG-08-002 | HybridRAGFactory 実配線                | 必須前提                              |
| UT-RAG-08-006 | GraphSearchStrategy queryType 伝播改善 | 推奨前提（Global 分岐を活用するため） |

UT-RAG-08-002 完了後に実施すること。UT-RAG-08-006 と並列実施も可能。

## 5. 受入基準

- [ ] global query で graph search が `communitySummarizer` を活用する経路を持つこと
- [ ] queryType 非伝播が解消され、必要な mode 切替が行われること
- [ ] `communitySummarizer` 未指定時の graceful degradation が明文化されていること
- [ ] 全テストが PASS すること
- [ ] `pnpm typecheck` がエラーゼロで通ること

## 6. 苦戦箇所（UT-RAG-08-002 での知見）

| 箇所                            | 内容                                                                                                                                                                                                                             | 対策                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| config 実装済み vs 未実装の境界 | `FullHybridRAGConfig.communitySummarizer` フィールドと Factory→GraphSearchStrategy の配線は完了済みだが、Engine→Strategy の queryType 伝播が欠落しているため global path が動作しない。仕様書に「config 未定義」と誤記されやすい | 実装前に `grep -rn "communitySummarizer" packages/` で現状の配線を確認し、「何が済み・何が未済」を明確にしてから着手する |
| P62: 暗黙 fallback 禁止         | `communitySummarizer` 未指定時に内部でデフォルトインスタンスを生成する誘惑があるが、P62 違反になる                                                                                                                               | 未指定時は local mode にフォールバックし、ログで「communitySummarizer 未設定のため local mode で実行」と明示する         |
| UT-RAG-08-006 との依存関係      | queryType 伝播（UT-RAG-08-006）なしでは global path のテストが書けない。並列着手は可能だが、結合テストは UT-RAG-08-006 完了後に実施する必要がある                                                                                | 単体テストでは queryType を直接注入して global path を検証し、結合テストは UT-RAG-08-006 完了後に追加する                |

## 7. 設計判断メモ

- `communitySummarizer` 自体は optional のままでよい。問題は「渡せるか」ではなく「global path で使えているか」。
- P62（暗黙 fallback 禁止）により、summarizer の暗黙生成は行わない。
- `createLite()` は graph 検索を持つが、今回の仕上げ対象は full path の global mode に限定する。
