# テスト仕様書: Phase 4 (TC-01〜TC-05)

## TC-01: ネストオブジェクトの部分更新でフィールドが保持される

- 入力: `{ theme: { color: "dark", size: "medium" } }`
- 更新: `{ theme: { color: "light" } }`
- 期待値: `{ theme: { color: "light", size: "medium" } }`
- 検証 AC: AC-1

## TC-02: トップレベルフィールドの上書きが従来通り動作する

- 入力: `{ language: "ja", theme: { color: "dark" } }`
- 更新: `{ language: "en" }`
- 期待値: `{ language: "en", theme: { color: "dark" } }`
- 検証 AC: AC-2

## TC-03: 配列フィールドは上書き動作になる（マージしない）

- 入力: `{ providers: ["a", "b"] }`
- 更新: `{ providers: ["c"] }`
- 期待値: `{ providers: ["c"] }`
- 検証 AC: AC-5

## TC-04: null ペイロードは上書き扱い

- 入力: `{ theme: { color: "dark" } }`
- 更新: `{ theme: null }`
- 期待値: `{ theme: null }`
- 検証 AC: AC-1

## TC-05: 存在しない子キーが追加される

- 入力: `{ theme: { color: "dark" } }`
- 更新: `{ theme: { size: "large" } }`
- 期待値: `{ theme: { color: "dark", size: "large" } }`
- 検証 AC: AC-1
