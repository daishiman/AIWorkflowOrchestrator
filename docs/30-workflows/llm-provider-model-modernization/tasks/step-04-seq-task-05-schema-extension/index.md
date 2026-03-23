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

`LLMModelSchema`（`packages/shared/src/types/llm/schemas/provider.ts`）に `description` フィールドを追加し、UIでモデルの説明を表示可能にする。

## 対象ファイル

| ファイル                                                           | 変更内容                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts`                | `LLMModelSchema` に `description` フィールド追加（既にオプションで定義済みか確認） |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | description フィールドのバリデーションテスト                                       |

## 現状確認

`LLMModelSchema` には既に `description: z.string().optional()` が定義されている（`provider.ts:34`）。
`PROVIDER_CONFIGS` の型定義側にも `description` を追加するだけで、スキーマ変更は不要の可能性が高い。

## 実行タスク

### Task 5-1: PROVIDER_CONFIGS 型と LLMModelSchema の整合確認

```typescript
// provider.ts:26-41 に description はすでに存在
export const LLMModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(), // ← 既存
  contextWindow: z.number().int().positive().optional(),
  isDefault: z.boolean().default(false),
});
```

`PROVIDER_CONFIGS` の型定義（`llm.ts` 内のインライン型）に `description?: string` を追加すれば、LLMModelSchema とのギャップは解消される。

### Task 5-2: Renderer 側の description 表示検討

モデル選択UIで description を表示する場合の影響範囲を調査する（本タスクでは実装しない。未タスク化の候補）。

## 完了条件

- [ ] `PROVIDER_CONFIGS` の型と `LLMModelSchema` の整合性が確認されている
- [ ] description フィールドが PROVIDER_CONFIGS → IPC → Renderer まで通るパスが確認されている
- [ ] 必要に応じて未タスクが検出・記録されている
