# Phase 6: Gap 記録

## タスク ID

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

## 計測日

2026-03-08

## profileHandlers.ts identities 防御パターン確認

### 確認結果: Array.isArray 統一済み

`profileHandlers.ts` 内の全3箇所で `Array.isArray(user.identities)` パターンが使用されていることを確認した。

| 行番号 | コード                                              | ステータス |
| ------ | --------------------------------------------------- | ---------- |
| L435   | `const identities = Array.isArray(user.identities)` | 統一済み   |
| L566   | `const identities = Array.isArray(user.identities)` | 統一済み   |
| L1258  | `const identities = Array.isArray(user.identities)` | 統一済み   |

### パターン詳細

```typescript
const identities = Array.isArray(user.identities) ? user.identities : [];
```

全箇所で三項演算子による空配列フォールバックが適用されており、本タスクで追加した `apiKeyHandlers.ts` の `Array.isArray(providers)` パターンと統一されている。

## 検出されたギャップ

### GAP-A: apiKeyHandlers.ts における .trim() バリデーション未適用

- **ステータス**: 対象外（本タスクスコープ外）
- **詳細**: `apiKeyHandlers.ts` の save/validate/delete ハンドラの文字列引数に P42 準拠の `.trim()` バリデーションが適用されていない箇所がある。grep 結果で `.trim()` の使用箇所が0件であることを確認
- **対応**: 本タスクのスコープは list ハンドラの providers 配列防御。他ハンドラの .trim() 追加は別タスクで対応

### GAP-B: ApiKeysSection の validate レスポンスにおける non-null assertion

- **ステータス**: 未タスク候補
- **詳細**: `index.tsx` L305-306 で `result.data!.status` / `result.data!.errorMessage` に non-null assertion（`!`）を使用。P48 違反の可能性
- **該当コード**: `validationStatus: result.data!.status`
- **リスク**: validate API のレスポンスが undefined の場合、ランタイムエラーが発生する
- **推奨対応**: optional chaining + デフォルト値（`result.data?.status ?? "unknown"`）に置換

## まとめ

- profileHandlers.ts の identities パターンは Array.isArray に完全統一済み
- apiKeyHandlers.ts の list ハンドラも同パターンで実装済み
- GAP-B（non-null assertion）は Phase 10 で MINOR 指摘として未タスク化を検討
