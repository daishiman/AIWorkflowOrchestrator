# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 12             |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明

- CRAGとは何か（検索結果の自己修正システム）
- 3段階評価の考え方（Correct/Incorrect/Ambiguous）
- なぜ必要なのか（検索結果の品質担保）

#### Part 2: 技術的詳細

| 項目                   | 内容                         |
| ---------------------- | ---------------------------- |
| インストール           | パッケージのインストール方法 |
| 基本的な使い方         | 最小構成での使用例           |
| オプション設定         | 各オプションの説明と推奨値   |
| Web検索連携            | IWebSearcher実装と連携方法   |
| トラブルシューティング | よくある問題と解決方法       |

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

```bash
# コードベースからTODO/FIXME検出（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.mjs \
  --workflow docs/30-workflows/corrective-rag \
  --sources "packages/shared/src/services/search/crag/"
```

## ドキュメント対象

### APIドキュメント（JSDoc）

| 対象               | 内容                                           |
| ------------------ | ---------------------------------------------- |
| RelevanceEvaluator | evaluate(), evaluateIndividual()               |
| CorrectiveRAG      | process(), handleCorrect/Incorrect/Ambiguous() |
| 型定義             | CRAGResult, CRAGOptions, RelevanceEvaluation等 |

## 参照資料

| 資料名         | パス                                     | 説明           |
| -------------- | ---------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |
| 設計書         | `outputs/phase-2/architecture-design.md` | Phase 2成果物  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                 | 内容             |
| ---------------- | -------------------------------------------------------------------- | ---------------- |
| ドキュメント規約 | `.claude/skills/aiworkflow-requirements/references/documentation.md` | ドキュメント標準 |

## 実行手順

### 1. JSDoc整備

````typescript
/**
 * 検索結果の関連性を評価する
 *
 * @param query - 検索クエリ
 * @param results - 評価対象の検索結果配列
 * @returns 評価結果（Result型）
 *
 * @example
 * ```typescript
 * const evaluator = new RelevanceEvaluator(llmClient);
 * const result = await evaluator.evaluate("TypeScript generics", searchResults);
 * if (result.isOk()) {
 *   console.log(result.value.action); // "correct" | "incorrect" | "ambiguous"
 * }
 * ```
 */
async evaluate(
  query: string,
  results: FusedSearchResult[]
): Promise<Result<RelevanceEvaluation, Error>>
````

### 2. 利用ガイド作成

```markdown
# Corrective RAG 利用ガイド

## 基本的な使い方

\`\`\`typescript
import { CorrectiveRAG, RelevanceEvaluator } from "@repo/shared/services/search/crag";

// 評価器の作成
const evaluator = new RelevanceEvaluator(llmClient, {
maxEvaluate: 5,
correctThreshold: 0.7,
incorrectThreshold: 0.3,
});

// CRAGの作成
const crag = new CorrectiveRAG(evaluator, webSearcher, {
enableWebSearch: true,
enableRefinement: false,
});

// 処理の実行
const result = await crag.process(query, searchResults);
\`\`\`
```

## 統合テスト連携【必須】

ドキュメントでの統合テスト情報記載:

| 確認項目                              | 結果 |
| ------------------------------------- | ---- |
| LLM連携の設定方法が記載されている     | -    |
| Web検索連携の設定方法が記載されている | -    |
| エラーハンドリング例が記載されている  | -    |

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 公開APIにJSDocが整備されている
- [ ] 関連ドキュメントが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実装ガイドPart 1作成（概念的説明）
3. 実装ガイドPart 2作成（技術的詳細）
4. JSDoc整備（RelevanceEvaluator/CorrectiveRAG/型定義）
5. システムドキュメント更新
6. 未タスク検出実行
7. 未タスク検出レポート作成
8. （該当時）未タスク指示書作成
9. 統合テスト関連情報の記載
10. 成果物の配置確認
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 12
```

## 次のPhase

Phase 13: PR作成
