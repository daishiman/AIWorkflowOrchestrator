# 拡張テストケース（TC-06〜TC-12）

## TC-06: 3 階層以上のネストオブジェクトのマージ

- 入力: `{ a: { b: { c: "old", d: "keep" } } }`
- 更新: `{ a: { b: { c: "new" } } }`
- 期待値: `{ a: { b: { c: "new", d: "keep" } } }`
- 検証観点: 3 階層再帰マージが正しく動作すること

## TC-07: 空オブジェクトを patch した場合は変化なし

- 入力: `{ theme: { color: "dark" } }`
- 更新: `{}`
- 期待値: `{ theme: { color: "dark" } }`
- 検証観点: 空 patch で既存値が保持されること

## TC-08: patch に空オブジェクトの子を持つ場合は変化なし

- 入力: `{ theme: { color: "dark" } }`
- 更新: `{ theme: {} }`
- 期待値: `{ theme: { color: "dark" } }`
- 検証観点: 空のネストオブジェクト patch で既存値が保持されること

## TC-09: undefined 値のキーは省略され基底値が維持される

- 入力: `{ language: "ja" }`
- 更新: `{ language: undefined }`
- 期待値: `{ language: "ja" }`
- 検証観点: undefined 省略ルールが正しく動作すること

## TC-10: update 後に settings:get で同じ値が返る

- 入力: `{ theme: { color: "dark", size: "medium" }, language: "ja" }`
- 更新: `{ theme: { color: "light" } }`
- 期待値: `settings:get` で merged 済みの設定値がそのまま返る
- 検証観点: `update` と `get` の往復で設定値が崩れないこと

## TC-11: 非 plain object の payload を拒否する

- 入力: `{ theme: { color: "dark" } }`
- 更新: `[]`
- 期待値: validation error を返し、`settings` は更新されない
- 検証観点: `settings:update` の入力検証が機能すること

## TC-12: 危険キーを無視して prototype pollution を防ぐ

- 入力: `{}`
- 更新: `{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"prototype":{"polluted":true}}`
- 期待値: 危険キーは保存されず、`Object.prototype` は汚染されない
- 検証観点: deepMerge の安全化が機能すること
