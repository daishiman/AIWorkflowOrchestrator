# Task05: 共有型スキーマ拡張検討（オプション）

## メタ情報

| 項目         | 値                                                              |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-LLM-MOD-05                                                 |
| 責務         | Schema lane                                                     |
| 実行順序     | step-04-seq（Task04 完了後）                                    |
| 依存先       | Task04                                                          |
| ブロック対象 | なし                                                            |
| 必須度       | **オプション** — Task01-04 だけでも本タスク全体の目的は達成可能 |

## 目的

`packages/shared/src/types/llm/schemas/provider-registry.ts` の `PROVIDER_CONFIGS` に OpenRouter 4モデルの `description` を追加し、`handleGetProviders()` を通じて `model.description` が IPC 経由で返ることを確認する。Renderer の description 表示は未タスク化候補として分離する。

## 対象ファイル

| ファイル                                                           | 変更内容                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| `packages/shared/src/types/llm/schemas/provider-registry.ts`       | OpenRouter 4モデルへの `description` 値追加              |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | `description` フィールドのスキーマバリデーションテスト   |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | `handleGetProviders()` での `description` 伝搬確認テスト |

## 現状確認

- `LLMModelSchema` には既に `description: z.string().optional()` が定義されている
- `ProviderModelEntry` には既に `description?: string` が定義されている
- `PROVIDER_CONFIGS` は `packages/shared/src/types/llm/schemas/provider-registry.ts` にあり、OpenAI/Anthropic/Google/xAI のモデルには description が設定済み
- OpenRouter 4モデルのみ description が未設定だった

## 実行タスク

### Task 5-1: PROVIDER_CONFIGS 値追加

`provider-registry.ts` の OpenRouter セクションにある 4 モデルへ `description` を追加する。

### Task 5-2: 伝搬確認

`provider.test.ts` で `LLMModelSchema` の `description` 振る舞いを確認し、`llm.test.ts` で `handleGetProviders()` から `description` が返ることを確認する。

### Task 5-3: Renderer 側の description 表示検討

モデル選択 UI で description を表示する場合の影響範囲を調査する（本タスクでは実装しない。未タスク化の候補）。

## 完了条件

- [ ] OpenRouter 4モデルに `description` が設定されている
- [ ] `LLMModelSchema` の description バリデーションが確認されている
- [ ] `handleGetProviders()` で `description` が透過的に伝搬することが確認されている
- [ ] 必要に応じて未タスクが検出・記録されている
