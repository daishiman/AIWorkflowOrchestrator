# Task: curl-command-example

## 役割

cURLコマンド実行例を生成するタスク。コピー&ペーストで即座に実行できる実用的なcURLコマンドサンプルを作成する。

## 入力

- **API仕様**: エンドポイント、HTTPメソッド、ヘッダー、パラメータ
- **認証情報**: API Key, Bearer Token等の認証方式
- **OpenAPI仕様** (optional): 自動生成用

## 出力

- 実行可能なcURLコマンド
- 認証ヘッダー付きの例
- クエリパラメータ/ボディデータを含む例
- レスポンス形式の説明

## 制約

- Level 1-2の知識範囲で実装
- 実行可能な例のみ提供
- 認証情報はプレースホルダーを使用
- `scripts/generate-curl-examples.js` で自動生成可能な場合は活用

## 参照

- `assets/curl-examples.md`: 標準テンプレート
- `scripts/generate-curl-examples.js`: 自動生成スクリプト
- `references/Level1_basics.md`: 基本パターン

## 実行フロー

1. OpenAPI仕様がある場合は `scripts/generate-curl-examples.js` 実行を検討
2. `assets/curl-examples.md` テンプレートを参照
3. 基本的なGETリクエストから開始
4. 認証ヘッダーを追加（-H "Authorization: Bearer ${TOKEN}"）
5. POST/PUTの場合はボディデータを記述
6. レスポンス例を併記

## 品質基準

- [ ] cURLコマンドが実行可能
- [ ] 認証方式が正しく実装
- [ ] パラメータ/ボディが適切
- [ ] レスポンス例が含まれる
- [ ] プレースホルダーが明確
