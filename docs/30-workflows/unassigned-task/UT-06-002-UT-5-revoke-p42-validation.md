# UT-06-002-UT-5: revokeTool ハンドラ P42準拠 3段バリデーション適用

| 項目     | 値             |
| -------- | -------------- |
| タスクID | UT-06-002-UT-5 |
| 優先度   | 低             |
| 元タスク | UT-06-002      |
| 検出日   | 2026-03-23     |

---

## 概要

`permission:revokeTool` ハンドラの引数バリデーションが `String(args?.toolName ?? "")` という暗黙変換パターンで、P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されていない。

## 背景・苦戦箇所

既存の revokeTool ハンドラは UT-06-002 のスコープ外であり、P42 バリデーション適用は新規 clear-session ハンドラにのみ行った。しかし、同ファイル内に P42 準拠と非準拠のハンドラが混在することでコード品質が不均一になっている。

P42 の知見として、`String(args?.toolName ?? "")` はスペースのみの入力（`"   "`）を通過させてしまう。この暗黙変換パターンは型チェックをスキップするため、数値や配列を渡された場合も文字列に変換されてしまい、意図しない動作を引き起こす可能性がある。

## 対応方針

`String(args?.toolName ?? "")` を `typeof args?.toolName !== "string" || args.toolName.trim() === ""` パターンに置換する。バリデーションエラー時は以下の形式で返す。

```typescript
{ success: false, error: { code: "VALIDATION_ERROR", message: "toolName must be a non-empty string" } }
```

これにより、型チェック → 空文字列チェック → トリム後空文字列チェックの3段バリデーションが完成する。

## 変更対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`                | 修正     |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | 修正     |

## 完了条件

- [ ] revokeTool ハンドラに P42準拠 3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されている
- [ ] スペースのみの入力（`"   "`）が VALIDATION_ERROR として拒否される
- [ ] 関連テストが PASS する
