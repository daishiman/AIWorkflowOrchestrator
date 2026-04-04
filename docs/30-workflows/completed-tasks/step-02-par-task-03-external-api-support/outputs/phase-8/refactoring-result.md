# Phase 8: リファクタリング

## Task 8-1: APIキー管理の統一化確認

- [x] `this.credential` の設定が `setAuth` のみ
- [x] `buildAuthHeader` のみで認証ヘッダー構築
- [x] `setAuth` 以外で `credential` 参照なし

## Task 8-2: AbortControllerタイムアウト処理

- [x] `fetchWithTimeout` 内でのみ `AbortController` 生成
- [x] `clearTimeout` が `finally` ブロックで確実に呼ばれている
- [x] `setTimeout` の戻り値が型安全

## Task 8-3: バリデーション強化

- [x] 認証情報空チェック追加済み（`authType !== "none" && !credential.trim()`）

## Task 8-4: セキュリティレビュー

- [x] `console.log(this.credential)` が存在しない
- [x] `console.log(this.buildAuthHeader())` が存在しない
- [x] エラーメッセージに認証情報が含まれない
- [x] `JSON.stringify(init)` でヘッダーログなし
- [x] 認証情報フィールドが `type="password"`

## Task 8-5: テスト再実行

T-01〜T-15: 全件PASS
