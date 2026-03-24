# Task02: AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目         | 値                               |
| ------------ | -------------------------------- |
| タスクID     | TASK-LLM-MOD-02                  |
| 責務         | Adapter lane                     |
| 実行順序     | step-02-par（Task03 と並列可能） |
| 依存先       | Task01                           |
| ブロック対象 | Task04                           |

## 目的

AnthropicAdapter のヘルスチェックで使用しているレガシーモデルID を最新に更新する。

## 対象ファイル

| ファイル                                                 | 変更内容                            |
| -------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` | ヘルスチェックのモデルID更新 (L207) |

## 実行タスク

### Task 2-1: ヘルスチェックモデルID更新

```typescript
// 現在 (L207)
model: "claude-3-haiku-20240307", // 最安モデル

// 修正後
model: "claude-haiku-4-5", // 最安・最速モデル
```

### 確認事項

- `anthropic-version: 2023-06-01` は変更不要
- `baseUrl`（`https://api.anthropic.com/v1`）は変更不要
- `sendChat` / `streamChat` のリクエスト形式は変更不要

## 参照資料

- [research/anthropic-models.md](../llm-provider-model-modernization/research/anthropic-models.md)

## 完了条件

- [ ] ヘルスチェックモデルが `claude-haiku-4-5` に更新されている
- [ ] TypeScript コンパイルが通る
