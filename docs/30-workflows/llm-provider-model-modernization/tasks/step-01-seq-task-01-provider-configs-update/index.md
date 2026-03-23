# Task01: PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目         | 値                      |
| ------------ | ----------------------- |
| タスクID     | TASK-LLM-MOD-01         |
| 責務         | Data lane               |
| 実行順序     | step-01-seq（先行必須） |
| 依存先       | なし                    |
| ブロック対象 | Task02, Task03, Task04  |

## 目的

`PROVIDER_CONFIGS` のモデル定義を各プロバイダーの最新APIに準拠させ、`inferProviderId` のパターンマッチを新モデルIDに対応させる。

## 対象ファイル

| ファイル                                | 変更内容                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts` | `PROVIDER_CONFIGS` のモデル定義更新、`inferProviderId` パターン追加、`description` フィールド追加 |

## 実行タスク

### Task 1-1: PROVIDER_CONFIGS のモデル更新

レガシーモデルを削除し、最新モデルに置換する。

| プロバイダー | 削除するモデル                                               | 追加するモデル                                                          |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| OpenAI       | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`                       | `gpt-4.1` (default), `gpt-4.1-mini`, `gpt-4.1-nano`, `o3`, `o4-mini`    |
| Anthropic    | `claude-3-5-sonnet-*`, `claude-3-opus-*`, `claude-3-haiku-*` | `claude-sonnet-4-6` (default), `claude-opus-4-6`, `claude-haiku-4-5`    |
| Google       | `gemini-1.5-pro`, `gemini-1.5-flash`                         | `gemini-2.5-flash` (default), `gemini-2.5-pro`, `gemini-2.5-flash-lite` |
| xAI          | `grok-beta`                                                  | `grok-3` (default), `grok-3-mini`                                       |

### Task 1-2: description フィールド追加

`PROVIDER_CONFIGS` の型定義に `description?: string` を追加し、各モデルに説明を付与する。

### Task 1-3: inferProviderId パターン追加

```typescript
// o3/o4 プレフィックスを OpenAI にマッピング
if (
  modelId.startsWith("gpt-") ||
  modelId.startsWith("o3") ||
  modelId.startsWith("o4")
)
  return "openai";
```

## 参照資料

- [research/openai-models.md](../../research/openai-models.md)
- [research/anthropic-models.md](../../research/anthropic-models.md)
- [research/google-models.md](../../research/google-models.md)
- [research/xai-models.md](../../research/xai-models.md)

## 完了条件

- [ ] 全プロバイダーのモデル定義が最新に更新されている
- [ ] レガシーモデルが削除されている
- [ ] `inferProviderId` が `o3`/`o4` プレフィックスを正しく解決する
- [ ] TypeScript コンパイルが通る
- [ ] 既存テストの期待値との整合性が確認されている（不整合は Task04 で対応）
