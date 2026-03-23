# Phase 7: カバレッジ確認 -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 7                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 6（テスト拡充）     |

## 目的

Phase 6 で拡充したテストにより、`OpenAICompatibleAdapter.ts` と `LLMAdapterFactory.ts` のカバレッジが基準値（Line: 80%、Branch: 60%、Function: 80%）を達成していることを公式に確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

### Task 7-1: カバレッジ計測実行

以下のコマンドを実行し、カバレッジレポートを取得する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts --coverage --reporter=verbose
```

### Task 7-2: カバレッジ数値の記録

#### OpenAICompatibleAdapter.ts

| 指標              | 基準値 | 実測値           | 判定      |
| ----------------- | ------ | ---------------- | --------- |
| Line Coverage     | >= 80% | （実測値を記録） | PASS/FAIL |
| Branch Coverage   | >= 60% | （実測値を記録） | PASS/FAIL |
| Function Coverage | >= 80% | （実測値を記録） | PASS/FAIL |

#### LLMAdapterFactory.ts

| 指標              | 基準値 | 実測値           | 判定      |
| ----------------- | ------ | ---------------- | --------- |
| Line Coverage     | >= 80% | （実測値を記録） | PASS/FAIL |
| Branch Coverage   | >= 60% | （実測値を記録） | PASS/FAIL |
| Function Coverage | >= 80% | （実測値を記録） | PASS/FAIL |

### Task 7-3: 未カバー箇所の確認

カバレッジレポートで未カバーの行・分岐を確認し、以下の観点で評価する:

- `sendChat` のエラーハンドリング分岐（isLLMError true/false）
- `streamChat` の JSON パースエラー catch ブロック
- `checkHealth` の成功/失敗の両パス
- `formatMessages` の systemPrompt 有無の分岐
- `LLMAdapterFactory` の `getAdapter` でキャッシュヒット/ミスの分岐

### Task 7-4: 判定とフロー制御

**全指標 PASS の場合**: Phase 8 に進む

**いずれかの指標 FAIL の場合**:

1. 未カバー箇所を特定する（Task 7-3 の結果を使用）
2. Phase 6 に戻り、追加テストケースを設計・実装する
3. Phase 7 を再実行する

### Task 7-5: 全テスト PASS 確認

カバレッジ確認と並行して、テスト全数の PASS を確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

期待する結果: 全テスト PASS（FAIL が 0 件）

## 参照資料

| 資料名             | パス                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-6-test-expansion.md` |
| コード品質ルール   | `.claude/rules/02-code-quality.md`（カバレッジ基準）                                                                               |

## 成果物

| 成果物             | パス                                                                                                                                        | 形式     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| カバレッジ確認記録 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-7/coverage-report.md` | Markdown |

## 完了条件

- [x] `pnpm vitest run --coverage` を実行し、カバレッジレポートを取得した
- [x] `OpenAICompatibleAdapter.ts` の Line Coverage が 80% 以上である
- [x] `OpenAICompatibleAdapter.ts` の Branch Coverage が 60% 以上である
- [x] `OpenAICompatibleAdapter.ts` の Function Coverage が 80% 以上である
- [x] `LLMAdapterFactory.ts` の Line Coverage が 80% 以上である
- [x] `LLMAdapterFactory.ts` の Branch Coverage が 60% 以上である
- [x] `LLMAdapterFactory.ts` の Function Coverage が 80% 以上である
- [x] 全テスト PASS（FAIL が 0 件）を確認した
- [x] カバレッジ未達の場合は Phase 6 に戻りテストを追加した

## 次の Phase

カバレッジ基準達成の場合: Phase 8（`phase-8-refactoring.md`）
カバレッジ基準未達の場合: Phase 6 に戻る
