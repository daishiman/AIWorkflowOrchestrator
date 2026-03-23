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

| プロバイダー | 削除するモデル                                               | 追加するモデル                                                                                                |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| OpenAI       | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`                       | `gpt-5.4` (default, 1.05M ctx), `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini`                |
| Anthropic    | `claude-3-5-sonnet-*`, `claude-3-opus-*`, `claude-3-haiku-*` | `claude-sonnet-4-6` (default), `claude-opus-4-6`, `claude-haiku-4-5`（変更なし）                              |
| Google       | `gemini-1.5-pro`, `gemini-1.5-flash`                         | `gemini-3-flash-preview` (default, 1M ctx), `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`         |
| xAI          | `grok-beta`                                                  | `grok-4-1-fast-reasoning` (default, 2M ctx), `grok-4-1-fast-non-reasoning`, `grok-4`, `grok-3`, `grok-3-mini` |

> **注記**: Gemini 2.5 は 2026年6月17日廃止予定。GPT-4.1 系は ChatGPT から退役済み（API では利用可能だが非推奨）。

### Task 1-2: description フィールド追加

`PROVIDER_CONFIGS` の型定義に `description?: string` を追加し、各モデルに説明を付与する。

### Task 1-3: inferProviderId パターン追加

```typescript
// gpt-（gpt-5.4 を含む）/ o3 / o4 プレフィックスを OpenAI にマッピング
// 注: 既存の gpt- パターンで gpt-5.4 系も包含されるが、明示的に確認すること
if (
  modelId.startsWith("gpt-") ||
  modelId.startsWith("o3") ||
  modelId.startsWith("o4")
)
  return "openai";
```

> `gpt-5.4` は `gpt-` プレフィックスで既存パターンにより `openai` に解決される。現行コードに `o3`/`o4` パターンが既存の場合、`inferProviderId` への変更は不要。現行コードを確認して判断すること。

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
