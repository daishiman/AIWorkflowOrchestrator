# Phase 2: Renderer Flow

## state 設計

| state               | 型                | 用途               |
| ------------------- | ----------------- | ------------------ |
| `selectedOptionId`  | `string \| null`  | `single_select` 用 |
| `selectedOptionIds` | `string[]`        | `multi_select` 用  |
| `textAnswer`        | `string`          | `free_text` 用     |
| `secretAnswer`      | `string`          | `secret` 用        |
| `confirmAnswer`     | `boolean \| null` | `confirm` 用       |

## checkbox host レンダリング

- 既存 `single_select` host の card レイアウトを流用
- `input type="radio"` を `input type="checkbox"` に変更
- toggle ロジック: 選択済みなら除去、未選択なら追加
- `description` があれば label 下に補足文として表示

## submit payload 構築

```
handleSubmitWorkflowInput() の分岐:
  if kind === "single_select" → selectedOptionId
  if kind === "multi_select"  → selectedOptionIds  ← 新規
  if kind === "free_text"     → textValue
  if kind === "secret"        → secretValue
  else                        → confirmed
```

## state reset

- submit 後: `setSelectedOptionIds([])` を追加
- kind 切り替え時は各 state が independent のため自然にリセット（request 変更時に新 state が初期値で描画される）
