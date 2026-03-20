# Phase 13: 完了 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `13 - 完了`                                                 |
| 前提Phase     | `Phase 12: ドキュメント`                                    |
| 次Phase       | なし                                                        |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-12/documentation-changelog.md`               |

## 目的

ユーザーの明示承認がある場合だけ PR へ進める。全成果物の最終チェックリストを確認し、PR 準備（タイトル案・Summary・Test Plan）を整える。今回の turn では commit / PR を自動実行しない。

## 実行タスク

- [ ] 成果物チェックリスト: コード + ドキュメントの全成果物を確認する
- [ ] `artifacts.json` の Phase 13 ステータスを更新する
- [ ] `pr-summary-draft.md` を作成する（PR タイトル案・Summary・Test Plan を含む）
- [ ] `blocked-status-record.md` にユーザー承認待ちを記録する
- [ ] 実行禁止確認: ユーザー承認前に commit / PR を実行しない

## 成果物チェックリスト

### コード成果物

| 成果物          | パス                                                                                | 確認 |
| --------------- | ----------------------------------------------------------------------------------- | ---- |
| factory 実装    | `packages/shared/src/services/search/hybrid-rag-factory.ts`                         | [ ]  |
| keyword adapter | `packages/shared/src/services/search/strategies/keyword-search-strategy-adapter.ts` | [ ]  |
| factory テスト  | `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts`          | [ ]  |

### ドキュメント成果物

| 成果物                           | パス                                             | 確認 |
| -------------------------------- | ------------------------------------------------ | ---- |
| Phase 1 要件成果物               | `outputs/phase-1/requirements.md`                | [ ]  |
| Phase 2 設計成果物               | `outputs/phase-2/design.md`                      | [ ]  |
| Phase 2 契約マトリクス           | `outputs/phase-2/contract-matrix.md`             | [ ]  |
| Phase 3 設計レビュー             | `outputs/phase-3/design-review.md`               | [ ]  |
| Phase 4 テスト成果物             | `outputs/phase-4/`                               | [ ]  |
| Phase 5 実装成果物               | `outputs/phase-5/implementation-plan.md`         | [ ]  |
| Phase 6 回帰成果物               | `outputs/phase-6/regression-plan.md`             | [ ]  |
| Phase 7 カバレッジ成果物         | `outputs/phase-7/coverage-report.md`             | [ ]  |
| Phase 8 リファクタリング記録     | `outputs/phase-8/refactoring-log.md`             | [ ]  |
| Phase 9 品質レポート             | `outputs/phase-9/quality-report.md`              | [ ]  |
| Phase 10 最終レビュー結果        | `outputs/phase-10/final-review.md`               | [ ]  |
| Phase 10 minor issues            | `outputs/phase-10/minor-issues.md`               | [ ]  |
| Phase 11 手動テスト結果          | `outputs/phase-11/manual-test-result.md`         | [ ]  |
| Phase 11 コマンド記録            | `outputs/phase-11/command-transcript.md`         | [ ]  |
| Phase 12 実装ガイド              | `outputs/phase-12/implementation-guide.md`       | [ ]  |
| Phase 12 system spec サマリー    | `outputs/phase-12/system-spec-update-summary.md` | [ ]  |
| Phase 12 documentation-changelog | `outputs/phase-12/documentation-changelog.md`    | [ ]  |
| Phase 12 未タスク検出レポート    | `outputs/phase-12/unassigned-task-report.md`     | [ ]  |
| Phase 12 skill feedback          | `outputs/phase-12/skill-feedback-report.md`      | [ ]  |

### system spec 成果物（Phase 12 で更新済みのもの）

| ファイル                     | 更新済み      | 確認 |
| ---------------------------- | ------------- | ---- |
| `architecture-rag.md`        | Phase 12 必須 | [ ]  |
| `rag-search-hybrid.md`       | Phase 12 必須 | [ ]  |
| `rag-query-pipeline.md`      | Phase 12 必須 | [ ]  |
| `task-workflow.md`           | Phase 12 必須 | [ ]  |
| `lessons-learned-current.md` | Phase 12 必須 | [ ]  |
| LOGS.md 2 ファイル           | Phase 12 必須 | [ ]  |
| SKILL.md 2 ファイル          | Phase 12 必須 | [ ]  |
| topic-map.md 再生成          | Phase 12 必須 | [ ]  |

## PR 準備

### PR タイトル案（70 文字以内）

```
feat(rag): HybridRAGFactory.createFull/createLite 実配線 (#1368)
```

### Summary（1-3 箇条書き）

- `HybridRAGFactory.createFull()` / `createLite()` を `FACTORY_NOT_READY` stub から本番 wiring へ移行した
- `KeywordSearchStrategyAdapter` を追加し、`ISearchStrategy` 非互換の `KeywordSearchStrategy` を engine 接続可能にした
- `FullHybridRAGConfig` で 3 LLM 系統（`llmProvider` / `rerankerLlmClient` / `cragLlmClient`）を責務分離し、依存不足時の silent fallback を防止した

### Test Plan

```
# テスト確認手順

## 自動テスト
cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts
# 期待: 全テスト PASS

## 型チェック
pnpm --filter @repo/shared exec tsc --noEmit
# 期待: エラー 0 件

## Lint
pnpm --filter @repo/shared lint
# 期待: PASS

## placeholder 残存確認
grep -rn "@placeholder" packages/shared/src/services/search/hybrid-rag-factory.ts
grep -rn "FACTORY_NOT_READY" packages/shared/src/services/search/hybrid-rag-factory.ts
# 期待: 両方ともゼロ件

## 確認観点
- createFull(): 正常系（llmProvider + cohereApiKey あり）で HybridRAGEngine が返ること
- createFull(): 異常系（cohereApiKey なし / voyageApiKey なし / rerankerLlmClient なし / cragLlmClient なし）で明示エラーが返ること
- createLite(): RuleBasedQueryClassifier + NoOpReranker + null CRAG で engine が返ること
- KeywordSearchStrategyAdapter: SearchQuery 変換が正しく行われること
- FACTORY_NOT_READY / @placeholder がコードに存在しないこと
```

### 関連 Issue

```
Closes #1368
```

## 参照資料

| 資料名                      | パス / 場所                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| execute workflow            | `.claude/skills/task-specification-creator/references/execute-workflow.md`                 |
| Phase 12 成果物             | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-12/`                      |
| Phase 2 設計成果物          | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/design.md`              |
| Phase 5 実装成果物          | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md` |
| Phase 9 品質レポート        | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-9/quality-report.md`      |
| Phase 10 最終レビュー成果物 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-10/final-review.md`       |
| Phase 11 手動テスト成果物   | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-11/manual-test-result.md` |

## 成果物

| 成果物         | パス                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| PR 要約 draft  | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-13/pr-summary-draft.md`      |
| blocked status | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-13/blocked-status-record.md` |

## 完了条件

- [ ] 成果物チェックリスト（コード + ドキュメント + system spec）が全て確認済み
- [ ] `artifacts.json` の全 Phase ステータスが更新済み
- [ ] `pr-summary-draft.md` が PR タイトル案 / Summary / Test Plan を含んでいる
- [ ] `blocked-status-record.md` にユーザー承認待ちが記録されている
- [ ] commit / PR をユーザー承認前に実行していない

## 多角的チェック観点（AIが判断）

1. PR タイトルが 70 文字以内に収まっているか。
2. Summary が変更の本質（stub 廃止・adapter 追加・LLM 系統分離）を 1-3 箇条で表現できているか。
3. Test Plan の確認手順が再現可能な形で記述されているか。
4. `Closes #1368` が Test Plan に含まれているか。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] 成果物チェックリストを全項目確認した
- [ ] blocked 条件が明確であることを確認した
- [ ] ユーザー承認なしでは停止することを確認した

## 次Phase

なし
