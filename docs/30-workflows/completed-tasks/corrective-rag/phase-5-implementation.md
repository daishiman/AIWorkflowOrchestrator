# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 5              |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。

## 実行タスク

- RelevanceEvaluator実装: LLMベースの関連性評価クラス
- CorrectiveRAG実装: 3段階アクション処理クラス
- 型定義実装: 必要な型・インターフェースの定義
- エラーハンドリング: Result型による適切なエラー処理

## 参照資料

| 資料名       | パス                                                             | 説明          |
| ------------ | ---------------------------------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md`                         | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                          | Phase 4成果物 |
| タスク指示書 | `docs/30-workflows/unassigned-task/task-07-06-corrective-rag.md` | 実装仕様      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                 |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| 検索クエリ・結果型定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | CRAGScore型参照      |
| コアインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`       | Result型、ILLMClient |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー分類・リトライ |

## 実行手順

### 1. 型定義実装

```typescript
// packages/shared/src/services/search/crag/types.ts

// タスク指示書の型定義を参照して実装
// - CRAGResult
// - CRAGOptions
// - RelevanceEvaluation
// - EvaluatorOptions
// - IndividualScore
// - CorrectionAction
// - IWebSearcher
// - WebSearchResult
```

### 2. RelevanceEvaluator実装

```typescript
// packages/shared/src/services/search/crag/relevance-evaluator.ts

// タスク指示書のRelevanceEvaluatorクラスを参照して実装
// 主要メソッド:
// - evaluate(): 検索結果全体の関連性を評価
// - evaluateIndividual(): 個別結果の評価
// - buildEvaluationPrompt(): LLM用プロンプト構築
// - parseEvaluationResponse(): LLMレスポンスのパース
// - calculateOverallScore(): 加重平均スコア計算
// - determineAction(): correct/incorrect/ambiguous判定
```

### 3. CorrectiveRAG実装

```typescript
// packages/shared/src/services/search/crag/corrective-rag.ts

// タスク指示書のCorrectiveRAGクラスを参照して実装
// 主要メソッド:
// - process(): 検索結果の評価・補正メイン処理
// - handleCorrect(): correct判定時の処理
// - handleIncorrect(): incorrect判定時の処理（Web検索補強）
// - handleAmbiguous(): ambiguous判定時の処理（フィルタ）
// - refineKnowledge(): Knowledge Refinement（オプション）
// - performWebSearch(): Web検索実行
// - formatWebResults(): Web検索結果のフォーマット
```

### 4. エクスポート設定

```typescript
// packages/shared/src/services/search/crag/index.ts

export { RelevanceEvaluator } from "./relevance-evaluator";
export type {
  EvaluatorOptions,
  RelevanceEvaluation,
  IndividualScore,
} from "./relevance-evaluator";

export { CorrectiveRAG } from "./corrective-rag";
export type {
  CRAGOptions,
  CRAGResult,
  CorrectionAction,
  IWebSearcher,
  WebSearchResult,
} from "./corrective-rag";
```

## 統合テスト連携【必須】

LLM連携・外部サービス接続の実装とテスト支援コード整備:

| 実装項目                   | 内容                                            |
| -------------------------- | ----------------------------------------------- |
| ILLMClient連携             | RelevanceEvaluatorでcomplete()を呼び出し        |
| IWebSearcher連携           | CorrectiveRAGでsearch()を呼び出し（オプション） |
| モック生成ヘルパー         | テスト用のモックLLMClient・WebSearcher作成      |
| Result型エラーハンドリング | 全外部呼び出しでResult型でエラーを返却          |

## 成果物

| 成果物       | パス                                                              | 説明       |
| ------------ | ----------------------------------------------------------------- | ---------- |
| 型定義       | `packages/shared/src/services/search/crag/types.ts`               | 型・IF定義 |
| Evaluator    | `packages/shared/src/services/search/crag/relevance-evaluator.ts` | 関連性評価 |
| CRAG         | `packages/shared/src/services/search/crag/corrective-rag.ts`      | 補正処理   |
| エクスポート | `packages/shared/src/services/search/crag/index.ts`               | 公開API    |

## 完了条件

- [ ] types.tsの型定義が実装されている
- [ ] RelevanceEvaluatorクラスが実装されている
- [ ] CorrectiveRAGクラスが実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている（YAGNI原則）
- [ ] Result型でエラーが適切に扱われている
- [ ] LLM連携・Web検索連携が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. types.ts型定義の実装
3. RelevanceEvaluatorクラスの実装
4. CorrectiveRAGクラスの実装
5. index.tsエクスポート設定
6. テスト支援コード整備
7. テストがGreen状態であることを確認
8. 成果物の配置確認
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 5
```

## 次のPhase

Phase 6: テスト拡充
