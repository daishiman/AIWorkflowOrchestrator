# Phase 2 エラーマッピング設計

## エラー分類

| 種別              | コード     | 条件                             | 表示方針               |
| ----------------- | ---------- | -------------------------------- | ---------------------- |
| Validation        | `ERR_1001` | 入力不正（型/空文字/trim空文字） | ユーザー修正を促す     |
| Security/Business | `ERR_2004` | sender不正、境界違反             | 操作不可を明示         |
| Internal          | `ERR_5001` | 予期しない例外                   | 汎用メッセージのみ表示 |

## 実装ルール

- `toIPCValidationError(..., errorCode)` でコードを明示する
- unknown error は `internalError()` で正規化して返す
- `error.message` はサニタイズ後のみ返す

## テスト観点

- 各エラーコードが期待経路で返ること
- `errorCode` が preload 境界で欠落しないこと
