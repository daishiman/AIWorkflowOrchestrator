# 実装サマリー: Phase 5

## 実装概要

`storeHandlers.ts` に `deepMerge<T>` 関数と plain-object validation を追加し、`settings:update` ハンドラの
シャローマージ（`{ ...current, ...updates }`）をディープマージ（`deepMerge(current, updates)`）に置き換えた。
あわせて prototype pollution 防止のため、危険キーを無視する安全化も入れた。

## 変更箇所

| ファイル                                          | 変更内容                                                          | 行数   |
| ------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| `apps/desktop/src/main/ipc/storeHandlers.ts`      | `deepMerge` + plain-object validation + 危険キー除外追加          | +72行  |
| `apps/desktop/src/main/ipc/storeHandlers.test.ts` | `registerUserSettingsHandlers` テストブロック拡張（TC-01〜TC-12） | +185行 |

## deepMerge 関数の実装方針

- 外部ライブラリ（lodash 等）なし、ファイル内プライベート関数として実装
- マージルール: プレーンオブジェクト→再帰、配列→上書き、null→上書き、undefined→省略
- 入力安全性: 非 plain object は validation error、危険キーは無視

## Green 確認

`Test Files 1 passed (1)`, `Tests 26 passed (26)` — TC-01〜TC-12 全件 PASS、plain object validation / prototype pollution guard も確認済み
