# Phase 8: リファクタリング（TDD: Refactor）-- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 8                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 7（カバレッジ確認） |

## 目的

Phase 5 の実装コードを、全テストを通した状態を維持しながら品質改善する（TDD: Refactor フェーズ）。コードの可読性・保守性を向上させる変更のみを行い、機能変更は行わない。

## 実行タスク

### Task 8-1: リファクタリング対象の確認

以下のファイルを Read で確認し、リファクタリング候補を評価する:

- `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts`（243行）
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`

#### 確認観点

1. **ChatCompletionResponse / StreamChunkResponse の型定義位置**: アダプター内にインライン定義で適切か
2. **formatMessages の可読性**: systemPrompt の条件分岐が明確か
3. **エラーハンドリングの一貫性**: sendChat / streamChat / checkHealth のエラー処理パターンが統一されているか
4. **コメントの一貫性**: JSDoc スタイルと @file / @description / @feature ヘッダーが既存ファイルと統一されているか
5. **OPENAI_COMPATIBLE_CONFIGS の位置**: LLMAdapterFactory.ts 内に定義されているが、分離が必要か

### Task 8-2: リファクタリング候補の評価

#### 候補 R-A: ChatCompletionResponse / StreamChunkResponse の外部化

評価: **実施しない**

理由: これらの型はアダプター内部のみで使用され、外部公開の必要がない。ファイルサイズも 243行と適切な範囲内。型定義の外部化はファイル数の増加に対して可読性向上が限定的。

#### 候補 R-B: OPENAI_COMPATIBLE_CONFIGS の分離

評価: **実施しない**

理由: 設定マップはファクトリクラスと密結合しており、分離すると参照先が増えるだけで保守性は向上しない。ファクトリファイル内に定義することで「設定変更 = ファクトリファイルの変更」という対応関係が明確。

#### 候補 R-C: JSDoc コメントの充実

評価: **確認のみ**

確認事項:

- `@file` / `@description` / `@feature` ヘッダーが OpenAICompatibleAdapter.ts に含まれている
- 各 public メソッドに JSDoc コメントが付与されている
- `@param` / `@returns` / `@throws` が記載されている

#### 候補 R-D: streamChat の JSON パースエラー処理の明示化

評価: **確認のみ**

現状: `catch {}` で JSON パースエラーを無視している。
判断: SSE ストリーム内の keep-alive メッセージ（`:` で始まるコメント行）や空データが JSON パースに失敗するのは想定内動作。コメントで理由を明記済み。変更不要。

### Task 8-3: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm prettier --check src/main/adapters/llm/OpenAICompatibleAdapter.ts src/main/adapters/llm/LLMAdapterFactory.ts src/main/adapters/llm/index.ts
```

### Task 8-4: リファクタリング後のテスト確認

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

期待する結果: 全テスト PASS（FAIL が 0 件）

## 参照資料

| 資料名                  | パス                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5 実装            | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-5-implementation.md` |
| OpenAICompatibleAdapter | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts`                                                                    |
| LLMAdapterFactory       | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                                                          |
| コード品質ルール        | `.claude/rules/02-code-quality.md`                                                                                                 |

## 成果物

| 成果物                         | パス                                                            | 形式       |
| ------------------------------ | --------------------------------------------------------------- | ---------- |
| リファクタリング済みアダプター | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | TypeScript |
| リファクタリング済みファクトリ | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | TypeScript |

## 完了条件

- [x] `OpenAICompatibleAdapter.ts` を Read で確認し、リファクタリング候補を評価した
- [x] `LLMAdapterFactory.ts` を Read で確認し、リファクタリング候補を評価した
- [x] 候補 R-A（型定義外部化）を実施しないと判断し、理由を記録した
- [x] 候補 R-B（設定マップ分離）を実施しないと判断し、理由を記録した
- [x] 候補 R-C（JSDoc コメント）の充実を確認した
- [x] 候補 R-D（JSON パースエラー処理）にコメントが付記されていることを確認した
- [x] Prettier フォーマットを確認した
- [x] リファクタリング後に全テストが PASS していることを確認した
- [x] 機能変更が発生していないことを確認した

## 次の Phase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）
