# Phase 9: 品質保証 -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| Phase番号  | 9                           |
| 機能名     | openai-compatible-adapter   |
| タスクID   | TASK-LLM-MOD-06             |
| 作成日     | 2026-03-23                  |
| 依存 Phase | Phase 8（リファクタリング） |

## 目的

Lint・TypeScript 型チェック・関連テスト全実行を実施し、Phase 10 最終レビューへの進行に必要な品質基準を全て満たすことを確認する。

## 実行タスク

### Task 9-1: ESLint チェック

```bash
cd apps/desktop && pnpm lint src/main/adapters/llm/OpenAICompatibleAdapter.ts src/main/adapters/llm/LLMAdapterFactory.ts src/main/adapters/llm/index.ts
```

期待する結果: エラー 0 件、警告 0 件

エラーが発生した場合: `pnpm lint --fix` を実行する。自動修正不可の場合は手動で修正する。

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待する結果: エラー 0 件

型エラーが発生した場合の確認ポイント:

- `OpenAICompatibleProviderConfig` の型定義が正しいか
- `LLMAdapterFactory` の import が更新されているか
- `BaseLLMAdapter` の protected メソッド（fetchWithRetry, fetchSSE）の型が一致しているか

### Task 9-3: アダプターテスト全実行

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

期待する結果: 全テスト PASS（対象ファイル全て）

対象テストファイル:

- `OpenAICompatibleAdapter.test.ts`（新規）
- 既存のアダプターテストファイル

### Task 9-4: ハンドラーテスト影響確認

LLMAdapterFactory を使用するハンドラーテストが影響を受けていないことを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
```

期待する結果: 全テスト PASS

### Task 9-5: shared パッケージのビルド確認

```bash
pnpm --filter @repo/shared build
```

期待する結果: エラー 0 件でビルド完了

### Task 9-6: 品質チェック結果の記録

| チェック項目             | コマンド                                                  | 結果      |
| ------------------------ | --------------------------------------------------------- | --------- |
| ESLint                   | `pnpm lint src/main/adapters/llm/*.ts`                    | PASS/FAIL |
| TypeScript 型チェック    | `pnpm --filter @repo/desktop typecheck`                   | PASS/FAIL |
| アダプターテスト全実行   | `pnpm vitest run src/main/adapters/llm/__tests__/`        | PASS/FAIL |
| ハンドラーテスト影響確認 | `pnpm vitest run src/main/handlers/__tests__/llm.test.ts` | PASS/FAIL |
| shared パッケージビルド  | `pnpm --filter @repo/shared build`                        | PASS/FAIL |

全て PASS の場合のみ Phase 10 に進む。

### Task 9-7: ILLMAdapter インターフェース変更なし確認

`apps/desktop/src/main/adapters/llm/types.ts` が変更されていないことを確認する:

```bash
git diff -- apps/desktop/src/main/adapters/llm/types.ts
```

期待する結果: 差分なし（空出力）

## 参照資料

| 資料名                   | パス                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-8-refactoring.md` |
| OpenAICompatibleAdapter  | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts`                                                                 |
| LLMAdapterFactory        | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                                                       |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                                                              |

## 成果物

| 成果物       | パス                                                                                                                                   | 形式     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 品質保証記録 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-9/qa-results.md` | Markdown |

## 完了条件

- [x] ESLint がエラー 0 件で完了した
- [x] TypeScript 型チェックがエラー 0 件で完了した
- [x] アダプターテスト全実行で全テストが PASS した
- [x] ハンドラーテスト（llm.test.ts）が引き続き PASS した
- [x] `@repo/shared` パッケージのビルドが成功した
- [x] `types.ts`（ILLMAdapter）が変更されていないことを git diff で確認した
- [x] 品質チェック結果を記録した

## 次の Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
