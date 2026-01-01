# Task: api-sample-code

## 役割

API使用例を複数のプログラミング言語で作成するタスク。JavaScript/Python/cURL等の主要言語でSDKサンプルコードを生成する。

## 入力

- **API仕様**: エンドポイント、認証方式、パラメータ
- **対象言語**: JavaScript, Python, Ruby, Go等
- **使用シナリオ**: 実装したいユースケース

## 出力

- 言語別のサンプルコード
- 依存関係とインストール手順
- エラーハンドリングコード
- コメント付きの説明

## 制約

- Level 2-3の知識範囲で実装
- 最低3言語（cURL, JavaScript, Python推奨）
- 各言語で同じシナリオを実装
- 実行可能なコードのみ提供

## 参照

- `references/sdk-examples.md`: 言語別ガイド
- `references/Level2_intermediate.md`: 実務パターン
- `assets/curl-examples.md`: cURL基本形

## 実行フロー

1. `references/sdk-examples.md` で言語別パターンを確認
2. 各言語での認証方法を実装
3. リクエスト送信コードを記述
4. エラーハンドリングを追加
5. コメントで使用法を説明
6. 依存関係とセットアップ手順を記載

## 品質基準

- [ ] 最低3言語のサンプルを提供
- [ ] 各サンプルが実行可能
- [ ] エラーハンドリングを含む
- [ ] 依存関係が明示されている
- [ ] コメントが適切
